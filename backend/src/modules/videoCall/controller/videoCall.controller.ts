import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IAppointmentRepository } from '../../appointment/interfaces/appointment.repository.interface'
import { IVideoCallService } from '../interfaces/videoCall.service.interface'

@injectable()
export class VideoCallController {
    constructor(
        @inject(TOKENS.IVideoCallService) private _videoCallService: IVideoCallService,
        @inject(TOKENS.IAppointmentRepository) private _appointmentRepo: IAppointmentRepository,
    ) {}

    createRoom = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId
        if (!doctorId) {
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

        const patientId = appointment.patientId.toString()

        const { roomName } = await this._videoCallService.createRoom(appointmentId, doctorId, patientId)
        const token = await this._videoCallService.getToken(roomName, doctorId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { roomName, token },
        })
    }

    getToken = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated')
        }

        const { roomName } = req.params
        if (!roomName) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'roomName is required')
        }

        if (typeof roomName !== 'string') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid room name')
        }

        const token = await this._videoCallService.getToken(roomName, userId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { token },
        })
    }

    endRoom = async (req: Request, res: Response) => {
        const { roomName } = req.params

        if (!roomName) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'roomName is required')
        }

        if (typeof roomName !== 'string') {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid room name')
        }

        await this._videoCallService.endRoom(roomName)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Video room ended',
        })
    }
}
