import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IPatientService } from '../interfaces/patient.service.interface'

@injectable()
export class PatientController {
    constructor(@inject(TOKENS.IPatientService) private _patientService: IPatientService) {}

    registerPatient = async (req: Request, res: Response) => {
        const result = await this._patientService.registerPatient(req.body)

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: result,
            message: 'Patient registered successfully',
        })
    }

    getProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const result = await this._patientService.getProfile(userId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: 'Patient profile fetched',
        })
    }

    updateProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const result = await this._patientService.updateProfile(userId, req.body)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
            message: 'Patient profile updated successfully',
        })
    }
}
