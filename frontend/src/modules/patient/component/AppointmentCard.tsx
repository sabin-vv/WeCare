import { useNavigate } from 'react-router-dom'

import type { AppointmentCardProps } from '../types/patient.types'

import styles from './AppointmentCard.module.css'

const AppointmentCard = ({ doctorName, date, time, status }: AppointmentCardProps) => {
    const navigate = useNavigate()
    return (
        <div className={styles.card}>
            <p className={styles.header}>Your Appointment</p>

            <div className={styles.mainRow}>
                <div className={styles.info}>
                    <span className={styles.doctorName}>Dr. {doctorName}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.meta}>{date}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.meta}>{time}</span>
                    <span className={styles.dot}>•</span>
                    <span className={`${styles.statusBadge} ${styles[status.replace('_', '')]}`}>{status}</span>
                </div>

                <div className={styles.actions}>
                    <button className={styles.viewBtn} onClick={() => navigate('/appointments')}>
                        View
                    </button>
                    <button className={styles.cancelBtn}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default AppointmentCard
