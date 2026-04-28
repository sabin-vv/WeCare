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
    slotEnd: string
    status: string
    paymentStatus: string
    amount: number
    createdAt: string
}

interface PopulatedPayment {
    status?: 'pending' | 'success' | 'failed' | 'refunded'
    totalAmount?: number
}

const isPopulatedPayment = (value: unknown): value is PopulatedPayment => {
    return typeof value === 'object' && value !== null
}

const mapPaymentStatus = (status?: PopulatedPayment['status']) => {
    switch (status) {
        case 'success':
            return 'paid'
        case 'failed':
            return 'failed'
        case 'refunded':
            return 'refunded'
        case 'pending':
            return 'pending'
        default:
            return 'pending'
    }
}

export const toAppointmentResponseDTO = (appointment: AppointmentDocument): AppointmentResponseDTO => {
    const payment = isPopulatedPayment(appointment.paymentId) ? appointment.paymentId : undefined

    return {
        _id: appointment._id.toString(),
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        appointmentDate: appointment.appointmentDate.toISOString(),
        slotStart: appointment.slotStart,
        slotEnd: appointment.slotEnd,
        status: appointment.status,
        paymentStatus: payment ? mapPaymentStatus(payment.status) : appointment.status === 'pending_payment' ? 'pending' : 'paid',
        amount: payment?.totalAmount ?? appointment.consultationFee,
        createdAt: appointment.createdAt.toISOString(),
    }
}

export const toAppointmentListResponseDTO = (appointments: AppointmentDocument[]): AppointmentResponseDTO[] => {
    return appointments.map(toAppointmentResponseDTO)
}
