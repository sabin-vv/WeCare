import { CHAT_API } from '@/shared/constants/api.constants'

export const CHAT_ENDPOINTS = {
    CONVERSATIONS: `${CHAT_API}/conversations`,
    CONVERSATION_MESSAGES: (patientId: string) => `${CHAT_API}/conversations/${patientId}/messages`,
    MESSAGE_READ: (messageId: string) => `${CHAT_API}/messages/${messageId}/read`,
    UNREAD_COUNT: `${CHAT_API}/unread-count`,
} as const
