import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'

import type { SocketContextValue } from '../types/context.types'

import { useAuth } from './AuthContext'

import { env } from '@/config/env'

const SocketContext = createContext<SocketContextValue | null>(null)

const getSocketUrl = () => {
    try {
        return new URL(env.API_URL).origin
    } catch {
        return 'http://localhost:5000'
    }
}

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { user, isAuthenticated } = useAuth()
    const socketRef = useRef<Socket | null>(null)
    const [socket, setSocket] = useState<Socket | null>(null)
    const [joinedPatients, setJoinedPatients] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
            }
            setSocket(null)
            return
        }

        const socketUrl = getSocketUrl()

        const newSocket = io(socketUrl, {
            withCredentials: true,
        })

        newSocket.on('connect_error', (error: unknown) => {
            console.error('Socket connection failed', error)
        })

        newSocket.on('patient_joined_call', (data: { patientMongoId?: string }) => {
            if (data.patientMongoId) {
                setJoinedPatients((prev) => new Set(prev).add(data.patientMongoId!))
            }
        })

        newSocket.on('consultation_completed', (data: { patientMongoId: string }) => {
            setJoinedPatients((prev) => {
                const next = new Set(prev)
                next.delete(data.patientMongoId)
                return next
            })
        })

        socketRef.current = newSocket
        setSocket(newSocket)

        return () => {
            newSocket.off('patient_joined_call')
            newSocket.off('consultation_completed')
            newSocket.disconnect()
            socketRef.current = null
            setSocket(null)
        }
    }, [isAuthenticated, user])

    const value = useMemo(() => ({ socket, joinedPatients }), [socket, joinedPatients])

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = (): SocketContextValue => {
    const ctx = useContext(SocketContext)
    if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>')
    return ctx
}
