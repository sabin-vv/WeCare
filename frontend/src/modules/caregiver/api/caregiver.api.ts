import type {
    AlertData,
    CaregiverProfileData,
    CaregiverProfileResponse,
    CaregiverProfileUpdateData,
    CreateReminderDTO,
    CaregiverActivityLogResponse,
    MedicationSchedule,
    PaginationData,
    PatientSummary,
    PrescriptionItem,
    RemindersResponse,
    VitalPlanItem,
    VitalScheduleItem,
} from '../types/caregiver.types'

import {
    CAREGIVER_ENDPOINTS,
    CAREGIVER_PATIENT_ENDPOINTS,
    CAREGIVER_REMINDER_ENDPOINTS,
    CAREGIVER_ACTIVITY_ENDPOINTS,
    CAREGIVER_ALERT_ENDPOINTS,
    CAREGIVER_PRESCRIPTION_ENDPOINTS,
} from './caregiver.endpoints'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import { api } from '@/services/api'

export type { PatientSummary, PrescriptionItem, VitalPlanItem } from '../types/caregiver.types'

export const createCaregiverProfile = async (formData: FormData): Promise<ApiInterface> => {
    const res = await api.post(CAREGIVER_ENDPOINTS.PROFILE, formData)
    return res.data
}

export const getCaregiverProfile = async (): Promise<CaregiverProfileResponse> => {
    const res = await api.get<CaregiverProfileResponse>(CAREGIVER_ENDPOINTS.ME)
    return res.data
}

export const updateCaregiverProfile = async (
    data: CaregiverProfileUpdateData | FormData,
): Promise<CaregiverProfileResponse> => {
    const res = await api.put(CAREGIVER_ENDPOINTS.ME, data)
    return res.data
}

export const updateCaregiverActiveStatus = async (isActive: boolean): Promise<CaregiverProfileData> => {
    const res = await api.patch<{ success: boolean; message: string; data: CaregiverProfileData }>(
        CAREGIVER_ENDPOINTS.ACTIVE_STATUS,
        { isActive },
    )
    return res.data.data
}

export const getPatientMedications = async (patientId: string): Promise<MedicationSchedule[]> => {
    const res = await api.get<{ success: boolean; data: MedicationSchedule[]; message: string }>(
        CAREGIVER_PATIENT_ENDPOINTS.MEDICATIONS(patientId),
    )
    return res.data.data
}

export const getPatientVitalSchedules = async (patientId: string): Promise<VitalScheduleItem[]> => {
    const res = await api.get<{ success: boolean; data: VitalScheduleItem[]; message: string }>(
        CAREGIVER_PATIENT_ENDPOINTS.VITAL_SCHEDULES(patientId),
    )
    return res.data.data
}

export const getMyPatients = async (): Promise<PatientSummary[]> => {
    const res = await api.get<{ success: boolean; data: PatientSummary[]; message: string }>(
        CAREGIVER_ENDPOINTS.PATIENTS,
    )
    return res.data.data
}

export const logMedicationAction = async (
    patientId: string,
    scheduleId: string,
    data: {
        status: 'on_time' | 'taken_late' | 'skipped'
        takenTime: string
        route: string
        observations?: string
    },
): Promise<MedicationSchedule> => {
    const res = await api.post<{ success: boolean; data: MedicationSchedule; message: string }>(
        CAREGIVER_PATIENT_ENDPOINTS.MEDICATION_LOG(patientId, scheduleId),
        data,
    )
    return res.data.data
}

export const logVitalReading = async (
    patientId: string,
    data: {
        scheduleId?: string
        vitalType: string
        systolic?: number
        diastolic?: number
        value?: number
        recordedAt: string
        notes?: string
    },
): Promise<{ vitalId: string; vitalType: string; scheduleId?: string; recordedAt: string }> => {
    const res = await api.post<{
        success: boolean
        data: { vitalId: string; vitalType: string; scheduleId?: string; recordedAt: string }
        message: string
    }>(CAREGIVER_PATIENT_ENDPOINTS.VITAL_LOG(patientId), data)
    return res.data.data
}

export const logSymptom = async (
    patientId: string,
    data: {
        symptom: string
        onsetTime: string
        severity: 'mild' | 'moderate' | 'severe' | 'critical'
        observations?: string
    },
): Promise<{
    _id: string
    symptom: string
    severity: 'mild' | 'moderate' | 'severe' | 'critical'
    onsetTime: string
    observations?: string
    createdAt: string
}> => {
    const res = await api.post<{
        success: boolean
        data: {
            _id: string
            symptom: string
            severity: 'mild' | 'moderate' | 'severe' | 'critical'
            onsetTime: string
            observations?: string
            createdAt: string
        }
        message: string
    }>(CAREGIVER_PATIENT_ENDPOINTS.SYMPTOM_LOG(patientId), data)
    return res.data.data
}

export const getReminders = async (): Promise<RemindersResponse> => {
    const res = await api.get<{ success: boolean; data: RemindersResponse; message: string }>(
        CAREGIVER_REMINDER_ENDPOINTS.BASE,
    )
    return res.data.data
}

export const createReminder = async (dto: CreateReminderDTO): Promise<void> => {
    await api.post(CAREGIVER_REMINDER_ENDPOINTS.BASE, dto)
}

export const markReminderDone = async (reminderId: string): Promise<void> => {
    await api.patch(CAREGIVER_REMINDER_ENDPOINTS.DONE(reminderId))
}

export const deleteReminder = async (reminderId: string): Promise<void> => {
    await api.delete(CAREGIVER_REMINDER_ENDPOINTS.BY_ID(reminderId))
}

export const getCaregiverActivityLogs = async (page = 1, limit = 8): Promise<CaregiverActivityLogResponse> => {
    const res = await api.get<{ success: boolean; data: CaregiverActivityLogResponse }>(
        CAREGIVER_ACTIVITY_ENDPOINTS.LOGS,
        {
            params: { page, limit },
        },
    )
    return res.data.data
}

export const getPatientPrescriptions = async (patientId: string): Promise<PrescriptionItem[]> => {
    const res = await api.get<{ success: boolean; data: PrescriptionItem[] }>(
        CAREGIVER_PRESCRIPTION_ENDPOINTS.BY_PATIENT(patientId),
    )
    return res.data.data
}

export const getPatientVitalPlans = async (patientId: string): Promise<VitalPlanItem[]> => {
    const res = await api.get<{ success: boolean; data: VitalPlanItem[] }>(
        CAREGIVER_PATIENT_ENDPOINTS.VITAL_PLANS(patientId),
    )
    return res.data.data
}

export const getCaregiverAlerts = async (filters?: {
    type?: string
    severity?: string
    status?: string
    limit?: number
    page?: number
}): Promise<{ alerts: AlertData[]; pagination: PaginationData }> => {
    const res = await api.get<{ success: boolean; data: { alerts: AlertData[]; pagination: PaginationData } }>(
        CAREGIVER_ENDPOINTS.ALERTS,
        { params: filters },
    )
    return res.data.data
}

export const acknowledgeAlert = async (alertId: string, note?: string): Promise<AlertData> => {
    const res = await api.patch<{ success: boolean; data: AlertData; message: string }>(
        CAREGIVER_ALERT_ENDPOINTS.ACKNOWLEDGE(alertId),
        { note },
    )
    return res.data.data
}
