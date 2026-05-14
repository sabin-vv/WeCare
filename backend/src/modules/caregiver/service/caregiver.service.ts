import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { ICaregiverRepository } from '../interfaces/caregiver.repository.interface'
import { ICaregiverService } from '../interfaces/caregiver.service.interface'
import { toCaregiverEntity, toCaregiverProfileEntity, toCaregiverProfileResponse, toCaregiverProfileResponseFromAggregation } from '../mapper/caregiver.mapper'
import { CaregiverProfileResponse } from '../types/caregiver.types'
import { CreateCaregiverProfileDTO } from '../validator/caregiver.schema'
import { UpdateCaregiverSettingsDTO } from '../validator/updateCaregiverSettings.schema'

@injectable()
export class CaregiverService implements ICaregiverService {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.ICaregiverRepository) private _caregiverRepo: ICaregiverRepository,
    ) {}

    async createProfile(userId: string, dto: CreateCaregiverProfileDTO): Promise<Partial<CaregiverProfileResponse>> {
        const existingCaregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (existingCaregiver) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Caregiver profile already exists')
        }

        const caregiverData = toCaregiverEntity(new Types.ObjectId(userId), dto, {})
        const caregiver = await this._caregiverRepo.create(caregiverData)
        await this._userRepo.update(userId, { isProfileComplete: true })

        return toCaregiverProfileEntity(caregiver)
    }

    async getProfile(userId: string): Promise<CaregiverProfileResponse> {
        const user = await this._userRepo.findById(userId)
        if (!user) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        const caregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        return toCaregiverProfileResponse(user, caregiver)
    }

    async updateProfile(userId: string, dto: UpdateCaregiverSettingsDTO): Promise<CaregiverProfileResponse> {
        const existingCaregiver = await this._caregiverRepo.findByUserId(new Types.ObjectId(userId))
        if (!existingCaregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        await this._userRepo.update(userId, {
            name: dto.fullName,
            email: dto.email,
            mobile: dto.phoneNumber,
        })

        const caregiver = await this._caregiverRepo.updateByUserId(new Types.ObjectId(userId), {
            phoneNumber: dto.phoneNumber,
            isActive: dto.isActive !== undefined ? dto.isActive : existingCaregiver.isActive,
            profileImage: dto.profileImage || existingCaregiver.profileImage,
        })
        if (!caregiver) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'Caregiver profile not found')
        }

        const updatedUser = await this._userRepo.findById(userId)
        if (!updatedUser) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
        }

        return toCaregiverProfileResponse(updatedUser, caregiver)
    }

    async listCaregivers(search?: string): Promise<CaregiverProfileResponse[]> {
        const caregivers = await this._caregiverRepo.findAllActive(search)

        return caregivers.map(toCaregiverProfileResponseFromAggregation)
    }
}
