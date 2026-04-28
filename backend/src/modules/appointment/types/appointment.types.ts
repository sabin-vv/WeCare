import { Document, Types } from 'mongoose'

interface AppointmentPaymentInfo {
    status?: 'pending' | 'success' | 'failed' | 'refunded'
    totalAmount?: number
}

export interface AppointmentDocument extends Document {
    patientId: Types.ObjectId
    doctorId: Types.ObjectId
    appointmentDate: Date
    slotStart: string
    slotEnd: string
    consultationFee: number
    paymentId?: Types.ObjectId | AppointmentPaymentInfo
    status: 'pending_payment' | 'confirmed' | 'cancelled' | 'in_consultation' | 'completed'
    expiredAt?: Date
    createdAt: Date
    updatedAt: Date
}
