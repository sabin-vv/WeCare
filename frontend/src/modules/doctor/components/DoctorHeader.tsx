import { Menu, Video } from 'lucide-react'

import Header from '../../../shared/components/Header/Header'

import styles from './DoctorHeader.module.css'

import { useUnreadChatCount } from '@/modules/chat/hooks/useUnreadChatCount'
import { doctorNavLinks } from '@/shared/constants/navLinks'
import { useAuth } from '@/shared/context/AuthContext'
import { useSocket } from '@/shared/context/SocketContext'

interface DoctorHeaderProps {
    onMenuClick?: () => void
}

const DoctorHeader = ({ onMenuClick }: DoctorHeaderProps) => {
    const { user } = useAuth()
    const { joinedPatients } = useSocket()
    const { unreadChatCount } = useUnreadChatCount()

    const hamburgerButton = onMenuClick ? (
        <button onClick={onMenuClick} className={styles.sidebarToggleBtn} aria-label="Toggle sidebar">
            <Menu size={24} />
        </button>
    ) : null

    const videoBadge = joinedPatients.size > 0 ? (
        <div className={styles.videoCallIndicator} title={`${joinedPatients.size} patient${joinedPatients.size > 1 ? 's' : ''} in video call`}>
            <Video size={18} />
            <span className={styles.videoCallCount}>{joinedPatients.size}</span>
        </div>
    ) : null

    const links = doctorNavLinks.map((link) =>
        link.label === 'Chat' ? { ...link, badge: unreadChatCount } : link,
    )

    return (
        <Header
            titlePrefix="Dr. "
            subtitle={user?.professionalTitle}
            navLinks={links}
            leading={hamburgerButton}
            trailing={videoBadge}
        />
    )
}

export default DoctorHeader
