import type { PresignUploadParams, PresignUploadResponse } from '../../auth/api/auth.api.types'
import type {
    ActivityLogsResponse,
    AdminAppointmentsResponse,
    AdminPaymentsResponse,
    DashboardChartData,
    PendingCaregiversResponse,
    PendingDoctorsResponse,
    PlatformSettings,
    RecentCaregiversResponse,
} from '../types/admin.types'
import type { ActivityLogFilters } from '../types/admin.types'

import { ADMIN_ENDPOINTS, ADMIN_UPLOAD_ENDPOINTS } from './admin.endpoints'

import { api } from '@/services/api'

export const getPendingDoctors = async (
    page: number,
    limit: number,
    search: string,
): Promise<PendingDoctorsResponse> => {
    const res = await api.get(ADMIN_ENDPOINTS.PENDING_DOCTORS, {
        params: { page, limit, search },
    })
    return res.data
}

export const getRecentDoctorVerifications = async (limit: number = 5): Promise<PendingDoctorsResponse> => {
    const res = await api.get(ADMIN_ENDPOINTS.RECENT_DOCTOR_VERIFICATIONS, {
        params: { limit },
    })
    return res.data
}

export const verifyDoctor = async (
    doctorId: string,
    status: 'verified' | 'rejected',
    reason?: string,
): Promise<{ message: string }> => {
    const res = await api.patch(ADMIN_ENDPOINTS.VERIFY_DOCTOR(doctorId), { status, reason })
    return res.data
}

export const verifySpecialization = async (
    doctorId: string,
    specIndex: number,
    verified: boolean,
): Promise<{ message: string }> => {
    const res = await api.patch(ADMIN_ENDPOINTS.VERIFY_SPECIALIZATION(doctorId, specIndex), {
        verified,
    })
    return res.data
}

export const getPendingCaregivers = async (
    page: number,
    limit: number,
    search: string,
): Promise<PendingCaregiversResponse> => {
    const res = await api.get(ADMIN_ENDPOINTS.PENDING_CAREGIVERS, {
        params: { page, limit, search },
    })
    return res.data
}

export const getRecentCaregiverVerifications = async (limit: number = 5): Promise<RecentCaregiversResponse> => {
    const res = await api.get(ADMIN_ENDPOINTS.RECENT_CAREGIVER_VERIFICATIONS, {
        params: { limit },
    })
    return res.data
}

export const verifyCaregiver = async (
    caregiverId: string,
    status: 'verified' | 'rejected',
    reason?: string,
): Promise<{ message: string }> => {
    const res = await api.patch(ADMIN_ENDPOINTS.VERIFY_CAREGIVER(caregiverId), { status, reason })
    return res.data
}

export const getDashboardChartData = async (
    limit?: number,
    startDate?: string,
    endDate?: string,
): Promise<DashboardChartData> => {
    const params: Record<string, string | number> = {}
    if (limit) params.limit = limit
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    const res = await api.get(ADMIN_ENDPOINTS.DASHBOARD_CHARTS, { params })
    return res.data.data
}

export const getAdminAppointments = async (
    page: number = 1,
    limit: number = 8,
    search?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
): Promise<AdminAppointmentsResponse> => {
    const params: Record<string, string | number> = { page, limit }
    if (search) params.search = search
    if (status && status !== 'all') params.status = status
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    const res = await api.get(ADMIN_ENDPOINTS.APPOINTMENTS, { params })
    return res.data
}

export const getAdminPayments = async (
    page: number = 1,
    limit: number = 8,
    search?: string,
    status?: string,
    paymentType?: string,
    startDate?: string,
    endDate?: string,
): Promise<AdminPaymentsResponse> => {
    const params: Record<string, string | number> = { page, limit }
    if (search) params.search = search
    if (status && status !== 'all') params.status = status
    if (paymentType && paymentType !== 'all') params.paymentType = paymentType
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    const res = await api.get(ADMIN_ENDPOINTS.PAYMENTS, { params })
    return res.data
}

export const getPendingCount = async (): Promise<{ count: number }> => {
    const res = await api.get(ADMIN_ENDPOINTS.PENDING_COUNT)
    return res.data
}

export const getPendingDoctorsCount = async (): Promise<{ count: number }> => {
    const res = await api.get(ADMIN_ENDPOINTS.PENDING_DOCTORS_COUNT)
    return res.data
}

export const getPendingCaregiversCount = async (): Promise<{ count: number }> => {
    const res = await api.get(ADMIN_ENDPOINTS.PENDING_CAREGIVERS_COUNT)
    return res.data
}

export const getUsers = async (role: string, search: string, page: number, limit: number) => {
    const res = await api.get(ADMIN_ENDPOINTS.USERS, {
        params: { role, search, page, limit },
    })
    return res.data
}

export const getActivityLogs = async (
    page: number = 1,
    limit: number = 20,
    filters: ActivityLogFilters = {},
): Promise<ActivityLogsResponse> => {
    const params: Record<string, string | number> = { page, limit }
    if (filters.category) params.category = filters.category
    if (filters.performedByRole) params.performedByRole = filters.performedByRole
    if (filters.targetType) params.targetType = filters.targetType
    if (filters.search) params.search = filters.search
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate

    const res = await api.get(ADMIN_ENDPOINTS.ACTIVITY_LOGS, { params })
    return res.data
}

export const toggleUserStatus = async (userId: string, isActive: boolean): Promise<{ message: string }> => {
    const res = await api.patch(ADMIN_ENDPOINTS.TOGGLE_STATUS(userId), {
        isActive,
    })
    return res.data
}

export const getPlatformSettings = async (): Promise<PlatformSettings> => {
    const res = await api.get(ADMIN_ENDPOINTS.PLATFORM_SETTINGS)
    return res.data
}

export const updatePlatformSettings = async (settings: Partial<PlatformSettings>): Promise<PlatformSettings> => {
    const res = await api.put(ADMIN_ENDPOINTS.PLATFORM_SETTINGS, settings)
    return res.data
}

export const presignUpload = async (params: PresignUploadParams): Promise<PresignUploadResponse> => {
    const res = await api.post(ADMIN_UPLOAD_ENDPOINTS.PRESIGN, params)
    return res.data
}

export const uploadToS3 = async (uploadUrl: string, file: File): Promise<void> => {
    await api.put(uploadUrl, file, {
        headers: {
            'Content-Type': file.type,
        },
    })
}
