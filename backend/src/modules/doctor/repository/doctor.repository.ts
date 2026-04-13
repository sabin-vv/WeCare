import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IDoctorRepository } from '../interfaces/doctor.repository.interface'
import { DoctorModel } from '../models/doctor.model'
import { DoctorDocument } from '../types/doctor.types'

@injectable()
export class DoctorRepository extends BaseRepository<DoctorDocument> implements IDoctorRepository {
    constructor() {
        super(DoctorModel)
    }
    async findByUserId(userId: Types.ObjectId) {
        return this.model.findOne({ userId })
    }
    async updateByUserId(userId: Types.ObjectId, data: Partial<DoctorDocument>): Promise<DoctorDocument> {
        const doctor = await this.model.findOneAndUpdate({ userId }, data, { new: true })

        if (!doctor) {
            throw new Error('Doctor profile not found for update')
        }

        return doctor
    }
    async createOrUpdateByUserId(userId: Types.ObjectId, data: Partial<DoctorDocument>): Promise<DoctorDocument> {
        const doctor = await this.model.findOneAndUpdate({ userId }, data, { upsert: true, new: true })

        if (!doctor) {
            throw new Error('Doctor profile could not be created or updated')
        }

        return doctor
    }
}
