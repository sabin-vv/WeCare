import { Calendar, Clock, User, CreditCard, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

import { cancelAppointment, getPatientAppointments } from '../api/patient.api'
import { type Appointment, type CancelModalContentProps } from '../types/patient.types'

import styles from './PatientAppointmentsPage.module.css'

import PatientLayout from '@/layout/PatientLayout'
import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import Modal from '@/shared/components/Modal/Modal'
import { getErrorMessage } from '@/utils/getErrorMessage'

const CANCELLATION_REASONS = ['Schedule conflict', 'Feeling better', 'Emergency', 'Financial reasons', 'Other']

const CancelModalContent = ({
    cancellationReason,
    setCancellationReason,
    customReason,
    setCustomReason,
}: CancelModalContentProps) => {
    return (
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
    )
}

const PatientAppointmentsPage = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
    const [cancellationReason, setCancellationReason] = useState('')
    const [customReason, setCustomReason] = useState('')
    const [isCancelling, setIsCancelling] = useState(false)

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
            setAppointments((prev) => prev.filter((app) => app._id !== selectedAppointmentId))
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

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'confirmed':
                return styles.statusConfirmed
            case 'pending_payment':
                return styles.statusPending
            case 'cancelled':
                return styles.statusCancelled
            default:
                return ''
        }
    }

    const cancelModalFooter = (
        <>
            <button className={styles.modalCancelBtn} onClick={() => setIsCancelModalOpen(false)}>
                Go Back
            </button>
            <button
                className={styles.modalConfirmBtn}
                onClick={handleConfirmCancel}
                disabled={
                    !cancellationReason || (cancellationReason === 'Other' && !customReason.trim()) || isCancelling
                }
            >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
            </button>
        </>
    )

    if (isLoading) {
        return (
            <PatientLayout>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                </div>
            </PatientLayout>
        )
    }

    const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
        const appointmentTime = new Date(appointment.appointmentDate).getTime()
        const currentTime = Date.now()

        const diffInHours = (appointmentTime - currentTime) / (1000 * 60 * 60)

        const canCancel = diffInHours > 2 && appointment.status !== 'cancelled' && appointment.status !== 'completed'

        return (
            <div className={styles.appointmentCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.doctorInfo}>
                        <div className={styles.icon}>
                            <User size={24} />
                        </div>
                        <div>
                            <div className={styles.doctorName}>Dr.{appointment.doctorId.userId.name}</div>
                            <div className={styles.doctorEmail}>
                                {appointment.doctorId.specializations.map((s) => s.name).join(',')}
                            </div>
                        </div>
                    </div>
                    <div className={`${styles.statusBadge} ${getStatusClass(appointment.status)}`}>
                        {appointment.status}
                    </div>
                </div>

                <div className={styles.appointmentDetails}>
                    <div className={styles.detailRow}>
                        <Calendar size={18} className={styles.icon} />
                        <span>
                            {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <Clock size={18} className={styles.icon} />
                        <span>{appointment.slotStart}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <CreditCard size={18} className={styles.icon} />
                        <span>
                            Payment: <strong>{appointment.paymentStatus}</strong>
                        </span>
                    </div>
                </div>

                <div className={styles.cardFooter}>
                    <div>
                        <div className={styles.amount}>₹{appointment.amount}</div>
                    </div>

                    {canCancel && (
                        <button
                            className={styles.cancelButton}
                            onClick={() => handleAppointmentCancel(appointment._id)}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <PatientLayout>
            <MainWrapper>
                <h1 className={styles.title}>My Appointments</h1>

                {currentAppointments.length > 0 ? (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <Clock size={24} /> Current Appointments
                        </h2>
                        <div className={styles.grid}>
                            {currentAppointments.map((app) => (
                                <AppointmentCard key={app._id} appointment={app} />
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
                                <AppointmentCard key={app._id} appointment={app} />
                            ))}
                        </div>
                    </section>
                )}
            </MainWrapper>
            <Modal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title="Cancel Appointment"
                footer={cancelModalFooter}
                size="sm"
            >
                <CancelModalContent
                    cancellationReason={cancellationReason}
                    setCancellationReason={setCancellationReason}
                    customReason={customReason}
                    setCustomReason={setCustomReason}
                />
            </Modal>
        </PatientLayout>
    )
}

export default PatientAppointmentsPage
