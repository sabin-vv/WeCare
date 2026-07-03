import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { getConversations } from '@/modules/chat/api/chat.api'

import { useAuth } from './AuthContext'
import { useSocket } from './SocketContext'

interface ChatUnreadCountContextValue {
    unreadChatCount: number
    reset: () => Promise<void>
    setConversationRead: (patientId: string) => void
}

const ChatUnreadCountContext = createContext<ChatUnreadCountContextValue | null>(null)

export const ChatUnreadCountProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth()
    const { socket } = useSocket()
    const [unreadChatCount, setUnreadChatCount] = useState(0)
    const currentUserId = user?.id ?? ''
    const mapRef = useRef<Map<string, number>>(new Map())

    const computeTotal = useCallback(() => {
        let total = 0
        for (const count of mapRef.current.values()) {
            total += count
        }
        setUnreadChatCount(total)
    }, [])

    const seedFromConversations = useCallback(async () => {
        try {
            const data = await getConversations()
            const newMap = new Map<string, number>()
            for (const conv of data.conversations) {
                if (conv.unreadCount > 0) {
                    newMap.set(conv.patientId, conv.unreadCount)
                }
            }
            mapRef.current = newMap
            computeTotal()
        } catch {
            // ignore
        }
    }, [computeTotal])

    useEffect(() => {
        if (!user || (user.role !== 'doctor' && user.role !== 'caregiver')) return
        void seedFromConversations()
    }, [seedFromConversations, user])

    useEffect(() => {
        if (!socket) return

        const handleNewMessage = (data: {
            conversation: { patientId: string; unreadCount: number }
            message: { senderId: string }
        }) => {
            if (data.message.senderId !== currentUserId) {
                mapRef.current.set(data.conversation.patientId, data.conversation.unreadCount)
                computeTotal()
            }
        }

        socket.on('new_chat_message', handleNewMessage)

        return () => {
            socket.off('new_chat_message', handleNewMessage)
        }
    }, [socket, currentUserId, computeTotal])

    const reset = useCallback(async () => {
        await seedFromConversations()
    }, [seedFromConversations])

    const setConversationRead = useCallback(
        (patientId: string) => {
            mapRef.current.delete(patientId)
            computeTotal()
        },
        [computeTotal],
    )

    const value = useMemo(
        () => ({ unreadChatCount, reset, setConversationRead }),
        [unreadChatCount, reset, setConversationRead],
    )

    return (
        <ChatUnreadCountContext.Provider value={value}>
            {children}
        </ChatUnreadCountContext.Provider>
    )
}

export const useChatUnreadCount = (): ChatUnreadCountContextValue => {
    const ctx = useContext(ChatUnreadCountContext)
    if (!ctx) throw new Error('useChatUnreadCount must be used inside <ChatUnreadCountProvider>')
    return ctx
}
