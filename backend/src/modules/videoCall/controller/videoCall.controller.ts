import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { sendSuccess } from '../../../core/response/ApiResponse'
import { IAppointmentRepository } from '../../appointment/interfaces/appointment.repository.interface'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { IVideoCallService } from '../interfaces/videoCall.service.interface'

@injectable()
export class VideoCallController {
    constructor(
        @inject(TOKENS.IVideoCallService) private _videoCallService: IVideoCallService,
        @inject(TOKENS.IAppointmentRepository) private _appointmentRepo: IAppointmentRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
    ) {}

    createRoom = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated')
        }

        const { appointmentId } = req.body
        if (!appointmentId) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'appointmentId is required')
        }

        const appointment = await this._appointmentRepo.findById(appointmentId)
        if (!appointment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Appointment not found')
        }

        const doctor = await this._doctorRepo.findById(appointment.doctorId.toString())
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor not found')
        }

        const doctorUserId = doctor.userId.toString()
        const patientUserId = appointment.patientId.toString()

        if (userId !== doctorUserId && userId !== patientUserId) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'Not authorized for this appointment')
        }

        const { roomName, appointmentID } = await this._videoCallService.createRoom(
            appointmentId,
            doctorUserId,
            patientUserId,
        )
        const token = await this._videoCallService.getToken(roomName, userId)

        sendSuccess(res, undefined, { roomName, appointmentID, token })
    }

    getToken = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated')
        }

        const roomName = req.params.roomName as string
        if (!roomName) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'roomName is required')
        }

        const token = await this._videoCallService.getToken(roomName, userId)

        sendSuccess(res, undefined, { token })
    }

    getRoomByAppointment = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated')
        }

        const appointmentId = req.params.appointmentId as string
        if (!appointmentId) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'appointmentId is required')
        }

        const appointment = await this._appointmentRepo.findById(appointmentId)
        if (!appointment) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Appointment not found')
        }

        const doctor = await this._doctorRepo.findById(appointment.doctorId.toString())
        if (!doctor) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Doctor not found')
        }

        const doctorUserId = doctor.userId.toString()
        const patientUserId = appointment.patientId.toString()

        if (userId !== doctorUserId && userId !== patientUserId) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'Not authorized for this appointment')
        }

        const { roomName } = await this._videoCallService.getRoomByAppointment(appointmentId)
        const token = await this._videoCallService.getToken(roomName, userId)

        sendSuccess(res, undefined, { roomName, token })
    }

    completeRoom = async (req: Request, res: Response) => {
        const roomName = req.params.roomName as string

        if (!roomName) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'roomName is required')
        }

        await this._videoCallService.completeRoom(roomName)

        sendSuccess(res, 'Consultation completed successfully')
    }

    endRoom = async (req: Request, res: Response) => {
        const roomName = req.params.roomName as string

        if (!roomName) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'roomName is required')
        }

        await this._videoCallService.endRoom(roomName)

        sendSuccess(res, 'Video room ended')
    }
}
