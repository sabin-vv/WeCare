import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { sendSuccess } from '../../../core/response/ApiResponse'
import { MSG } from '../constants/messages'
import { IChatService } from '../interfaces/chat.service.interface'

@injectable()
export class ChatController {
    constructor(@inject(TOKENS.IChatService) private _chatService: IChatService) {}

    getConversations = async (req: Request, res: Response) => {
        const { userId, role } = req.user ?? {}
        if (!userId || !role) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')

        if (role !== 'doctor' && role !== 'caregiver') {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'Only doctors and caregivers can access chat')
        }

        const result = await this._chatService.getConversations(userId, role)
        sendSuccess(res, undefined, result)
    }

    getUnreadCount = async (req: Request, res: Response) => {
        const { userId, role } = req.user ?? {}
        if (!userId || !role) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')

        if (role !== 'doctor' && role !== 'caregiver') {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'Only doctors and caregivers can access chat')
        }

        const result = await this._chatService.getTotalUnreadCount(userId, role)
        sendSuccess(res, undefined, result)
    }

    getMessages = async (req: Request, res: Response) => {
        const { userId, role } = req.user ?? {}
        if (!userId || !role) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')

        if (role !== 'doctor' && role !== 'caregiver') {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'Only doctors and caregivers can access chat')
        }

        const patientId = req.params.patientId as string
        const page = parseInt(req.query.page as string, 10) || 1
        const limit = parseInt(req.query.limit as string, 10) || 50

        const result = await this._chatService.getMessages(userId, role, patientId, page, limit)
        sendSuccess(res, undefined, result)
    }

    sendMessage = async (req: Request, res: Response) => {
        const { userId, role } = req.user ?? {}
        if (!userId || !role) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')

        if (role !== 'doctor' && role !== 'caregiver') {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'Only doctors and caregivers can access chat')
        }

        const patientId = req.params.patientId as string
        const { message } = req.body

        const result = await this._chatService.sendMessage(userId, role, patientId, message)
        sendSuccess(res, MSG.MESSAGE_SENT, result, HTTP_STATUS.CREATED)
    }

    markAsRead = async (req: Request, res: Response) => {
        const { userId, role } = req.user ?? {}
        if (!userId || !role) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')

        if (role !== 'doctor' && role !== 'caregiver') {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'Only doctors and caregivers can access chat')
        }

        const messageId = req.params.messageId as string
        await this._chatService.markAsRead(userId, role, messageId)
        sendSuccess(res, MSG.MESSAGE_READ)
    }
}
