import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IMedicationService } from '../../medication/interfaces/medication.service.interface'

@injectable()
export class MedicationTool {
    constructor(
        @inject(TOKENS.IMedicationService) private readonly _medicationService: IMedicationService,
    ) {}

    async getCurrentMedications(userId: string): Promise<string | null> {
        const meds = await this._medicationService.getPatientMedications(userId)
        if (!meds.length) return null

        return meds
            .slice(0, 10)
            .map((m) => `- ${m.medicineName} ${m.dosage} | ${m.route} | ${m.scheduleTime} | ${m.status}`)
            .join('\n')
    }

    async getNextDose(userId: string): Promise<string | null> {
        const meds = await this._medicationService.getPatientMedications(userId)
        const pending = meds
            .filter((m) => m.status === 'pending')
            .sort((a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime())

        if (!pending.length) return null

        const next = pending[0]
        return `${next.medicineName} ${next.dosage} at ${new Date(next.scheduleTime).toLocaleTimeString()}`
    }

    async getContext(userId: string): Promise<string | null> {
        return this.getCurrentMedications(userId)
    }
}
