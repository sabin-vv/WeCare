import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { getDoctorProfile, updateDoctorActiveStatus, updateDoctorProfile } from '../api/doctor.api'
import type { DoctorProfile } from '../types/doctor.types'
import type { SettingsFormValues } from '../types/doctor.types'
import { settingsFormSchema } from '../validator/settingsForm.validator'

import styles from './DoctorSettingsForm.module.css'
import DoctorPersonalInfoSection from './settings/DoctorPersonalInfoSection'
import DoctorRegistrationSection from './settings/DoctorRegistrationSection'
import DoctorSecuritySection from './settings/DoctorSecuritySection'
import DoctorSettingsProfileCard from './settings/DoctorSettingsProfileCard'

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
import ChangePasswordForm from '@/shared/components/ChangePasswordForm'
import ImageCropper from '@/shared/components/ImageCropper/ImageCropper'
import MainWrapper from '@/shared/components/MainWrapper/MainWrapper'
import Modal from '@/shared/components/Modal/Modal'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

const defaultFormValues: SettingsFormValues = {
    name: '',
    email: '',
    phoneNumber: '',
    consultationFee: 0,
}

const DoctorSettingsForm = () => {
    const { user, setAuth } = useAuth()
    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
        getValues,
    } = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: defaultFormValues,
        mode: 'onChange',
    })

    const [savedProfile, setSavedProfile] = useState<DoctorProfile | null>(null)
    const [isActive, setIsActive] = useState(true)
    const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)

    const [showEmailOtpModal, setShowEmailOtpModal] = useState(false)
    const [pendingEmail, setPendingEmail] = useState('')
    const [pendingFormValues, setPendingFormValues] = useState<SettingsFormValues | null>(null)
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
        const loadDoctorProfile = async () => {
            try {
                const profile = await getDoctorProfile()

                reset({
                    name: profile.name,
                    email: profile.email,
                    phoneNumber: profile.mobile,
                    consultationFee: profile.consultationFee || 0,
                })
                setSavedProfile(profile)
                setIsActive(profile.isActive)
            } catch {
                toast.error('Failed to load doctor settings')
            } finally {
                setIsLoadingProfile(false)
            }
        }

        loadDoctorProfile()
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
            const updatedProfile = await updateDoctorActiveStatus(newStatus)
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
                name: savedProfile.name,
                email: savedProfile.email,
                phoneNumber: savedProfile.mobile,
                consultationFee: savedProfile.consultationFee || 0,
            })
        }
        setIsEditingPersonalInfo(false)
        toast.success('Changes discarded')
    }

    const saveProfile = async (formValues: SettingsFormValues) => {
        setIsSaving(true)

        try {
            const updatedProfile = await updateDoctorProfile({
                name: formValues.name,
                consultationFee: formValues.consultationFee,
                email: formValues.email,
            })

            if (user) {
                setAuth({
                    ...user,
                    name: formValues.name,
                    email: formValues.email,
                })
            }

            reset({
                name: updatedProfile.name,
                email: updatedProfile.email,
                phoneNumber: updatedProfile.mobile,
                consultationFee: updatedProfile.consultationFee || 0,
            })
            setSavedProfile(updatedProfile)
            setIsEditingPersonalInfo(false)
            toast.success('Doctor settings updated successfully')
        } catch {
            toast.error('Failed to update doctor settings')
        } finally {
            setIsSaving(false)
        }
    }

    const onSubmit = async (formValues: SettingsFormValues) => {
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
                folder: 'documents/doctorProfile',
                size: croppedFile.size,
            })

            await uploadToS3(presignRes.uploadUrl, croppedFile)

            const values = getValues()
            await updateDoctorProfile({
                name: values.name,
                consultationFee: values.consultationFee,
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
        <MainWrapper title="Account Settings" subtitle="Manage your profile and account preferences.">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.stack}>
                    <DoctorSettingsProfileCard
                        profile={savedProfile!}
                        profileImageUrl={profileImageUrl}
                        isActive={isActive}
                        onToggleStatus={handleToggleStatus}
                        onImageSelect={handleImageSelect}
                        isUploadingImage={isUploadingImage}
                    />

                    <DoctorPersonalInfoSection
                        register={register}
                        control={control}
                        errors={errors}
                        isEditing={isEditingPersonalInfo}
                        isDirty={isDirty}
                        isSaving={isSaving}
                        isLoadingProfile={isLoadingProfile}
                        onToggleEditing={handleToggleEditing}
                        onDiscard={handleDiscard}
                        onSave={handleSubmit(onSubmit)}
                    />

                    {savedProfile && <DoctorRegistrationSection profile={savedProfile} />}

                    <DoctorSecuritySection onResetPassword={handleResetPassword} />
                </div>
            </form>

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

            {imageCrop && (
                <ImageCropper
                    image={imageCrop}
                    onCropComplete={handleCropComplete}
                    onClose={() => setImageCrop(null)}
                />
            )}
        </MainWrapper>
    )
}

export default DoctorSettingsForm
