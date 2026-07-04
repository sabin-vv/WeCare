import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { sendSuccess } from '../../../core/response/ApiResponse'
import { MSG } from '../constants/messages'
import { ISymptomLogService } from '../interfaces/symptomLog.service.interface'
import { CreateSymptomLogDTO } from '../validator/symptomLog.schema'

@injectable()
export class SymptomLogController {
    constructor(@inject(TOKENS.ISymptomLogService) private readonly _logService: ISymptomLogService) {}

    createLog = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const dto: CreateSymptomLogDTO = req.body
        const log = await this._logService.create(userId, dto)

        sendSuccess(res, 'Symptom log created successfully', log, HTTP_STATUS.CREATED)
    }

    getPatientLogs = async (req: Request, res: Response) => {
        const { patientId } = req.params
        const logs = await this._logService.getPatientLogs(String(patientId))

        sendSuccess(res, undefined, logs)
    }
}
