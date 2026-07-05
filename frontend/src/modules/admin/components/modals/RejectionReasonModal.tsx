/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react'

import styles from '../../pages/DoctorVerification.module.css'

import Modal from '@/shared/components/Modal/Modal'

interface RejectionReasonModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (reason: string) => void
    name: string
}

const RejectionReasonModal = ({ isOpen, onClose, onConfirm, name }: RejectionReasonModalProps) => {
    const [reason, setReason] = useState('Information provided is insufficient')

    const handleConfirm = () => {
        onConfirm(reason)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Reason for Rejection"
            footer={
                <>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={styles.rejectBtn} onClick={handleConfirm}>
                        Confirm Reject
                    </button>
                </>
            }
        >
            <div className={styles.rejectionBody}>
                <p>Please provide a reason for rejecting {name}'s application:</p>
                <textarea
                    className={styles.rejectionTextarea}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Certificate is expired or invalid..."
                    rows={4}
                />
            </div>
        </Modal>
    )
}

export default RejectionReasonModal
