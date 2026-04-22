import { MulterFiles } from '../../auth/types/auth.types'
import { CaregiverProfileResponse } from '../types/caregiver.types'
import { CreateCaregiverProfileDTO, RegisterCaregiverDTO } from '../validator/caregiver.schema'
import { UpdateCaregiverSettingsDTO } from '../validator/updateCaregiverSettings.schema'

export interface ICaregiverService {
    registerCaregiver(dto: RegisterCaregiverDTO, files: MulterFiles): Promise<CaregiverProfileResponse>
    createProfile(userId: string, dto: CreateCaregiverProfileDTO): Promise<CaregiverProfileResponse>
    getProfile(userId: string): Promise<CaregiverProfileResponse>
    updateProfile(userId: string, dto: UpdateCaregiverSettingsDTO): Promise<CaregiverProfileResponse>
}
