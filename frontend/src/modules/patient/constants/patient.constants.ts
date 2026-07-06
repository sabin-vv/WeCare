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

export const PAYMENT_STATUS_CLASS_MAP: Record<string, string> = {
    paid: 'paymentPaid',
    pending: 'paymentPending',
    failed: 'paymentFailed',
    refunded: 'paymentRefunded',
    refund_pending: 'paymentRefundPending',
}

export const getPaymentStatusClass = (status: string): string =>
    PAYMENT_STATUS_CLASS_MAP[status] ?? ''
