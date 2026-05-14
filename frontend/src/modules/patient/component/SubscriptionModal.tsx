import { CreditCard, Wallet } from 'lucide-react'

import styles from './SubscriptionModal.module.css'

import Modal from '@/shared/components/Modal/Modal'

interface SubscriptionModalProps {
    isOpen: boolean
    onClose: () => void
    caregiverName: string
    amount: number
    onSelectRazorpay: () => void
    onSelectWallet: () => void
    walletBalance?: number
}

const SubscriptionModal = ({
    isOpen,
    onClose,
    caregiverName,
    amount,
    onSelectRazorpay,
    onSelectWallet,
    walletBalance,
}: SubscriptionModalProps) => {
    const hasInsufficientBalance = walletBalance !== undefined && walletBalance < amount

    const handleWallet = () => {
        if (!hasInsufficientBalance) {
            onSelectWallet()
            onClose()
        }
    }

    const content = (
        <div className={styles.content}>
            <div className={styles.header}>
                <p className={styles.headerText}>Subscribe to {caregiverName}</p>
            </div>

            <div className={styles.amountRow}>
                <span className={styles.amountLabel}>Amount to pay:</span>
                <span className={styles.amount}>₹{amount.toLocaleString()}</span>
            </div>

            <div className={styles.paymentOptions}>
                <button className={styles.paymentOption} onClick={onSelectRazorpay}>
                    <div className={styles.paymentIcon}>
                        <CreditCard size={24} />
                    </div>
                    <div className={styles.paymentInfo}>
                        <span className={styles.paymentLabel}>Pay via Razorpay</span>
                        <span className={styles.paymentDesc}>Credit/Debit Card, UPI, Net Banking</span>
                    </div>
                </button>

                <button
                    className={`${styles.paymentOption} ${hasInsufficientBalance ? styles.disabled : ''}`}
                    onClick={handleWallet}
                    disabled={hasInsufficientBalance}
                >
                    <div className={styles.paymentIcon}>
                        <Wallet size={24} />
                    </div>
                    <div className={styles.paymentInfo}>
                        <span className={styles.paymentLabel}>Pay by Wallet</span>
                        <span className={styles.paymentDesc}>
                            Balance: ₹{walletBalance?.toLocaleString() ?? 0}
                            {hasInsufficientBalance && (
                                <span className={styles.insufficient}> - Insufficient</span>
                            )}
                        </span>
                    </div>
                </button>
            </div>
        </div>
    )

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Subscribe to Caregiver" size="sm">
            {content}
        </Modal>
    )
}

export default SubscriptionModal