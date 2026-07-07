import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { sendSuccess } from '../../../core/response/ApiResponse'
import { MSG } from '../constants/messages'
import { IPaymentService } from '../interfaces/payment.service.interface'

@injectable()
export class PaymentController {
    constructor(@inject(TOKENS.IPaymentService) private _paymentService: IPaymentService) {}

    verifyPayment = async (req: Request, res: Response) => {
        const result = await this._paymentService.verifyPayment(req.body)

        sendSuccess(res, MSG.VERIFIED, result)
    }

    createWalletTopupOrder = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized')

        const result = await this._paymentService.createWalletTopupOrder(userId, req.body)

        sendSuccess(res, undefined, result)
    }

    verifyWalletTopup = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized')

        const result = await this._paymentService.verifyWalletTopup(userId, req.body)

        sendSuccess(res, 'Wallet topped up successfully', result)
    }
}
