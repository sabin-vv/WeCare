import type { SubscriptionDTO } from '../types/subscription.types'

export interface ISubscriptionService {
    getMySubscription(userId: string): Promise<SubscriptionDTO | null>
}