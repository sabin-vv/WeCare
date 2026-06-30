import { AccessToken, RoomServiceClient } from 'livekit-server-sdk'
import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../../appointment/constants/messages'
import { IAppointmentRepository } from '../../appointment/interfaces/appointment.repository.interface'
import { IVideoCallRepository } from '../interfaces/videoCall.repository.interface'
import { IVideoCallService } from '../interfaces/videoCall.service.interface'

@injectable()
export class VideoCallService implements IVideoCallService {
    private _roomClient: RoomServiceClient

    constructor(
        @inject(TOKENS.IVideoCallRepository) private _videoCallRepo: IVideoCallRepository,
        @inject(TOKENS.IAppointmentRepository) private _appointmentRepo: IAppointmentRepository,
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

    async createRoom(appointmentId: string, doctorId: string, patientId: string): Promise<{ roomName: string }> {
        const existigRoom = await this._videoCallRepo.findByAppointmentId(appointmentId)

        if (existigRoom) {
            return { roomName: existigRoom.roomName }
        }

        const appointment = await this._appointmentRepo.findById(appointmentId)

        if (!appointment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.NOT_FOUND)
        }
        if (appointment.status !== 'confirmed') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Vdeo room can be created for confirmed appointments')
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

        return { roomName: doc.roomName }
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
        }

        return this._generateToken(roomName, identity)
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

    private async _generateToken(roomName: string, identity: string): Promise<string> {
        const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
            identity,
            ttl: '1h',
        })

        at.addGrant({ roomJoin: true, room: roomName })

        return at.toJwt()
    }
}
