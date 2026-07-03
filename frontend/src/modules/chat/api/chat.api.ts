import type { ConversationListResponse, MessagesResponse, SendMessageResponse } from '../types/chat.types'

import { api } from '@/services/api'
import { CHAT_API } from '@/shared/constants/api.constants'

export const getConversations = async (): Promise<ConversationListResponse> => {
    const res = await api.get<{ data: ConversationListResponse }>(`${CHAT_API}/conversations`)
    return res.data.data
}

export const getConversationMessages = async (
    patientId: string,
    page = 1,
    limit = 50,
): Promise<MessagesResponse> => {
    const res = await api.get<{ data: MessagesResponse }>(
        `${CHAT_API}/conversations/${patientId}/messages`,
        { params: { page, limit } },
    )
    return res.data.data
}

export const sendMessage = async (
    patientId: string,
    message: string,
): Promise<SendMessageResponse> => {
    const res = await api.post<{ data: SendMessageResponse }>(
        `${CHAT_API}/conversations/${patientId}/messages`,
        { message },
    )
    return res.data.data
}

export const markMessageAsRead = async (messageId: string): Promise<void> => {
    await api.patch(`${CHAT_API}/messages/${messageId}/read`)
}
