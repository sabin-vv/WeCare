import { z } from 'zod'

export const sendMessageSchema = z.object({
    message: z.string().min(1, 'Message is required'),
})

export const messagesQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50),
})
