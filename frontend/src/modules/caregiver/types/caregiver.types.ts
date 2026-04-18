import type { Dispatch } from 'react'

import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import type { VerificationStatus } from '@/modules/auth/types/auth.types'

export interface CaregiverDocuments {
    govId: File | null
    profileImage: File | null
    certificate: {
        number: string
        document: File | null
    }
    license: {
        number: string
        document: File | null
    }
}

export interface CaregiverRegisterState {
    basicInfo: {
        name: string
        email: string
        mobile: string
        password: string
        confirmPassword: string
    }
    documents: CaregiverDocuments
}

export interface CaregiverDetailsFormProps {
    prevStep: () => void
    nextStep: () => void
    documents: CaregiverDocuments
    registerData: CaregiverRegisterState
    setRegisterData: Dispatch<React.SetStateAction<CaregiverRegisterState>>
}

export interface CaregiverProfileData {
    id: string
    fullName: string
    email: string
    phoneNumber: string
    profileImage?: string
    certificateNumber: string
    licenseNumber: string
    isActive: boolean
    verificationStatus: VerificationStatus
}

export interface CaregiverProfileResponse extends ApiInterface {
    data: CaregiverProfileData
}
