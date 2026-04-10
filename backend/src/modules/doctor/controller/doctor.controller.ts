import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IDoctorService } from '../interfaces/doctor.service.interface'

@injectable()
export class DoctorController {
    constructor(@inject(TOKENS.IDoctorService) private _doctorService: IDoctorService) {}

    createProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const result = await this._doctorService.createProfile(userId, req.body)

        res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Profile updated', data: result })
    }
}
