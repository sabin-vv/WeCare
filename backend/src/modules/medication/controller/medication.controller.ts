import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { sendSuccess } from '../../../core/response/ApiResponse'
import { MSG } from '../constants/messages'
import { IMedicationService } from '../interfaces/medication.service.interface'

@injectable()
export class MedicationController {
    constructor(@inject(TOKENS.IMedicationService) private _medicationService: IMedicationService) {}

    getPatientMedications = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const medications = await this._medicationService.getPatientMedications(userId)

        sendSuccess(res, MSG.FETCHED, medications)
    }

    generateMedications = async (req: Request, res: Response) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        await this._medicationService.generateDailySchedule(today)

        sendSuccess(res, MSG.GENERATED)
    }
}