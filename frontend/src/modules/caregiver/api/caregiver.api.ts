import type { CaregiverProfileResponse } from '../types/caregiver.types'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import { api } from '@/services/api'
import { CAREGIVERS_API } from '@/shared/constants/api.constants'

export const createCaregiverProfile = async (formData: FormData): Promise<ApiInterface> => {
    const res = await api.post(`${CAREGIVERS_API}/profile`, formData)
    return res.data
}

export const getCaregiverProfile = async (): Promise<CaregiverProfileResponse> => {
    const res = await api.get<CaregiverProfileResponse>(`${CAREGIVERS_API}/me`)
    return res.data
}

export const updateCaregiverProfile = async (data: Record<string, unknown>): Promise<CaregiverProfileResponse> => {
    const res = await api.put<CaregiverProfileResponse>(`${CAREGIVERS_API}/me`, data)
    return res.data
}
