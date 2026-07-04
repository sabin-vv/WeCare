import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { sendSuccess } from '../../../core/response/ApiResponse'
import { MSG } from '../constants/messages'
import { IFeedbackService } from '../interfaces/feedback.service.interface'

@injectable()
export class FeedbackController {
    constructor(
        @inject(TOKENS.IFeedbackService)
        private _feedbackService: IFeedbackService,
    ) {}

    submitFeedback = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)

        const result = await this._feedbackService.submitFeedback(userId, req.body)
        sendSuccess(res, MSG.SUBMITTED, result, HTTP_STATUS.CREATED)
    }
}
