import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { sendSuccess } from '../../../core/response/ApiResponse'
import { MSG } from '../constants/messages'
import { IAppointmentService } from '../interfaces/appointment.service.interface'

@injectable()
export class AppointmentController {
    constructor(@inject(TOKENS.IAppointmentService) private _appointmentService: IAppointmentService) {}

    createAppointment = async (req: Request, res: Response) => {
        const patientId = req.user?.userId
        if (!patientId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const order = await this._appointmentService.createAppointment({
            ...req.body,
            patientId,
        })

        sendSuccess(res, undefined, order, HTTP_STATUS.CREATED)
    }

    getPatientAppointments = async (req: Request, res: Response) => {
        const patientId = req.user?.userId
        if (!patientId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const appointments = await this._appointmentService.getPatientAppointments(patientId)

        sendSuccess(res, MSG.FETCHED, appointments)
    }

    getDoctorAppointments = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId
        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const appointments = await this._appointmentService.getDoctorAppointments(doctorId, {
            search: (req.query.search as string)?.trim() || '',
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 8,
            date: (req.query.date as string)?.trim() || undefined,
        })

        sendSuccess(res, MSG.DOCTOR_FETCHED, appointments)
    }

    cancellAppointment = async (req: Request, res: Response) => {
        const { appointmentId } = req.params
        const reason: string = req.body.reason

        const result = await this._appointmentService.cancelAppointment(appointmentId as string, reason)

        const cancelMessage =
            result.refundAmount > 0
                ? `Appointment cancelled. Refund of ₹${result.refundAmount} initiated.`
                : MSG.CANCELLED
        sendSuccess(res, cancelMessage, { refundAmount: result.refundAmount })
    }

    getAppointmentById = async (req: Request, res: Response) => {
        const patientId = req.user?.userId
        if (!patientId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const { appointmentId } = req.params as { appointmentId: string }
        const appointment = await this._appointmentService.getAppointmentById(appointmentId, patientId)

        sendSuccess(res, undefined, appointment)
    }

    rescheduleAppointment = async (req: Request, res: Response) => {
        const patientId = req.user?.userId
        if (!patientId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const { appointmentId } = req.params as { appointmentId: string }

        const appointment = await this._appointmentService.rescheduleAppointment(appointmentId, patientId, req.body)

        sendSuccess(res, MSG.RESCHEDULED, appointment)
    }

    retryPayment = async (req: Request, res: Response) => {
        const patientId = req.user?.userId
        if (!patientId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const { appointmentId } = req.params as { appointmentId: string }
        const { paymentMethod } = req.body

        const result = await this._appointmentService.retryPayment(appointmentId, {
            paymentMethod,
            patientId,
        })

        sendSuccess(res, undefined, result)
    }
}
