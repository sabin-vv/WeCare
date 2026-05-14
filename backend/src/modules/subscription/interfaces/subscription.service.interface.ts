import type { SubscriptionDTO } from '../types/subscription.types'
import type { CreateSubscriptionDTO } from '../validator/subscription.schema'

export interface CreateSubscriptionResult {
    subscriptionId: string
    paymentId: string
    orderId: string
    amount: number
    currency: string
    keyId: string
}

export interface WalletSubscriptionResult {
    subscriptionId: string
    paymentId: string
    walletBalance: number
    subscriptionConfirmed: true
}

export interface VerifySubscriptionPaymentDTO {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
}

export interface ISubscriptionService {
    getMySubscription(userId: string): Promise<SubscriptionDTO | null>
    createSubscription(
        userId: string,
        dto: CreateSubscriptionDTO,
    ): Promise<CreateSubscriptionResult | WalletSubscriptionResult>
    verifySubscriptionPayment(dto: VerifySubscriptionPaymentDTO): Promise<SubscriptionDTO>
    cancelSubscription(subscriptionId: string): Promise<void>
}