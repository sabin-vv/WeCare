export const APPOINTMENT_STATUS_CLASS_MAP: Record<string, string> = {
    confirmed: 'statusConfirmed',
    pending_payment: 'statusPending',
    cancelled: 'statusCancelled',
    missed: 'statusMissed',
    in_consultation: 'inConsultation',
    completed: 'completed',
}

export const getAppointmentStatusClass = (status: string): string =>
    APPOINTMENT_STATUS_CLASS_MAP[status] ?? ''
