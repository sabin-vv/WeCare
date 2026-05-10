import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IVitalService } from '../interfaces/vital.service.interface'

@injectable()
export class VitalController {
    constructor(@inject(TOKENS.IVitalService) private _vitalService: IVitalService) {}

    createVital = async (req: Request, res: Response) => {
        const recordedBy = req.user?.userId
        if (!recordedBy) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const result = await this._vitalService.createVital(recordedBy, req.body)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Vital recorded successfully',
            data: result,
        })
    }

    getPatientVitals = async (req: Request, res: Response) => {
        const { patientId } = req.params
        if (typeof patientId !== 'string' || !patientId) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Patient ID is required')
        }

        const type = typeof req.query.type === 'string' ? req.query.type : undefined
        const result = await this._vitalService.getPatientVitals(patientId, type)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
        })
    }
}
