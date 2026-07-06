import type { CaregiverDocuments } from '../types/caregiver.types'

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

export const RISK_LABELS: Record<string, string> = {
    high_risk: 'Critical',
    severe: 'High',
    moderate: 'Moderate',
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
