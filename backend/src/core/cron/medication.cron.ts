import cron from 'node-cron'
import { container } from 'tsyringe'

import { MedicationService } from '../../modules/medication/service/medication.service'

export const startMedicationCron = () => {
    cron.schedule('59 23 * * *', async () => {
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const medicationService = container.resolve(MedicationService)
            await medicationService.generateDailySchedule(today)
        } catch (error) {
            console.error('Medication cron failed:', error)
        }
    })
}
