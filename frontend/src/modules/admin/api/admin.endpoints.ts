import { ADMIN_API, UPLOADS_API } from '@/shared/constants/api.constants'

export const ADMIN_ENDPOINTS = {
    PENDING_DOCTORS: `${ADMIN_API}/pending-doctors`,
    RECENT_DOCTOR_VERIFICATIONS: `${ADMIN_API}/recent-doctor-verifications`,
    VERIFY_DOCTOR: (doctorId: string) => `${ADMIN_API}/verify-doctor/${doctorId}`,
    VERIFY_SPECIALIZATION: (doctorId: string, specIndex: number) =>
        `${ADMIN_API}/verify-specialization/${doctorId}/${specIndex}`,
    PENDING_CAREGIVERS: `${ADMIN_API}/pending-caregivers`,
    RECENT_CAREGIVER_VERIFICATIONS: `${ADMIN_API}/recent-caregiver-verifications`,
    VERIFY_CAREGIVER: (caregiverId: string) => `${ADMIN_API}/verify-caregiver/${caregiverId}`,
    DASHBOARD_CHARTS: `${ADMIN_API}/dashboard-charts`,
    APPOINTMENTS: `${ADMIN_API}/appointments`,
    PAYMENTS: `${ADMIN_API}/payments`,
    PENDING_COUNT: `${ADMIN_API}/pending-count`,
    PENDING_DOCTORS_COUNT: `${ADMIN_API}/pending-doctors-count`,
    PENDING_CAREGIVERS_COUNT: `${ADMIN_API}/pending-caregivers-count`,
    USERS: `${ADMIN_API}/users`,
    ACTIVITY_LOGS: '/activity-logs',
    TOGGLE_STATUS: (userId: string) => `${ADMIN_API}/toggle-status/${userId}`,
    PLATFORM_SETTINGS: `${ADMIN_API}/platform-settings`,
} as const

export const ADMIN_UPLOAD_ENDPOINTS = {
    PRESIGN: `${UPLOADS_API}/presign`,
} as const
