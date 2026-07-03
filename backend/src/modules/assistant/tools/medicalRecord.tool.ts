import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IMedicalRecordRepository } from '../../medicalRecord/interfaces/medicalRecord.repository.interface'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'

@injectable()
export class MedicalRecordTool {
    constructor(
        @inject(TOKENS.IPatientRepository) private readonly _patientRepo: IPatientRepository,
        @inject(TOKENS.IMedicalRecordRepository) private readonly _medicalRecordRepo: IMedicalRecordRepository,
    ) {}

    async getMedicalRecord(userId: string): Promise<string | null> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) return null

        const record = await this._medicalRecordRepo.findByPatientId(patient._id.toString())
        if (!record) return null

        const parts: string[] = []
        if (record.allergies?.length) parts.push(`Allergies: ${record.allergies.join(', ')}`)
        if (record.pastSurgeries) parts.push(`Past Surgeries: ${record.pastSurgeries}`)
        if (patient.conditions?.length) parts.push(`Conditions: ${patient.conditions.join(', ')}`)
        if (patient.clinicalStatus) parts.push(`Clinical Status: ${patient.clinicalStatus}`)
        if (patient.riskLevel) parts.push(`Risk Level: ${patient.riskLevel}`)

        return parts.length ? parts.join(' | ') : null
    }

    async getMedicalHistory(userId: string): Promise<string | null> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) return null

        const record = await this._medicalRecordRepo.findByPatientId(patient._id.toString())
        if (!record) return null

        const parts: string[] = []
        if (record.pastSurgeries) parts.push(`Past Surgeries: ${record.pastSurgeries}`)
        if (record.clinicalNotes?.length) {
            const recentNotes = record.clinicalNotes.slice(-3)
            parts.push(`Recent Notes (${recentNotes.length}): ${recentNotes.map((n) => n.note).join('; ')}`)
        }

        return parts.length ? parts.join(' | ') : null
    }

    async getContext(userId: string): Promise<string | null> {
        return this.getMedicalRecord(userId)
    }
}
