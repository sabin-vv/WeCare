import {
    APPOINTMENT_API,
    CAREGIVERS_API,
    DOCTORS_API,
    MEDICAL_RECORDS_API,
    PATIENTS_API,
    PRESCRIPTIONS_API,
    VITALS_API,
} from '@/shared/constants/api.constants'

export const DOCTOR_ENDPOINTS = {
    PROFILE: `${DOCTORS_API}/me`,
    PROFILE_CREATE: `${DOCTORS_API}/profile`,
    ACTIVE_STATUS: `${DOCTORS_API}/active-status`,
    AVAILABILITY: `${DOCTORS_API}/availability`,
    DASHBOARD: `${DOCTORS_API}/dashboard`,
    APPOINTMENT_STATS: `${DOCTORS_API}/appointment-stats`,
    APPOINTMENTS: `${APPOINTMENT_API}/doctor`,
} as const

export const DOCTOR_PATIENT_ENDPOINTS = {
    LIST: `${PATIENTS_API}/`,
    BY_ID: (patientId: string) => `${PATIENTS_API}/${patientId}`,
    CONDITION: (patientId: string) => `${PATIENTS_API}/${patientId}/condition`,
    CAREGIVER: (patientId: string) => `${PATIENTS_API}/${patientId}/caregiver`,
    CLINICAL_STATUS: (patientId: string) => `${PATIENTS_API}/${patientId}/clinical-status`,
    START_CONSULTATION: (patientId: string) => `${DOCTORS_API}${PATIENTS_API}/${patientId}/start-consultation`,
    COMPLETE_CONSULTATION: (patientId: string) => `${DOCTORS_API}${PATIENTS_API}/${patientId}/complete-consultation`,
} as const

export const DOCTOR_PRESCRIPTION_ENDPOINTS = {
    CREATE: `${PRESCRIPTIONS_API}`,
    STATUS: (prescriptionId: string) => `${PRESCRIPTIONS_API}/${prescriptionId}/status`,
    BY_PATIENT: (patientId: string) => `${PRESCRIPTIONS_API}/patient/${patientId}`,
} as const

export const DOCTOR_VITAL_ENDPOINTS = {
    PLANS: `${VITALS_API}/plans`,
    PLANS_BY_PATIENT: (patientId: string) => `${VITALS_API}/plans/patient/${patientId}`,
    PLAN_CANCEL: (planId: string) => `${VITALS_API}/plans/${planId}/cancel`,
} as const

export const DOCTOR_CAREGIVER_ENDPOINTS = {
    LIST: `${CAREGIVERS_API}/`,
} as const

export const DOCTOR_MEDICAL_RECORD_ENDPOINTS = {
    BY_PATIENT: (patientId: string) => `${MEDICAL_RECORDS_API}/${patientId}`,
    NOTES: (patientId: string) => `${MEDICAL_RECORDS_API}/${patientId}/notes`,
} as const
