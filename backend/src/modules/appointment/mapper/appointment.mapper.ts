import { Types } from 'mongoose'

import { AppointmentDocument } from '../types/appointment.types'

export interface PopulatedUser {
    _id: string | Types.ObjectId
    name: string
    email: string
}

export interface AppointmentResponseDTO {
    _id: string
    doctorId: string | Types.ObjectId | PopulatedUser
    patientId: string | Types.ObjectId | PopulatedUser
    appointmentDate: string
    slotStart: string
    status: string
    paymentStatus: string
    amount: number
    createdAt: string
}

export const toAppointmentResponseDTO = (appointment: AppointmentDocument): AppointmentResponseDTO => {
    return {
        _id: appointment._id.toString(),
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        appointmentDate: appointment.appointmentDate.toISOString(),
        slotStart: appointment.slotStart,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        amount: appointment.amount,
        createdAt: appointment.createdAt.toISOString(),
    }
}

export const toAppointmentListResponseDTO = (appointments: AppointmentDocument[]): AppointmentResponseDTO[] => {
    return appointments.map(toAppointmentResponseDTO)
}
