import { BadgeCheck } from 'lucide-react'

import type { DoctorRegistrationSectionProps } from '../../types/doctor.types'
import styles from '../DoctorSettingsForm.module.css'

import { Section } from '@/shared/components/Section/Section'

const DoctorRegistrationSection = ({ formState }: DoctorRegistrationSectionProps) => {
    return (
        <Section title="Professional Registration">
            <div className={styles.registrationGrid}>
                <div className={styles.registrationItem}>
                    <h3>Medical License Number</h3>
                    <p>{formState.medicalLicenseNumber}</p>
                </div>

                <div className={styles.registrationItem}>
                    <h3>Medical Council Registration Number</h3>
                    <p>{formState.medicalCouncilRegistrationNumber}</p>
                </div>

                <div className={styles.registrationItem}>
                    <h3>Experience Certificates</h3>
                    <p className={styles.highlightValue}>{formState.experienceCertificatesCount} Uploaded</p>
                </div>
            </div>

            <div className={styles.verifiedRow}>
                <BadgeCheck size={14} />
                <span>Verified</span>
            </div>
        </Section>
    )
}

export default DoctorRegistrationSection
