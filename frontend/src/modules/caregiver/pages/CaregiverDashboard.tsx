import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getCurrentUser } from '../../auth/api/auth.api'
import { getCaregiverProfile } from '../api/caregiver.api'
import CaregiverDetailsForm from '../form/CaregiverDetailsForm'

import styles from './CaregiverDashboard.module.css'

import { env } from '@/config/env'
import { VerificationStatus } from '@/modules/auth/types/auth.types'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

interface CaregiverDocumentsDisplay {
    govId: File | string | null
    profileImage: File | string | null
    certificate: {
        number: string
        document: File | string | null
    }
    license: {
        number: string
        document: File | string | null
    }
}

const CaregiverDashboard = () => {
    const { user, setAuth } = useAuth()
    const [documents, setDocuments] = useState<CaregiverDocumentsDisplay>({
        govId: null,
        profileImage: null,
        certificate: {
            number: '',
            document: null,
        },
        license: {
            number: '',
            document: null,
        },
    })
    const [rejectReason, setRejectReason] = useState<string>()

    const baseUrl = env.AWS_BASE_URL
    useEffect(() => {
        if (!user) {
            return
        }

        const loadDashboardState = async () => {
            try {
                const currentUser = await getCurrentUser()
                const nextUser = {
                    ...user,
                    verificationStatus: currentUser.data.verificationStatus ?? user.verificationStatus,
                    profileImage: currentUser.data.profileImage ?? user.profileImage,
                }

                const hasAuthChanged =
                    nextUser.verificationStatus !== user.verificationStatus ||
                    nextUser.profileImage !== user.profileImage

                if (hasAuthChanged) {
                    setAuth(nextUser)
                }

                if (nextUser.verificationStatus === VerificationStatus.REJECTED) {
                    const profile = await getCaregiverProfile()

                    setDocuments({
                        govId: `${baseUrl}${profile.data.govIdImage}`,
                        profileImage: `${baseUrl}${profile.data.profileImage}`,
                        certificate: {
                            number: profile.data.certificateNumber,
                            document: `${baseUrl}${profile.data.certificateImage}`,
                        },
                        license: {
                            number: profile.data.licenseNumber,
                            document: `${baseUrl}${profile.data.licenseImage}`,
                        },
                    })
                    setRejectReason(profile.data.rejectReason || '')
                    return
                }

                setRejectReason(undefined)
            } catch (error) {
                toast.error(getErrorMessage(error))
            }
        }

        loadDashboardState()
    }, [baseUrl, setAuth, user])

    return (
        <main className={styles.content}>
            {!user?.isProfileComplete || user.verificationStatus === 'rejected' ? (
                <>
                    {user && user.verificationStatus === 'rejected' && (
                        <div className={styles.rejectBox}>
                            <strong>Profile Rejected</strong>
                            <p>{rejectReason}</p>
                        </div>
                    )}

                    <CaregiverDetailsForm documents={documents} />
                </>
            ) : user.verificationStatus === VerificationStatus.Verified ? (
                <section className={styles.statusPanel}>
                    <span className={`${styles.badge} ${styles.successBadge}`}>Verified Account</span>
                    <h1 className={styles.heading}>Welcome back, {user?.name}</h1>
                    <p className={styles.sub}>
                        Your account is active and ready. You can now manage patients, schedules, and caregiving duties
                        from your dashboard.
                    </p>
                </section>
            ) : (
                <section className={styles.statusPanel}>
                    <span className={`${styles.badge} ${styles.pendingBadge}`}>Verification In Progress</span>
                    <h1 className={styles.heading}>Account under verification</h1>
                    <p className={styles.sub}>
                        We are reviewing your profile, certificates, and uploaded documents. Once approved, your full
                        caregiver dashboard will be unlocked.
                    </p>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <h2>Current status</h2>
                            <p>Submitted successfully and waiting for admin approval.</p>
                        </div>
                        <div className={styles.infoCard}>
                            <h2>What to expect</h2>
                            <p>
                                You will be able to access patients and caregiving tasks after verification is complete.
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </main>
    )
}

export default CaregiverDashboard
