import { useState } from 'react'

import styles from '../../pages/Verification.module.css'
import type { PendingDoctor } from '../../types/admin.types'

import Modal from '@/shared/components/Modal/Modal'
import { getFileUrl } from '@/utils/getFileUrl'

interface DoctorDocumentViewerProps {
    isOpen: boolean
    onClose: () => void
    doctor: PendingDoctor | null
    onApprove: () => void
    onReject: () => void
    onSpecVerify: (index: number) => void
}

const DoctorDocumentViewer = ({
    isOpen,
    onClose,
    doctor,
    onApprove,
    onReject,
    onSpecVerify,
}: DoctorDocumentViewerProps) => {
    const [activeTab, setActiveTab] = useState<string>('council')

    const getDocUrl = () => {
        if (!doctor) return ''
        if (activeTab === 'council') return doctor.medicalCouncilImage
        if (activeTab === 'certificate') return doctor.medicalCertificateImage
        if (activeTab === 'govid') return doctor.govIdImage
        if (activeTab.startsWith('spec-')) {
            const index = parseInt(activeTab.split('-')[1])
            return doctor.specializations[index]?.documentImage
        }
        return ''
    }

    const currentDocUrl = getDocUrl()
    const currentSpecIndex = activeTab.startsWith('spec-') ? parseInt(activeTab.split('-')[1]) : -1
    const isCurrentSpecVerified = currentSpecIndex !== -1 && doctor?.specializations[currentSpecIndex]?.verified

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Verification: Dr. ${doctor?.name}`}
            footer={
                doctor?.verificationStatus === 'pending' ? (
                    <>
                        <button className={styles.rejectBtn} onClick={onReject}>
                            Reject
                        </button>
                        <button className={styles.approveBtn} onClick={onApprove}>
                            Approve
                        </button>
                    </>
                ) : null
            }
        >
            {doctor && (
                <div className={styles.modalContent}>
                    <div className={styles.docHead}>
                        <p>
                            <strong>Council Reg. No:</strong> #{doctor.medicalCouncilRegisterNumber}
                        </p>
                        <p>
                            <strong>Certificate No:</strong> #{doctor.medicalCertificateNumber}
                        </p>
                        <p>
                            <strong>Specialty:</strong>{' '}
                            {doctor.specializations?.length
                                ? doctor.specializations.map((s) => s.name).join(', ')
                                : 'General'}
                        </p>
                    </div>
                    <div className={styles.tabBar}>
                        <button
                            className={`${styles.tab} ${activeTab === 'council' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('council')}
                        >
                            Medical Council
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'certificate' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('certificate')}
                        >
                            Medical Certificate
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'govid' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('govid')}
                        >
                            Govt ID
                        </button>
                        {doctor.specializations.map((spec, i) => (
                            <button
                                key={`spec-${i}`}
                                className={`${styles.tab} ${activeTab === `spec-${i}` ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab(`spec-${i}`)}
                            >
                                {spec.name} Cert {spec.verified && '✓'}
                            </button>
                        ))}
                    </div>

                    {currentSpecIndex !== -1 && (
                        <div className={styles.specActionBar}>
                            {isCurrentSpecVerified ? (
                                <div className={styles.verifiedBadge}>
                                    <span>Verified</span>
                                </div>
                            ) : (
                                doctor?.verificationStatus === 'pending' && (
                                    <div className={styles.specActionBar}>
                                        <button
                                            className={styles.specVerifyBtn}
                                            onClick={() => onSpecVerify(currentSpecIndex)}
                                        >
                                            Verify This Certificate
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    <div className={styles.docWrapper}>
                        {currentDocUrl?.endsWith('.pdf') ? (
                            <iframe
                                key={currentDocUrl}
                                src={getFileUrl(currentDocUrl)}
                                className={styles.docIframe}
                                title="Doctor Document Viewer"
                            />
                        ) : currentDocUrl ? (
                            <img
                                key={currentDocUrl}
                                src={getFileUrl(currentDocUrl)}
                                className={styles.docImage}
                                alt="Doctor Document Preview"
                            />
                        ) : (
                            <div className={styles.noDoc}>No document uploaded</div>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    )
}

export default DoctorDocumentViewer
