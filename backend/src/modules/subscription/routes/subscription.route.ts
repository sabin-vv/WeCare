import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { SubscriptionController } from '../controller/subscription.controller'
import { createSubscriptionSchema } from '../validator/subscription.schema'

export const createSubscriptionRoutes = () => {
    const router = Router()
    const subscriptionController = container.resolve(SubscriptionController)

    router.get('/me', requireAuth, subscriptionController.getMySubscription)

    router.post('/', requireAuth, validate(createSubscriptionSchema), subscriptionController.createSubscription)

    router.post('/verify', requireAuth, subscriptionController.verifySubscriptionPayment)

    router.post('/:subscriptionId/cancel', requireAuth, subscriptionController.cancelSubscription)

    return router
}