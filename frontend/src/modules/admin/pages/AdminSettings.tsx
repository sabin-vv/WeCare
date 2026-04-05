import { zodResolver } from '@hookform/resolvers/zod'
import { IndianRupee } from 'lucide-react'
import { useState, useEffect, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'

import { getPlatformSettings, updatePlatformSettings } from '../api/admin.api'
import PageCard from '../components/PageCard'
import { platformSettingsSchema, type PlatformSettingsForm } from '../validator/admin.validator'

import styles from './AdminSettings.module.css'

import Button from '@/shared/components/Button/Button'
import InputField from '@/shared/components/InputField/InputField'
import PageHeader from '@/shared/components/PageHeader/PageHeader'

const AdminSettings = () => {
    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<PlatformSettingsForm>({
        resolver: zodResolver(platformSettingsSchema),
        defaultValues: {
            platformName: '',
            contactEmail: '',
            address: '',
            platformFee: 0,
        },
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [feeInput, setFeeInput] = useState<string>('0')

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await getPlatformSettings()
                setValue('platformName', data.platformName)
                setValue('contactEmail', data.contactEmail)
                setValue('address', data.address)
                setValue('platformFee', data.platformFee)

                setFeeInput(data.platformFee.toString())
            } catch (error) {
                console.error('Failed to load settings:', error)
            } finally {
                setLoading(false)
            }
        }
        loadSettings()
    }, [setValue])

    const handleFee = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, '')
        if (!/^\d*$/.test(value)) return

        const formatted = Number(value).toLocaleString('en-IN')
        setFeeInput(formatted)
        setValue('platformFee', Number(value), { shouldValidate: true })
    }

    const onSubmit = async (data: PlatformSettingsForm) => {
        setSaving(true)
        try {
            await updatePlatformSettings(data)
            alert('Settings saved successfully')
        } catch (err) {
            console.error(err)
            alert('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <PageHeader title="Admin Settings" subtitle="View and update your application settings" />
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <PageCard title="General Settings">
                    <div className={styles.infoWrapper}>
                        <InputField
                            label="Platform Name"
                            {...register('platformName')}
                            errors={errors.platformName?.message}
                        />
                        <InputField
                            label="Admin contact email"
                            type="email"
                            {...register('contactEmail')}
                            errors={errors.contactEmail?.message}
                        />
                    </div>
                    <div className={styles.addressFeeWrapper}>
                        <InputField label="Address" {...register('address')} errors={errors.address?.message} />
                        <InputField
                            icon={<IndianRupee />}
                            value={feeInput}
                            onChange={handleFee}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            label="Platform Fee"
                            errors={errors.platformFee?.message}
                        />
                    </div>
                </PageCard>
                <PageCard title="Platform Branding">
                    <div className={styles.logoContainer}>
                        <div className={styles.logoWrapper}>
                            <div>
                                <img src="/logo" alt="logo" />
                            </div>
                            <Button>Upload Full logo</Button>
                        </div>
                        <div className={styles.logoWrapper}>
                            <div>
                                <img src="/logo" alt="logo" />
                            </div>
                            <Button>Upload Icon logo</Button>
                        </div>
                    </div>
                </PageCard>
                <div className={styles.saveButton}>
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default AdminSettings
