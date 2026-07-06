import type { RiskLevel } from '../types/doctor.types'

export const CONSULTATION_STATUS_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Pending Consultation', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
] as const

export const formatAppointmentStatusLabel = (status: string) => {
    if (status === 'confirmed') return 'Pending Consultation'

    return status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export const FREQUENCY_SLOT_MAP: Record<string, number> = {
    'Once daily': 1,
    'Twice daily': 2,
    'Three times daily': 3,
    'Four times daily': 4,
}

export const FREQUENCY_OPTIONS = ['Every 1 hour', 'Every 2 hours', 'Every 6 hours', 'Every 1 day', 'Every 1 week']

export const DURATION_OPTIONS = ['Next 12 hours', 'Next 24 hours', 'Next 48 hours', 'For 7 days', 'For 4 weeks']

export type VitalPlanOptionId = 'blood_pressure' | 'heart_rate' | 'spo2' | 'blood_sugar'

export const DEFAULT_VITALS_PREFERENCES: Record<VitalPlanOptionId, { frequency: string; duration: string }> = {
    blood_pressure: { frequency: 'Every 2 hours', duration: 'Next 24 hours' },
    heart_rate: { frequency: 'Every 2 hours', duration: 'Next 24 hours' },
    spo2: { frequency: 'Every 2 hours', duration: 'Next 24 hours' },
    blood_sugar: { frequency: 'Every 2 hours', duration: 'Next 24 hours' },
}

const FREQUENCY_UNIT_MAP = {
    hour: 'hours',
    hours: 'hours',
    day: 'days',
    days: 'days',
    week: 'weeks',
    weeks: 'weeks',
} as const

const DURATION_UNIT_MAP = {
    ...FREQUENCY_UNIT_MAP,
    month: 'months',
    months: 'months',
} as const

export const CLINICAL_STATUS_OPTIONS = [
    { label: 'All Accounts', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Hospitalized', value: 'hospitalized' },
    { label: 'Deceased', value: 'deceased' },
] as const

export const formatAccountStatusLabel = (status?: string) => {
    if (!status) return 'N/A'
    if (status === 'active') return 'Active'
    if (status === 'hospitalized') return 'Hospitalized'
    if (status === 'deceased') return 'Deceased'
    if (status === 'completed') return 'Completed'

    return status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export const formatRiskLevel = (riskLevel: string): string => {
    if (riskLevel === 'mild') return 'Mild'
    if (riskLevel === 'moderate') return 'Moderate'
    if (riskLevel === 'severe') return 'Severe'
    if (riskLevel === 'high_risk') return 'High Risk'
    return riskLevel
}

export const vitalNameFormat = (vital: string): string => {
    if (vital === 'blood_pressure') return 'Blood Pressure'
    if (vital === 'heart_rate') return 'Heart Rate'
    if (vital === 'spo2') return 'SPO2'
    if (vital === 'blood_sugar') return 'Blood Sugar'
    return vital
}

export const SEVERITY_OPTIONS: Array<{ label: string; value: RiskLevel }> = [
    { label: 'Mild', value: 'mild' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Severe', value: 'severe' },
    { label: 'High Risk', value: 'high_risk' },
]

export const DEFAULT_SETTINGS_FORM_VALUES = {
    name: '',
    email: '',
    phoneNumber: '',
    consultationFee: 0,
}

export const parseFrequency = (
    value: string,
): { frequencyValue: number; frequencyUnit: 'hours' | 'days' | 'weeks' } => {
    const match = value.match(/Every (\d+) (hour|hours|day|days|week|weeks)/i)
    if (!match) {
        return { frequencyValue: 2, frequencyUnit: 'hours' }
    }

    return {
        frequencyValue: Number(match[1]),
        frequencyUnit: FREQUENCY_UNIT_MAP[match[2].toLowerCase() as keyof typeof FREQUENCY_UNIT_MAP],
    }
}

export const parseDuration = (
    value: string,
): { durationValue: number; durationUnit: 'hours' | 'days' | 'weeks' | 'months' } => {
    const match = value.match(/(?:Next|For) (\d+) (hour|hours|day|days|week|weeks|month|months)/i)
    if (!match) {
        return { durationValue: 24, durationUnit: 'hours' }
    }

    return {
        durationValue: Number(match[1]),
        durationUnit: DURATION_UNIT_MAP[match[2].toLowerCase() as keyof typeof DURATION_UNIT_MAP],
    }
}
