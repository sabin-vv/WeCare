import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IAppointmentRepository } from '../../appointment/interfaces/appointment.repository.interface'

@injectable()
export class AppointmentTool {
    constructor(
        @inject(TOKENS.IAppointmentRepository) private readonly _appointmentRepo: IAppointmentRepository,
    ) {}

    async getUpcomingAppointments(userId: string): Promise<string | null> {
        const appointments = await this._appointmentRepo.findByPatientId(userId)
        const upcoming = appointments.filter((a) => a.status === 'confirmed' || a.status === 'in_consultation')

        if (!upcoming.length) return null

        return upcoming
            .slice(0, 5)
            .map((a) => {
                const doctorName =
                    typeof a.doctorId === 'object' && a.doctorId !== null && 'userId' in a.doctorId
                        ? (a.doctorId as unknown as { userId: { name: string } }).userId?.name || 'Doctor'
                        : 'Doctor'
                const date = a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : ''
                return `- ${doctorName} | ${date} ${a.slotStart}-${a.slotEnd} | ${a.status}`
            })
            .join('\n')
    }

    async getAppointmentHistory(userId: string): Promise<string | null> {
        const appointments = await this._appointmentRepo.findByPatientId(userId)
        const past = appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled')

        if (!past.length) return null

        return past
            .slice(0, 5)
            .map((a) => {
                const doctorName =
                    typeof a.doctorId === 'object' && a.doctorId !== null && 'userId' in a.doctorId
                        ? (a.doctorId as unknown as { userId: { name: string } }).userId?.name || 'Doctor'
                        : 'Doctor'
                const date = a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : ''
                return `- ${doctorName} | ${date} ${a.slotStart}-${a.slotEnd} | ${a.status}`
            })
            .join('\n')
    }

    async getContext(userId: string): Promise<string | null> {
        return this.getUpcomingAppointments(userId)
    }
}
