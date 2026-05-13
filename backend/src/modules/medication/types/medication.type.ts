import { Types } from 'mongoose'

export type MedicationStatus = 'pending' | 'administered' | 'missed' | 'skipped' | 'cancelled'

export interface MedicationScheduleModel extends Document {
    prescriptionId: Types.ObjectId
    patientId: Types.ObjectId
    caregiverId: Types.ObjectId
    medicineName: string
    dosage: string
    route: 'oral' | 'injection' | 'IV' | 'inhalation'
    scheduleDate: Date
    scheduleTime: Date
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: MedicationStatus
    cancelledReason?: string
    skippedReason?: string
    missedReason?: string
    administeredAt?: Date
    administeredBy?: Types.ObjectId
    createdAt: Date
    updatedAt: Date
}
