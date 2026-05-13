import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { ICaregiverRepository } from '../interfaces/caregiver.repository.interface'
import { CaregiverModel } from '../models/caregiver.model'
import { CaregiverDocument } from '../types/caregiver.types'

@injectable()
export class CaregiverRepository extends BaseRepository<CaregiverDocument> implements ICaregiverRepository {
    constructor() {
        super(CaregiverModel)
    }

    async findByUserId(userId: Types.ObjectId): Promise<CaregiverDocument | null> {
        return this.model.findOne({ userId })
    }

    async findById(id: string): Promise<CaregiverDocument | null> {
        if (!Types.ObjectId.isValid(id)) return null
        return this.model.findById(id).lean()
    }

    async findAllActive(search?: string): Promise<CaregiverDocument[]> {
        const query: Record<string, unknown> = { isActive: true }
        if (search) {
            query.$or = [
                { certificateNumber: { $regex: search, $options: 'i' } },
                { licenseNumber: { $regex: search, $options: 'i' } },
            ]
        }
        return this.model.find(query).lean()
    }

    async updateByUserId(userId: Types.ObjectId, data: Partial<CaregiverDocument>): Promise<CaregiverDocument | null> {
        return this.model.findOneAndUpdate({ userId }, data, { returnDocument: 'after' })
    }
}
