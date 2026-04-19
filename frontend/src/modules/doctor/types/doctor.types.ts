import type { ChangeEvent } from 'react'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'

export type DoctorSettingsFormState = {
    fullName: string
    consultationFee: string
    phoneNumber: string
    email: string
    medicalLicenseNumber: string
    medicalCouncilRegistrationNumber: string
    experienceCertificatesCount: number
    isActive: boolean
}

export interface DoctorRegistrationSectionProps {
    formState: DoctorSettingsFormState
}

export interface DoctorSettingsProfileCardProps {
    savedState: DoctorSettingsFormState
    profileImageUrl: string
    isActive: boolean
    onToggleStatus: () => void
}

export interface DoctorSettingsActionsProps {
    hasChanges: boolean
    isSaving: boolean
    isLoadingProfile: boolean
    onDiscard: () => void
    onSave: () => void
}

export interface DoctorSecuritySectionProps {
    onResetPassword: () => void
}

export interface DoctorPersonalInfoSectionProps {
    formState: DoctorSettingsFormState
    isEditing: boolean
    onToggleEditing: () => void
    onFieldChange: (field: keyof DoctorSettingsFormState) => (event: ChangeEvent<HTMLInputElement>) => void
}

export interface Certificate {
    number: string
    document: File | null
}
export interface Specializations {
    name: string
    document: File | null
}
export interface DoctorDocuments {
    govId: File | null
    profileImage: File | null
    medicalCertificate: Certificate
    councilRegistration: Certificate
}

export interface DoctorProfile extends ApiInterface {
    id: string
    fullName: string
    email: string
    phoneNumber: string
    profileImage?: string
    professionalTitle?: string
    consultationFee: number
    medicalLicenseNumber: string
    medicalCouncilRegistrationNumber: string
    experienceCertificatesCount: number
    isActive: boolean
    verificationStatus: 'pending' | 'verified' | 'rejected'
}
export interface DoctorProfileResponse extends ApiInterface {
    data: DoctorProfile
}

export type UpdateDoctorProfileData = Pick<
    DoctorProfile,
    'fullName' | 'consultationFee' | 'phoneNumber' | 'email' | 'isActive'
>

export interface TimeRange {
    startTime: string
    endTime: string
}

export interface TimeRangeInputProps {
    value: TimeRange
    onChange: (value: TimeRange) => void
    slotDuration: number
    onDelete?: () => void
}

export interface DaySchedule {
    day: string
    isAvailable: boolean
    timeRanges: TimeRange[]
}
export interface DayScheduleRowProps {
    data: DaySchedule
    slotDuration: number
    canAddRange: boolean
    onToggleAvailability: (value: boolean) => void
    onRangeChange: (index: number, value: TimeRange) => void
    onAddRange: () => void
    onDeleteRange: (index: number) => void
}

export interface SlotDurationSelctorProps {
    value: number
    onChange: (value: number) => void
    options?: number[]
}

export interface DateRange {
    start: string
    end: string
}

export interface DateRangePickerProps {
    value: DateRange
    onChange: (value: DateRange) => void
    minDate?: string
    maxDate?: string
}

export interface WeeklySchedule {
    day: string
    isAvailable: boolean
    timeRanges: { startTime: string; endTime: string }[]
}

export const initialSchedule: WeeklySchedule[] = [
    {
        day: 'Monday',
        isAvailable: true,
        timeRanges: [{ startTime: '09:00', endTime: '13:00' }],
    },
    {
        day: 'Tuesday',
        isAvailable: true,
        timeRanges: [
            { startTime: '09:00', endTime: '13:00' },
            { startTime: '14:00', endTime: '17:00' },
        ],
    },
    {
        day: 'Wednesday',
        isAvailable: false,
        timeRanges: [],
    },
    {
        day: 'Thursday',
        isAvailable: true,
        timeRanges: [{ startTime: '09:00', endTime: '13:00' }],
    },
    {
        day: 'Friday',
        isAvailable: true,
        timeRanges: [{ startTime: '09:00', endTime: '13:00' }],
    },
    {
        day: 'Saturday',
        isAvailable: false,
        timeRanges: [],
    },
    {
        day: 'Sunday',
        isAvailable: false,
        timeRanges: [],
    },
]
