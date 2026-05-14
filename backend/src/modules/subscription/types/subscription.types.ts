import type { Types } from 'mongoose'

export type SubscriptionStatus = 'pending_payment' | 'active' | 'expired' | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type BillingCycle = 'monthly' | 'yearly'

export interface SubscriptionDocument {
    _id: Types.ObjectId
    patientId: Types.ObjectId
    caregiverId: Types.ObjectId
    subscriptionFee: number
    startDate: Date
    endDate: Date
    status: SubscriptionStatus
    paymentStatus: PaymentStatus
    billingCycle: BillingCycle
    createdAt: Date
    updatedAt: Date
}