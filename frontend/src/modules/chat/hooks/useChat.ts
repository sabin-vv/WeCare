import { useCallback, useEffect, useRef, useState } from 'react'

import { getConversations, getConversationMessages, sendMessage as sendMessageApi } from '../api/chat.api'
import type { ConversationDTO, MessageDTO } from '../types/chat.types'

import { useAuth } from '@/shared/context/AuthContext'
import { useSocket } from '@/shared/context/SocketContext'

const sortOldestFirst = (msgs: MessageDTO[]) =>
    msgs.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

const sortNewestConversationFirst = (conversations: ConversationDTO[]) =>
    conversations
        .slice()
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())

export const useChat = () => {
    const { user } = useAuth()
    const { socket } = useSocket()
    const [conversations, setConversations] = useState<ConversationDTO[]>([])
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
    const [messages, setMessages] = useState<MessageDTO[]>([])
    const [loadingConversations, setLoadingConversations] = useState(true)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [sending, setSending] = useState(false)
    const messagesMapRef = useRef<Map<string, MessageDTO[]>>(new Map())
    const selectedPatientIdRef = useRef<string | null>(null)

    const currentUserRole = user?.role as 'doctor' | 'caregiver' | undefined
    const currentUserId = user?.id ?? ''

    const addMessageToConversation = useCallback(
        (patientId: string, message: MessageDTO) => {
            const patientMsgs = messagesMapRef.current.get(patientId) ?? []
            if (!patientMsgs.some((m) => m.id === message.id)) {
                messagesMapRef.current.set(patientId, sortOldestFirst([...patientMsgs, message]))
            }

            if (selectedPatientIdRef.current === patientId) {
                setMessages((prev) =>
                    prev.some((m) => m.id === message.id)
                        ? prev
                        : sortOldestFirst([...prev, message]),
                )
            }
        },
        [],
    )

    const updateConversationPreview = useCallback(
        (
            patientId: string,
            message: MessageDTO,
            unreadCount?: number,
        ) => {
            setConversations((prev) =>
                sortNewestConversationFirst(
                    prev.map((conversation) =>
                        conversation.patientId === patientId
                            ? {
                                  ...conversation,
                                  lastMessage: message.message,
                                  lastMessageAt: message.createdAt,
                                  lastSenderId: message.senderId,
                                  lastSenderRole: message.senderRole,
                                  unreadCount:
                                      selectedPatientIdRef.current === patientId
                                          ? 0
                                          : unreadCount ?? conversation.unreadCount,
                              }
                            : conversation,
                    ),
                ),
            )
        },
        [],
    )

    const fetchConversations = useCallback(async () => {
        try {
            setLoadingConversations(true)
            const data = await getConversations()
            setConversations(data.conversations)
        } catch {
            console.error('Failed to load conversations')
        } finally {
            setLoadingConversations(false)
        }
    }, [])

    const selectConversation = useCallback(async (patientId: string) => {
        selectedPatientIdRef.current = patientId
        setSelectedPatientId(patientId)
        setConversations((prev) =>
            prev.map((conversation) =>
                conversation.patientId === patientId ? { ...conversation, unreadCount: 0 } : conversation,
            ),
        )

        const cached = messagesMapRef.current.get(patientId)
        if (cached) {
            setMessages(cached)
            return
        }

        setMessages([])

        try {
            setLoadingMessages(true)
            const data = await getConversationMessages(patientId)
            const msgs = sortOldestFirst(data.messages)
            messagesMapRef.current.set(patientId, msgs)
            if (selectedPatientIdRef.current === patientId) {
                setMessages(msgs)
            }
        } catch {
            console.error('Failed to load messages')
        } finally {
            if (selectedPatientIdRef.current === patientId) {
                setLoadingMessages(false)
            }
        }
    }, [])

    const sendMessage = useCallback(
        async (message: string) => {
            if (!selectedPatientId) return
            try {
                setSending(true)
                const data = await sendMessageApi(selectedPatientId, message)
                const newMsg = data.message
                addMessageToConversation(selectedPatientId, newMsg)
                updateConversationPreview(selectedPatientId, newMsg, 0)
            } catch {
                console.error('Failed to send message')
            } finally {
                setSending(false)
            }
        },
        [addMessageToConversation, selectedPatientId, updateConversationPreview],
    )

    const startNewChat = useCallback(
        async (patientId: string) => {
            await selectConversation(patientId)
            await fetchConversations()
        },
        [selectConversation, fetchConversations],
    )

    useEffect(() => {
        fetchConversations()
    }, [fetchConversations])

    useEffect(() => {
        if (!socket) return

        const handleNewMessage = (data: {
            conversation: {
                patientId: string
                lastMessage: string
                lastMessageAt: string
                lastSenderId: string
                lastSenderRole: 'doctor' | 'caregiver'
                unreadCount: number
            }
            message: MessageDTO
        }) => {
            const { conversation: conv, message: msg } = data
            const isKnownConversation = conversations.some((c) => c.patientId === conv.patientId)

            if (!isKnownConversation) {
                void fetchConversations()
            }

            updateConversationPreview(conv.patientId, msg, conv.unreadCount)

            if (msg.senderId !== currentUserId && selectedPatientId === conv.patientId) {
                addMessageToConversation(conv.patientId, msg)
            }
        }

        const handleMessageSent = (msg: MessageDTO) => {
            if (selectedPatientId) {
                addMessageToConversation(selectedPatientId, msg)
                updateConversationPreview(selectedPatientId, msg, 0)
            }
        }

        socket.on('new_chat_message', handleNewMessage)
        socket.on('chat_message_sent', handleMessageSent)

        return () => {
            socket.off('new_chat_message', handleNewMessage)
            socket.off('chat_message_sent', handleMessageSent)
        }
    }, [
        addMessageToConversation,
        conversations,
        currentUserId,
        fetchConversations,
        selectedPatientId,
        socket,
        updateConversationPreview,
    ])

    return {
        conversations,
        messages,
        selectedPatientId,
        loadingConversations,
        loadingMessages,
        sending,
        currentUserRole,
        currentUserId,
        selectConversation,
        sendMessage,
        startNewChat,
        fetchConversations,
    }
}
