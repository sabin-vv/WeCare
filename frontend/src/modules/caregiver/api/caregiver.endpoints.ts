import {
    ALERTS_API,
    CAREGIVER_ACTIVITY_API,
    CAREGIVERS_API,
    PRESCRIPTIONS_API,
    REMINDERS_API,
} from '@/shared/constants/api.constants'

export const CAREGIVER_ENDPOINTS = {
    REGISTER: `${CAREGIVERS_API}/register`,
    PROFILE: `${CAREGIVERS_API}/profile`,
    ME: `${CAREGIVERS_API}/me`,
    ACTIVE_STATUS: `${CAREGIVERS_API}/active-status`,
    PATIENTS: `${CAREGIVERS_API}/patients`,
    ALERTS: `${CAREGIVERS_API}/alerts`,
} as const

export const CAREGIVER_PATIENT_ENDPOINTS = {
    MEDICATIONS: (patientId: string) => `${CAREGIVERS_API}/patients/${patientId}/medications`,
    MEDICATION_LOG: (patientId: string, scheduleId: string) =>
        `${CAREGIVERS_API}/patients/${patientId}/medications/${scheduleId}/log`,
    VITAL_SCHEDULES: (patientId: string) => `${CAREGIVERS_API}/patients/${patientId}/vital-schedules`,
    VITAL_LOG: (patientId: string) => `${CAREGIVERS_API}/patients/${patientId}/vitals/log`,
    SYMPTOM_LOG: (patientId: string) => `${CAREGIVERS_API}/patients/${patientId}/symptoms/log`,
    VITAL_PLANS: (patientId: string) => `${CAREGIVERS_API}/patients/${patientId}/vital-plans`,
} as const

export const CAREGIVER_REMINDER_ENDPOINTS = {
    BASE: REMINDERS_API,
    DONE: (reminderId: string) => `${REMINDERS_API}/${reminderId}/done`,
    BY_ID: (reminderId: string) => `${REMINDERS_API}/${reminderId}`,
} as const

export const CAREGIVER_ACTIVITY_ENDPOINTS = {
    LOGS: CAREGIVER_ACTIVITY_API,
} as const

export const CAREGIVER_ALERT_ENDPOINTS = {
    ACKNOWLEDGE: (alertId: string) => `${ALERTS_API}/${alertId}/acknowledge`,
} as const

export const CAREGIVER_PRESCRIPTION_ENDPOINTS = {
    BY_PATIENT: (patientId: string) => `${PRESCRIPTIONS_API}/patient/${patientId}`,
} as const
