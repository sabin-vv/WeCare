import cron from 'node-cron'
import { container } from 'tsyringe'

import { MedicationService } from '../../modules/medication/service/medication.service'

export const startMedicationCron = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            tomorrow.setHours(0, 0, 0, 0)

            const medicationService = container.resolve(MedicationService)
            await medicationService.generateDailySchedule(tomorrow)
        } catch (error) {
            console.error('Medication cron failed:', error)
        }
    })
}
