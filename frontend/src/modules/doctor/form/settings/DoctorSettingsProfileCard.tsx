import { Camera } from 'lucide-react'

import type { DoctorSettingsProfileCardProps } from '../../types/doctor.types'
import styles from '../DoctorSettingsForm.module.css'

import { Section } from '@/shared/components/Section/Section'

const DoctorSettingsProfileCard = ({
    profile,
    profileImageUrl,
    onToggleStatus,
    isActive,
    onImageSelect,
    isUploadingImage,
}: DoctorSettingsProfileCardProps) => {
    return (
        <Section>
            <div className={styles.profileCard}>
                <div className={styles.profileMeta}>
                    <div
                        className={`${styles.avatarWrap} ${isUploadingImage ? styles.uploading : ''}`}
                        onClick={() => !isUploadingImage && document.getElementById('doctorProfileImageInput')?.click()}
                    >
                        <input
                            type="file"
                            id="doctorProfileImageInput"
                            accept="image/*"
                            onChange={onImageSelect}
                            style={{ display: 'none' }}
                        />
                        {profileImageUrl ? (
                            <img src={profileImageUrl} alt={profile.name} className={styles.avatar} />
                        ) : (
                            <div className={styles.avatarFallback}>{profile.name.charAt(0).toUpperCase()}</div>
                        )}
                        <span className={styles.avatarBadge}>
                            <Camera size={12} />
                        </span>
                    </div>

                    <div>
                        <h1 className={styles.doctorName}>Dr. {profile.name}</h1>
                        <p className={styles.doctorMetaLine}>{profile.email}</p>
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
            </div>
        </Section>
    )
}

export default DoctorSettingsProfileCard
