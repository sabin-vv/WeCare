import { useState } from 'react'

import styles from './ChangePasswordForm.module.css'
import type { ChangePasswordFormProps } from './ChangePasswordForm.types'

import Modal from '@/shared/components/Modal/Modal'
import PasswordField from '@/shared/components/PasswordField/PasswordField'

const ChangePasswordForm = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
}: ChangePasswordFormProps) => {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        setError('')

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required')
            return
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match')
            return
        }

        await onSubmit(currentPassword, newPassword)
    }

    const handleClose = () => {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setError('')
        onClose()
    }

    const footer = (
        <div className={styles.footer}>
            <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleClose}
                disabled={isLoading}
            >
                Cancel
            </button>
            <button
                type="button"
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? 'Changing...' : 'Change Password'}
            </button>
        </div>
    )

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Change Password" footer={footer} size="sm">
            <div className={styles.form}>
                <PasswordField
                    label="Current Password"
                    name="currentPassword"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <PasswordField
                    label="New Password"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <PasswordField
                    label="Confirm Password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && <p className={styles.error}>{error}</p>}
            </div>
        </Modal>
    )
}

export default ChangePasswordForm