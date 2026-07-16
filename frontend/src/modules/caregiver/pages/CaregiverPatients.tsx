import {
    Activity,
    AlertCircle,
    BadgeAlert,
    ClipboardPlus,
    Clock3,
    Droplet,
    Heart,
    RefreshCw,
    ShieldAlert,
    Wind,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import {
    getMyPatients,
    getPatientMedications,
    getPatientVitalSchedules,
    logMedicationAction,
    logSymptom,
    logVitalReading,
    type PatientSummary,
} from '../api/caregiver.api'
import MedicationLogModal from '../components/modals/MedicationLogModal'
import SymptomLogModal from '../components/modals/SymptomLogModal'
import VitalLogModal from '../components/modals/VitalLogModal'
import ProfileCard from '../components/ProfileCard/ProfileCard'
import {
    MEDICATION_STATUS_META,
    SYMPTOM_OPTIONS,
    VITAL_LABEL_MAP,
    VITAL_UNIT_MAP,
} from '../constants/caregiver.constants'
import type {
    AlertCard,
    MedicationLogFormState,
    MedicationSchedule,
    SymptomLogFormState,
    TimelineItem,
    VitalLogFormState,
    VitalScheduleItem,
} from '../types/caregiver.types'

import styles from './CaregiverPatients.module.css'

import MainWrapper from '@/shared/components/MainWrapper/MainWrapper'
import { Section } from '@/shared/components/Section/Section'
import { DATE_FORMAT, formatDate } from '@/shared/utils/format'
import { nowHHMM } from '@/shared/utils/time.utils'
import { getErrorMessage } from '@/utils/getErrorMessage'

const iconMap: Record<string, typeof Activity> = {
    blood_pressure: Heart,
    blood_sugar: Droplet,
    heart_rate: Activity,
    spo2: Wind,
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

const CaregiverPatients = () => {
    const [patients, setPatients] = useState<PatientSummary[]>([])
    const [medications, setMedications] = useState<MedicationSchedule[]>([])
    const [vitalSchedules, setVitalSchedules] = useState<VitalScheduleItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedMedication, setSelectedMedication] = useState<MedicationSchedule | null>(null)
    const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false)
    const [medicationLogForm, setMedicationLogForm] = useState<MedicationLogFormState>({
        status: 'on_time',
        takenTime: '',
        route: '',
        observations: '',
    })
    const [isVitalModalOpen, setIsVitalModalOpen] = useState(false)
    const [vitalLogForm, setVitalLogForm] = useState<VitalLogFormState>({
        selectedScheduleId: undefined,
        vitalType: '',
        systolic: '',
        diastolic: '',
        value: '',
        recordedAt: '',
        notes: '',
    })
    const [isSymptomModalOpen, setIsSymptomModalOpen] = useState(false)
    const [symptomLogForm, setSymptomLogForm] = useState<SymptomLogFormState>({
        symptom: '',
        onsetTime: '',
        severity: 'mild',
        observations: '',
    })
    const [isSavingMedication, setIsSavingMedication] = useState(false)
    const [isSavingVital, setIsSavingVital] = useState(false)
    const [isSavingSymptom, setIsSavingSymptom] = useState(false)
    const navigate = useNavigate()

    const loadAll = async (showRefreshLoader = false) => {
        try {
            if (showRefreshLoader) setIsRefreshing(true)
            const patientData = await getMyPatients()
            setPatients(patientData)
            if (patientData.length > 0) {
                const [medData, vitalData] = await Promise.all([
                    getPatientMedications(patientData[0]._id),
                    getPatientVitalSchedules(patientData[0]._id),
                ])
                setMedications(medData)
                setVitalSchedules(vitalData)
            }
        } catch (err) {
            console.error('Error fetching data:', err)
            toast.error(getErrorMessage(err))
        } finally {
            setIsLoading(false)
            if (showRefreshLoader) setIsRefreshing(false)
        }
    }

    useEffect(() => {
        loadAll()
    }, [])

    const handleRefresh = () => {
        loadAll(true)
    }

    const now = new Date()
    const alerts: AlertCard[] = medications
        .filter((med) => med.status === 'missed' || (med.status === 'pending' && new Date(med.scheduleTime) < now))
        .map((med) => {
            const time = new Date(med.scheduleTime)
            const timeStr = `${formatDate(med.scheduleTime, { month: 'short', day: 'numeric' })}, ${formatDate(med.scheduleTime, { ...DATE_FORMAT.TIME, hour12: true })}`
            const isOverdue = med.status === 'missed' || time < new Date()
            return {
                id: med._id,
                title: med.status === 'missed' ? 'Missed Dose' : 'Overdue Dose',
                medicine: `${med.medicineName} ${med.dosage}`,
                scheduled: timeStr,
                route: med.route,
                overdue: isOverdue ? 'Needs attention' : '',
                tone: med.status === 'missed' ? 'critical' : 'warning',
            }
        })

    const timeline: TimelineItem[] = [...medications]
        .sort((a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime())
        .map((med) => {
            const statusMeta = MEDICATION_STATUS_META[med.status]
            return {
                id: med._id,
                time: formatDate(med.scheduleTime, { ...DATE_FORMAT.TIME, hour12: true }),
                title: statusMeta.title,
                medicine: `${med.medicineName} ${med.dosage}`,
                note: statusMeta.note,
                route: med.route,
                tone: statusMeta.tone,
                actionLabel: statusMeta.actionLabel,
            }
        })

    const openMedicationModal = (medication: MedicationSchedule) => {
        const scheduledDate = new Date(medication.scheduleTime)
        const defaultTime = `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`

        setSelectedMedication(medication)
        setMedicationLogForm({
            status: 'on_time',
            takenTime: defaultTime,
            route: medication.route,
            observations: '',
        })
        setIsMedicationModalOpen(true)
    }

    const closeMedicationModal = () => {
        setIsMedicationModalOpen(false)
        setSelectedMedication(null)
    }

    const handleMedicationLogSubmit = async () => {
        if (!selectedMedication || patients.length === 0) return
        const patientId = patients[0]._id

        try {
            setIsSavingMedication(true)
            await logMedicationAction(patientId, selectedMedication._id, {
                status: medicationLogForm.status,
                takenTime: medicationLogForm.takenTime,
                route: medicationLogForm.route,
                observations: medicationLogForm.observations.trim() || undefined,
            })
            await loadAll()
            toast.success(
                medicationLogForm.status === 'skipped' ? 'Medication marked as skipped' : 'Medication log saved',
            )
            closeMedicationModal()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsSavingMedication(false)
        }
    }

    const openVitalModal = (vitalType?: string, schedule?: VitalScheduleItem) => {
        const fallbackType = vitalType || vitalSchedules[0]?.vitalType || 'blood_pressure'
        const defaultTime = nowHHMM()

        setVitalLogForm({
            selectedScheduleId: schedule?._id,
            vitalType: fallbackType,
            systolic: fallbackType === 'blood_pressure' ? '120' : '',
            diastolic: fallbackType === 'blood_pressure' ? '80' : '',
            value: '',
            recordedAt: defaultTime,
            notes: '',
        })
        setIsVitalModalOpen(true)
    }

    const closeVitalModal = () => {
        setIsVitalModalOpen(false)
    }

    const handleVitalTypeChange = (nextType: string) => {
        setVitalLogForm((current) => ({
            ...current,
            selectedScheduleId: undefined,
            vitalType: nextType,
            systolic: nextType === 'blood_pressure' ? current.systolic || '120' : '',
            diastolic: nextType === 'blood_pressure' ? current.diastolic || '80' : '',
            value: nextType === 'blood_pressure' ? '' : current.value,
        }))
    }

    const handleVitalLogSubmit = async () => {
        if (patients.length === 0) return
        const patientId = patients[0]._id

        try {
            setIsSavingVital(true)
            await logVitalReading(patientId, {
                scheduleId: vitalLogForm.selectedScheduleId,
                vitalType: vitalLogForm.vitalType,
                systolic: isBloodPressure ? Number(vitalLogForm.systolic) : undefined,
                diastolic: isBloodPressure ? Number(vitalLogForm.diastolic) : undefined,
                value: !isBloodPressure && vitalLogForm.value ? Number(vitalLogForm.value) : undefined,
                recordedAt: vitalLogForm.recordedAt,
                notes: vitalLogForm.notes.trim() || undefined,
            })
            await loadAll()
            toast.success('Vital reading logged')
            closeVitalModal()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsSavingVital(false)
        }
    }

    const openSymptomModal = () => {
        const defaultTime = nowHHMM()

        setSymptomLogForm({
            symptom: SYMPTOM_OPTIONS[0],
            onsetTime: defaultTime,
            severity: 'mild',
            observations: '',
        })
        setIsSymptomModalOpen(true)
    }

    const closeSymptomModal = () => {
        setIsSymptomModalOpen(false)
    }

    const handleSymptomLogSubmit = async () => {
        if (patients.length === 0) return
        const patientId = patients[0]._id

        try {
            setIsSavingSymptom(true)
            await logSymptom(patientId, {
                symptom: symptomLogForm.symptom,
                onsetTime: symptomLogForm.onsetTime,
                severity: symptomLogForm.severity,
                observations: symptomLogForm.observations.trim() || undefined,
            })
            toast.success('Symptom log saved')
            closeSymptomModal()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsSavingSymptom(false)
        }
    }

    const isBloodPressure = vitalLogForm.vitalType === 'blood_pressure'
    const selectedVitalLabel = VITAL_LABEL_MAP[vitalLogForm.vitalType] || 'Vital'
    const selectedVitalUnit = VITAL_UNIT_MAP[vitalLogForm.vitalType] || ''

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
        <MainWrapper title="My Patients">
            {patients.length === 0 ? (
                <Section>
                    <p className={styles.emptyText}>No patients assigned to you yet.</p>
                </Section>
            ) : (
                <>
                    <ProfileCard
                        patient={patients[0]}
                        action={{
                            label: 'View Prescription',
                            onClick: () => {
                                navigate(`/caregiver/patients/${patients[0]._id}/prescription`)
                            },
                        }}
                    />

                    <Section
                        title="Patient Medication Monitor"
                        actions={
                            <button
                                type="button"
                                className={styles.refreshBtn}
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <RefreshCw size={16} className={isRefreshing ? styles.spinningIcon : ''} />
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                        }
                    >
                        {alerts.length > 0 && (
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionTitleWrap}>
                                        <ShieldAlert size={18} className={styles.sectionIconCritical} />
                                        <h3 className={styles.sectionTitle}>Medication Deviation (Critical Alerts)</h3>
                                    </div>
                                    <span className={styles.sectionMeta}>{alerts.length} alerts</span>
                                </div>

                                <div className={styles.alertGrid}>
                                    {alerts.map((alert) => {
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

                                                <button
                                                    type="button"
                                                    className={styles.alertAction}
                                                    onClick={() => {
                                                        const medication = medications.find(
                                                            (med) => med._id === alert.id,
                                                        )
                                                        if (medication) {
                                                            openMedicationModal(medication)
                                                        }
                                                    }}
                                                >
                                                    Administer Now
                                                </button>
                                            </article>
                                        )
                                    })}
                                </div>
                            </section>
                        )}

                        {vitalSchedules.length === 0 && timeline.length === 0 ? (
                            <p className={styles.emptyText}>No medication or vital schedules for today.</p>
                        ) : (
                            <>
                                {vitalSchedules.length > 0 && (
                                    <section className={styles.section}>
                                        <div className={styles.sectionHeader}>
                                            <div className={styles.sectionTitleWrap}>
                                                <Heart size={18} className={styles.sectionIconInfo} />
                                                <div>
                                                    <h3 className={styles.sectionTitle}>Vital Checks</h3>
                                                    <p className={styles.sectionHint}>
                                                        Active vital plans ready for logging
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.vitalsGrid}>
                                            {vitalSchedules.map((schedule, _, arr) => {
                                                const type = schedule.vitalType
                                                const Icon = iconMap[type] || Activity
                                                const label = VITAL_LABEL_MAP[type] || type
                                                const unit = VITAL_UNIT_MAP[type] || ''
                                                const scheduleTimeLabel = `${formatDate(schedule.scheduleTime, DATE_FORMAT.SHORT)}, ${formatDate(schedule.scheduleTime, { ...DATE_FORMAT.TIME, hour12: true })}`
                                                const statusLabel =
                                                    schedule.status === 'pending'
                                                        ? 'Pending'
                                                        : schedule.status === 'recorded'
                                                          ? 'Recorded'
                                                          : schedule.status === 'missed'
                                                            ? 'Missed'
                                                            : schedule.status
                                                const earliestPendingTime = arr
                                                    .filter(s => s.status === 'pending')
                                                    .sort((a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime())[0]?.scheduleTime

                                                return (
                                                    <article
                                                        key={schedule._id}
                                                        className={styles.vitalCard}
                                                        data-status={schedule.status}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => openVitalModal(type, schedule)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault()
                                                                openVitalModal(type, schedule)
                                                            }
                                                        }}
                                                    >
                                                        <div className={styles.vitalTop}>
                                                            <span className={styles.vitalLabel}>{label}</span>
                                                            <span
                                                                className={styles.vitalStatus}
                                                                data-status={schedule.status}
                                                            >
                                                                {statusLabel}
                                                            </span>
                                                        </div>
                                                        <div className={styles.vitalValueRow}>
                                                            <Icon size={18} className={styles.vitalIcon} />
                                                            {schedule.status === 'recorded' &&
                                                            schedule.recordedValue ? (
                                                                <div className={styles.vitalValueWrap}>
                                                                    <strong className={styles.vitalValue}>
                                                                        {type === 'blood_pressure'
                                                                            ? `${schedule.recordedValue.systolic ?? ''}/${schedule.recordedValue.diastolic ?? ''}`
                                                                            : (schedule.recordedValue.value ?? '')}
                                                                        <span className={styles.vitalUnit}>
                                                                            {' '}
                                                                            {schedule.recordedValue.unit || unit}
                                                                        </span>
                                                                    </strong>
                                                                    <span className={styles.vitalDate}>
                                                                        {formatDate(schedule.recordedAt!, {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                        })}{' '}
                                                                        {formatDate(schedule.recordedAt!, {
                                                                            ...DATE_FORMAT.TIME,
                                                                            hour12: true,
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className={styles.vitalValueWrap}>
                                                                    <span className={styles.vitalTime}>
                                                                        {scheduleTimeLabel}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className={styles.vitalLog}>
                                                            {schedule.status === 'pending' && schedule.scheduleTime === earliestPendingTime && Date.now() >= new Date(schedule.scheduleTime).getTime() - 15 * 60 * 1000 && (
                                                                <span
                                                                    className={styles.logVital}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        openVitalModal(type, schedule)
                                                                    }}
                                                                >
                                                                    Log reading
                                                                </span>
                                                            )}
                                                        </div>
                                                    </article>
                                                )
                                            })}
                                        </div>
                                    </section>
                                )}

                                {timeline.length > 0 && (
                                    <section className={styles.section}>
                                        <div className={styles.sectionHeader}>
                                            <div className={styles.sectionTitleWrap}>
                                                <ClipboardPlus size={18} className={styles.sectionIconInfo} />
                                                <h3 className={styles.sectionTitle}>Medication Update</h3>
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.dangerAction}
                                                onClick={openSymptomModal}
                                            >
                                                Add Symptoms
                                            </button>
                                        </div>

                                        <div className={styles.timeline}>
                                            {(() => {
                                                const nextEligibleMedId = medications
                                                    .filter(m => m.status === 'pending' && Date.now() >= new Date(m.scheduleTime).getTime() - 15 * 60 * 1000)
                                                    .sort((a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime())[0]?._id

                                                return timeline.map((item, index) => {
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
                                                            <div
                                                                className={`${styles.timelineCard} ${meta.timelineClassName}`}
                                                            >
                                                                <div className={styles.timelineTop}>
                                                                    <div className={styles.timelineTitleWrap}>
                                                                        <SectionIcon size={16} />
                                                                        <span className={styles.timelineTitle}>
                                                                            {item.title}
                                                                        </span>
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
                                                                        onClick={() => {
                                                                            if (item.actionLabel === 'Take Action') {
                                                                                const medication = medications.find(
                                                                                    (med) => med._id === item.id,
                                                                                )
                                                                                if (medication) {
                                                                                    openMedicationModal(medication)
                                                                                }
                                                                            }
                                                                        }}
                                                                        disabled={item.id !== nextEligibleMedId}
                                                                    >
                                                                        {item.actionLabel}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </article>
                                                    )
                                                })
                                            })()}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </Section>

                    <MedicationLogModal
                        isOpen={isMedicationModalOpen}
                        onClose={closeMedicationModal}
                        medication={selectedMedication}
                        formState={medicationLogForm}
                        setFormState={setMedicationLogForm}
                        onSave={handleMedicationLogSubmit}
                        isSaving={isSavingMedication}
                    />

                    <VitalLogModal
                        isOpen={isVitalModalOpen}
                        onClose={() => setIsVitalModalOpen(false)}
                        formState={vitalLogForm}
                        setFormState={setVitalLogForm}
                        onSave={handleVitalLogSubmit}
                        isSaving={isSavingVital}
                        vitalSchedules={vitalSchedules}
                        isBloodPressure={isBloodPressure}
                        selectedVitalLabel={selectedVitalLabel}
                        selectedVitalUnit={selectedVitalUnit}
                        onVitalTypeChange={handleVitalTypeChange}
                    />

                    <SymptomLogModal
                        isOpen={isSymptomModalOpen}
                        onClose={() => setIsSymptomModalOpen(false)}
                        formState={symptomLogForm}
                        setFormState={setSymptomLogForm}
                        onSave={handleSymptomLogSubmit}
                        isSaving={isSavingSymptom}
                        symptomOptions={SYMPTOM_OPTIONS}
                    />
                </>
            )}
        </MainWrapper>
    )
}

export default CaregiverPatients
