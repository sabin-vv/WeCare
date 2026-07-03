import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
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
        res.status(HTTP_STATUS.OK).json({ success: true, data: result })
    }

    getUnreadCount = async (req: Request, res: Response) => {
        const { userId, role } = req.user ?? {}
        if (!userId || !role) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')

        if (role !== 'doctor' && role !== 'caregiver') {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'Only doctors and caregivers can access chat')
        }

        const result = await this._chatService.getTotalUnreadCount(userId, role)
        res.status(HTTP_STATUS.OK).json({ success: true, data: result })
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
        res.status(HTTP_STATUS.OK).json({ success: true, data: result })
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
        res.status(HTTP_STATUS.CREATED).json({ success: true, data: result, message: MSG.MESSAGE_SENT })
    }

    markAsRead = async (req: Request, res: Response) => {
        const { userId, role } = req.user ?? {}
        if (!userId || !role) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated')

        if (role !== 'doctor' && role !== 'caregiver') {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'Only doctors and caregivers can access chat')
        }

        const messageId = req.params.messageId as string
        await this._chatService.markAsRead(userId, role, messageId)
        res.status(HTTP_STATUS.OK).json({ success: true, message: MSG.MESSAGE_READ })
    }
}
