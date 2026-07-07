import { Orders } from 'razorpay/dist/types/orders'

import { PaymentDocument } from '../types/payment.types'
import { CreateWalletTopupDTO, VerifyPaymentDTO, VerifyWalletTopupDTO } from '../validator/payment.schema'

export type RazorpayOrder = Orders.RazorpayOrder

export interface WalletTopupOrderResult {
    orderId: string
    amount: number
    currency: string
    keyId: string
}

export interface IPaymentService {
    verifyPayment(dto: VerifyPaymentDTO): Promise<PaymentDocument>

    createWalletTopupOrder(userId: string, dto: CreateWalletTopupDTO): Promise<WalletTopupOrderResult>

    verifyWalletTopup(userId: string, dto: VerifyWalletTopupDTO): Promise<{ balance: number }>
}
