import type { DoctorSecuritySectionProps } from '../../types/doctor.types'
import styles from '../DoctorSettingsForm.module.css'

import { Section } from '@/shared/components/Section/Section'

const DoctorSecuritySection = ({ onResetPassword }: DoctorSecuritySectionProps) => {
    return (
        <Section title="Account Security">
            <div className={styles.securityRow}>
                <div>
                    <h3 className={styles.securityTitle}>Change Password</h3>
                    <p className={styles.securitySub}>Update your login credentials regularly</p>
                </div>

                <button type="button" className={styles.secondaryButton} onClick={onResetPassword}>
                    Reset Password
                </button>
            </div>
        </Section>
    )
}

export default DoctorSecuritySection
