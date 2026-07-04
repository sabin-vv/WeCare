import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { sendSuccess } from '../../../core/response/ApiResponse'
import { MSG } from '../constants/messages'
import { IReminderService } from '../interfaces/reminder.service.interface'

@injectable()
export class ReminderController {
    constructor(@inject(TOKENS.IReminderService) private _reminderService: IReminderService) {}

    getReminders = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)

        const result = await this._reminderService.getReminders(userId)
        sendSuccess(res, undefined, result)
    }

    createReminder = async (req: Request, res: Response) => {
        const userId = req.user?.userId
        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.USER_NOT_AUTHENTICATED)

        const result = await this._reminderService.createReminder(userId, req.body)
        sendSuccess(res, MSG.CREATED, result, HTTP_STATUS.CREATED)
    }

    updateReminder = async (req: Request, res: Response) => {
        const reminderId = req.params.reminderId as string
        if (!reminderId) throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.ID_REQUIRED)

        const result = await this._reminderService.updateReminder(reminderId, req.body)
        sendSuccess(res, MSG.UPDATED, result)
    }

    markReminderDone = async (req: Request, res: Response) => {
        const reminderId = req.params.reminderId as string
        if (!reminderId) throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.ID_REQUIRED)

        const result = await this._reminderService.markReminderDone(reminderId)
        sendSuccess(res, MSG.MARKED_DONE, result)
    }

    deleteReminder = async (req: Request, res: Response) => {
        const reminderId = req.params.reminderId as string
        if (!reminderId) throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.ID_REQUIRED)

        await this._reminderService.deleteReminder(reminderId)
        sendSuccess(res, MSG.DELETED)
    }
}
