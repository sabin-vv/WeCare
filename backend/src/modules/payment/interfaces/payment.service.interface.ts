import { Orders } from 'razorpay/dist/types/orders'

import { PaymentDocument } from '../types/payment.types'
import { VerifyPaymentDTO } from '../validator/payment.schema'

export type RazorpayOrder = Orders.RazorpayOrder

export interface IPaymentService {
    verifyPayment(dto: VerifyPaymentDTO): Promise<PaymentDocument>
}
