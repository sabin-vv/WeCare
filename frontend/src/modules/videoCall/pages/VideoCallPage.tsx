import '@livekit/components-styles'
import { LiveKitRoom, VideoConference } from '@livekit/components-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { completeRoom, createRoom } from '../api/videoCall.api'

import styles from './VideoCallPage.module.css'

import { env } from '@/config/env'
import { Role } from '@/modules/auth/types/auth.types'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

const VideoCallPage = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>()
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [token, setToken] = useState<string | null>(null)
    const [roomName, setRoomName] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [appointmentID, setAppointmentID] = useState('')

    const hasCalledRef = useRef(false)

    const initCall = useCallback(async () => {
        if (!appointmentId || hasCalledRef.current) return

        hasCalledRef.current = true
        setIsLoading(true)

        try {
            const data = await createRoom(appointmentId)

            setRoomName(data.roomName)
            setToken(data.token)
            setAppointmentID(data.appointmentID)
        } catch (error) {
            toast.error(getErrorMessage(error))
            navigate(-1)
        } finally {
            setIsLoading(false)
        }
    }, [appointmentId, navigate])

    useEffect(() => {
        initCall()
    }, [initCall])

    const goBack = useCallback(() => {
        const returnPath = location.state?.returnPath as string | undefined
        if (returnPath) {
            navigate(returnPath, { state: { refresh: Date.now() }, replace: true })
        } else {
            navigate(-1)
        }
    }, [location.state?.returnPath, navigate])

    const handleEndConsultation = useCallback(async () => {
        if (roomName) {
            try {
                await completeRoom(roomName)
                toast.success('Consultation completed')
                goBack()
                return
            } catch {
                toast.error('Failed to end consultation')
            }
        }

        navigate(-1)
    }, [roomName, goBack, navigate])

    const handleDisconnected = useCallback(() => {
        goBack()
    }, [goBack])

    if (isLoading || !token) {
        return <div className={styles.loadingContainer}>Connecting to consultation...</div>
    }

    return (
        <div className={styles.page} data-lk-theme="default">
            <header className={styles.header}>
                <div>
                    <h2 className={styles.title}>WeCare Consultation</h2>
                    <p className={styles.subtitle}>
                        Appointment ID : <span className={styles.appointmentId}>{appointmentID}</span>
                    </p>
                </div>

                {user?.role === Role.DOCTOR && (
                    <button className={styles.leaveButton} onClick={handleEndConsultation}>
                        End Consultation
                    </button>
                )}
            </header>

            <div className={styles.content}>
                <LiveKitRoom
                    token={token}
                    serverUrl={env.LIVEKIT_URL}
                    connect
                    onDisconnected={handleDisconnected}
                    style={{ width: '100%', height: '100%' }}
                >
                    <VideoConference />
                </LiveKitRoom>
            </div>
        </div>
    )
}

export default VideoCallPage
