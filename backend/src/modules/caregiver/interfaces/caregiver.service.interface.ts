import { MulterFiles } from '../../auth/types/auth.types'
import { CaregiverDocument, CaregiverProfileResponse } from '../types/caregiver.types'
import { CreateCaregiverProfileDTO, RegisterCaregiverDTO } from '../validator/caregiver.schema'
import { UpdateCaregiverSettingsDTO } from '../validator/updateCaregiverSettings.schema'

export interface ICaregiverService {
    registerCaregiver(dto: RegisterCaregiverDTO, files: MulterFiles): Promise<CaregiverDocument>
    createProfile(userId: string, dto: CreateCaregiverProfileDTO): Promise<CaregiverDocument>
    getProfile(userId: string): Promise<CaregiverProfileResponse>
    updateProfile(userId: string, dto: UpdateCaregiverSettingsDTO): Promise<CaregiverProfileResponse>
}
