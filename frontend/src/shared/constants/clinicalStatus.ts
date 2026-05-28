import type { ClinicalStatus } from '@/modules/doctor/types/doctor.types'

export const CLINICAL_STATUS_TRANSITION: Record<ClinicalStatus, ClinicalStatus[]> = {
    active: ['hospitalized', 'recovered', 'deceased'],
    hospitalized: ['active', 'recovered'],
    recovered: ['active', 'hospitalized'],
    deceased: [],
} as const
