import type { ConversationListResponse, MessagesResponse, SendMessageResponse } from '../types/chat.types'

import { CHAT_ENDPOINTS } from './chat.endpoints'

import { api } from '@/services/api'

export const getConversations = async (): Promise<ConversationListResponse> => {
    const res = await api.get<{ data: ConversationListResponse }>(CHAT_ENDPOINTS.CONVERSATIONS)
    return res.data.data
}

export const getConversationMessages = async (patientId: string, page = 1, limit = 50): Promise<MessagesResponse> => {
    const res = await api.get<{ data: MessagesResponse }>(CHAT_ENDPOINTS.CONVERSATION_MESSAGES(patientId), {
        params: { page, limit },
    })
    return res.data.data
}

export const sendMessage = async (patientId: string, message: string): Promise<SendMessageResponse> => {
    const res = await api.post<{ data: SendMessageResponse }>(CHAT_ENDPOINTS.CONVERSATION_MESSAGES(patientId), {
        message,
    })
    return res.data.data
}

export const markMessageAsRead = async (messageId: string): Promise<void> => {
    await api.patch(CHAT_ENDPOINTS.MESSAGE_READ(messageId))
}

export const getUnreadChatCount = async (): Promise<number> => {
    const res = await api.get<{ data: { unreadCount: number } }>(CHAT_ENDPOINTS.UNREAD_COUNT)
    return res.data.data.unreadCount
}
