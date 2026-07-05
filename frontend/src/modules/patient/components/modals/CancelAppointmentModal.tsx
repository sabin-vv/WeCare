import styles from './CancelAppointmentModal.module.css'

import Modal from '@/shared/components/Modal/Modal'

const CANCELLATION_REASONS = ['Schedule conflict', 'Feeling better', 'Emergency', 'Financial reasons', 'Other']

interface CancelAppointmentModalProps {
    isOpen: boolean
    onClose: () => void
    cancellationReason: string
    setCancellationReason: (reason: string) => void
    customReason: string
    setCustomReason: (reason: string) => void
    isCancelling: boolean
    onConfirm: () => void
}

const CancelAppointmentModal = ({
    isOpen,
    onClose,
    cancellationReason,
    setCancellationReason,
    customReason,
    setCustomReason,
    isCancelling,
    onConfirm,
}: CancelAppointmentModalProps) => {
    const footer = (
        <>
            <button className={styles.modalCancelBtn} onClick={onClose}>
                Go Back
            </button>
            <button
                className={styles.modalConfirmBtn}
                onClick={onConfirm}
                disabled={
                    !cancellationReason || (cancellationReason === 'Other' && !customReason.trim()) || isCancelling
                }
            >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
            </button>
        </>
    )

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cancel Appointment" footer={footer} size="sm">
            <div className={styles.cancelModalContent}>
                <p className={styles.cancelModalText}>Please select a reason for cancelling this appointment:</p>
                <div className={styles.reasonsList}>
                    {CANCELLATION_REASONS.map((reason) => (
                        <label key={reason} className={styles.reasonOption}>
                            <input
                                type="radio"
                                name="cancellationReason"
                                value={reason}
                                checked={cancellationReason === reason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                className={styles.reasonRadio}
                            />
                            <span className={styles.reasonLabel}>{reason}</span>
                        </label>
                    ))}
                </div>
                {cancellationReason === 'Other' && (
                    <textarea
                        className={styles.customReasonTextarea}
                        placeholder="Please specify your reason..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        rows={3}
                        autoFocus
                    />
                )}
            </div>
        </Modal>
    )
}

export default CancelAppointmentModal
