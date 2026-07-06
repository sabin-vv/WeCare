import type { ActivityLogFilters, AdminAppointmentFilters, AdminPaymentFilters } from '../types/admin.types'

export const ROLE_OPTIONS = [
    { value: '', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'caregiver', label: 'Caregiver' },
    { value: 'patient', label: 'Patient' },
]

export const CATEGORY_OPTIONS = [
    { value: '', label: 'All Categories' },
    { value: 'user_management', label: 'User Management' },
    { value: 'verification', label: 'Verification' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'payment', label: 'Payment' },
    { value: 'platform_settings', label: 'Platform Settings' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'alert', label: 'Alert' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'system', label: 'System' },
]

export const TARGET_TYPE_OPTIONS = [
    { value: '', label: 'All Targets' },
    { value: 'user', label: 'User' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'caregiver', label: 'Caregiver' },
    { value: 'patient', label: 'Patient' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'payment', label: 'Payment' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'platform_setting', label: 'Platform Setting' },
    { value: 'alert', label: 'Alert' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'subscription', label: 'Subscription' },
]

export const INITIAL_ACTIVITY_LOG_FILTERS: ActivityLogFilters = {
    category: '',
    performedByRole: '',
    targetType: '',
    search: '',
    startDate: '',
    endDate: '',
}

export const STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending_payment', label: 'Pending Payment' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_consultation', label: 'In Consultation' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'missed', label: 'Missed' },
]

export const INITIAL_APPOINTMENT_FILTERS: AdminAppointmentFilters = {
    search: '',
    status: 'all',
    startDate: '',
    endDate: '',
}

export const PAYMENT_STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'success', label: 'Success' },
    { value: 'failed', label: 'Failed' },
    { value: 'refund_pending', label: 'Refund Pending' },
    { value: 'refunded', label: 'Refunded' },
]

export const PAYMENT_TYPE_OPTIONS = [
    { value: 'all', label: 'All Types' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'subscription', label: 'Subscription' },
]

export const INITIAL_PAYMENT_FILTERS: AdminPaymentFilters = {
    search: '',
    status: 'all',
    paymentType: 'all',
    startDate: '',
    endDate: '',
}
