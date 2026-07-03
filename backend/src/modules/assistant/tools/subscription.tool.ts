import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { ISubscriptionService } from '../../subscription/interfaces/subscription.service.interface'

@injectable()
export class SubscriptionTool {
    constructor(
        @inject(TOKENS.ISubscriptionService) private readonly _subscriptionService: ISubscriptionService,
    ) {}

    async getSubscriptionStatus(userId: string): Promise<string | null> {
        const sub = await this._subscriptionService.getMySubscription(userId)
        if (!sub) return null

        return `${sub.billingCycle} | ${sub.status}${sub.endDate ? ` | expires ${new Date(sub.endDate).toLocaleDateString()}` : ''}`
    }

    async getContext(userId: string): Promise<string | null> {
        return this.getSubscriptionStatus(userId)
    }
}
