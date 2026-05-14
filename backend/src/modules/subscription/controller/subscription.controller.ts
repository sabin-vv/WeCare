import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { ISubscriptionService } from '../interfaces/subscription.service.interface'

@injectable()
export class SubscriptionController {
    constructor(@inject(TOKENS.ISubscriptionService) private _subscriptionService: ISubscriptionService) {}

    getMySubscription = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')
        }

        const subscription = await this._subscriptionService.getMySubscription(userId)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: subscription,
            message: subscription ? 'Subscription fetched successfully' : 'No active subscription found',
        })
    }
}