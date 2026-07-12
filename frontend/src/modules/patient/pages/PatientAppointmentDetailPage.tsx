import {
    Activity,
    ArrowLeft,
    Calendar,
    Clock,
    CheckCircle2,
    Circle,
    ClipboardList,
    XCircle,
    User,
    HeartPulse,
    Mail,
    Phone,
    Star,
    Pill,
    BadgeCheck,
    Video,
} from 'lucide-react'
import { useCallback, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import {
    cancelAppointment,
    getAppointmentById,
    getMyActiveVitalPlans,
    getPatientPrescriptions,
    getPatientProfile,
    getWallet,
    retryPayment,
    verifyPayment,
} from '../api/patient.api'
import CancelAppointmentModal from '../components/modals/CancelAppointmentModal'
import PaymentMethodModal from '../components/modals/PaymentMethodModal'
import { getAppointmentStatusClass, getPaymentStatusClass } from '../constants/patient.constants'
import type { Appointment, PatientProfileData, Prescription } from '../types/patient.types'

import styles from './PatientAppointmentDetailPage.module.css'

import { env } from '@/config/env'
import MainWrapper from '@/shared/components/MainWrapper/MainWrapper'
import { Section } from '@/shared/components/Section/Section'
import { DATE_FORMAT, formatDate, getInitials } from '@/shared/utils/format'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { getFileUrl } from '@/utils/getFileUrl'
import { loadRazorpayScript } from '@/utils/loadRazorpay'

const PatientAppointmentDetailPage = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>()
    const navigate = useNavigate()
    const location = useLocation()

    const [appointment, setAppointment] = useState<Appointment | null>(null)
    const [patient, setPatient] = useState<PatientProfileData | null>(null)
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [activeVitalPlansCount, setActiveVitalPlansCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const [cancellationReason, setCancellationReason] = useState('')
    const [customReason, setCustomReason] = useState('')
    const [isCancelling, setIsCancelling] = useState(false)

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [walletBalance, setWalletBalance] = useState(0)

    const fetchAppointment = useCallback(async () => {
        if (!appointmentId) return
        try {
            const [appt, profile] = await Promise.all([getAppointmentById(appointmentId), getPatientProfile()])
            setAppointment(appt)
            setPatient(profile)
        } catch (err) {
            toast.error(getErrorMessage(err))
        } finally {
            setIsLoading(false)
        }
    }, [appointmentId])

    useEffect(() => {
        fetchAppointment()
    }, [fetchAppointment])

    useEffect(() => {
        if (location.state?.refresh) {
            fetchAppointment()
        }
    }, [location.state?.refresh, fetchAppointment])

    useEffect(() => {
        if (!patient?.patientMongoId) return
        getPatientPrescriptions(patient.patientMongoId)
            .then(setPrescriptions)
            .catch(() => {})
        getMyActiveVitalPlans()
            .then(setActiveVitalPlansCount)
            .catch(() => {})
    }, [patient])

    useEffect(() => {
        if (isPaymentModalOpen) {
            getWallet()
                .then((data) => setWalletBalance(data.data.balance))
                .catch(() => setWalletBalance(0))
        }
    }, [isPaymentModalOpen])

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
            </div>
        )
    }

    if (!appointment) {
        return (
            <div className={styles.loadingContainer}>
                <p className={styles.errorText}>Appointment not found</p>
                <button className={styles.backBtn} onClick={() => navigate('/appointments')}>
                    <ArrowLeft size={18} /> Back to Appointments
                </button>
            </div>
        )
    }

    const appointmentDateTime = new Date(appointment.appointmentDate)
    const [hours, minutes] = (appointment.slotStart || '00:00').split(':').map(Number)
    appointmentDateTime.setHours(hours, minutes, 0, 0)
    const diffInHours = (appointmentDateTime.getTime() - Date.now()) / (1000 * 60 * 60)

    const canCancel = diffInHours > 2 && appointment.status === 'confirmed'
    const isWithinJoinWindow = diffInHours * 60 <= 2
    const joinDate = new Date(appointment.appointmentDate)
    joinDate.setHours(hours, minutes - 2, 0, 0)
    const joinTime = `${String(joinDate.getHours()).padStart(2, '0')}:${String(joinDate.getMinutes()).padStart(2, '0')}`
    const canRetryPayment = appointment.status === 'pending_payment' && appointment.paymentStatus === 'pending'
    const isTerminal = appointment.status === 'cancelled' || appointment.status === 'completed'
    const doctorName = appointment.doctorId.userId.name
    const profileImage = appointment.doctorId.profileImage

    const handleOpenCancelModal = () => {
        setCancellationReason('')
        setCustomReason('')
        setIsCancelModalOpen(true)
    }

    const handleConfirmCancel = async () => {
        if (!cancellationReason) return
        if (cancellationReason === 'Other' && !customReason.trim()) return

        const reason = cancellationReason === 'Other' ? customReason.trim() : cancellationReason
        setIsCancelling(true)
        try {
            const res = await cancelAppointment(appointment._id, reason)
            toast.success(res.message)
            setIsCancelModalOpen(false)
            const [appt, profile] = await Promise.all([getAppointmentById(appointmentId!), getPatientProfile()])
            setAppointment(appt)
            setPatient(profile)
        } catch (err) {
            toast.error(getErrorMessage(err))
        } finally {
            setIsCancelling(false)
        }
    }

    const handleRetryPayment = () => setIsPaymentModalOpen(true)

    const handleRazorpayPayment = async () => {
        try {
            setIsPaymentModalOpen(false)
            await loadRazorpayScript()

            const response = await retryPayment(appointment._id, 'razorpay')

            if (response.paymentMethod !== 'razorpay') {
                throw new Error('Unexpected response')
            }

            const { order, paymentId } = response

            const options = {
                key: env.RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'WeCare',
                description: 'Appointment payment',
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
                        const appt = await getAppointmentById(appointmentId!)
                        setAppointment(appt)
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
        try {
            setIsPaymentModalOpen(false)
            const response = await retryPayment(appointment._id, 'wallet')
            if (response.paymentMethod !== 'wallet') {
                throw new Error('Unexpected response')
            }
            toast.success('Payment successful!')
            const appt = await getAppointmentById(appointmentId!)
            setAppointment(appt)
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const timelineSteps = [
        { label: 'Booked', done: true, date: appointment.createdAt },
        {
            label: 'Paid',
            done:
                appointment.paymentStatus === 'paid' ||
                appointment.paymentStatus === 'refunded' ||
                appointment.paymentStatus === 'refund_pending',
            date: appointment.paidAt,
        },
        {
            label: 'Confirmed',
            done: !!appointment.confirmedAt,
            date: appointment.confirmedAt,
        },
        ...(appointment.status !== 'cancelled'
            ? [
                  {
                      label: 'Consultation',
                      done: appointment.status === 'in_consultation' || appointment.status === 'completed',
                      date: appointment.videoCallStartedAt,
                  },
              ]
            : []),
        {
            label: appointment.status === 'cancelled' ? 'Cancelled' : 'Completed',
            done: appointment.status === 'cancelled' || appointment.status === 'completed',
            date: appointment.status === 'cancelled' ? appointment.cancelledAt : appointment.completedAt,
            isCancelled: appointment.status === 'cancelled',
        },
    ]

    return (
        <>
            <MainWrapper title="Appointment Details" subtitle="Manage and review your appointment">
                <div className={styles.grid}>
                    <Section title="Doctor Summary">
                        <div className={styles.doctorSection}>
                            {profileImage ? (
                                <img src={getFileUrl(profileImage)} alt={doctorName} className={styles.doctorImage} />
                            ) : (
                                <div className={styles.doctorAvatarPlaceholder}>{getInitials(doctorName)}</div>
                            )}
                            <div className={styles.doctorMeta}>
                                <div className={styles.doctorNameRow}>
                                    <h2 className={styles.doctorName}>Dr. {doctorName}</h2>
                                    {appointment.doctorId.verificationStatus === 'verified' && (
                                        <span className={styles.verifiedBadge}>
                                            <BadgeCheck size={18} />
                                        </span>
                                    )}
                                </div>
                                {appointment.averageRating != null && (
                                    <p className={styles.doctorRating}>
                                        <Star size={14} fill="#f59e0b" />
                                        {appointment.averageRating.toFixed(1)}
                                        {appointment.reviewCount != null && (
                                            <span className={styles.reviewCount}>
                                                ({appointment.reviewCount} Reviews)
                                            </span>
                                        )}
                                    </p>
                                )}
                                <p className={styles.doctorSpecializations}>
                                    {appointment.doctorId.specializations.map((s) => s.name).join(', ')}
                                </p>
                                <p className={styles.doctorEmail}>
                                    <Mail size={14} />
                                    {appointment.doctorId.userId.email}
                                </p>
                            </div>
                        </div>
                    </Section>

                    <Section title="Appointment Information">
                        <div className={styles.infoList}>
                            <div className={styles.infoRow}>
                                <span className={styles.infoIcon}>#</span>
                                <div className={styles.infoContent}>
                                    <span className={styles.infoLabel}>Appointment ID</span>
                                    <span className={styles.appointmentIdText}>{appointment.appointmentId}</span>
                                </div>
                            </div>
                            <div className={styles.infoRow}>
                                <Calendar size={16} className={styles.infoIcon} />
                                <div className={styles.infoContent}>
                                    <span className={styles.infoLabel}>Date</span>
                                    <span className={styles.infoValue}>
                                        {formatDate(appointment.appointmentDate, DATE_FORMAT.WEEKDAY_LONG)}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.infoRow}>
                                <Clock size={16} className={styles.infoIcon} />
                                <div className={styles.infoContent}>
                                    <span className={styles.infoLabel}>Time</span>
                                    <span className={styles.infoValue}>
                                        {appointment.slotStart} – {appointment.slotEnd}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.infoRow}>
                                <div className={styles.infoIcon}>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <line x1="3" y1="9" x2="21" y2="9" />
                                        <line x1="9" y1="21" x2="9" y2="9" />
                                    </svg>
                                </div>
                                <div className={styles.infoContent}>
                                    <span className={styles.infoLabel}>Status</span>
                                    <span
                                        className={`${styles.badge} ${styles[getAppointmentStatusClass(appointment.status)]}`}
                                    >
                                        {appointment.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                {(appointment.status === 'in_consultation' || appointment.status === 'confirmed') && (
                                    <div className={styles.infoRowAction}>
                                        <button
                                            className={
                                                appointment.status === 'in_consultation' || isWithinJoinWindow
                                                    ? styles.joinCallBtn
                                                    : styles.joinCallBtnDisabled
                                            }
                                            disabled={appointment.status !== 'in_consultation' && !isWithinJoinWindow}
                                            onClick={
                                                appointment.status === 'in_consultation' || isWithinJoinWindow
                                                    ? () =>
                                                          navigate(`/video-call/${appointment._id}`, {
                                                              state: { returnPath: `/appointments/${appointment._id}` },
                                                          })
                                                    : undefined
                                            }
                                        >
                                            <Video /> Join Video Call
                                        </button>
                                        {appointment.status === 'confirmed' && (
                                            <span className={styles.joinWindowInfo}>You can join at {joinTime}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Section>

                    {patient && (
                        <Section title="Patient Details">
                            <div className={styles.patientBody}>
                                <div className={styles.patientAvatar}>
                                    {patient.profileImage ? (
                                        <img
                                            src={getFileUrl(patient.profileImage)}
                                            alt={patient.name}
                                            className={styles.patientAvatarImg}
                                        />
                                    ) : (
                                        <div className={styles.patientAvatarPlaceholder}>
                                            {getInitials(patient.name)}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.patientInfo}>
                                    <p className={styles.patientName}>{patient.name}</p>
                                    <p className={styles.patientDetail}>
                                        <User size={14} /> {patient.gender || 'N/A'}
                                    </p>
                                    <p className={styles.patientDetail}>
                                        <Calendar size={14} />{' '}
                                        {patient.dateOfBirth
                                            ? formatDate(patient.dateOfBirth, DATE_FORMAT.SHORT)
                                            : 'N/A'}
                                    </p>
                                    <p className={styles.patientDetail}>
                                        <Mail size={14} /> {patient.email}
                                    </p>
                                    <p className={styles.patientDetail}>
                                        <Phone size={14} /> {patient.mobile}
                                    </p>
                                </div>
                            </div>
                        </Section>
                    )}

                    <Section title="Payment Information">
                        <div className={styles.paymentBody}>
                            {appointment.consultationFee != null && (
                                <div className={styles.paymentRow}>
                                    <span className={styles.paymentLabel}>Consultation Fee</span>
                                    <span className={styles.paymentValue}>
                                        ₹{appointment.consultationFee.toLocaleString()}
                                    </span>
                                </div>
                            )}
                            {appointment.platformFee != null && (
                                <div className={styles.paymentRow}>
                                    <span className={styles.paymentLabel}>Platform Fee</span>
                                    <span className={styles.paymentValue}>
                                        ₹{appointment.platformFee.toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <div className={styles.paymentDivider} />
                            <div className={styles.paymentRow}>
                                <span className={styles.paymentLabel}>Total Amount</span>
                                <span className={styles.amount}>₹{appointment.amount.toLocaleString()}</span>
                            </div>
                            <div className={styles.paymentRow}>
                                <span className={styles.paymentLabel}>Payment Status</span>
                                <span
                                    className={`${styles.badge} ${styles[getPaymentStatusClass(appointment.paymentStatus)]}`}
                                >
                                    {appointment.paymentStatus.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>
                    </Section>

                    <Section title="Timeline">
                        <div className={styles.timeline}>
                            {timelineSteps.map((step, i) => (
                                <div
                                    key={step.label}
                                    className={`${styles.timelineStep} ${step.done ? styles.stepDone : ''} ${step.isCancelled ? styles.stepCancelled : ''} ${i === timelineSteps.length - 1 ? styles.stepLast : ''}`}
                                >
                                    <div className={styles.timelineDot}>
                                        {step.isCancelled ? (
                                            <XCircle size={18} />
                                        ) : step.done ? (
                                            <CheckCircle2 size={18} />
                                        ) : (
                                            <Circle size={18} />
                                        )}
                                    </div>
                                    <div className={styles.timelineContent}>
                                        <span className={styles.timelineLabel}>{step.label}</span>
                                        {step.date && (
                                            <span className={styles.timelineDate}>
                                                {formatDate(step.date, DATE_FORMAT.DATE_TIME)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {patient && (
                        <Section title="Clinical Details">
                            <div className={styles.clinicalBody}>
                                <div className={styles.clinicalSection}>
                                    <div className={styles.clinicalHeader}>
                                        <HeartPulse size={16} />
                                        <span>Medical Conditions</span>
                                    </div>
                                    {patient.conditions && patient.conditions.length > 0 ? (
                                        <div className={styles.conditionsList}>
                                            {patient.conditions.map((c, i) => (
                                                <span key={i} className={styles.conditionTag}>
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={styles.noData}>No conditions recorded</p>
                                    )}
                                </div>
                                <div className={styles.clinicalSection}>
                                    <div className={styles.clinicalHeader}>
                                        <User size={16} />
                                        <span>Patient ID</span>
                                    </div>
                                    <p className={styles.patientIdValue}>{patient.patientId}</p>
                                </div>
                                <div className={styles.clinicalHeader}>
                                    <Pill size={16} />
                                    <span>Medication</span>
                                </div>
                                <div className={styles.clinicalStats}>
                                    <div className={styles.clinicalStat}>
                                        <ClipboardList size={20} className={styles.statIcon} />
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>
                                                {prescriptions.filter((p) => p.status === 'active').length}
                                            </span>
                                            <span className={styles.statLabel}>Active Prescriptions</span>
                                        </div>
                                    </div>
                                    <div className={styles.clinicalStat}>
                                        <Activity size={20} className={styles.statIcon} />
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>{activeVitalPlansCount}</span>
                                            <span className={styles.statLabel}>Active Vital Plans</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Section>
                    )}

                    {appointment.status === 'cancelled' && (
                        <div className={`${styles.card} ${styles.fullWidth}`}>
                            <h3 className={styles.cardTitle}>Cancellation Details</h3>
                            <div className={styles.cancellationBody}>
                                {appointment.cancelledBy && (
                                    <div className={styles.cancelRow}>
                                        <span className={styles.cancelLabel}>Cancelled By</span>
                                        <span>{appointment.cancelledBy}</span>
                                    </div>
                                )}
                                {appointment.cancellationReason && (
                                    <div className={styles.cancelRow}>
                                        <span className={styles.cancelLabel}>Reason</span>
                                        <span>{appointment.cancellationReason}</span>
                                    </div>
                                )}
                                {appointment.cancelledAt && (
                                    <div className={styles.cancelRow}>
                                        <span className={styles.cancelLabel}>Cancelled At</span>
                                        <span>{formatDate(appointment.cancelledAt, DATE_FORMAT.DATE_TIME)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={`${styles.actions} ${styles.fullWidth}`}>
                        {isTerminal ? (
                            <button
                                className={styles.bookAgainBtn}
                                onClick={() => navigate(`/doctors/${appointment.doctorId._id}`)}
                            >
                                Book Again
                            </button>
                        ) : (
                            <>
                                {appointment.status === 'confirmed' && !isWithinJoinWindow && (
                                    <button
                                        className={styles.rescheduleBtn}
                                        onClick={() =>
                                            navigate(
                                                `/doctors/${appointment.doctorId._id}/reschedule/${appointment._id}`,
                                            )
                                        }
                                    >
                                        Reschedule
                                    </button>
                                )}
                                {canRetryPayment ? (
                                    <button className={styles.retryPaymentBtn} onClick={handleRetryPayment}>
                                        Retry Payment
                                    </button>
                                ) : canCancel ? (
                                    <button className={styles.cancelBtn} onClick={handleOpenCancelModal}>
                                        Cancel Appointment
                                    </button>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>
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
                onClose={() => setIsPaymentModalOpen(false)}
                amount={appointment.amount}
                onSelectRazorpay={handleRazorpayPayment}
                onSelectWallet={handleWalletPayment}
                walletBalance={walletBalance}
            />
        </>
    )
}

export default PatientAppointmentDetailPage
