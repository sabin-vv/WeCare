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
