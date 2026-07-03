import { ConversationListResponse, MessagesResponse, SendMessageResponse } from '../types/chat.types'

export interface IChatService {
    getConversations(userId: string, role: 'doctor' | 'caregiver'): Promise<ConversationListResponse>
    getMessages(
        userId: string,
        role: 'doctor' | 'caregiver',
        patientId: string,
        page: number,
        limit: number,
    ): Promise<MessagesResponse>
    sendMessage(
        userId: string,
        role: 'doctor' | 'caregiver',
        patientId: string,
        message: string,
    ): Promise<SendMessageResponse>
    markAsRead(userId: string, role: 'doctor' | 'caregiver', messageId: string): Promise<void>
}
