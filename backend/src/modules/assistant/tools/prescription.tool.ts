import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { IPrescriptionService } from '../../prescription/interfaces/prescription.service.interface'

@injectable()
export class PrescriptionTool {
    constructor(
        @inject(TOKENS.IPatientRepository) private readonly _patientRepo: IPatientRepository,
        @inject(TOKENS.IPrescriptionService) private readonly _prescriptionService: IPrescriptionService,
    ) {}

    async getActivePrescriptions(userId: string): Promise<string | null> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) return null

        const result = await this._prescriptionService.getPatientPrescriptions(patient._id.toString(), undefined, undefined, 'active')
        const prescriptions = Array.isArray(result) ? result : result.data

        if (!prescriptions.length) return null

        return prescriptions
            .slice(0, 5)
            .map((p) => {
                const meds = p.medications
                    .map((m) => `${m.name} ${m.dosage} — ${m.frequency}`)
                    .join(', ')
                const date = p.prescribedAt ? new Date(p.prescribedAt).toLocaleDateString() : ''
                return `- ${meds} (prescribed ${date})${p.note ? ` — ${p.note}` : ''}`
            })
            .join('\n')
    }

    async getContext(userId: string): Promise<string | null> {
        return this.getActivePrescriptions(userId)
    }
}
