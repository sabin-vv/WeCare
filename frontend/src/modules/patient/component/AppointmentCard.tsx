import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import styles from './AppointmentCard.module.css'

type AppointmentStatus = 'pending_payment' | 'confirmed' | 'in_consultation' | 'completed'

interface Props {
    doctorName: string
    specialization: string
    date: string
    time: string
    status: AppointmentStatus
}

const steps = ['BOOKED', 'PAYMENT', 'CONSULTATION', 'MEDICAL PLAN']

const getStepIndex = (status: AppointmentStatus) => {
    switch (status) {
        case 'pending_payment':
            return 1
        case 'confirmed':
            return 2
        case 'in_consultation':
            return 2
        case 'completed':
            return 3
        default:
            return 0
    }
}

const AppointmentCard = ({ doctorName, specialization, date, time, status }: Props) => {
    const navigate = useNavigate()
    const currentStep = getStepIndex(status)

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3>Your Consultation is Scheduled</h3>
                <span className={styles.statusBadge}>✓ Confirmed</span>
            </div>

            <div className={styles.infoRow}>
                <div>
                    <p className={styles.label}>Doctor</p>
                    <p className={styles.value}>Dr.{doctorName}</p>
                    <span className={styles.sub}>{specialization}</span>
                </div>

                <div>
                    <p className={styles.label}>Date & Time</p>
                    <p className={styles.value}>{date}</p>
                    <span className={styles.sub}>{time}</span>
                </div>
            </div>

            <div className={styles.stepper}>
                <div className={styles.progressBar} />

                {steps.map((step, index) => (
                    <div key={step} className={styles.step}>
                        <div className={`${styles.circle} ${index <= currentStep ? styles.active : ''}`}>
                            {index < currentStep ? '✓' : index + 1}
                        </div>

                        <p className={styles.label}>{step}</p>
                    </div>
                ))}
            </div>

            <div className={styles.actions}>
                <div className={styles.recent} onClick={() => navigate('/appointments')}>
                    <span>
                        View Recent <ArrowRight size={18} />
                    </span>
                </div>
                <div className={styles.actionButton}>
                    <button className={styles.changeBtn}>Change slot</button>
                    <button className={styles.cancelBtn}>Cancel</button>
                </div>
            </div>
        </div>
    )
}
export default AppointmentCard
