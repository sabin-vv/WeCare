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

import type { ReactNode } from 'react'

export interface ChatInputProps {
    onSend: (message: string) => void
    disabled?: boolean
}

export interface ChatLayoutProps {
    children: ReactNode
    hasActiveChat?: boolean
}

export interface ChatWindowProps {
    messages: MessageDTO[]
    patientName: string
    otherPersonName: string
    otherPersonProfileImage?: string
    currentUserId: string
    onSend: (message: string) => void
    disabled?: boolean
    isLoading?: boolean
    onBack?: () => void
}

export interface ConversationListProps {
    conversations: ConversationDTO[]
    selectedPatientId: string | null
    onSelect: (patientId: string) => void
    currentUserRole: 'doctor' | 'caregiver'
    onNewChat?: () => void
}

export interface MessageBubbleProps {
    message: MessageDTO
    isOwn: boolean
}

export interface PatientOption {
    _id: string
    name: string
    patientName: string
    subtitle?: string
    profileImage?: string
}

export interface StartNewChatModalProps {
    isOpen: boolean
    onClose: () => void
    fetchPatients: () => Promise<PatientOption[]>
    onSelectPatient: (patientId: string, name: string, patientName: string) => void
}
