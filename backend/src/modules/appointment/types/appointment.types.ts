import { Document, Types } from 'mongoose'

export interface AppointmentDocument extends Document {
    patientId: Types.ObjectId
    doctorId: Types.ObjectId
    appointmentDate: Date
    slotStart: string
    slotEnd: string
    consultationFee: number
    paymentId?: Types.ObjectId
    status: 'pending_payment' | 'confirmed' | 'cancelled' | 'in_consultation' | 'completed'
    expiredAt?: Date
    createdAt: Date
    updatedAt: Date
}
