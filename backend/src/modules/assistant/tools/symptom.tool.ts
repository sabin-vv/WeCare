import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { ISymptomLogService } from '../../symptom/interfaces/symptomLog.service.interface'

@injectable()
export class SymptomTool {
    constructor(
        @inject(TOKENS.IPatientRepository) private readonly _patientRepo: IPatientRepository,
        @inject(TOKENS.ISymptomLogService) private readonly _symptomService: ISymptomLogService,
    ) {}

    async getRecentSymptoms(userId: string): Promise<string | null> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) return null

        const logs = await this._symptomService.getPatientLogs(patient._id.toString())
        if (!logs.length) return null

        return logs
            .slice(0, 5)
            .map((l) => {
                const date = l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''
                return `- ${l.symptom} (severity: ${l.severity}) on ${date}`
            })
            .join('\n')
    }

    async getContext(userId: string): Promise<string | null> {
        return this.getRecentSymptoms(userId)
    }
}
