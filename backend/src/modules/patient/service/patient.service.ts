import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { toUserEntity } from '../../auth/mapper/auth.mapper'
import { UserRole } from '../../auth/types/auth.types'
import { IPatientRepository } from '../interfaces/patient.repository.interface'
import { IPatientService } from '../interfaces/patient.service.interface'
import {
    PatientProfileResponseDTO,
    PatientResponseDTO,
    toPatientEntity,
    toPatientProfileResponseDTO,
    toPatientResponseDTO,
} from '../mapper/patient.mapper'
import { RegisterPatientDTO } from '../validator/patient.schema'
import { UpdatePatientSettingsDTO } from '../validator/updatePatientSettings.schema'

const STARTING_ID = 1000

@injectable()
export class PatientService implements IPatientService {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
    ) {}

    private async generateNextPatientId(): Promise<string> {
        const lastId = await this._patientRepo.getLastPatientId()
        const nextNumber = lastId ? parseInt(lastId, 10) + 1 : STARTING_ID
        return String(nextNumber)
    }

    async registerPatient(dto: RegisterPatientDTO): Promise<PatientResponseDTO> {
        const existing = await this._userRepo.findByEmail(dto.email)
        if (existing) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'User already exist')

        const userData = await toUserEntity(dto, UserRole.PATIENT)
        const user = await this._userRepo.create(userData)

        const patientId = await this.generateNextPatientId()
        const patientData = toPatientEntity(user._id, patientId, dto)
        const patient = await this._patientRepo.create(patientData)
        return toPatientResponseDTO(user, patient)
    }

    async getProfile(userId: string): Promise<PatientProfileResponseDTO> {
        const user = await this._userRepo.findById(userId)
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient profile not found')
        }

        return toPatientProfileResponseDTO(user, patient)
    }

    async updateProfile(userId: string, dto: UpdatePatientSettingsDTO): Promise<PatientProfileResponseDTO> {
        const existingPatient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!existingPatient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient profile not found')
        }

        const userUpdates: Record<string, string> = {}
        if (dto.name !== undefined) {
            userUpdates.name = dto.name
        }
        if (dto.email !== undefined) {
            userUpdates.email = dto.email
        }
        if (dto.mobile !== undefined) {
            userUpdates.mobile = dto.mobile
        }
        if (Object.keys(userUpdates).length > 0) {
            await this._userRepo.update(userId, userUpdates)
        }

        const patientUpdates = {
            profileImage: dto.profileImage ?? existingPatient.profileImage,
        }

        const patient = await this._patientRepo.updateByUserId(new Types.ObjectId(userId), patientUpdates)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Patient profile not found')
        }

        const updatedUser = await this._userRepo.findById(userId)
        if (!updatedUser) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        return toPatientProfileResponseDTO(updatedUser, patient)
    }
}
