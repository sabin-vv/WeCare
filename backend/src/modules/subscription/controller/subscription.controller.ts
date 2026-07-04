import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { sendSuccess } from '../../../core/response/ApiResponse'
import { MSG } from '../constants/messages'
import { ISubscriptionService } from '../interfaces/subscription.service.interface'
import { createSubscriptionSchema } from '../validator/subscription.schema'

@injectable()
export class SubscriptionController {
    constructor(@inject(TOKENS.ISubscriptionService) private _subscriptionService: ISubscriptionService) {}

    getMySubscription = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const subscription = await this._subscriptionService.getMySubscription(userId)

        sendSuccess(res, subscription ? MSG.FETCHED : 'No active subscription found', subscription)
    }

    createSubscription = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        const role = req.user?.role
        if (!userId || !role) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const dto = createSubscriptionSchema.parse(req.body)
        const result = await this._subscriptionService.createSubscription(userId, role, dto)

        sendSuccess(res, MSG.CREATED, result, HTTP_STATUS.CREATED)
    }

    verifySubscriptionPayment = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        const role = req.user?.role
        if (!userId || !role) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const subscription = await this._subscriptionService.verifySubscriptionPayment(userId, role, req.body)

        sendSuccess(res, MSG.ACTIVATED, subscription)
    }

    cancelSubscription = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        const role = req.user?.role
        if (!userId || !role) {
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)
        }

        const { subscriptionId } = req.params as { subscriptionId: string }
        await this._subscriptionService.cancelSubscription(subscriptionId, userId, role)

        sendSuccess(res, MSG.CANCELLED)
    }
}