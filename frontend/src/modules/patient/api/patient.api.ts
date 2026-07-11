import type {
    Appointment,
    AppointmentCheckoutResponse,
    CreateAppointmentRequest,
    GetWalletResponse,
    DoctorSlotsResponse,
    GetDoctorsParams,
    MedicationSchedule,
    PatientProfileData,
    PatientProfileResponse,
    Prescription,
    RescheduleAppointmentRequest,
    Specialist,
    SubscriptionData,
    UpdatePatientProfileData,
    VerifyPaymentRequest,
    RetryPaymentResponse,
    VitalSchedule,
    CreateSubscriptionResponse,
    CreateFeedbackDTO,
    CareTeamMember,
} from '../types/patient.types'

import { PATIENT_ENDPOINTS } from './patient.endpoints'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import { api } from '@/services/api'

export type GetDoctorsResponse = {
    data: Specialist[]
    specialties: string[]
    totalPages: number
    totalCount: number
    currentPage: number
}

export const getDoctors = async (params: GetDoctorsParams): Promise<GetDoctorsResponse> => {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.append('search', params.search)
    if (params.specialty) searchParams.append('specialty', params.specialty)
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)

    const response = await api.get<GetDoctorsResponse>(`${PATIENT_ENDPOINTS.DOCTORS}?${searchParams.toString()}`)
    return response.data
}

export const getPatientProfile = async (): Promise<PatientProfileData> => {
    const response = await api.get<PatientProfileResponse>(PATIENT_ENDPOINTS.PROFILE)
    return response.data.data
}

export const updatePatientProfile = async (data: UpdatePatientProfileData): Promise<PatientProfileData> => {
    const response = await api.put<PatientProfileResponse>(PATIENT_ENDPOINTS.PROFILE, data)
    return response.data.data
}

export const getDoctorSlots = async (doctorId: string, date: string): Promise<DoctorSlotsResponse> => {
    const response = await api.get<{ data: DoctorSlotsResponse }>(PATIENT_ENDPOINTS.DOCTOR_SLOTS(doctorId), {
        params: { date },
    })
    return response.data.data
}

export const createAppointment = async (data: CreateAppointmentRequest): Promise<AppointmentCheckoutResponse> => {
    const response = await api.post<{ data: AppointmentCheckoutResponse }>(PATIENT_ENDPOINTS.APPOINTMENTS, data)
    return response.data.data
}

export const verifyPayment = async (data: VerifyPaymentRequest): Promise<Appointment> => {
    const response = await api.post<{ data: Appointment }>(PATIENT_ENDPOINTS.PAYMENT_VERIFY, data)
    return response.data.data
}

export const getPatientAppointments = async (): Promise<Appointment[]> => {
    const response = await api.get<{ data: Appointment[] }>(PATIENT_ENDPOINTS.APPOINTMENTS)
    return response.data.data
}

export const getAppointmentById = async (appointmentId: string): Promise<Appointment> => {
    const response = await api.get<{ success: boolean; data: Appointment }>(PATIENT_ENDPOINTS.APPOINTMENT_BY_ID(appointmentId))
    return response.data.data
}

export const getWallet = async (): Promise<GetWalletResponse> => {
    const response = await api.get(PATIENT_ENDPOINTS.WALLET)
    return response.data
}

export const createWalletTopupOrder = async (
    amount: number,
): Promise<{ success: boolean; data: { orderId: string; amount: number; currency: string; keyId: string } }> => {
    const response = await api.post(PATIENT_ENDPOINTS.WALLET_TOPUP_ORDER, { amount })
    return response.data
}

export type VerifyWalletTopupPayload = {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
}

export const verifyWalletTopup = async (
    dto: VerifyWalletTopupPayload,
): Promise<{ success: boolean; message: string; data: { balance: number } }> => {
    const response = await api.post(PATIENT_ENDPOINTS.WALLET_TOPUP_VERIFY, dto)
    return response.data
}

