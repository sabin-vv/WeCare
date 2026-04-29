export interface AvailabilityCancellationNotificationPayload {
    appointmentId: string
    patientName: string
    patientEmail: string
    patientMobile: string
    doctorName: string
    appointmentDate: string
    slotStart: string
    slotEnd: string
    refundPending: boolean
}

export interface AvailabilityCancellationNotificationFailure {
    channel: 'email' | 'sms'
    reason: string
}

export interface IAvailabilityNotificationService {
    sendAvailabilityCancellation(
        payload: AvailabilityCancellationNotificationPayload,
    ): Promise<AvailabilityCancellationNotificationFailure[]>
}
