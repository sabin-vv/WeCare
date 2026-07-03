import { useCallback, useEffect, useRef, useState } from 'react'

import { getUnreadChatCount } from '../api/chat.api'

import { useAuth } from '@/shared/context/AuthContext'
import { useSocket } from '@/shared/context/SocketContext'

export const useUnreadChatCount = () => {
    const { user } = useAuth()
    const { socket } = useSocket()
    const [unreadChatCount, setUnreadChatCount] = useState(0)
    const currentUserId = user?.id ?? ''
    const countRef = useRef(0)

    const fetchCount = useCallback(async () => {
        try {
            const count = await getUnreadChatCount()
            countRef.current = count
            setUnreadChatCount(count)
        } catch {
            // ignore
        }
    }, [])

    useEffect(() => {
        if (!user || (user.role !== 'doctor' && user.role !== 'caregiver')) return
        void fetchCount()
    }, [fetchCount, user])

    useEffect(() => {
        if (!socket) return

        const handleNewMessage = (data: { message: { senderId: string } }) => {
            if (data.message.senderId !== currentUserId) {
                countRef.current += 1
                setUnreadChatCount(countRef.current)
            }
        }

        socket.on('new_chat_message', handleNewMessage)

        return () => {
            socket.off('new_chat_message', handleNewMessage)
        }
    }, [socket, currentUserId])

    const reset = useCallback(() => {
        void fetchCount()
    }, [fetchCount])

    return { unreadChatCount, reset }
}
