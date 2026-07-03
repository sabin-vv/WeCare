import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { ChatController } from '../controller/chat.controller'
import { sendMessageSchema } from '../validator/chat.schema'

export const createChatRoutes = () => {
    const router = Router()
    const chatController = container.resolve(ChatController)

    router.use(requireAuth)

    router.get('/unread-count', chatController.getUnreadCount)
    router.get('/conversations', chatController.getConversations)
    router.get('/conversations/:patientId/messages', chatController.getMessages)
    router.post('/conversations/:patientId/messages', validate(sendMessageSchema), chatController.sendMessage)
    router.patch('/messages/:messageId/read', chatController.markAsRead)

    return router
}
