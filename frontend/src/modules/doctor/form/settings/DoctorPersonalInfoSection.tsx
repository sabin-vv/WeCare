import { IndianRupee, Pencil } from 'lucide-react'
import { Controller } from 'react-hook-form'

import type { DoctorPersonalInfoSectionProps } from '../../types/doctor.types'
import styles from '../DoctorSettingsForm.module.css'

import InputField from '@/shared/components/InputField/InputField'
import PhoneInput from '@/shared/components/PhoneInput/PhoneInput'
import { Section } from '@/shared/components/Section/Section'

const DoctorPersonalInfoSection = ({
    register,
    control,
    errors,
    isEditing,
    isDirty,
    isSaving,
    isLoadingProfile,
    onToggleEditing,
    onDiscard,
    onSave,
}: DoctorPersonalInfoSectionProps) => {
    return (
        <Section
            title="Personal Information"
            actions={
                <button
                    type="button"
                    className={`${styles.editButton} ${isEditing ? styles.editButtonActive : ''}`}
                    onClick={onToggleEditing}
                    aria-label="Toggle personal information editing"
                >
                    <Pencil size={16} />
                </button>
            }
        >
            <div className={styles.formGrid}>
                <div className={styles.fieldShell}>
                    <InputField
                        id="doctor-full-name"
                        label="Full Name"
                        {...register('name')}
                        disabled={!isEditing}
                        errors={errors.name?.message}
                    />
                </div>

                <div className={styles.fieldShell}>
                    <InputField
                        id="doctor-fee"
                        label="Fee"
                        {...register('consultationFee', { valueAsNumber: true })}
                        icon={<IndianRupee size={16} />}
                        disabled={!isEditing}
                        errors={errors.consultationFee?.message}
                    />
                </div>

                <div className={`${styles.fieldShell} ${styles.fullRow}`}>
                    <div className={styles.formGrid}>
                        <div className={styles.fieldShell}>
                            <Controller
                                name="phoneNumber"
                                control={control}
                                render={({ field }) => (
                                    <PhoneInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        label="Phone Number"
                                        error={errors.phoneNumber?.message}
                                        disabled={!isEditing}
                                    />
                                )}
                            />
                        </div>
                        <InputField
                            id="doctor-email"
                            label="Email Address"
                            {...register('email')}
                            disabled={!isEditing}
                            errors={errors.email?.message}
                        />
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className={`${styles.actions} ${styles.actionsInline}`}>
                    <button
                        type="button"
                        className={styles.ghostButton}
                        onClick={onDiscard}
                        disabled={!isDirty || isSaving || isLoadingProfile}
                    >
                        Discard
                    </button>
                    <button
                        type="button"
                        className={styles.saveButton}
                        onClick={onSave}
                        disabled={!isDirty || isSaving || isLoadingProfile}
                    >
                        {isSaving ? 'Saving Changes...' : 'Save All Changes'}
                    </button>
                </div>
            )}
        </Section>
    )
}

export default DoctorPersonalInfoSection
