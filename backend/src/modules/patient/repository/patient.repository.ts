import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IPatientRepository } from '../interfaces/patient.repository.interface'
import { PatientModel } from '../models/patient.model'
import { PatientDocument } from '../types/patient.types'

@injectable()
export class PatientRepository extends BaseRepository<PatientDocument> implements IPatientRepository {
    constructor() {
        super(PatientModel)
    }

    async findByUserId(userId: Types.ObjectId): Promise<PatientDocument | null> {
        return this.model.findOne({ userId })
    }

    async updateByUserId(userId: Types.ObjectId, data: Partial<PatientDocument>): Promise<PatientDocument | null> {
        return this.model.findOneAndUpdate({ userId }, data, { new: true })
    }

    async getLastPatientId(): Promise<string | null> {
        const lastPatient = await this.model.findOne().sort({ patientId: -1 }).select('patientId').lean()
        return lastPatient?.patientId || null
    }
}

