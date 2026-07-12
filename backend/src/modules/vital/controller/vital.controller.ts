import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { sendSuccess } from '../../../core/response/ApiResponse'
import { MSG } from '../constants/messages'
import { IVitalService } from '../interfaces/vital.service.interface'
import { CreateVitalPlanDTO } from '../validator/vital.schema'

@injectable()
export class VitalController {
    constructor(@inject(TOKENS.IVitalService) private _vitalService: IVitalService) {}

    createVitalPlan = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const dto: CreateVitalPlanDTO = req.body
        const plan = await this._vitalService.createVitalPlan(userId, dto)

        sendSuccess(res, undefined, plan, HTTP_STATUS.CREATED)
    }

    getPatientVitalPlans = async (req: Request, res: Response) => {
        const { patientId } = req.params as { patientId: string }
        const { status } = req.query

        const plans = await this._vitalService.getPatientVitalPlans(patientId, status as string | undefined)

        sendSuccess(res, undefined, plans)
    }

    cancelVitalPlan = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const { planId } = req.params as { planId: string }
        const plan = await this._vitalService.cancelVitalPlan(userId, planId)

        sendSuccess(res, MSG.PLAN_CANCELLED, plan)
    }

    getMyActiveVitalPlans = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const patient = await this._vitalService.getPatientByUserId(userId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PATIENT_NOT_FOUND)
        }

        const plans = await this._vitalService.getPatientVitalPlans(patient._id.toString(), 'active')

        const count = plans.reduce((sum, plan) => sum + plan.vitals.length, 0)

        sendSuccess(res, undefined, { count })
    }

    getPatientVitalSchedules = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const schedules = await this._vitalService.getPatientVitalSchedules(userId)

        sendSuccess(res, MSG.SCHEDULES_FETCHED, schedules)
    }

    generateVitalSchedules = async (req: Request, res: Response) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        await this._vitalService.generateDailyVitalSchedule(today)

        sendSuccess(res, MSG.GENERATED)
    }
}
