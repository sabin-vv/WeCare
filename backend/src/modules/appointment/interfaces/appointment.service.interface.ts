import { AppointmentResponseDTO } from '../mapper/appointment.mapper'

export interface RazorpayOrder {
    id: string
    entity: string
    amount: number | string
    amount_paid: number | string
    amount_due: number | string
    currency: string
    receipt: string
    status: string
    attempts: number
    created_at: number
}

export interface IAppointmentService {
    createOrder(patientId: string, doctorId: string, appointmentDate: string, slotStart: string): Promise<RazorpayOrder>
    verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<AppointmentResponseDTO>
    getPatientAppointments(patientId: string): Promise<AppointmentResponseDTO[]>
    getDoctorAppointments(doctorId: string): Promise<AppointmentResponseDTO[]>
}
