import { BadgeCheck } from 'lucide-react'
import { useState } from 'react'

import type { DoctorRegistrationSectionProps } from '../../types/doctor.types'
import styles from '../DoctorSettingsForm.module.css'

import { env } from '@/config/env'
import Modal from '@/shared/components/Modal/Modal'
import { Section } from '@/shared/components/Section/Section'

const DoctorRegistrationSection = ({ profile }: DoctorRegistrationSectionProps) => {
    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; title: string; documentUrl: string }>({
        isOpen: false,
        title: '',
        documentUrl: '',
    })

    const openPreview = (title: string, documentUrl: string) => {
        setPreviewModal({ isOpen: true, title, documentUrl })
    }

    const closePreview = () => {
        setPreviewModal({ isOpen: false, title: '', documentUrl: '' })
    }
    const baseUrl = env.AWS_BASE_URL

    return (
        <Section
            title="Professional Registration"
            actions={
                <div className={styles.verifiedRow}>
                    <BadgeCheck size={14} />
                    <span>Verified</span>
                </div>
            }
        >
            <div className={styles.registrationGrid}>
                <div className={styles.registrationItem}>
                    <h3>Medical License</h3>
                    <p>{profile.medicalCertificateNumber}</p>
                    <span
                        className={styles.previewCert}
                        onClick={() => openPreview('Medical License', profile.medicalCertificateImage || '')}
                    >
                        preview
                    </span>
                </div>

                <div className={styles.registrationItem}>
                    <h3>Medical Council Registration</h3>
                    <p>{profile.medicalCouncilRegistrationNumber}</p>
                    <span
                        className={styles.previewCert}
                        onClick={() => openPreview('Medical Council Registration', profile.medicalCouncilImage || '')}
                    >
                        preview
                    </span>
                </div>

                <div className={styles.registrationItem}>
                    <h3>Experience Certificates : {profile.specialization?.length || 0}</h3>
                    <p className={styles.highlightValue}> Uploaded</p>
                    {profile.specialization?.map((spec, index) => (
                        <span
                            key={index}
                            className={styles.previewCert}
                            onClick={() => openPreview(`${spec.name} - Certificate`, spec.documentImage as string)}
                        >
                            {spec.name}
                        </span>
                    ))}
                </div>
            </div>

            <Modal isOpen={previewModal.isOpen} onClose={closePreview} title={previewModal.title} size="lg">
                {previewModal.documentUrl ? (
                    <img
                        src={`${baseUrl}${previewModal.documentUrl}`}
                        alt={previewModal.title}
                        style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                    />
                ) : (
                    <p style={{ textAlign: 'center', color: '#666' }}>No document uploaded</p>
                )}
            </Modal>
        </Section>
    )
}

export default DoctorRegistrationSection
