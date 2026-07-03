import { Types } from 'mongoose'

import { ConversationDocument, MessageDocument } from '../types/chat.types'

export interface IChatRepository {
    findConversationByPatient(patientId: Types.ObjectId): Promise<ConversationDocument | null>
    findConversationsByUserId(userId: Types.ObjectId, role: 'doctor' | 'caregiver'): Promise<ConversationDocument[]>
    createConversation(data: Partial<ConversationDocument>): Promise<ConversationDocument>
    updateConversation(
        conversationId: Types.ObjectId,
        data: Partial<ConversationDocument>,
    ): Promise<ConversationDocument | null>
    updateUnreadCount(
        conversationId: Types.ObjectId,
        role: 'doctor' | 'caregiver',
        delta: number,
    ): Promise<void>
    resetUnreadCount(conversationId: Types.ObjectId, role: 'doctor' | 'caregiver'): Promise<void>
    createMessage(data: Partial<MessageDocument>): Promise<MessageDocument>
    findMessagesByConversation(
        conversationId: Types.ObjectId,
        page: number,
        limit: number,
    ): Promise<{ messages: MessageDocument[]; totalCount: number }>
    getTotalUnreadCount(userId: Types.ObjectId, role: 'doctor' | 'caregiver'): Promise<number>
    markMessageAsRead(messageId: Types.ObjectId): Promise<void>
    markConversationMessagesAsRead(
        conversationId: Types.ObjectId,
        receiverId: Types.ObjectId,
    ): Promise<void>
}
