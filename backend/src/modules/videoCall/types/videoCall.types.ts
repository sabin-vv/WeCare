import { Document, Types } from 'mongoose'

export interface VideoRoomDocument extends Document {
    appointmentId: Types.ObjectId
    roomName: string
    doctorId: Types.ObjectId
    patientId: Types.ObjectId
    status: 'waiting' | 'active' | 'ended'
    startedAt?: Date
    endedAt?: Date
    duration?: number
    createdAt: Date
    updatedAt: Date
}