export const cancelAppointment = async (id: string, reason: string): Promise<ApiInterface> => {
    const response = await api.patch(PATIENT_ENDPOINTS.APPOINTMENT_CANCEL(id), { reason })
    return response.data
}

export const retryPayment = async (id: string, paymentMethod: 'razorpay' | 'wallet'): Promise<RetryPaymentResponse> => {
    const response = await api.post<{ data: RetryPaymentResponse }>(PATIENT_ENDPOINTS.APPOINTMENT_RETRY_PAYMENT(id), {
        paymentMethod,
    })
    return response.data.data
}

export const rescheduleAppointment = async (id: string, data: RescheduleAppointmentRequest): Promise<Appointment> => {
    const response = await api.patch<{ data: Appointment }>(PATIENT_ENDPOINTS.APPOINTMENT_RESCHEDULE(id), data)
    return response.data.data
}

export const getPatientSubscription = async (): Promise<SubscriptionData | null> => {
    const response = await api.get<{ success: boolean; message: string; data: SubscriptionData | null }>(
        PATIENT_ENDPOINTS.SUBSCRIPTION_ME,
    )
    return response.data.data
}

export const createSubscription = async (
    billingCycle: 'monthly' | 'yearly',
    paymentMethod: 'razorpay' | 'wallet',
): Promise<CreateSubscriptionResponse['data']> => {
    const response = await api.post<CreateSubscriptionResponse>(PATIENT_ENDPOINTS.SUBSCRIPTIONS, {
        billingCycle,
        paymentMethod,
    })
    return response.data.data
}

export const verifySubscriptionPayment = async (data: {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
}): Promise<SubscriptionData> => {
    const response = await api.post<{ success: boolean; message: string; data: SubscriptionData }>(
        PATIENT_ENDPOINTS.SUBSCRIPTION_VERIFY,
        data,
    )
    return response.data.data
}

export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
    await api.post(PATIENT_ENDPOINTS.SUBSCRIPTION_CANCEL(subscriptionId))
}

export const getPatientMedications = async (): Promise<MedicationSchedule[]> => {
    const response = await api.get<{ success: boolean; message: string; data: MedicationSchedule[] }>(
        PATIENT_ENDPOINTS.MEDICATIONS_ME,
    )
    return response.data.data
}

export const getMyAlertCount = async (): Promise<number> => {
    const response = await api.get<{ success: boolean; data: { count: number } }>(PATIENT_ENDPOINTS.ALERT_COUNT)
    return response.data.data.count
}

export const getPatientVitalSchedules = async (): Promise<VitalSchedule[]> => {
    const response = await api.get<{ success: boolean; message: string; data: VitalSchedule[] }>(
        PATIENT_ENDPOINTS.VITAL_SCHEDULES,
    )
    return response.data.data
}

export const getPatientPrescriptions = async (patientId: string): Promise<Prescription[]> => {
    const response = await api.get<{ success: boolean; data: Prescription[] }>(
        PATIENT_ENDPOINTS.PRESCRIPTIONS_BY_PATIENT(patientId),
    )
    return response.data.data
}

export const getCareTeam = async (): Promise<CareTeamMember[]> => {
    const response = await api.get<{
        success: boolean
        data: { doctor: CareTeamMember | null; caregiver: CareTeamMember | null }
    }>(PATIENT_ENDPOINTS.CARE_TEAM)
    const { doctor, caregiver } = response.data.data
    return [doctor, caregiver].filter((m): m is CareTeamMember => m !== null)
}

export const createFeedback = async (data: CreateFeedbackDTO): Promise<{ id: string }> => {
    const response = await api.post<{ success: boolean; data: { id: string } }>(PATIENT_ENDPOINTS.FEEDBACK, data)
    return response.data.data
}

export const chatWithAssistant = async (message: string): Promise<string> => {
    const response = await api.post<{ success: boolean; data: { text: string } }>(PATIENT_ENDPOINTS.ASSISTANT_CHAT, { message })
    return response.data.data.text
}
