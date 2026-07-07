import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { PaymentController } from '../controller/payment.controller'
import { createWalletTopupSchema, verifyPaymentSchema, verifyWalletTopupSchema } from '../validator/payment.schema'

export const createPaymentRoutes = () => {
    const router = Router()
    const paymentController = container.resolve(PaymentController)

    router.post('/verify', validate(verifyPaymentSchema), paymentController.verifyPayment)

    router.use(requireAuth)

    router.post(
        '/wallet-topup/order',
        validate(createWalletTopupSchema),
        paymentController.createWalletTopupOrder,
    )

    router.post(
        '/wallet-topup/verify',
        validate(verifyWalletTopupSchema),
        paymentController.verifyWalletTopup,
    )

    return router
}
