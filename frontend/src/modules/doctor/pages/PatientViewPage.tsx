import { Heart, Activity, Thermometer, Droplets, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import {
    cancelPatientVitalPlan,
    getPatientById,
    getPatientVitalPlans,
    startConsultation,
    completeConsultation,
    updatePatientCondition,
    assignCaregiver,
    listCaregivers,
    updateClinicalStatus,
} from '../api/doctor.api'
import AssignCaregiverModal from '../components/modals/AssignCaregiverModal'
import SearchConditionModal from '../components/modals/SearchConditionModal'
import MedicationTable from '../components/viewPatient/MedicationTable'
import ProfileCard from '../components/viewPatient/ProfileCard'
import VitalCard from '../components/viewPatient/VitalCard'
import type { CaregiverOption, PatientDetails, RiskLevel, PatientVitalPlan } from '../types/doctor.types'

import styles from './PatientViewPage.module.css'

import { type ConditionResult, searchConditions } from '@/modules/doctor/api/conditionsApi'
import MainWrapper from '@/shared/components/MainWrapper/MainWrapper'
import { Section } from '@/shared/components/Section/Section'
import { useSocket } from '@/shared/context/SocketContext'
import { getErrorMessage } from '@/utils/getErrorMessage'

const SEVERITY_OPTIONS: Array<{ label: string; value: RiskLevel }> = [
    { label: 'Mild', value: 'mild' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Severe', value: 'severe' },
    { label: 'High Risk', value: 'high_risk' },
]

const PatientViewPage = () => {
    const { patientId } = useParams<{ patientId: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const [patient, setPatient] = useState<PatientDetails | null>(null)
    const [vitalPlans, setVitalPlans] = useState<PatientVitalPlan[]>([])
    const [cancellingPlanId, setCancellingPlanId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showConditionModal, setShowConditionModal] = useState(false)
    const [conditionQuery, setConditionQuery] = useState('')
    const [selectedConditions, setSelectedConditions] = useState<ConditionResult[]>([])
    const [selectedSeverity, setSelectedSeverity] = useState<RiskLevel | ''>('')
    const [conditionSuggestions, setConditionSuggestions] = useState<ConditionResult[]>([])
    const [isSearchingConditions, setIsSearchingConditions] = useState(false)
    const [isApplyingCondition, setIsApplyingCondition] = useState(false)
    const [showCaregiverModal, setShowCaregiverModal] = useState(false)
    const [caregiverSearch, setCaregiverSearch] = useState('')
    const [caregivers, setCaregivers] = useState<CaregiverOption[]>([])
    const [selectedCaregiver, setSelectedCaregiver] = useState<CaregiverOption | null>(null)
    const [isLoadingCaregivers, setIsLoadingCaregivers] = useState(false)
    const [isAssigningCaregiver, setIsAssigningCaregiver] = useState(false)
    const fetchPatient = useCallback(async () => {
        if (!patientId) return
        setIsLoading(true)
        try {
            const [patientData, vitalPlansData] = await Promise.all([
                getPatientById(patientId),
                getPatientVitalPlans(patientId, 'active'),
            ])
            setPatient(patientData)
            setVitalPlans(vitalPlansData)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }, [patientId])

    useEffect(() => {
        fetchPatient()
    }, [fetchPatient])

    useEffect(() => {
        if (location.state?.refresh) {
            fetchPatient()
        }
    }, [location.state?.refresh, fetchPatient])

    const { joinedPatients } = useSocket()

    const handleStartConsultation = async () => {
        if (!patientId) return

        if (patient?.appointmentStatus === 'in_consultation') {
            const id = patient.appointmentId
            if (id) {
                navigate(`/video-call/${id}`, { state: { returnPath: `/doctor/patients/${patientId}` } })
            }
            return
        }

        try {
            const { appointmentId } = await startConsultation(patientId)
            toast.success('Consultation started')
            navigate(`/video-call/${appointmentId}`, { state: { returnPath: `/doctor/patients/${patientId}` } })
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleCompleteConsultation = async () => {
        if (!patientId) return
        try {
            await completeConsultation(patientId)
            toast.success('Consultation completed')
            fetchPatient()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const resetConditionModal = () => {
        setConditionQuery('')
        setSelectedConditions(
            (patient?.conditions ?? []).map((condition) => ({
                name: condition,
                code: condition,
            })),
        )
        setSelectedSeverity((patient?.riskLevel as RiskLevel | undefined) ?? '')
        setConditionSuggestions([])
        setIsSearchingConditions(false)
    }

    const handleConditionModalClose = () => {
        resetConditionModal()
        setShowConditionModal(false)
    }

    const handleCaregiverModalClose = () => {
        setShowCaregiverModal(false)
        setCaregiverSearch('')
        setCaregivers([])
        setSelectedCaregiver(null)
    }

    const handleCaregiverModalOpen = () => {
        setShowCaregiverModal(true)
        setCaregiverSearch('')
        setCaregivers([])
        setSelectedCaregiver(null)
        fetchCaregivers('')
    }

    const fetchCaregivers = async (search: string) => {
        setIsLoadingCaregivers(true)
        try {
            const data = await listCaregivers(search)
            setCaregivers(data)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsLoadingCaregivers(false)
        }
    }

    const handleCaregiverSearch = useCallback((search: string) => {
        setCaregiverSearch(search)
        fetchCaregivers(search)
    }, [])

    const handleAssignCaregiver = async () => {
        if (!patient || !selectedCaregiver) return
        setIsAssigningCaregiver(true)
        try {
            const updatedPatient = await assignCaregiver(patient._id, selectedCaregiver.id)
            setPatient(updatedPatient)
            toast.success('Caregiver assigned successfully')
            handleCaregiverModalClose()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsAssigningCaregiver(false)
        }
    }

    const handleConditionSearch = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                setConditionSuggestions([])
                setIsSearchingConditions(false)
                return
            }

            setIsSearchingConditions(true)
            const results = await searchConditions(query)
            if (query.trim() === conditionQuery.trim()) {
                setConditionSuggestions(results)
            }
            setIsSearchingConditions(false)
        },
        [conditionQuery],
    )

    const handleConditionSelect = (selectedCondition: string) => {
        const matchedCondition = conditionSuggestions.find((condition) => condition.name === selectedCondition) ?? null
        if (!matchedCondition) {
            return
        }

        setSelectedConditions((current) => {
            if (current.some((condition) => condition.name === matchedCondition.name)) {
                return current
            }

            return [...current, matchedCondition]
        })
        setConditionQuery('')
        setConditionSuggestions([])
    }

    const handleConditionRemove = (conditionName: string) => {
        setSelectedConditions((current) => current.filter((condition) => condition.name !== conditionName))
    }

    const applyConditionUpdate = async () => {
        if (!patient || selectedConditions.length === 0 || !selectedSeverity) {
            return
        }

        setIsApplyingCondition(true)
        try {
            const updatedPatient = await updatePatientCondition(patient._id, {
                conditions: selectedConditions.map((condition) => condition.name),
                riskLevel: selectedSeverity,
            })
            setPatient(updatedPatient)
            toast.success('Condition and severity updated successfully')
            handleConditionModalClose()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsApplyingCondition(false)
        }
    }

    useEffect(() => {
        if (!showConditionModal) {
            resetConditionModal()
        }
    }, [showConditionModal])

    if (isLoading) {
        return (
            <MainWrapper>
                <div className="loading">Loading patient details...</div>
            </MainWrapper>
        )
    }

    if (!patient) {
        return (
            <MainWrapper>
                <div className="error">Patient not found</div>
            </MainWrapper>
        )
    }

    const vitalIcons: Record<string, ReactNode> = {
        blood_pressure: <Activity />,
        heart_rate: <Heart />,
        spo2: <Droplets />,
        blood_sugar: <Thermometer />,
    }
    const vitalNameFormat = (vital: string): string => {
        if (vital === 'blood_pressure') return 'Blood Pressure'
        else if (vital === 'heart_rate') return 'Heart Rate'
        else if (vital === 'spo2') return 'SPO2'
        else if (vital === 'blood_sugar') return 'Bloood Sugar'
        else return vital
    }

    const formatFrequency = (value: number, unit: 'hours' | 'days' | 'weeks') => {
        const label = value === 1 ? unit.slice(0, -1) : unit
        return `Every ${value} ${label}`
    }

    const formatDuration = (value: number, unit: 'hours' | 'days' | 'weeks' | 'months') => {
        const label = value === 1 ? unit.slice(0, -1) : unit
        return `${value} ${label}`
    }

    const handleCancelVitalPlan = async (planId: string) => {
        setCancellingPlanId(planId)
        try {
            await cancelPatientVitalPlan(planId)
            toast.success('Vitals check request removed')
            fetchPatient()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setCancellingPlanId(null)
        }
    }

    const handleClinicalStatusChange = async (clinicalStatus: string) => {
        if (!patient) return
        try {
            const updated = await updateClinicalStatus(patient._id, clinicalStatus)
            setPatient(updated.data)
            toast.success(updated.message)
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleMedicalRecord = () => {
        navigate(`/doctor/patients/${patientId}/medical-record`)
    }
    const flatVital = vitalPlans.flatMap((plan) => plan.vitals)

    const vitals = flatVital.map((vital) => vital.type)

    return (
        <MainWrapper>
            <ProfileCard
                name={patient.name}
                age={patient.age}
                gender={patient.gender}
                patientId={patient.patientId}
                riskLevel={patient.riskLevel}
                conditions={patient.conditions}
                profileImage={patient.profileImage}
                appointmentStatus={patient.appointmentStatus}
                appointmentId={patient.appointmentId}
                appointmentDate={patient.appointmentDate}
                slotStart={patient.slotStart}
                hasPatientJoined={joinedPatients.has(patientId!)}
                caregiver={patient.caregiver}
                clinicalStatus={patient.clinicalStatus}
                onClinicalStatusChange={handleClinicalStatusChange}
                onStartConsultation={handleStartConsultation}
                onCompleteConsultation={handleCompleteConsultation}
                onAddCondition={() => {
                    resetConditionModal()
                    setShowConditionModal(true)
                }}
                onAssignCaregiver={handleCaregiverModalOpen}
                onMedicalRecord={handleMedicalRecord}
            />
            <div className={styles.vitalsLogGrid}>
                {patient.vitals.length > 0 &&
                    patient.vitals.map((vital) => (
                        <VitalCard
                            key={vital._id}
                            vitalName={vitalNameFormat(vital.type)}
                            value={vital.value?.toString() || `${vital.systolic}/${vital.diastolic}`}
                            unit={vital.unit}
                            icon={vitalIcons[vital.type]}
                            status={vital.recordedAt}
                        />
                    ))}
            </div>
            {vitalPlans.length > 0 && (
                <Section title="Vitals Check Requests">
                    <div className={styles.vitalsGrid}>
                        {vitalPlans.flatMap((plan) =>
                            plan.vitals.map((vital) => (
                                <div key={`${plan._id}-${vital.type}`} className={styles.vitalCard}>
                                    <div className={styles.header}>
                                        <span className={styles.vitalName}>{vitalNameFormat(vital.type)}</span>

                                        <button
                                            onClick={() => handleCancelVitalPlan(plan._id)}
                                            className={styles.deleteButton}
                                            disabled={cancellingPlanId === plan._id}
                                        >
                                            <Trash2 size={18} color="red" />
                                        </button>
                                    </div>

                                    <div className={styles.details}>
                                        <div className={styles.detailRow}>
                                            <span className={styles.label}>Frequency</span>

                                            <span className={styles.value}>
                                                {formatFrequency(vital.frequencyValue, vital.frequencyUnit)}
                                            </span>
                                        </div>

                                        <div className={styles.detailRow}>
                                            <span className={styles.label}>Duration</span>

                                            <span className={styles.value}>
                                                {formatDuration(vital.durationValue, vital.durationUnit)}
                                            </span>
                                        </div>

                                        <div className={styles.detailRow}>
                                            <span className={styles.label}>Requested On</span>

                                            <span className={styles.value}>
                                                {new Date(plan.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )),
                        )}
                    </div>
                </Section>
            )}
            <MedicationTable
                patientId={patient._id}
                patientName={patient.name}
                hasConditions={(patient.conditions?.length ?? 0) > 0}
                vitalPlan={vitals}
                onSuccess={fetchPatient}
            />

            <SearchConditionModal
                isOpen={showConditionModal}
                onClose={handleConditionModalClose}
                conditionQuery={conditionQuery}
                setConditionQuery={setConditionQuery}
                selectedConditions={selectedConditions}
                selectedSeverity={selectedSeverity}
                setSelectedSeverity={setSelectedSeverity}
                conditionSuggestions={conditionSuggestions}
                isSearchingConditions={isSearchingConditions}
                isApplyingCondition={isApplyingCondition}
                severityOptions={SEVERITY_OPTIONS}
                onSearch={handleConditionSearch}
                onSelect={handleConditionSelect}
                onRemove={handleConditionRemove}
                onApply={applyConditionUpdate}
            />

            <AssignCaregiverModal
                isOpen={showCaregiverModal}
                onClose={handleCaregiverModalClose}
                caregiverSearch={caregiverSearch}
                setCaregiverSearch={setCaregiverSearch}
                caregivers={caregivers}
                selectedCaregiver={selectedCaregiver}
                setSelectedCaregiver={setSelectedCaregiver}
                isLoadingCaregivers={isLoadingCaregivers}
                isAssigningCaregiver={isAssigningCaregiver}
                onSearch={handleCaregiverSearch}
                onAssign={handleAssignCaregiver}
            />
        </MainWrapper>
    )
}
export default PatientViewPage
