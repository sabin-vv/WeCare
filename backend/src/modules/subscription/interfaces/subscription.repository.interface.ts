import type { Types } from 'mongoose'

import type { SubscriptionDocument } from '../types/subscription.types'

export interface ISubscriptionRepository {
    findByPatientId(patientId: Types.ObjectId): Promise<SubscriptionDocument | null>
    findActiveByPatient(patientId: Types.ObjectId): Promise<SubscriptionDocument | null>
}