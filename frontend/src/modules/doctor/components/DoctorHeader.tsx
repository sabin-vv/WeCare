import { Menu, Video } from 'lucide-react'

import Header from '../../../shared/components/Header/Header'

import styles from './DoctorHeader.module.css'

import { doctorNavLinks } from '@/shared/constants/navLinks'
import { useAuth } from '@/shared/context/AuthContext'
import { useSocket } from '@/shared/context/SocketContext'

interface DoctorHeaderProps {
    onMenuClick?: () => void
}

const DoctorHeader = ({ onMenuClick }: DoctorHeaderProps) => {
    const { user } = useAuth()
    const { joinedPatients } = useSocket()

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

    return (
        <Header
            titlePrefix="Dr. "
            subtitle={user?.professionalTitle}
            navLinks={doctorNavLinks}
            leading={hamburgerButton}
            trailing={videoBadge}
        />
    )
}

export default DoctorHeader
