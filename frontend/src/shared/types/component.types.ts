import type { ClinicalStatus } from '@/modules/doctor/types/doctor.types'

export interface SelectOptions {
    label: string
    value: string
}

export interface ClinicalStatusOption {
    label: string
    value: ClinicalStatus
    disabled?: boolean
}
