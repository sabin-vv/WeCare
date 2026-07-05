import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { sendOtp } from '@/modules/auth/api/auth.api'
import OtpVerification from '@/modules/auth/components/OtpVerification'
import { OtpPurpose } from '@/modules/auth/types/auth.types'
import Modal from '@/shared/components/Modal/Modal'
import { getErrorMessage } from '@/utils/getErrorMessage'

interface EmailOtpModalProps {
    isOpen: boolean
    onClose: () => void
    email: string
    onVerify: (otp: string) => Promise<void>
    onResend: () => Promise<void>
    isVerifying: boolean
}

const EmailOtpModal = ({ isOpen, onClose, email, onVerify, onResend, isVerifying }: EmailOtpModalProps) => {
    const [otpSent, setOtpSent] = useState(false)

    useEffect(() => {
        if (!isOpen || !email || otpSent) return

        const send = async () => {
            try {
                await sendOtp(email, OtpPurpose.REGISTER)
                setOtpSent(true)
            } catch (error) {
                toast.error(getErrorMessage(error))
            }
        }

        send()
    }, [isOpen, email, otpSent])

    const handleClose = () => {
        setOtpSent(false)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="">
            <OtpVerification
                email={email}
                onVerify={onVerify}
                onResend={onResend}
                onBack={handleClose}
                loading={isVerifying}
            />
        </Modal>
    )
}

export default EmailOtpModal
