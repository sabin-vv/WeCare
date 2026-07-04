import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { sendSuccess } from '../../../core/response/ApiResponse'
import { MSG } from '../constants/messages'
import { IPatientService } from '../interfaces/patient.service.interface'

@injectable()
export class PatientController {
    constructor(@inject(TOKENS.IPatientService) private _patientService: IPatientService) {}

    registerPatient = async (req: Request, res: Response) => {
        const result = await this._patientService.registerPatient(req.body)

        sendSuccess(res, MSG.REGISTERED, result, HTTP_STATUS.CREATED)
    }

    getProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._patientService.getProfile(userId)

        sendSuccess(res, MSG.PROFILE_FETCHED, result)
    }

    updateProfile = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._patientService.updateProfile(userId, req.body)

        sendSuccess(res, MSG.PROFILE_UPDATED, result)
    }

    getPatients = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId

        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHORIZED)
        }
        const { search, clinicalStatus, riskLevel, page, limit } = req.query

        const result = await this._patientService.listPatients(doctorId, {
            search: (search as string)?.trim() || '',
            clinicalStatus: (clinicalStatus as string) || 'all',
            riskLevel: (riskLevel as string) || 'all',
            page: parseInt(page as string) || 1,
            limit: parseInt(limit as string) || 8,
        })

        sendSuccess(res, MSG.LIST_FETCHED, result)
    }

    getPatientById = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId

        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHORIZED)
        }

        const { patientId } = req.params

        const result = await this._patientService.getPatientById(doctorId, patientId as string)

        sendSuccess(res, MSG.DETAILS_FETCHED, result)
    }

    updatePatientCondition = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId

        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHORIZED)
        }

        const { patientId } = req.params

        const result = await this._patientService.updatePatientCondition(doctorId, patientId as string, req.body)

        sendSuccess(res, MSG.CONDITION_UPDATED, result)
    }

    assignCaregiver = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId

        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHORIZED)
        }

        const { patientId } = req.params
        const { caregiverId } = req.body

        const result = await this._patientService.assignCaregiver(doctorId, patientId as string, caregiverId)

        sendSuccess(res, MSG.CAREGIVER_ASSIGNED, result)
    }

    getCareTeam = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const result = await this._patientService.getCareTeam(userId)

        sendSuccess(res, MSG.CARE_TEAM_FETCHED, result)
    }

    updateClinicalStatus = async (req: Request, res: Response) => {
        const doctorId = req.user?.userId

        if (!doctorId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHORIZED)
        }

        const { patientId } = req.params
        const { clinicalStatus } = req.body

        const result = await this._patientService.updateClinicalStatus(doctorId, patientId as string, clinicalStatus)

        sendSuccess(res, MSG.CLINICAL_STATUS_UPDATED, result)
    }
}
