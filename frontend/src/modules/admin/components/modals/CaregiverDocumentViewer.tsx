import { useState } from 'react'

import styles from '../../pages/Verification.module.css'
import type { PendingCaregiver } from '../../types/admin.types'

import Modal from '@/shared/components/Modal/Modal'
import { getFileUrl } from '@/utils/getFileUrl'

interface CaregiverDocumentViewerProps {
    isOpen: boolean
    onClose: () => void
    caregiver: PendingCaregiver | null
    onApprove: () => void
    onReject: () => void
}

type Tab = 'certificate' | 'license' | 'govid'

const CaregiverDocumentViewer = ({ isOpen, onClose, caregiver, onApprove, onReject }: CaregiverDocumentViewerProps) => {
    const [activeTab, setActiveTab] = useState<Tab>('certificate')

    const currentDocUrl = (() => {
        if (!caregiver) return ''
        if (activeTab === 'certificate') return caregiver.certificateImage
        if (activeTab === 'license') return caregiver.licenseImage
        return caregiver.govIdImage
    })()

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Verification: ${caregiver?.name || ''}`}
            footer={
                caregiver?.verificationStatus === 'pending' ? (
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
            {caregiver && (
                <div className={styles.modalContent}>
                    <div className={styles.docHead}>
                        <p>
                            <strong>Certificate No:</strong> #{caregiver.certificateNumber}
                        </p>
                        <p>
                            <strong>License No:</strong> #{caregiver.licenseNumber}
                        </p>
                    </div>

                    <div className={styles.tabBar}>
                        <button
                            className={`${styles.tab} ${activeTab === 'certificate' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('certificate')}
                        >
                            Certificate
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'license' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('license')}
                        >
                            License
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'govid' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('govid')}
                        >
                            Govt ID
                        </button>
                    </div>

                    <div className={styles.docWrapper}>
                        {currentDocUrl?.endsWith('.pdf') ? (
                            <iframe
                                key={currentDocUrl}
                                src={getFileUrl(currentDocUrl)}
                                className={styles.docIframe}
                                title="Caregiver Document Viewer"
                            />
                        ) : currentDocUrl ? (
                            <img
                                key={currentDocUrl}
                                src={getFileUrl(currentDocUrl)}
                                className={styles.docImage}
                                alt="Caregiver Document Preview"
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

export default CaregiverDocumentViewer
