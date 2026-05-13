import { CaregiverProfileResponse } from '../types/caregiver.types'
import { CreateCaregiverProfileDTO } from '../validator/caregiver.schema'
import { UpdateCaregiverSettingsDTO } from '../validator/updateCaregiverSettings.schema'

export interface ICaregiverService {
    createProfile(userId: string, dto: CreateCaregiverProfileDTO): Promise<Partial<CaregiverProfileResponse>>
    getProfile(userId: string): Promise<CaregiverProfileResponse>
    updateProfile(userId: string, dto: UpdateCaregiverSettingsDTO): Promise<CaregiverProfileResponse>
    listCaregivers(search?: string): Promise<CaregiverProfileResponse[]>
}
