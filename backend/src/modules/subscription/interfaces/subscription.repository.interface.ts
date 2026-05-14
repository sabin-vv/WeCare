import type { Types } from 'mongoose'

import type { SubscriptionDocument } from '../types/subscription.types'

export interface ISubscriptionRepository {
    findById(id: string): Promise<SubscriptionDocument | null>
    findByPatientId(patientId: Types.ObjectId): Promise<SubscriptionDocument | null>
    findActiveByPatient(patientId: Types.ObjectId): Promise<SubscriptionDocument | null>
    create(data: Partial<SubscriptionDocument>): Promise<SubscriptionDocument>
    updateById(id: string, data: Partial<SubscriptionDocument>): Promise<SubscriptionDocument | null>
}