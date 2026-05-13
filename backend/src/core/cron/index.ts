import { startAppointmentCron } from './appointment.cron'
import { startMedicationCron } from './medication.cron'

export const initializeCrons = () => {
    startAppointmentCron()
    startMedicationCron()
}
