import { AccessToken, RoomServiceClient } from 'livekit-server-sdk'
import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { getIO } from '../../../core/socket'
import { MSG } from '../../appointment/constants/messages'
import { IAppointmentRepository } from '../../appointment/interfaces/appointment.repository.interface'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { IVideoCallRepository } from '../interfaces/videoCall.repository.interface'
import { IVideoCallService } from '../interfaces/videoCall.service.interface'

@injectable()
export class VideoCallService implements IVideoCallService {
    private _roomClient: RoomServiceClient

    constructor(
        @inject(TOKENS.IVideoCallRepository) private _videoCallRepo: IVideoCallRepository,
        @inject(TOKENS.IAppointmentRepository) private _appointmentRepo: IAppointmentRepository,
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
    ) {
        const host = this._getLiveKitHost()

        this._roomClient = new RoomServiceClient(host, env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET)
    }

    private _getLiveKitHost(): string {
        const url = env.LIVEKIT_URL || env.LIVEKIT_HOST

        if (!url) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'LiveKit host not configured')
        }

        return url.replace('wss://', 'https://').replace('ws://', 'http://')
    }

    async createRoom(
        appointmentId: string,
        doctorId: string,
        patientId: string,
    ): Promise<{ roomName: string; appointmentID: string }> {
        const appointment = await this._appointmentRepo.findById(appointmentId)

        if (!appointment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.NOT_FOUND)
        }
        const existigRoom = await this._videoCallRepo.findByAppointmentId(appointmentId)

        if (existigRoom) {
            return { roomName: existigRoom.roomName, appointmentID: appointment.appointmentId }
        }

        if (appointment.status !== 'confirmed' && appointment.status !== 'in_consultation') {
            throw new AppError(
                HTTP_STATUS.BAD_REQUEST,
                'Video room can only be created for confirmed or active appointments',
            )
        }

        const roomName = `consultation-${appointmentId}`

        await this._roomClient.createRoom({ name: roomName })

        const doc = await this._videoCallRepo.create({
            appointmentId: new Types.ObjectId(appointmentId),
            roomName,
            doctorId: new Types.ObjectId(doctorId),
            patientId: new Types.ObjectId(patientId),
            status: 'waiting',
        })

        return { roomName: doc.roomName, appointmentID: appointment.appointmentId }
    }

    async getToken(roomName: string, identity: string): Promise<string> {
        const room = await this._videoCallRepo.findByRoomName(roomName)

        if (!room) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Video room not found')
        }

        if (room.status === 'ended') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Video room has already ended')
        }

        const isDoctor = room.doctorId.toString() === identity
        const isPatient = room.patientId.toString() === identity

        if (!isDoctor && !isPatient) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not authorized to join this consultation')
        }

        if (room.status === 'waiting') {
            await this._videoCallRepo.updateByRoomName(roomName, {
                status: 'active',
                startedAt: new Date(),
            })

            const appointment = await this._appointmentRepo.findById(room.appointmentId.toString())
            if (appointment && appointment.status === 'confirmed') {
                await this._appointmentRepo.update(room.appointmentId.toString(), {
                    status: 'in_consultation',
                })
            }
        }

        const token = await this._generateToken(roomName, identity)

        if (isPatient) {
            const user = await this._userRepo.findById(identity)
            const patientName = user?.name || 'Patient'
            const patient = await this._patientRepo.findByUserId(new Types.ObjectId(identity))
            const patientMongoId = patient?._id.toString()

            getIO().to(`user:${room.doctorId.toString()}`).emit('patient_joined_call', {
                appointmentId: room.appointmentId.toString(),
                patientName,
                patientMongoId,
                roomName,
            })
        }

        return token
    }

    async endRoom(roomName: string): Promise<void> {
        const room = await this._videoCallRepo.findByRoomName(roomName)

        if (!room) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Video room not found')
        }

        await this._roomClient.deleteRoom(roomName)

        const now = new Date()
        const duration = room.startedAt ? Math.floor((now.getTime() - room.startedAt.getTime()) / 1000) : undefined

        await this._videoCallRepo.updateByRoomName(roomName, { status: 'ended', endedAt: now, duration })
    }

    async completeRoom(roomName: string): Promise<void> {
        const room = await this._videoCallRepo.findByRoomName(roomName)

        if (!room) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Video room not found')
        }

        await this._roomClient.deleteRoom(roomName)

        const now = new Date()
        const duration = room.startedAt
            ? Math.floor((now.getTime() - room.startedAt.getTime()) / 1000)
            : undefined

        await this._videoCallRepo.updateByRoomName(roomName, { status: 'ended', endedAt: now, duration })

        const appointment = await this._appointmentRepo.findById(room.appointmentId.toString())
        if (appointment && appointment.status === 'in_consultation') {
            await this._appointmentRepo.update(room.appointmentId.toString(), {
                status: 'completed',
                completedAt: new Date(),
            })
        }

        const patient = await this._patientRepo.findByUserId(room.patientId)
        if (patient && !patient.primaryDoctorId) {
            await this._patientRepo.updateByUserId(room.patientId, { primaryDoctorId: room.doctorId })
        }

        getIO().to(`user:${room.doctorId.toString()}`).emit('consultation_completed', {
            patientMongoId: room.patientId.toString(),
        })
    }

    async getRoomByAppointment(appointmentId: string): Promise<{ roomName: string }> {
        const room = await this._videoCallRepo.findByAppointmentId(appointmentId)

        if (!room) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Video room not found for this appointment')
        }

        return { roomName: room.roomName }
    }

    private async _generateToken(roomName: string, identity: string): Promise<string> {
        const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
            identity,
            ttl: '1h',
        })

        at.addGrant({ roomJoin: true, room: roomName })

        return at.toJwt()
    }
}
