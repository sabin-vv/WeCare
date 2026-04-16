import { Camera } from 'lucide-react'

import type { DoctorSettingsProfileCardProps } from '../../types/doctor.types'
import styles from '../DoctorSettingsForm.module.css'

const DoctorSettingsProfileCard = ({
    savedState,
    profileImageUrl,
    onToggleStatus,
    isActive,
}: DoctorSettingsProfileCardProps) => {
    return (
        <section className={styles.profileCard}>
            <div className={styles.profileMeta}>
                <div className={styles.avatarWrap}>
                    {profileImageUrl ? (
                        <img src={profileImageUrl} alt={savedState.fullName} className={styles.avatar} />
                    ) : (
                        <div className={styles.avatarFallback}>{savedState.fullName.charAt(0).toUpperCase()}</div>
                    )}
                    <span className={styles.avatarBadge}>
                        <Camera size={12} />
                    </span>
                </div>

                <div>
                    <h1 className={styles.doctorName}>Dr. {savedState.fullName}</h1>
                    <p className={styles.doctorMetaLine}>
                        {savedState.email}
                    </p>
                </div>
            </div>

            <div className={styles.statusToggle}>
                <button
                    type="button"
                    className={`${styles.switch} ${isActive ? styles.switchOn : ''}`}
                    onClick={onToggleStatus}
                    aria-label="Toggle doctor account status"
                    aria-pressed={isActive}
                >
                    <span className={styles.switchThumb} />
                </button>
                <span>{isActive ? 'Active' : 'Inactive'}</span>
            </div>
        </section>
    )
}

export default DoctorSettingsProfileCard
