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
