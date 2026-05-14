import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { SubscriptionController } from '../controller/subscription.controller'

export const createSubscriptionRoutes = () => {
    const router = Router()
    const subscriptionController = container.resolve(SubscriptionController)

    router.get('/me', requireAuth, subscriptionController.getMySubscription)

    return router
}