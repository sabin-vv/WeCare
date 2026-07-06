import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Pencil } from 'lucide-react'
import { useEffect, useState, type ChangeEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import styles from './PatientSettings.module.css'

import {
    changePassword,
    getCurrentUser,
    presignUpload,
    sendOtp,
    uploadToS3,
    verifyOtp,
} from '@/modules/auth/api/auth.api'
import { OtpPurpose } from '@/modules/auth/types/auth.types'
import DoctorSecuritySection from '@/modules/doctor/form/settings/DoctorSecuritySection'
import { getPatientProfile, updatePatientProfile } from '@/modules/patient/api/patient.api'
import EmailOtpModal from '@/modules/patient/components/modals/EmailOtpModal'
import { DEFAULT_PATIENT_SETTINGS_FORM_VALUES } from '@/modules/patient/constants/patient.constants'
import type { PatientProfileData, PatientSettingsFormValues } from '@/modules/patient/types/patient.types'
import { patientSettingsFormSchema } from '@/modules/patient/validator/settingsForm.validator'
import ChangePasswordForm from '@/shared/components/ChangePasswordForm'
import ImageCropper from '@/shared/components/ImageCropper/ImageCropper'
import InputField from '@/shared/components/InputField/InputField'
import MainWrapper from '@/shared/components/MainWrapper/MainWrapper'
import PhoneInput from '@/shared/components/PhoneInput/PhoneInput'
import { Section } from '@/shared/components/Section/Section'
import { useAuth } from '@/shared/context/AuthContext'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { getFileUrl } from '@/utils/getFileUrl'

const PatientSettings = () => {
    const { user, setAuth } = useAuth()

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
        getValues,
    } = useForm<PatientSettingsFormValues>({
        resolver: zodResolver(patientSettingsFormSchema),
        defaultValues: DEFAULT_PATIENT_SETTINGS_FORM_VALUES,
        mode: 'onChange',
    })

    const [patientProfile, setPatientProfile] = useState<PatientProfileData | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [imageCrop, setImageCrop] = useState<string | null>(null)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [showEmailOtpModal, setShowEmailOtpModal] = useState(false)
    const [pendingEmail, setPendingEmail] = useState('')
    const [pendingFormValues, setPendingFormValues] = useState<PatientSettingsFormValues | null>(null)
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
    const [isLoadingProfile, setIsLoadingProfile] = useState(false)

    useEffect(() => {
        const loadPatientProfile = async () => {
            setIsLoadingProfile(true)
            try {
                const profile = await getPatientProfile()
                setPatientProfile(profile)

                reset({
                    name: profile.name,
                    email: profile.email,
                    mobile: profile.mobile,
                    dateOfBirth: profile.dateOfBirth.split('T')[0] || '',
                    gender: profile.gender,
                })
            } catch (error) {
                toast.error(getErrorMessage(error))
            } finally {
                setIsLoadingProfile(false)
            }
        }

        loadPatientProfile()
    }, [])

    const handleToggleEditing = () => {
        if (isEditing) {
            if (isDirty) {
                handleDiscard()
            } else {
                setIsEditing(false)
            }
        } else {
            setIsEditing(true)
        }
    }

    const saveProfile = async (formValues: PatientSettingsFormValues) => {
        setIsSaving(true)
        try {
            const updatedProfile = await updatePatientProfile({
                name: formValues.name,
                email: formValues.email,
                mobile: formValues.mobile,
            })

            reset({
                name: updatedProfile.name,
                email: updatedProfile.email,
                mobile: updatedProfile.mobile,
                dateOfBirth: updatedProfile.dateOfBirth.split('T')[0] || '',
                gender: updatedProfile.gender,
            })
            setPatientProfile(updatedProfile)
            setIsEditing(false)

            if (user) {
                setAuth({
                    ...user,
                    name: updatedProfile.name,
                    email: updatedProfile.email,
                    mobile: updatedProfile.mobile,
                })
            }

            toast.success('Patient profile updated successfully')
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsSaving(false)
        }
    }

    const onSubmit = async (formValues: PatientSettingsFormValues) => {
        const emailChanged = formValues.email !== patientProfile?.email

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

    const handleDiscard = () => {
        if (patientProfile) {
            reset({
                name: patientProfile.name,
                email: patientProfile.email,
                mobile: patientProfile.mobile,
                dateOfBirth: patientProfile.dateOfBirth.split('T')[0] || '',
                gender: patientProfile.gender,
            })
        }
        setIsEditing(false)
        toast.success('Changes discarded')
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
        if (!file) {
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setImageCrop(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleCropComplete = async (croppedFile: File) => {
        setImageCrop(null)
        setIsUploadingImage(true)
        const toastId = toast.loading('Uploading profile image...')

        try {
            const presignRes = await presignUpload({
                fileName: croppedFile.name,
                contentType: croppedFile.type as 'image/png' | 'image/jpeg',
                folder: 'documents/patientProfile',
                size: croppedFile.size,
            })

            await uploadToS3(presignRes.uploadUrl, croppedFile)

            const values = getValues()
            await updatePatientProfile({
                name: values.name,
                email: values.email,
                mobile: values.mobile,
                profileImage: presignRes.key,
            })

            const currentUser = await getCurrentUser()
            if (user) {
                setAuth({
                    ...user,
                    profileImage: currentUser.data.profileImage,
                })
            }

            toast.success('Profile image updated successfully', { id: toastId })
        } catch (error) {
            toast.error(getErrorMessage(error), { id: toastId })
        } finally {
            setIsUploadingImage(false)
        }
    }

    const profileImageSrc = patientProfile?.profileImage || user?.profileImage
    const resolvedProfileImage = getFileUrl(profileImageSrc)

    const nameValue = getValues('name')

    return (
        <MainWrapper title="Settings" subtitle="Manage your profile and account preferences.">
            <form onSubmit={handleSubmit(onSubmit)}>
                <Section>
                    <div className={styles.profileHeader}>
                        <div className={styles.left}>
                            <div className={styles.avatarWrap}>
                                <input
                                    type="file"
                                    id="patientProfileImageInput"
                                    accept="image/*"
                                    hidden
                                    onChange={handleImageSelect}
                                />

                                {resolvedProfileImage ? (
                                    <img
                                        src={resolvedProfileImage}
                                        className={styles.avatar}
                                        alt={nameValue || 'Patient profile'}
                                    />
                                ) : (
                                    <div className={styles.avatarFallback}>
                                        {(nameValue || user?.name || 'P').charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <label
                                    htmlFor="patientProfileImageInput"
                                    className={`${styles.avatarBadge} ${isUploadingImage ? styles.uploading : ''}`}
                                >
                                    <Camera size={14} />
                                </label>
                            </div>
                            <div>
                                <h3 className={styles.name}>{patientProfile?.name || user?.name}</h3>

                                <p className={styles.conditions}>
                                    Conditions:{' '}
                                    {patientProfile?.conditions?.length
                                        ? patientProfile.conditions.join(', ')
                                        : 'No conditions'}
                                </p>
                            </div>
                        </div>

                        <div className={styles.right}>
                            <span className={styles.label}>Patient ID</span>
                            <p className={styles.patientId}>
                                {patientProfile?.patientId ? `#${patientProfile.patientId}` : '--'}
                            </p>
                        </div>
                    </div>
                </Section>

                <Section
                    title="Profile Information"
                    actions={
                        <button
                            type="button"
                            className={`${styles.editButton} ${isEditing ? styles.editButtonActive : ''}`}
                            onClick={handleToggleEditing}
                            aria-label="Toggle personal information editing"
                        >
                            <Pencil size={16} />
                        </button>
                    }
                >
                    <div className={styles.grid}>
                        <InputField
                            id="patient-name"
                            label="Full Name"
                            {...register('name')}
                            disabled={!isEditing}
                            errors={errors.name?.message}
                        />
                        <InputField
                            id="patient-email"
                            label="Email"
                            {...register('email')}
                            disabled={!isEditing}
                            errors={errors.email?.message}
                        />
                        <Controller
                            name="mobile"
                            control={control}
                            render={({ field }) => (
                                <PhoneInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    label="Phone Number"
                                    error={errors.mobile?.message}
                                    disabled={!isEditing}
                                />
                            )}
                        />
                        <InputField
                            id="patient-dob"
                            label="Date of Birth"
                            type="date"
                            {...register('dateOfBirth')}
                            disabled
                        />
                        <InputField id="patient-gender" label="Gender" {...register('gender')} disabled />
                    </div>

                    {isEditing && (
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
                <DoctorSecuritySection onResetPassword={handleResetPassword} />
            </form>

            <ChangePasswordForm
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSubmit={handleChangePassword}
                isLoading={isChangingPassword}
            />

            <EmailOtpModal
                isOpen={showEmailOtpModal}
                onClose={() => setShowEmailOtpModal(false)}
                email={pendingEmail}
                onVerify={handleVerifyEmailOtp}
                onResend={handleResendEmailOtp}
                isVerifying={isVerifyingEmail}
            />

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

export default PatientSettings
