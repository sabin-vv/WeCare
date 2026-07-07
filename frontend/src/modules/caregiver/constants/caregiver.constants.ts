import type { CaregiverDocuments, CreateReminderDTO, MedicationSchedule } from '../types/caregiver.types'

export const ALERT_STATUS_OPTIONS = [
    { label: 'All Statuses', value: '' },
    { label: 'Open', value: 'open' },
    { label: 'Acknowledged', value: 'acknowledged' },
]

export const ALERT_TYPE_OPTIONS = [
    { label: 'All Types', value: '' },
    { label: 'Missed Medication', value: 'missed_medication' },
    { label: 'Critical Vital', value: 'critical_vital' },
    { label: 'Critical Symptom', value: 'critical_symptom' },
    { label: 'Missed Vital', value: 'missed_vital' },
]

export const ALERT_SEVERITY_OPTIONS = [
    { label: 'All Severities', value: '' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
]

export const ROUTE_OPTIONS = [
    { label: 'Oral', value: 'oral' },
    { label: 'Injection', value: 'injection' },
    { label: 'IV', value: 'IV' },
    { label: 'Inhalation', value: 'inhalation' },
]

export const RISK_LABELS: Record<string, string> = {
    high_risk: 'Critical',
    severe: 'High',
    moderate: 'Moderate',
}

export const VITAL_LABEL_MAP: Record<string, string> = {
    blood_pressure: 'Blood Pressure',
    blood_sugar: 'Blood Sugar',
    heart_rate: 'Heart Rate',
    spo2: 'SpO2',
}

export const VITAL_UNIT_MAP: Record<string, string> = {
    blood_pressure: 'mmHg',
    blood_sugar: 'mg/dL',
    heart_rate: 'BPM',
    spo2: '%',
}

export const SYMPTOM_OPTIONS = [
    'Headache',
    'Dizziness',
    'Nausea',
    'Fatigue',
    'Shortness of breath',
    'Chest pain',
    'Fever',
    'Cough',
]

export const MEDICATION_STATUS_META: Record<
    MedicationSchedule['status'],
    { title: string; note: string; tone: 'success' | 'warning' | 'critical'; actionLabel: string }
> = {
    administered: {
        title: 'Medication Administered',
        note: 'Administered',
        tone: 'success' as const,
        actionLabel: 'Administered',
    },
    missed: {
        title: 'Medication Deviation',
        note: 'Missed dose',
        tone: 'critical' as const,
        actionLabel: 'Take Action',
    },
    skipped: {
        title: 'Medication Skipped',
        note: 'Skipped',
        tone: 'warning' as const,
        actionLabel: 'Skipped',
    },
    cancelled: {
        title: 'Medication Cancelled',
        note: 'Cancelled',
        tone: 'warning' as const,
        actionLabel: 'Cancelled',
    },
    pending: {
        title: 'Medication Scheduled',
        note: 'Scheduled',
        tone: 'warning' as const,
        actionLabel: 'Take Action',
    },
}

export const PRIORITY_LABELS: Record<string, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
}

export const DEFAULT_REMINDER_FORM: CreateReminderDTO = {
    title: '',
    scheduleTime: '',
    priority: 'medium',
}

export const PRESCRIPTION_STATUS_MAP: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'statusActive' },
    on_hold: { label: 'On Hold', className: 'statusOnHold' },
    discontinued: { label: 'Discontinued', className: 'statusDiscontinued' },
    amended: { label: 'Amended', className: 'statusAmended' },
    completed: { label: 'Completed', className: 'statusCompleted' },
}

export const DEFAULT_CAREGIVER_DOCUMENTS: CaregiverDocuments = {
    govId: null,
    profileImage: null,
    certificate: {
        number: '',
        document: null,
    },
    license: {
        number: '',
        document: null,
    },
}
