import type {
    AppointmentStats,
    DashboardStats,
    DashboardStatsResponse,
    DoctorAvailability,
    DoctorAvailabilityResponse,
    DoctorProfile,
    DoctorProfileResponse,
    DoctorAvailabilityUpdateResponse,
    DoctorAvailabilityUpdateResult,
    UpdateDoctorProfileData,
    ListPatientsResponse,
    DoctorAppointmentsResponse,
    PatientDetails,
    PatientDetailsResponse,
    PatientVitalPlan,
    UpdatePatientConditionPayload,
    AddPrescriptionPayload,
    AddVitalPlanPayload,
    PatientPrescription,
    PaginatedPrescriptionsResponse,
    MedicalRecordData,
} from '../types/doctor.types'

import {
    DOCTOR_ENDPOINTS,
    DOCTOR_PATIENT_ENDPOINTS,
    DOCTOR_PRESCRIPTION_ENDPOINTS,
    DOCTOR_VITAL_ENDPOINTS,
    DOCTOR_CAREGIVER_ENDPOINTS,
    DOCTOR_MEDICAL_RECORD_ENDPOINTS,
} from './doctor.endpoints'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import { api } from '@/services/api'

export const updateProfile = async (data: FormData, hasExistingProfile = false): Promise<ApiInterface> => {
    const res = hasExistingProfile
        ? await api.put(DOCTOR_ENDPOINTS.PROFILE, data)
        : await api.post(DOCTOR_ENDPOINTS.PROFILE_CREATE, data)

    return res.data
}

export const getDoctorProfile = async (): Promise<DoctorProfile> => {
    const res = await api.get<DoctorProfileResponse>(DOCTOR_ENDPOINTS.PROFILE)

    return res.data.data
}

export const updateDoctorProfile = async (data: UpdateDoctorProfileData): Promise<DoctorProfile> => {
    const res = await api.put<DoctorProfileResponse>(DOCTOR_ENDPOINTS.PROFILE, data)

    return res.data.data
}

export const updateDoctorActiveStatus = async (isActive: boolean): Promise<DoctorProfile> => {
    const res = await api.patch<DoctorProfileResponse>(DOCTOR_ENDPOINTS.ACTIVE_STATUS, { isActive })

    return res.data.data
}

const unwrapDoctorAvailability = (payload: DoctorAvailability | DoctorAvailabilityResponse) => {
    return 'data' in payload ? payload.data : payload
}

export const getDoctorAvailability = async (): Promise<DoctorAvailability> => {
    const res = await api.get<DoctorAvailability | DoctorAvailabilityResponse>(DOCTOR_ENDPOINTS.AVAILABILITY)
    return unwrapDoctorAvailability(res.data)
}

export const updateDoctorAvailability = async (data: DoctorAvailability): Promise<DoctorAvailabilityUpdateResult> => {
    const res = await api.put<DoctorAvailabilityUpdateResponse>(DOCTOR_ENDPOINTS.AVAILABILITY, data)
    return res.data.data
}

export const listPatients = async (
    search: string,
    clinicalStatus: string,
    riskLevel: string,
    page: number,
    limit: number,
): Promise<ListPatientsResponse> => {
    const res = await api.get(DOCTOR_PATIENT_ENDPOINTS.LIST, {
        params: {
            search,
            clinicalStatus,
            riskLevel,
            page,
            limit,
        },
    })

    return res.data.data
}

export const getDoctorAppointments = async (
    search: string,
    page: number,
    limit: number,
    date?: string,
): Promise<DoctorAppointmentsResponse> => {
    const res = await api.get<{ data: DoctorAppointmentsResponse }>(DOCTOR_ENDPOINTS.APPOINTMENTS, {
        params: {
            search,
            page,
            limit,
            date,
        },
    })

    return res.data.data
}

export const getPatientById = async (patientId: string): Promise<PatientDetails> => {
    const res = await api.get<PatientDetailsResponse>(DOCTOR_PATIENT_ENDPOINTS.BY_ID(patientId))

    return res.data.data
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const res = await api.get<DashboardStatsResponse>(DOCTOR_ENDPOINTS.DASHBOARD)
    return res.data.data
}

export const getAppointmentStats = async (startDate: string, endDate: string): Promise<AppointmentStats> => {
    const res = await api.get<{ success: boolean; data: AppointmentStats }>(DOCTOR_ENDPOINTS.APPOINTMENT_STATS, {
        params: { startDate, endDate },
    })
    return res.data.data
}

