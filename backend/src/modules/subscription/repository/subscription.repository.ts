import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { ISubscriptionRepository } from '../interfaces/subscription.repository.interface'
import { SubscriptionModel } from '../models/subscription.model'
import type { SubscriptionDocument } from '../types/subscription.types'

@injectable()
export class SubscriptionRepository extends BaseRepository<SubscriptionDocument> implements ISubscriptionRepository {
    constructor() {
        super(SubscriptionModel)
    }
    async findByPatientId(patientId: Types.ObjectId): Promise<SubscriptionDocument | null> {
        return await SubscriptionModel.findOne({ patientId }).lean()
    }

    async findActiveByPatient(patientId: Types.ObjectId): Promise<SubscriptionDocument | null> {
        return await SubscriptionModel.findOne({
            patientId,
            status: 'active',
        }).lean()
    }
}
