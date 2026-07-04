import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
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
}
