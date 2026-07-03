import { Document, Types } from 'mongoose'

export interface ConversationDocument extends Document {
    patientId: Types.ObjectId
    doctorId: Types.ObjectId
    caregiverId: Types.ObjectId
    lastMessage: string
    lastMessageAt: Date
    lastSenderId: Types.ObjectId
    lastSenderRole: 'doctor' | 'caregiver'
    unreadCount: {
        doctor: number
        caregiver: number
    }
    createdAt: Date
    updatedAt: Date
}

export interface MessageDocument extends Document {
    conversationId: Types.ObjectId
    patientId: Types.ObjectId
    senderId: Types.ObjectId
    senderRole: 'doctor' | 'caregiver'
    receiverId: Types.ObjectId
    receiverRole: 'doctor' | 'caregiver'
    message: string
    readAt: Date | null
    createdAt: Date
}

export interface ConversationDTO {
    patientId: string
    patientName: string
    patientProfileImage?: string
    otherPersonName: string
    otherPersonProfileImage?: string
    otherPersonRole: 'doctor' | 'caregiver'
    lastMessage: string
    lastMessageAt: string
    lastSenderId: string
    lastSenderRole: 'doctor' | 'caregiver'
    unreadCount: number
}

export interface MessageDTO {
    id: string
    conversationId: string
    senderId: string
    senderRole: 'doctor' | 'caregiver'
    message: string
    readAt: string | null
    createdAt: string
}

export interface ConversationListResponse {
    conversations: ConversationDTO[]
}

export interface MessagesResponse {
    messages: MessageDTO[]
    pagination: {
        page: number
        limit: number
        totalCount: number
        totalPages: number
    }
}

export interface SendMessageResponse {
    message: MessageDTO
}
