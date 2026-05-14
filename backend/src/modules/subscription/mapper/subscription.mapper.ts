import type { UserDocument } from '../../auth/types/auth.types'
import type { CaregiverDocument } from '../../caregiver/types/caregiver.types'
import type { SubscriptionDocument, SubscriptionDTO } from '../types/subscription.types'

export const toSubscriptionDTO = (
    subscription: SubscriptionDocument,
    caregiver?: CaregiverDocument,
    caregiverUser?: UserDocument,
): SubscriptionDTO => {
    return {
        subscriptionId: subscription._id.toString(),
        status: subscription.status,
        paymentStatus: subscription.paymentStatus,
        billingCycle: subscription.billingCycle,
        subscriptionFee: subscription.subscriptionFee,
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate.toISOString(),
        caregiver:
            caregiver && caregiverUser
                ? {
                      id: caregiver._id.toString(),
                      name: caregiverUser.name,
                  }
                : null,
    }
}
