import {
    Activity,
    AlertCircle,
    ArrowLeft,
    BadgeAlert,
    ChevronRight,
    ClipboardPlus,
    Clock3,
    Droplet,
    Heart,
    ShieldAlert,
    Thermometer,
    Wind,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'

import {
    getPatientMedications,
    getPatientVitalPlans,
    type MedicationSchedule,
    type VitalPlanItem,
} from '../api/caregiver.api'

import styles from './CaregiverMedicationMonitorPage.module.css'

import MainWrapper from '@/shared/components/MainWrapper.tsx/MainWrapper'
import { getErrorMessage } from '@/utils/getErrorMessage'

const iconMap: Record<string, typeof Activity> = {
    blood_pressure: Heart,
    blood_sugar: Droplet,
    heart_rate: Activity,
    temperature: Thermometer,
    oxygen_saturation: Wind,
}

const labelMap: Record<string, string> = {
    blood_pressure: 'Blood Pressure',
    blood_sugar: 'Blood Sugar',
    heart_rate: 'Heart Rate',
    temperature: 'Temperature',
    oxygen_saturation: 'SpO2',
}

const unitMap: Record<string, string> = {
    blood_pressure: 'mmHg',
    blood_sugar: 'mg/dL',
    heart_rate: 'BPM',
    temperature: '\u00b0F',
    oxygen_saturation: '%',
}

interface AlertCard {
    title: string
    medicine: string
    scheduled: string
    route: string
    overdue: string
    tone: 'critical' | 'warning'
}

interface TimelineItem {
    time: string
    title: string
    medicine: string
    note: string
    route: string
    status: string
    tone: 'critical' | 'warning' | 'success'
    actionLabel: string
}

const toneMeta = {
    critical: {
        alertIcon: AlertCircle,
        sectionIcon: ShieldAlert,
        cardClassName: styles.alertCritical,
        badgeClassName: styles.alertBadgeCritical,
        timelineClassName: styles.timelineCritical,
    },
    warning: {
        alertIcon: Clock3,
        sectionIcon: BadgeAlert,
        cardClassName: styles.alertWarning,
        badgeClassName: styles.alertBadgeWarning,
        timelineClassName: styles.timelineWarning,
    },
    success: {
        alertIcon: ClipboardPlus,
        sectionIcon: ClipboardPlus,
        cardClassName: styles.alertWarning,
        badgeClassName: styles.alertBadgeWarning,
        timelineClassName: styles.timelineSuccess,
    },
} as const

const CaregiverMedicationMonitorPage = () => {
    const { patientId } = useParams<{ patientId: string }>()
    const [medications, setMedications] = useState<MedicationSchedule[]>([])
    const [vitalPlans, setVitalPlans] = useState<VitalPlanItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        if (!patientId) return
        try {
            const [medData, vitalData] = await Promise.all([
                getPatientMedications(patientId),
                getPatientVitalPlans(patientId),
            ])
            setMedications(medData)
            setVitalPlans(vitalData)
        } catch (err) {
            console.error('Error fetching data:', err)
            toast.error(getErrorMessage(err))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 10000)
        return () => clearInterval(interval)
    }, [patientId])

    const alerts: AlertCard[] = medications
        .filter((med) => med.status === 'missed' || med.status === 'pending')
        .map((med) => {
            const time = new Date(med.scheduleTime)
            const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
            const isOverdue = med.status === 'missed' || time < new Date()
            return {
                title: med.status === 'missed' ? 'Missed Dose' : 'Pending Dose',
                medicine: med.medicineName,
                scheduled: timeStr,
                route: med.route,
                overdue: isOverdue ? 'Needs attention' : '',
                tone: med.status === 'missed' ? 'critical' : 'warning',
            }
        })

    const timeline: TimelineItem[] = [...medications]
        .sort((a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime())
        .map((med) => {
            const time = new Date(med.scheduleTime)
            const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
            const note =
                med.status === 'administered' ? 'Administered' : med.status === 'missed' ? 'Missed dose' : 'Scheduled'
            return {
                time: timeStr,
                title:
                    med.status === 'administered'
                        ? `Medication Administered`
                        : med.status === 'missed'
                          ? `Medication Deviation`
                          : `Medication Scheduled`,
                medicine: `${med.medicineName} ${med.dosage}`,
                note,
                route: med.route,
                status: med.status === 'administered' ? 'Administered' : 'Take Action',
                tone: med.status === 'administered' ? 'success' : med.status === 'missed' ? 'critical' : 'warning',
                actionLabel: med.status === 'administered' ? 'Administered' : 'Take Action',
            }
        })

    if (isLoading) {
        return (
            <MainWrapper>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                </div>
            </MainWrapper>
        )
    }

    return (
        <MainWrapper title="Medication Overview" subtitle="Track medication compliance and recent patient vitals.">
            <section className={styles.page}>
                <div className={styles.backRow}>
                    <Link to="/caregiver/patients" className={styles.backLink}>
                        <ArrowLeft size={16} />
                        Back to patients
                    </Link>
                </div>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitleWrap}>
                            <ShieldAlert size={18} className={styles.sectionIconCritical} />
                            <h3 className={styles.sectionTitle}>Medication Deviation (Critical Alerts)</h3>
                        </div>
                        <span className={styles.sectionMeta}>{alerts.length} alerts</span>
                    </div>

                    <div className={styles.alertGrid}>
                        {alerts.length === 0 ? (
                            <p className={styles.emptyText}>No medication alerts for today.</p>
                        ) : (
                            alerts.map((alert) => {
                                const meta = toneMeta[alert.tone]
                                const AlertIcon = meta.alertIcon

                                return (
                                    <article
                                        key={`${alert.medicine}-${alert.scheduled}`}
                                        className={`${styles.alertCard} ${meta.cardClassName}`}
                                    >
                                        <div className={styles.alertTop}>
                                            <div className={styles.alertTitleWrap}>
                                                <span className={styles.alertIcon}>
                                                    <AlertIcon size={18} />
                                                </span>
                                                <div>
                                                    <p className={styles.alertLabel}>{alert.title}</p>
                                                    <h4 className={styles.alertMedicine}>{alert.medicine}</h4>
                                                </div>
                                            </div>
                                            {alert.overdue && (
                                                <span className={`${styles.alertBadge} ${meta.badgeClassName}`}>
                                                    {alert.overdue}
                                                </span>
                                            )}
                                        </div>

                                        <div className={styles.alertDetails}>
                                            <div>
                                                <span className={styles.detailLabel}>Scheduled</span>
                                                <strong>{alert.scheduled}</strong>
                                            </div>
                                            <div>
                                                <span className={styles.detailLabel}>Route</span>
                                                <strong>{alert.route}</strong>
                                            </div>
                                        </div>

                                        <button type="button" className={styles.alertAction}>
                                            Administer Now
                                        </button>
                                    </article>
                                )
                            })
                        )}
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitleWrap}>
                            <Heart size={18} className={styles.sectionIconInfo} />
                            <div>
                                <h3 className={styles.sectionTitle}>Vital Snapshot</h3>
                                <p className={styles.sectionHint}>Latest recorded patient metrics</p>
                            </div>
                        </div>
                        <button type="button" className={styles.secondaryAction}>
                            Log Vitals
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className={styles.vitalsGrid}>
                        {vitalPlans.length === 0 ? (
                            <p className={styles.emptyText}>No vital plans assigned to this patient.</p>
                        ) : (
                            vitalPlans.map((vital) => {
                                const Icon = iconMap[vital.type] || Activity
                                const label = labelMap[vital.type] || vital.type
                                const unit = unitMap[vital.type] || ''

                                return (
                                    <article key={vital.type} className={styles.vitalCard}>
                                        <div className={styles.vitalTop}>
                                            <span className={styles.vitalLabel}>{label}</span>
                                            <span className={styles.vitalStatus}>Awaiting first reading</span>
                                        </div>
                                        <div className={styles.vitalValueRow}>
                                            <Icon size={18} className={styles.vitalIcon} />
                                            <div className={styles.vitalValueWrap}>
                                                <strong className={styles.vitalValue}>—</strong>
                                                <span className={styles.vitalUnit}>{unit}</span>
                                            </div>
                                        </div>
                                        <span className={styles.vitalUpdated}>
                                            Frequency: every {vital.frequencyValue} {vital.frequencyUnit}
                                        </span>
                                    </article>
                                )
                            })
                        )}
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitleWrap}>
                            <ClipboardPlus size={18} className={styles.sectionIconInfo} />
                            <h3 className={styles.sectionTitle}>Medication Update</h3>
                        </div>
                        <button type="button" className={styles.dangerAction}>
                            Add Symptoms
                        </button>
                    </div>

                    <div className={styles.timeline}>
                        {timeline.length === 0 ? (
                            <p className={styles.emptyText}>No medication schedules for today.</p>
                        ) : (
                            timeline.map((item, index) => {
                                const meta = toneMeta[item.tone]
                                const SectionIcon = meta.sectionIcon

                                return (
                                    <article
                                        key={`${item.time}-${item.medicine}-${index}`}
                                        className={styles.timelineRow}
                                    >
                                        <div className={styles.timelineTime}>
                                            <span>{item.time}</span>
                                        </div>
                                        <div className={styles.timelineLine} />
                                        <div className={`${styles.timelineCard} ${meta.timelineClassName}`}>
                                            <div className={styles.timelineTop}>
                                                <div className={styles.timelineTitleWrap}>
                                                    <SectionIcon size={16} />
                                                    <span className={styles.timelineTitle}>{item.title}</span>
                                                </div>
                                            </div>

                                            <div className={styles.timelineContent}>
                                                <div className={styles.timelineText}>
                                                    <h4>{item.medicine}</h4>
                                                    <p>{item.note}</p>
                                                    <span>Route: {item.route}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={
                                                        item.tone === 'success'
                                                            ? styles.timelineSuccessBtn
                                                            : styles.timelineActionBtn
                                                    }
                                                >
                                                    {item.actionLabel}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                )
                            })
                        )}
                    </div>
                </section>
            </section>
        </MainWrapper>
    )
}

export default CaregiverMedicationMonitorPage
