import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, BadgeCheck, Camera, Pencil, XCircle } from 'lucide-react'
import { useEffect, useState, type ChangeEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { getCaregiverProfile, updateCaregiverActiveStatus, updateCaregiverProfile } from '../api/caregiver.api'
import type { CaregiverProfileData, CaregiverSettingsFormValues } from '../types/caregiver.types'
import { caregiverSettingsFormSchema } from '../validator/caregiverSettingsForm.validator'

import styles from './CaregiverSettingsForm.module.css'

import {
    changePassword,
    getCurrentUser,
    presignUpload,
    sendOtp,
    uploadToS3,
    verifyOtp,
} from '@/modules/auth/api/auth.api'
import OtpVerification from '@/modules/auth/components/OtpVerification'
import { OtpPurpose } from '@/modules/auth/types/auth.types'
import DoctorSecuritySection from '@/modules/doctor/form/settings/DoctorSecuritySection'
import ChangePasswordForm from '@/shared/components/ChangePasswordForm'
import ImageCropper from '@/shared/components/ImageCropper/ImageCropper'
import InputField from '@/shared/components/InputField/InputField'
import Modal from '@/shared/components/Modal/Modal'
import PhoneInput from '@/shared/components/PhoneInput/PhoneInput'
import { Section } from '@/shared/components/Section/Section'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

const defaultFormValues: CaregiverSettingsFormValues = {
    fullName: '',
    email: '',
    phoneNumber: '',
}

const CaregiverSettingsForm = () => {
    const { user, setAuth } = useAuth()

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
        getValues,
    } = useForm<CaregiverSettingsFormValues>({
        resolver: zodResolver(caregiverSettingsFormSchema),
        defaultValues: defaultFormValues,
        mode: 'onChange',
    })

    const [savedProfile, setSavedProfile] = useState<CaregiverProfileData | null>(null)
    const [isActive, setIsActive] = useState(true)
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('pending')
    const [certificateNumber, setCertificateNumber] = useState('')
    const [licenseNumber, setLicenseNumber] = useState('')
    const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)

    const [showEmailOtpModal, setShowEmailOtpModal] = useState(false)
    const [pendingEmail, setPendingEmail] = useState('')
    const [pendingFormValues, setPendingFormValues] = useState<CaregiverSettingsFormValues | null>(null)
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
    const [otpSent, setOtpSent] = useState(false)

    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    const [confirmToggle, setConfirmToggle] = useState<{ isActive: boolean } | null>(null)
    const [imageCrop, setImageCrop] = useState<string | null>(null)
    const [isUploadingImage, setIsUploadingImage] = useState(false)

    useEffect(() => {
        if (!showEmailOtpModal || !pendingEmail || otpSent) return

        const send = async () => {
            try {
                await sendOtp(pendingEmail, OtpPurpose.REGISTER)
                setOtpSent(true)
            } catch (error) {
                toast.error(getErrorMessage(error))
            }
        }

        send()
    }, [showEmailOtpModal, pendingEmail, otpSent])

    useEffect(() => {
        const loadCaregiverProfile = async () => {
            try {
                const profile = await getCaregiverProfile()
                const data = profile.data || profile

                reset({
                    fullName: data?.fullName || user?.name || '',
                    email: data?.email || user?.email || '',
                    phoneNumber: data?.phoneNumber || '',
                })
                setSavedProfile(data)
                setIsActive(data?.isActive ?? true)
                setVerificationStatus(data?.verificationStatus || 'pending')
                setCertificateNumber(data?.certificateNumber || '')
                setLicenseNumber(data?.licenseNumber || '')
            } catch (error) {
                console.error('Failed to load caregiver settings:', error)
            } finally {
                setIsLoadingProfile(false)
            }
        }

        loadCaregiverProfile()
    }, [])

    const profileImageUrl = user?.profileImage ? `${import.meta.env.VITE_S3_BASE_URL}${user.profileImage}` : ''

    const handleToggleEditing = () => {
        if (isEditingPersonalInfo) {
            if (isDirty) {
                handleDiscard()
            } else {
                setIsEditingPersonalInfo(false)
            }
        } else {
            setIsEditingPersonalInfo(true)
        }
    }

    const handleToggleStatus = () => {
        setConfirmToggle({ isActive: !isActive })
    }

    const handleConfirmToggle = async () => {
        if (!confirmToggle) return
        const newStatus = confirmToggle.isActive
        setConfirmToggle(null)
        try {
            const updatedProfile = await updateCaregiverActiveStatus(newStatus)
            setIsActive(updatedProfile.isActive)
            setSavedProfile(updatedProfile)
            toast.success(`Account ${newStatus ? 'activated' : 'deactivated'} successfully`)
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleCancelToggle = () => setConfirmToggle(null)

    const handleDiscard = () => {
        if (savedProfile) {
            reset({
                fullName: savedProfile.fullName,
                email: savedProfile.email,
                phoneNumber: savedProfile.phoneNumber,
            })
        }
        setIsEditingPersonalInfo(false)
        toast.success('Changes discarded')
    }

    const saveProfile = async (formValues: CaregiverSettingsFormValues) => {
        setIsSaving(true)

        try {
            const updatedProfile = await updateCaregiverProfile({
                fullName: formValues.fullName,
                phoneNumber: formValues.phoneNumber,
                email: formValues.email,
            })

            if (user) {
                setAuth({
                    ...user,
                    name: formValues.fullName,
                    email: formValues.email,
                })
            }

            const responseData = updatedProfile.data || updatedProfile
            reset({
                fullName: responseData?.fullName || formValues.fullName,
                email: responseData?.email || formValues.email,
                phoneNumber: responseData?.phoneNumber || formValues.phoneNumber,
            })
            setSavedProfile(responseData)
            setIsEditingPersonalInfo(false)
            toast.success('Caregiver settings updated successfully')
        } catch {
            toast.error('Failed to update caregiver settings')
        } finally {
            setIsSaving(false)
        }
    }

    const onSubmit = async (formValues: CaregiverSettingsFormValues) => {
        const emailChanged = formValues.email !== savedProfile?.email

        if (emailChanged) {
            toast('Please verify your new email')
            setPendingFormValues(formValues)
            setPendingEmail(formValues.email)
            setShowEmailOtpModal(true)
            return
        }

        await saveProfile(formValues)
    }

    const handleVerifyEmailOtp = async (otp: string) => {
        setIsVerifyingEmail(true)
        try {
            await verifyOtp(pendingEmail, otp)
            setShowEmailOtpModal(false)
            if (pendingFormValues) {
                await saveProfile(pendingFormValues)
            }
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsVerifyingEmail(false)
        }
    }

    const handleResendEmailOtp = async () => {
        try {
            await sendOtp(pendingEmail, OtpPurpose.REGISTER)
            toast.success('Verification code sent')
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleResetPassword = () => {
        setShowPasswordModal(true)
    }

    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        setIsChangingPassword(true)
        try {
            await changePassword(currentPassword, newPassword)
            toast.success('Password changed successfully')
            setShowPasswordModal(false)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsChangingPassword(false)
        }
    }

    const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => {
                setImageCrop(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleCropComplete = async (croppedFile: File) => {
        setImageCrop(null)
        setIsUploadingImage(true)
        const toastId = toast.loading('Uploading profile image...')

        try {
            const presignRes = await presignUpload({
                fileName: croppedFile.name,
                contentType: croppedFile.type as 'image/png' | 'image/jpeg',
                folder: 'documents/caregiverProfile',
                size: croppedFile.size,
            })

            await uploadToS3(presignRes.uploadUrl, croppedFile)

            const values = getValues()
            await updateCaregiverProfile({
                fullName: values.fullName,
                phoneNumber: values.phoneNumber,
                email: values.email,
                profileImage: presignRes.key,
            })

            const profile = await getCurrentUser()
            if (user) {
                setAuth({
                    ...user,
                    profileImage: profile.data.profileImage,
                })
            }

            toast.success('Profile image updated successfully', { id: toastId })
        } catch (error) {
            toast.error(getErrorMessage(error), { id: toastId })
        } finally {
            setIsUploadingImage(false)
        }
    }

    if (isLoadingProfile) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingCard}>
                    <p className={styles.loadingText}>Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.stack}>
                    <Section>
                        <div className={styles.profileCard}>
                            <div className={styles.profileMeta}>
                                <div
                                    className={`${styles.avatarWrap} ${isUploadingImage ? styles.uploading : ''}`}
                                    onClick={() =>
                                        !isUploadingImage && document.getElementById('profileImageInput')?.click()
                                    }
                                >
                                    <input
                                        type="file"
                                        id="profileImageInput"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        style={{ display: 'none' }}
                                    />
                                    {profileImageUrl ? (
                                        <img
                                            src={profileImageUrl}
                                            alt={savedProfile?.fullName || 'Caregiver'}
                                            className={styles.avatar}
                                        />
                                    ) : (
                                        <div className={styles.avatarFallback}>
                                            {(savedProfile?.fullName || 'C').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className={styles.avatarBadge}>
                                        <Camera size={12} />
                                    </span>
                                </div>
                                <div>
                                    <h1 className={styles.profileName}>{savedProfile?.fullName || user?.name}</h1>
                                    <p className={styles.profileEmail}>{savedProfile?.email || user?.email}</p>
                                    <span
                                        className={`${styles.statusBadge} ${isActive ? styles.activeBadge : styles.inactiveBadge}`}
                                    >
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.statusToggle}>
                                <button
                                    type="button"
                                    className={`${styles.switch} ${isActive ? styles.switchOn : ''}`}
                                    onClick={handleToggleStatus}
                                    aria-label="Toggle caregiver account status"
                                    aria-pressed={isActive}
                                >
                                    <span className={styles.switchThumb} />
                                </button>
                                <span>{isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </Section>

                    <Section
                        title="Personal Information"
                        actions={
                            <button
                                type="button"
                                className={`${styles.editButton} ${isEditingPersonalInfo ? styles.editButtonActive : ''}`}
                                onClick={handleToggleEditing}
                                aria-label="Toggle personal information editing"
                            >
                                <Pencil size={16} />
                            </button>
                        }
                    >
                        <div className={styles.formGrid}>
                            <InputField
                                id="caregiver-name"
                                label="Full Name"
                                {...register('fullName')}
                                disabled={!isEditingPersonalInfo}
                                errors={errors.fullName?.message}
                            />
                            <InputField
                                id="caregiver-email"
                                label="Email"
                                {...register('email')}
                                disabled={!isEditingPersonalInfo}
                                errors={errors.email?.message}
                            />
                            <Controller
                                name="phoneNumber"
                                control={control}
                                render={({ field }) => (
                                    <PhoneInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        label="Phone Number"
                                        error={errors.phoneNumber?.message}
                                        disabled={!isEditingPersonalInfo}
                                    />
                                )}
                            />
                        </div>

                        {isEditingPersonalInfo && (
                            <div className={styles.actionsInline}>
                                <button
                                    type="button"
                                    className={styles.ghostButton}
                                    onClick={handleDiscard}
                                    disabled={!isDirty || isSaving || isLoadingProfile}
                                >
                                    Discard
                                </button>
                                <button
                                    type="button"
                                    className={styles.saveButton}
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={!isDirty || isSaving || isLoadingProfile}
                                >
                                    {isSaving ? 'Saving Changes...' : 'Save All Changes'}
                                </button>
                            </div>
                        )}
                    </Section>

                    <Section title="Professional Information">
                        <div className={styles.formGrid}>
                            <InputField
                                id="caregiver-certificate"
                                label="Certificate Number"
                                value={certificateNumber}
                                disabled
                            />
                            <InputField id="caregiver-license" label="License Number" value={licenseNumber} disabled />
                        </div>

                        {verificationStatus === 'verified' && (
                            <div className={styles.verifiedRow}>
                                <BadgeCheck size={14} />
                                <span>Verified</span>
                            </div>
                        )}

                        {verificationStatus === 'pending' && (
                            <div className={styles.pendingRow}>
                                <AlertCircle size={14} />
                                <span> Pending</span>
                            </div>
                        )}

                        {verificationStatus === 'rejected' && (
                            <div className={styles.rejectedRow}>
                                <XCircle size={14} />
                                <span> Rejected</span>
                            </div>
                        )}
                    </Section>

                    <DoctorSecuritySection onResetPassword={handleResetPassword} />
                </div>
            </form>

            {confirmToggle && (
                <Modal size="sm" isOpen onClose={handleCancelToggle} title="Confirm">
                    <p style={{ margin: 0, fontSize: '15px', color: '#374151' }}>
                        Are you sure you want to <strong>{confirmToggle.isActive ? 'activate' : 'deactivate'}</strong>{' '}
                        your account?
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button type="button" className={styles.ghostButton} onClick={handleCancelToggle}>
                            No
                        </button>
                        <button type="button" className={styles.saveButton} onClick={handleConfirmToggle}>
                            Yes
                        </button>
                    </div>
                </Modal>
            )}

            {showEmailOtpModal && (
                <Modal
                    isOpen={showEmailOtpModal}
                    onClose={() => {
                        setShowEmailOtpModal(false)
                        setOtpSent(false)
                    }}
                    title=""
                >
                    <OtpVerification
                        email={pendingEmail}
                        onVerify={handleVerifyEmailOtp}
                        onResend={handleResendEmailOtp}
                        onBack={() => setShowEmailOtpModal(false)}
                        loading={isVerifyingEmail}
                    />
                </Modal>
            )}

            <ChangePasswordForm
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSubmit={handleChangePassword}
                isLoading={isChangingPassword}
            />

            {imageCrop && (
                <ImageCropper
                    image={imageCrop}
                    onCropComplete={handleCropComplete}
                    onClose={() => setImageCrop(null)}
                />
            )}
        </div>
    )
}

export default CaregiverSettingsForm