export const startConsultation = async (patientId: string): Promise<{ appointmentId: string }> => {
    const res = await api.put(DOCTOR_PATIENT_ENDPOINTS.START_CONSULTATION(patientId))

    return res.data.data
}

export const completeConsultation = async (patientId: string): Promise<ApiInterface> => {
    const res = await api.put(DOCTOR_PATIENT_ENDPOINTS.COMPLETE_CONSULTATION(patientId))

    return res.data
}

export const updatePatientCondition = async (
    patientId: string,
    data: UpdatePatientConditionPayload,
): Promise<PatientDetails> => {
    const res = await api.patch<PatientDetailsResponse>(DOCTOR_PATIENT_ENDPOINTS.CONDITION(patientId), data)

    return res.data.data
}

export const addPrescription = async (
    patientId: string,
    data: AddPrescriptionPayload,
): Promise<PatientPrescription> => {
    const res = await api.post(DOCTOR_PRESCRIPTION_ENDPOINTS.CREATE, {
        ...data,
        patientId,
    })

    return res.data.data
}

export const updatePrescriptionStatus = async (prescriptionId: string, status: string): Promise<void> => {
    await api.patch(DOCTOR_PRESCRIPTION_ENDPOINTS.STATUS(prescriptionId), { status })
}

export const getPatientPrescriptions = async (
    patientId: string,
    page: number,
    limit: number,
): Promise<PaginatedPrescriptionsResponse> => {
    const res = await api.get<PaginatedPrescriptionsResponse>(DOCTOR_PRESCRIPTION_ENDPOINTS.BY_PATIENT(patientId), {
        params: { page, limit },
    })

    return res.data
}

export const createVitalPlan = async (patientId: string, data: AddVitalPlanPayload): Promise<void> => {
    await api.post(DOCTOR_VITAL_ENDPOINTS.PLANS, {
        ...data,
        patientId,
    })
}

export const getPatientVitalPlans = async (patientId: string, status = 'active'): Promise<PatientVitalPlan[]> => {
    const res = await api.get<{ data: PatientVitalPlan[] }>(DOCTOR_VITAL_ENDPOINTS.PLANS_BY_PATIENT(patientId), {
        params: { status },
    })

    return res.data.data
}

export const cancelPatientVitalPlan = async (planId: string): Promise<void> => {
    await api.patch(DOCTOR_VITAL_ENDPOINTS.PLAN_CANCEL(planId))
}

export const assignCaregiver = async (patientId: string, caregiverId: string): Promise<PatientDetails> => {
    const res = await api.patch<PatientDetailsResponse>(DOCTOR_PATIENT_ENDPOINTS.CAREGIVER(patientId), { caregiverId })

    return res.data.data
}

export const listCaregivers = async (search?: string) => {
    const res = await api.get(DOCTOR_CAREGIVER_ENDPOINTS.LIST, {
        params: { search },
    })

    return res.data.data as {
        id: string
        fullName: string
        email: string
        phoneNumber: string
        profileImage: string
    }[]
}

export const updateClinicalStatus = async (
    patientId: string,
    clinicalStatus: string,
): Promise<PatientDetailsResponse> => {
    const res = await api.patch(DOCTOR_PATIENT_ENDPOINTS.CLINICAL_STATUS(patientId), {
        clinicalStatus,
    })
    return res.data
}

export const getPatientMedicalRecord = async (patientId: string): Promise<MedicalRecordData> => {
    const res = await api.get<{ success: boolean; data: MedicalRecordData }>(
        DOCTOR_MEDICAL_RECORD_ENDPOINTS.BY_PATIENT(patientId),
    )
    return res.data.data
}

export const updateMedicalRecord = async (
    patientId: string,
    data: { allergies?: string[]; pastSurgeries?: string },
): Promise<MedicalRecordData> => {
    const res = await api.patch<{ success: boolean; data: MedicalRecordData }>(
        DOCTOR_MEDICAL_RECORD_ENDPOINTS.BY_PATIENT(patientId),
        data,
    )
    return res.data.data
}

export const addClinicalNote = async (patientId: string, note: string): Promise<MedicalRecordData> => {
    const res = await api.post<{ success: boolean; data: MedicalRecordData }>(
        DOCTOR_MEDICAL_RECORD_ENDPOINTS.NOTES(patientId),
        { note },
    )
    return res.data.data
}
