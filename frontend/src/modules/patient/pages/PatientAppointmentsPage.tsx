import { Clock, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

import { cancelAppointment, getPatientAppointments, getWallet, retryPayment, verifyPayment } from '../api/patient.api'
import DetailedAppointmentCard from '../components/DetailedAppointmentCard/DetailedAppointmentCard'
import CancelAppointmentModal from '../components/modals/CancelAppointmentModal'
import PaymentMethodModal from '../components/modals/PaymentMethodModal'
import { type Appointment } from '../types/patient.types'

import styles from './PatientAppointmentsPage.module.css'

import { env } from '@/config/env'
import MainWrapper from '@/shared/components/MainWrapper/MainWrapper'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { loadRazorpayScript } from '@/utils/loadRazorpay'

const PatientAppointmentsPage = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
    const [cancellationReason, setCancellationReason] = useState('')
    const [customReason, setCustomReason] = useState('')
    const [isCancelling, setIsCancelling] = useState(false)

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [selectedRetryAppointment, setSelectedRetryAppointment] = useState<Appointment | null>(null)
    const [walletBalance, setWalletBalance] = useState<number>(0)

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await getPatientAppointments()
                setAppointments(data)
            } catch (err) {
                console.error('Error fetching appointments:', err)
                toast.error(getErrorMessage(err))
            } finally {
                setIsLoading(false)
            }
        }

        fetchAppointments()
    }, [])

    useEffect(() => {
        if (isPaymentModalOpen) {
            getWallet()
                .then((data) => setWalletBalance(data.data.balance))
                .catch(() => setWalletBalance(0))
        }
    }, [isPaymentModalOpen])

    const handleRetryPayment = (appointment: Appointment) => {
        setSelectedRetryAppointment(appointment)
        setIsPaymentModalOpen(true)
    }

    const handleRazorpayPayment = async () => {
        if (!selectedRetryAppointment) return

        try {
            setIsPaymentModalOpen(false)

            await loadRazorpayScript()

            const response = await retryPayment(selectedRetryAppointment._id, 'razorpay')

            if (response.paymentMethod !== 'razorpay') {
                throw new Error('Unexpected response')
            }

            const { order, paymentId } = response

            const options = {
                key: env.RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'WeCare',
                description: `Appointment payment`,
                order_id: order.id,
                handler: async (razorpayResponse: {
                    razorpay_order_id: string
                    razorpay_payment_id: string
                    razorpay_signature: string
                }) => {
                    try {
                        await verifyPayment({
                            paymentId,
                            razorpayOrderId: razorpayResponse.razorpay_order_id,
                            razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                            razorpaySignature: razorpayResponse.razorpay_signature,
                        })
                        toast.success('Payment successful!')
                        const data = await getPatientAppointments()
                        setAppointments(data)
                    } catch (err) {
                        toast.error(getErrorMessage(err))
                    }
                },
                prefill: {},
                theme: { color: '#007bff' },
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const handleWalletPayment = async () => {
        if (!selectedRetryAppointment) return

        try {
            setIsPaymentModalOpen(false)

            const response = await retryPayment(selectedRetryAppointment._id, 'wallet')

            if (response.paymentMethod !== 'wallet') {
                throw new Error('Unexpected response')
            }

            toast.success('Payment successful!')
            const data = await getPatientAppointments()
            setAppointments(data)
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const closePaymentModal = () => {
        setIsPaymentModalOpen(false)
        setSelectedRetryAppointment(null)
    }

    const handleAppointmentCancel = (id: string) => {
        setSelectedAppointmentId(id)
        setCancellationReason('')
        setCustomReason('')
        setIsCancelModalOpen(true)
    }

    const handleConfirmCancel = async () => {
        if (!selectedAppointmentId || !cancellationReason) return
        if (cancellationReason === 'Other' && !customReason.trim()) return

        const reason = cancellationReason === 'Other' ? customReason.trim() : cancellationReason
        setIsCancelling(true)
        try {
            const res = await cancelAppointment(selectedAppointmentId, reason)
            toast.success(res.message)
            setIsCancelModalOpen(false)
            const data = await getPatientAppointments()
            setAppointments(data)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsCancelling(false)
        }
    }

    const now = new Date()

    const currentAppointments = appointments.filter((app) => {
        const appDate = new Date(app.appointmentDate)
        return appDate >= new Date(now.setHours(0, 0, 0, 0)) && app.status !== 'completed' && app.status !== 'cancelled'
    })

    const recentAppointments = appointments.filter((app) => {
        const appDate = new Date(app.appointmentDate)
        return appDate < new Date(now.setHours(0, 0, 0, 0)) || app.status === 'completed' || app.status === 'cancelled'
    })

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        )
    }

    return (
        <>
            <MainWrapper title="My Appointments" subtitle="View and manage your upcoming and past appointments">
                {currentAppointments.length > 0 ? (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <Clock size={24} /> Current Appointments
                        </h2>
                        <div className={styles.grid}>
                            {currentAppointments.map((app) => (
                                <DetailedAppointmentCard
                                    key={app._id}
                                    appointment={app}
                                    onRetryPayment={handleRetryPayment}
                                    onCancel={handleAppointmentCancel}
                                />
                            ))}
                        </div>
                    </section>
                ) : (
                    <div className={styles.emptyState}>No upcoming appointments</div>
                )}

                {recentAppointments.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <AlertCircle size={24} /> Recent & Past Appointments
                        </h2>
                        <div className={styles.grid}>
                            {recentAppointments.map((app) => (
                                <DetailedAppointmentCard
                                    key={app._id}
                                    appointment={app}
                                    onRetryPayment={handleRetryPayment}
                                    onCancel={handleAppointmentCancel}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </MainWrapper>
            <CancelAppointmentModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                cancellationReason={cancellationReason}
                setCancellationReason={setCancellationReason}
                customReason={customReason}
                setCustomReason={setCustomReason}
                isCancelling={isCancelling}
                onConfirm={handleConfirmCancel}
            />

            <PaymentMethodModal
                isOpen={isPaymentModalOpen}
                onClose={closePaymentModal}
                amount={selectedRetryAppointment?.amount ?? 0}
                onSelectRazorpay={handleRazorpayPayment}
                onSelectWallet={handleWalletPayment}
                walletBalance={walletBalance}
            />
        </>
    )
}

export default PatientAppointmentsPage
