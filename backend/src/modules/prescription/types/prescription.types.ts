import { Document, Types } from 'mongoose'

export type MedicationRoute = 'oral' | 'injection' | 'IV' | 'inhalation'
export type PrescriptionStatus = 'active' | 'on_hold' | 'discontinued' | 'amended' | 'completed'

export interface MedicationItem {
    name: string
    dosage: string
    route: MedicationRoute
    frequency: string
    scheduleTimes: string[]
    isCritical: boolean
}

export interface PrescriptionDocument extends Document {
    patientId: Types.ObjectId
    prescribedBy: Types.ObjectId
    medications: MedicationItem[]
    note?: string
    status: PrescriptionStatus
    discontinuedAt?: Date
    discontinuedBy?: Types.ObjectId
    prescribedAt: Date
    createdAt: Date
    updatedAt: Date
}
