import { useCallback, useEffect, useState } from 'react'

import { useChat } from '../hooks/useChat'
import { useUnreadChatCount } from '../hooks/useUnreadChatCount'
import type { PatientOption } from '../types/chat.types'

import ChatLayout from '@/modules/chat/components/ChatLayout'
import ChatWindow from '@/modules/chat/components/ChatWindow'
import ConversationList from '@/modules/chat/components/ConversationList'
import StartNewChatModal from '@/modules/chat/components/StartNewChatModal'
import { listPatients } from '@/modules/doctor/api/doctor.api'
import MainWrapper from '@/shared/components/MainWrapper/MainWrapper'

const DoctorChatPage = () => {
    const {
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
    } = useChat()

    const { reset: resetChatCount } = useUnreadChatCount()

    useEffect(() => {
        resetChatCount()
    }, [resetChatCount])

    const [showModal, setShowModal] = useState(false)
    const [selectedInfo, setSelectedInfo] = useState<{
        otherPersonName: string
        otherPersonProfileImage?: string
        patientName: string
    } | null>(null)

    const selectedPatient = conversations.find((c) => c.patientId === selectedPatientId)

    const otherPersonName = selectedPatient?.otherPersonName ?? selectedInfo?.otherPersonName ?? 'Chat'
    const otherPersonProfileImage = selectedPatient?.otherPersonProfileImage ?? selectedInfo?.otherPersonProfileImage
    const headerPatientName = selectedPatient?.patientName ?? selectedInfo?.patientName ?? 'Patient'

    const fetchPatients = useCallback(async (): Promise<PatientOption[]> => {
        const res = await listPatients('', 'all', 'all', 1, 100)
        return res.patients.map((p) => ({
            _id: p._id,
            name: p.caregiver || 'Unassigned Caregiver',
            patientName: p.name,
            subtitle: `about ${p.name}`,
            profileImage: p.profileImage,
        }))
    }, [])

    const handleSelectPatient = useCallback(
        async (patientId: string, name: string, patientName: string) => {
            setSelectedInfo({ otherPersonName: name, patientName })
            await startNewChat(patientId)
        },
        [startNewChat],
    )

    return (
        <MainWrapper title="Chat" subtitle="Communicate with caregivers about your patients">
            <ChatLayout>
                {loadingConversations ? (
                    <div style={{ padding: '24px', color: '#94a3b8' }}>Loading conversations...</div>
                ) : (
                    <ConversationList
                        conversations={conversations}
                        selectedPatientId={selectedPatientId}
                        onSelect={selectConversation}
                        currentUserRole={currentUserRole ?? 'doctor'}
                        onNewChat={() => setShowModal(true)}
                    />
                )}
                {selectedPatientId ? (
                    <ChatWindow
                        messages={messages}
                        patientName={headerPatientName}
                        otherPersonName={otherPersonName}
                        otherPersonProfileImage={otherPersonProfileImage}
                        currentUserId={currentUserId}
                        onSend={sendMessage}
                        disabled={sending}
                    />
                ) : (
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8',
                            fontSize: '14px',
                            backgroundColor: '#f8fafc',
                        }}
                    >
                        {loadingMessages ? 'Loading messages...' : 'Select a conversation to start chatting'}
                    </div>
                )}
            </ChatLayout>
            <StartNewChatModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                fetchPatients={fetchPatients}
                onSelectPatient={handleSelectPatient}
            />
        </MainWrapper>
    )
}

export default DoctorChatPage
