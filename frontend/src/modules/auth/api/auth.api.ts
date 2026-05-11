import type { RegisterFormData, Role } from '../types/auth.types'

import type {
    ApiInterface,
    GetCurrentUser,
    LoginUser,
    PresignUploadParams,
    PresignUploadResponse,
} from './auth.api.types'

import { api } from '@/services/api'
import { AUTH_API, CAREGIVER_API, PATIENTS_API, UPLOADS_API } from '@/shared/constants/api.constants'
import type { PatientRegister } from '@/shared/types/model.types'

export const sendOtp = async (email: string, purpose: string): Promise<ApiInterface> => {
    const res = await api.post(`${AUTH_API}/send-otp`, {
        email,
        purpose,
    })

    return res.data
}

export const verifyOtp = async (email: string, otp: string): Promise<ApiInterface> => {
    const res = await api.post(`${AUTH_API}/verify-otp`, {
        email,
        otp,
    })
    return res.data
}

export const register = async (data: RegisterFormData, role: Role): Promise<ApiInterface> => {
    const res = await api.post(`${AUTH_API}/register`, { ...data, role })
    return res.data
}
export const patientRegister = async (data: PatientRegister): Promise<ApiInterface> => {
    const res = await api.post(`${PATIENTS_API}/register`, data)
    return res.data
}

export const caregiverRegister = async (formData: FormData): Promise<ApiInterface> => {
    const res = await api.post(`${CAREGIVER_API}/register`, formData)
    return res.data
}

export const loginUser = async (email: string, password: string, role: string): Promise<LoginUser> => {
    const res = await api.post(`${AUTH_API}/login`, { email, password, role })
    return res.data
}

export const logout = async (): Promise<ApiInterface> => {
    const res = await api.post(`${AUTH_API}/logout`)
    return res.data
}

export const presignUpload = async (params: PresignUploadParams): Promise<PresignUploadResponse> => {
    const res = await api.post(`${UPLOADS_API}/presign`, params)
    return res.data
}

export const uploadToS3 = async (uploadUrl: string, file: File): Promise<void> => {
    const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    })

    if (!res.ok) {
        throw new Error(`S3 upload failed: ${res.status} ${res.statusText}`)
    }
}

export const resetPassword = async (email: string, newPassword: string): Promise<ApiInterface> => {
    const res = await api.post(`${AUTH_API}/reset-password`, {
        email,
        newPassword,
    })
    return res.data
}

export const refreshToken = async (): Promise<ApiInterface> => {
    const res = await api.post(`${AUTH_API}/refresh-token`)
    return res.data
}

export const getCurrentUser = async (): Promise<GetCurrentUser> => {
    const res = await api.get(`${AUTH_API}/me`)
    return res.data
}

export const changePassword = async (currentPassword: string, newPassword: string): Promise<ApiInterface> => {
    const res = await api.post(`${AUTH_API}/change-password`, {
        currentPassword,
        newPassword,
    })
    return res.data
}
