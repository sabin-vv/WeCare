import { Document, Types } from 'mongoose'

export type VitalType = 'blood_sugar' | 'blood_pressure' | 'spo2' | 'heart_rate'

export interface VitalDocument extends Document {
    patientId: Types.ObjectId
    type: VitalType
    value?: number
    systolic?: number
    diastolic?: number
    unit: string
    recordedAt: Date
    recordedBy: Types.ObjectId
    createdAt: Date
    updatedAt: Date
}
