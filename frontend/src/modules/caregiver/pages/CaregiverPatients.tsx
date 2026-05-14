import styles from './CaregiverPatients.module.css'

import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'

const CaregiverPatients = () => {
    return (
        <MainWrapper title="My Patients">
            <section className={styles.page}>
                <div className={styles.patientCard}>
                    <div className={styles.cardLeft}>
                        <div className={styles.avatar}>
                            <img src="/image" alt="patient" />
                        </div>

                        <div className={styles.patientInfo}>
                            <div className={styles.nameRow}>
                                <h3 className={styles.patientName}>John Doe</h3>
                                <span className={styles.riskBadge}>Critical</span>
                            </div>

                            <div className={styles.metaRow}>
                                <span className={styles.metaItem}>45 years</span>
                                <span className={styles.metaDot}>•</span>
                                <span className={styles.metaItem}>Male</span>
                                <span className={styles.metaDot}>•</span>
                                <span className={styles.metaItem}>ID: #123456</span>
                            </div>

                            <div className={styles.conditionRow}>
                                <span className={styles.conditionLabel}>Conditions:</span>
                                <span className={styles.conditionTags}>
                                    <span className={styles.conditionTag}>Diabetes</span>
                                    <span className={styles.conditionTag}>Hypertension</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.cardRight}>
                        <button className={styles.viewBtn}>View Patient →</button>
                    </div>
                </div>
            </section>
        </MainWrapper>
    )
}

export default CaregiverPatients
