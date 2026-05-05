import { Document, Types } from 'mongoose'

export type RiskLevel = 'mild' | 'moderate' | 'severe' | 'high_risk'
type AccountStatus = 'suspended' | 'active' | 'archived'

type ClinicalStatus = 'active' | 'hospitalized' | 'deceased'
export interface PatientDocument extends Document {
    userId: Types.ObjectId
    patientId: string
    dateOfBirth: Date
    gender: string
    conditions?: string[]
    riskLevel?: RiskLevel
    accountStatus?: AccountStatus
    clinicalStatus?: ClinicalStatus
    primaryDoctorId?: Types.ObjectId
    caregiverId?: Types.ObjectId
    profileImage?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface PatientEntity {
    userId: Types.ObjectId
    patientId: string
    dateOfBirth: Date
    gender: string
    profileImage?: string
}

export interface PatientProfileResponseDTO {
    id: string
    name: string
    email: string
    mobile: string
    patientId: string
    dateOfBirth: string
    gender: string
    conditions: string[]
    profileImage?: string
    isActive: boolean
}

export interface ListPatientMapper {
    patientId: string
    name: string
    profileImage?: string
    conditions?: string[]
    riskLevel?: string
    caregiver?: string
    status?: string
}

export interface PatientListPagination {
    page: number
    limit: number
    totalCount: number
    totalPages: number
}

export interface ListPatientsResponse {
    patients: ListPatientMapper[]
    pagination: PatientListPagination
}
