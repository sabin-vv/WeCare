import { TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getCurrentUser } from '../../auth/api/auth.api'
import { getCaregiverProfile } from '../api/caregiver.api'
import Dashboard from '../components/Dashboard/Dashboard'
import { DEFAULT_CAREGIVER_DOCUMENTS } from '../constants/caregiver.constants'
import CaregiverDetailsForm from '../form/CaregiverDetailsForm'
import type { CaregiverDocuments } from '../types/caregiver.types'

import styles from './CaregiverDashboard.module.css'

import { env } from '@/config/env'
import { VerificationStatus } from '@/modules/auth/types/auth.types'
import MainWrapper from '@/shared/components/MainWrapper/MainWrapper'
import { useAuth } from '@/shared/context/AuthContext'
import { getTimePeriod } from '@/shared/utils/time.utils'
import { getErrorMessage } from '@/utils/getErrorMessage'

const CaregiverDashboard = () => {
    const { user, setAuth } = useAuth()
    const [documents, setDocuments] = useState<CaregiverDocuments>(DEFAULT_CAREGIVER_DOCUMENTS)
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

    const timePeriod = getTimePeriod()

    return (
        <MainWrapper title={`Good ${timePeriod}, ${user?.name}`}>
            {!user?.isProfileComplete || user.verificationStatus === 'rejected' ? (
                <>
                    {user?.verificationStatus === 'rejected' && (
                        <div className={styles.rejectBox}>
                            <div className={styles.rejectHeader}>
                                <TriangleAlert size={20} color="#f59e00" />
                                <strong>Verification Rejected</strong>
                            </div>

                            <p className={styles.rejectMessage}>Your professional details could not be verified.</p>

                            <div className={styles.reasonBox}>
                                <span>Reason :</span>
                                <p>{rejectReason}</p>
                            </div>
                        </div>
                    )}

                    <CaregiverDetailsForm documents={documents} />
                </>
            ) : user.verificationStatus === VerificationStatus.Verified ? (
                <Dashboard />
            ) : (
                <section className={styles.statusPanel}>
                    <span className={`${styles.badge} ${styles.pendingBadge}`}>Verification In Progress</span>
                    <h1 className={styles.heading}>Your profile is under review</h1>

                    <p className={styles.sub}>
                        We&apos;ve received your professional information and supporting documents. Our team is
                        currently reviewing them. You&apos;ll receive a notification once the verification process is
                        complete.
                    </p>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <h2>Current status</h2>
                            <p>Your profile has been submitted successfully and is awaiting administrator review..</p>
                        </div>
                        <div className={styles.infoCard}>
                            <h2>What to expect?</h2>
                            <p>
                                Once your profile is approved, You will be able to access patients and caregiving tasks
                                after verification is complete.
                            </p>
                        </div>
                        <div className={styles.infoCard}>
                            <h2>Need to Make Changes?</h2>
                            <p>
                                If your profile is rejected, you&apos;ll receive the reason and can update your
                                information before resubmitting it for verification.
                            </p>
                        </div>
                        <div className={styles.infoCard}>
                            <h2>Estimated Review Time</h2>
                            <p>
                                Most caregiver profiles are reviewed within <strong>1–2 business days</strong>. Review
                                time may vary depending on document verification.
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </MainWrapper>
    )
}

export default CaregiverDashboard
