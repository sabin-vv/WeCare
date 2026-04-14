import type { DoctorProfile, DoctorProfileResponse, UpdateDoctorProfileData } from '../types/doctor.types'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import { api } from '@/services/api'

export const updateProfile = async (data: FormData): Promise<ApiInterface> => {
    const res = await api.post('/doctors/profile', data)

    return res.data
}

export const getDoctorProfile = async (): Promise<DoctorProfile> => {
    const res = await api.get<DoctorProfileResponse>('/doctors/me')

    return res.data.data
}

export const updateDoctorProfile = async (data: UpdateDoctorProfileData): Promise<DoctorProfile> => {
    const res = await api.put<DoctorProfileResponse>('/doctors/me', data)

    return res.data.data
}
