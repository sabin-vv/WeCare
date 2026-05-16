import { Menu } from 'lucide-react'

import Header from '../../../shared/components/Header/Header'

import styles from './DoctorHeader.module.css'

import { doctorNavLinks } from '@/shared/constants/navLinks'
import { useAuth } from '@/shared/context/AuthContext'

interface DoctorHeaderProps {
    onMenuClick?: () => void
}

const DoctorHeader = ({ onMenuClick }: DoctorHeaderProps) => {
    const { user } = useAuth()

    const hamburgerButton = onMenuClick ? (
        <button onClick={onMenuClick} className={styles.sidebarToggleBtn} aria-label="Toggle sidebar">
            <Menu size={24} />
        </button>
    ) : null

    return (
        <Header
            titlePrefix="Dr. "
            subtitle={user?.professionalTitle}
            navLinks={doctorNavLinks}
            leading={hamburgerButton}
        />
    )
}

export default DoctorHeader
