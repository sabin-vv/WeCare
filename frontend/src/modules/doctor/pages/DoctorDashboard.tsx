import { TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getCurrentUser } from '../../auth/api/auth.api'
import { getDoctorProfile } from '../api/doctor.api'
import Dashboard from '../components/Dashboard/Dashboard'
import DoctorDetailsForm from '../form/DoctorDetailesForm'
import type { DoctorDocuments, Specialization } from '../types/doctor.types'

import styles from './DoctorDashboard.module.css'

import { env } from '@/config/env'
import { VerificationStatus } from '@/modules/auth/types/auth.types'
import MainWrapper from '@/shared/components/MainWrapper/MainWrapper'
import { useAuth } from '@/shared/context/AuthContext'
import { getTimePeriod } from '@/shared/utils/time.utils'
import { getErrorMessage } from '@/utils/getErrorMessage'

const DoctorDashboard = () => {
    const { user, setAuth } = useAuth()
    const [documents, setDocuments] = useState<DoctorDocuments>()
    const [specializations, setSpecializations] = useState<Specialization[]>([{ name: '', documentImage: null }])
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
                    professionalTitle: currentUser.data.professionalTitle ?? user.professionalTitle,
                }

                const hasAuthChanged =
                    nextUser.verificationStatus !== user.verificationStatus ||
                    nextUser.profileImage !== user.profileImage ||
                    nextUser.professionalTitle !== user.professionalTitle

                if (hasAuthChanged) {
                    setAuth(nextUser)
                }

                if (nextUser.verificationStatus === VerificationStatus.REJECTED) {
                    const profile = await getDoctorProfile()

                    setDocuments({
                        govId: `${baseUrl}${profile.govIdImage}`,
                        profileImage: `${baseUrl}${profile.profileImage}`,
                        medicalCertificate: {
                            number: profile.medicalCertificateNumber,
                            document: `${baseUrl}${profile.medicalCertificateImage}`,
                        },
                        councilRegistration: {
                            number: profile.medicalCouncilRegistrationNumber,
                            document: `${baseUrl}${profile.medicalCouncilImage}`,
                        },
                    })
                    setSpecializations(
                        profile.specialization.map((spec) => ({
                            name: spec.name,
                            documentImage: `${baseUrl}${spec.documentImage}`,
                        })),
                    )
                    setRejectReason(profile.rejectReason || '')
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
        <MainWrapper title={`Good ${timePeriod},${user?.name}`}>
            {!user?.isProfileComplete || user.verificationStatus === VerificationStatus.REJECTED ? (
                <>
                    {user?.verificationStatus === VerificationStatus.REJECTED && (
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

                    <DoctorDetailsForm document={documents} specialization={specializations} />
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
                            <p>Your profile has been submitted successfully and is awaiting administrator review.</p>
                        </div>
                        <div className={styles.infoCard}>
                            <h2>What Happens Next?</h2>
                            <p>
                                After approval, you&apos;ll be able to configure your availability, accept appointments,
                                conduct consultations, and manage your patients
                            </p>
                        </div>

                        <div className={styles.infoCard}>
                            <h2>Need to Make Changes?</h2>
                            <p>
                                If your profile requires updates, we&apos;ll provide the reason so you can correct the
                                information and resubmit it.
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

export default DoctorDashboard
