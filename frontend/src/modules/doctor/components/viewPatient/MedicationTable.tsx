import { Activity, Droplets, Heart, OctagonMinus, Pencil } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'

import {
    addPrescription,
    createVitalPlan,
    getPatientPrescriptions,
    updatePrescriptionStatus,
} from '../../api/doctor.api'
import { getMedicineNames, getMedicineStrengths } from '../../api/medicine.api'
import {
    DEFAULT_VITALS_PREFERENCES,
    DURATION_OPTIONS,
    FREQUENCY_OPTIONS,
    FREQUENCY_SLOT_MAP,
    parseDuration,
    parseFrequency,
    type VitalPlanOptionId,
} from '../../constants/doctor.constants'
import type { MedicationProps, PatientPrescription, ScheduleTime, SelectedMedication } from '../../types/doctor.types'
import PrescriptionModal from '../modals/PrescriptionModal'
import VitalsCheckRequestModal from '../modals/VitalsCheckRequestModal'

import styles from './MedicationTable.module.css'

import Button from '@/shared/components/Button/Button'
import Pagination from '@/shared/components/Pagination/Pagination'
import { Section } from '@/shared/components/Section/Section'
import DataTable from '@/shared/components/Table/DataTable'
import type { Column } from '@/shared/components/Table/dataTable.types'
import { DEFAULT_PAGINATION } from '@/shared/constants/pagination.constants'
import { getErrorMessage } from '@/utils/getErrorMessage'

const createScheduleTime = (medicationId: string, index: number): ScheduleTime => ({
    id: `${medicationId}-schedule-${index}-${Date.now()}`,
    time: '',
})

const normalizeScheduleTimes = (
    medicationId: string,
    frequency: string,
    scheduleTimes: ScheduleTime[],
): ScheduleTime[] => {
    const requiredCount = FREQUENCY_SLOT_MAP[frequency] ?? 1
    const normalizedTimes = scheduleTimes.slice(0, requiredCount)

    while (normalizedTimes.length < requiredCount) {
        normalizedTimes.push(createScheduleTime(medicationId, normalizedTimes.length))
    }

    return normalizedTimes
}

const MedicationTable = ({ patientId, patientName, hasConditions, onSuccess, vitalPlan }: MedicationProps) => {
    const [prescriptions, setPrescriptions] = useState<PatientPrescription[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false)
    const [prescriptionRefreshKey, setPrescriptionRefreshKey] = useState(0)
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
    const [showVitalsModal, setShowVitalsModal] = useState(false)
    const [editingPrescription, setEditingPrescription] = useState<PatientPrescription | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [originalPrescription, setOriginalPrescription] = useState<SelectedMedication[]>([])

    const fetchPrescriptions = useCallback(async () => {
        setIsLoadingPrescriptions(true)
        try {
            const response = await getPatientPrescriptions(patientId, page, DEFAULT_PAGINATION.limit)
            setPrescriptions(response.data)
            setTotalPages(response.pagination.totalPages)
            setTotalCount(response.pagination.total)
        } catch (error) {
            toast.error(getErrorMessage(error))
            setPrescriptions([])
        } finally {
            setIsLoadingPrescriptions(false)
        }
    }, [patientId, page])

    useEffect(() => {
        if (patientId) {
            fetchPrescriptions()
        }
    }, [fetchPrescriptions, patientId, prescriptionRefreshKey])

    const flattenedMedications = [...prescriptions]
        .sort((a, b) => new Date(b.prescribedAt).getTime() - new Date(a.prescribedAt).getTime())
        .flatMap((prescription) =>
            prescription.medications.map((med) => ({
                prescriptionId: prescription._id,
                prescriptionStatus: prescription.status,
                prescribedAt: prescription.prescribedAt,
                ...med,
            })),
        )

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active':
                return styles.statusActive
            case 'on_hold':
                return styles.statusOnHold
            case 'amended':
                return styles.statusAmended
            case 'completed':
                return styles.statusCompleted
            case 'discontinued':
                return styles.statusDiscontinued
            default:
                return ''
        }
    }

    const medicationColumns: Column<(typeof flattenedMedications)[number]>[] = [
        {
            header: 'Medication',
            key: 'name' as keyof (typeof flattenedMedications)[number],
            render: (item) => <span className={styles.medicationCell}>{item.name}</span>,
        },
        {
            header: 'Dosage',
            key: 'dosage' as keyof (typeof flattenedMedications)[number],
            render: (item) => item.dosage,
        },
        {
            header: 'Frequency',
            key: 'frequency' as keyof (typeof flattenedMedications)[number],
            render: (item) => item.frequency,
        },
        {
            header: 'Schedule Times',
            key: 'scheduleTimes' as keyof (typeof flattenedMedications)[number],
            render: (item) =>
                item.scheduleTimes.length > 0 ? (
                    <div className={styles.scheduleTimeChips}>
                        {item.scheduleTimes.map((time, index) => (
                            <span
                                key={`${item.prescriptionId}-${item.name}-${time}-${index}`}
                                className={styles.scheduleTimeChip}
                            >
                                {time}
                            </span>
                        ))}
                    </div>
                ) : (
                    'N/A'
                ),
        },
        {
            header: 'End Time',
            key: 'endDate' as keyof (typeof flattenedMedications)[number],
            render: (item) =>
                item.endDate
                    ? new Date(item.endDate).toLocaleString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                      })
                    : 'N/A',
        },
        {
            header: 'Status',
            key: 'prescriptionStatus' as keyof (typeof flattenedMedications)[number],
            render: (item) => (
                <span className={`${styles.statusBadge} ${getStatusClass(item.prescriptionStatus)}`}>
                    {item.prescriptionStatus.replace('_', ' ')}
                </span>
            ),
        },
        {
            header: 'Actions',
            key: 'prescriptionId' as keyof (typeof flattenedMedications)[number],
            render: (item) => {
                if (item.prescriptionStatus !== 'active') return null

                const prescription = prescriptions.find((p) => p._id === item.prescriptionId)
                return (
                    <div className={styles.actionButtons}>
                        <button
                            className={styles.actionIconBtn}
                            title="Edit"
                            onClick={() => handleEditPrescription(prescription)}
                        >
                            <Pencil size={18} className={styles.editIcon} />
                        </button>
                        <button
                            className={`${styles.actionIconBtn} ${styles.deleteBtn}`}
                            title="Delete"
                            onClick={() => handleDeletePrescription(prescription)}
                        >
                            <OctagonMinus size={18} className={styles.deleteIcon} />
                        </button>
                    </div>
                )
            },
        },
    ]

    const [medicationSearch, setMedicationSearch] = useState('')
    const [dosage, setDosage] = useState('')
    const [availableStrengths, setAvailableStrengths] = useState<string[]>([])
    const [selectedMedications, setSelectedMedications] = useState<SelectedMedication[]>([])
    const [medicineSuggestions, setMedicineSuggestions] = useState<string[]>([])
    const [isSearchingMedicines, setIsSearchingMedicines] = useState(false)
    const [selectedMedicineName, setSelectedMedicineName] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isSavingVitalPlan, setIsSavingVitalPlan] = useState(false)
    const [selectedVitals, setSelectedVitals] = useState<VitalPlanOptionId[]>([])
    const [vitalsInstructions, setVitalsInstructions] = useState('')
    const [vitalsPreferences, setVitalsPreferences] = useState(DEFAULT_VITALS_PREFERENCES)

    const vitalOptions: Array<{ id: VitalPlanOptionId; label: string; icon: ReactNode; iconClassName: string }> = [
        {
            id: 'blood_pressure',
            label: 'Blood Pressure',
            icon: <Activity size={18} />,
            iconClassName: styles.vitalOptionIconBlue,
        },
        {
            id: 'heart_rate',
            label: 'Heart Rate',
            icon: <Heart size={18} />,
            iconClassName: styles.vitalOptionIconRed,
        },
        {
            id: 'spo2',
            label: 'SpO2',
            icon: <Activity size={18} />,
            iconClassName: styles.vitalOptionIconGreen,
        },
        {
            id: 'blood_sugar',
            label: 'Blood Sugar',
            icon: <Droplets size={18} />,
            iconClassName: styles.vitalOptionIconPurple,
        },
    ] as const

    const handleRemoveMedication = (id: string) => {
        setSelectedMedications(selectedMedications.filter((med) => med.id !== id))
    }

    const handleUpdateScheduleTime = (medicationId: string, timeId: string, newTime: string) => {
        setSelectedMedications(
            selectedMedications.map((med) => {
                if (med.id === medicationId) {
                    return {
                        ...med,
                        scheduleTimes: med.scheduleTimes.map((time) =>
                            time.id === timeId ? { ...time, time: newTime } : time,
                        ),
                    }
                }
                return med
            }),
        )
    }

    const handleEditPrescription = async (prescription: PatientPrescription | undefined) => {
        if (!prescription || prescription.medications.length === 0) return
        setEditingPrescription(prescription)
        setIsEditMode(true)

        const firstMed = prescription.medications[0]

        const mappedMedications: SelectedMedication[] = prescription.medications.map((med, index) => {
            const medicationId = `${prescription._id}-${index}`
            const scheduleTimes = med.scheduleTimes.map((time, i) => ({
                id: `${medicationId}-${i}`,
                time: time,
            }))

            return {
                id: medicationId,
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration || 7,
                durationUnit: med.durationUnit || 'Days',
                priority: med.priority || '',
                route: med.route === 'IV' ? 'Intravenous' : med.route === 'injection' ? 'Intramuscular' : med.route,
                scheduleTimes: normalizeScheduleTimes(medicationId, med.frequency, scheduleTimes),
                instructions: med.instructions || '',
            }
        })

        setSelectedMedications(mappedMedications)
        setOriginalPrescription([...mappedMedications])
        setMedicationSearch(firstMed.name)
        setSelectedMedicineName(firstMed.name)

        try {
            setIsSearchingMedicines(true)
            const strengths = await getMedicineStrengths(firstMed.name)
            setAvailableStrengths(strengths)
            if (strengths.includes(firstMed.dosage)) {
                setDosage(firstMed.dosage)
            } else if (strengths.length > 0) {
                setDosage(strengths[0])
            }
        } catch (error) {
            console.error('Error fetching strengths:', error)
            setAvailableStrengths([])
        } finally {
            setIsSearchingMedicines(false)
        }

        setShowPrescriptionModal(true)
    }

    const handleDeletePrescription = async (prescription: PatientPrescription | undefined) => {
        if (!prescription) return

        try {
            await updatePrescriptionStatus(prescription._id, 'discontinued')
            toast.success('Prescription discontinued')
            onSuccess()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const handleMedicineSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setMedicineSuggestions([])
            setIsSearchingMedicines(false)
            return
        }

        setIsSearchingMedicines(true)
        try {
            const results = await getMedicineNames(query)
            setMedicineSuggestions(results)
        } catch (error) {
            console.error('Error searching medicines:', error)
            setMedicineSuggestions([])
        } finally {
            setIsSearchingMedicines(false)
        }
    }, [])

    const handleMedicineSelect = async (medicineName: string) => {
        setSelectedMedicineName(medicineName)
        setMedicationSearch(medicineName)
        setMedicineSuggestions([])

        try {
            setIsSearchingMedicines(true)
            const strengths = await getMedicineStrengths(medicineName)
            setAvailableStrengths(strengths)
            if (strengths.length > 0) {
                setDosage(strengths[0])
            }
        } catch (error) {
            console.error('Error fetching strengths:', error)
            setAvailableStrengths([])
        } finally {
            setIsSearchingMedicines(false)
        }
    }

    const handleAddMedicationToList = () => {
        if (!selectedMedicineName) return

        const medicationId = Date.now().toString()
        const frequency = 'Once daily'
        const newMedication: SelectedMedication = {
            id: medicationId,
            name: selectedMedicineName,
            dosage: dosage,
            frequency,
            duration: 7,
            durationUnit: 'Days',
            priority: 'Medium',
            route: 'Oral',
            scheduleTimes: normalizeScheduleTimes(medicationId, frequency, []),
        }

        setSelectedMedications([...selectedMedications, newMedication])
        setSelectedMedicineName('')
        setMedicationSearch('')
        setDosage('')
        setAvailableStrengths([])
    }

    const handleUpdateMedicationField = (
        medicationId: string,
        field: keyof SelectedMedication,
        value: string | number,
    ) => {
        setSelectedMedications(
            selectedMedications.map((med) => {
                if (med.id === medicationId) {
                    if (field === 'frequency' && typeof value === 'string') {
                        return {
                            ...med,
                            frequency: value,
                            scheduleTimes: normalizeScheduleTimes(med.id, value, med.scheduleTimes),
                        }
                    }

                    return { ...med, [field]: value }
                }
                return med
            }),
        )
    }

    const handleAddPrescription = async () => {
        if (!patientId || selectedMedications.length === 0) return

        setIsSaving(true)
        try {
            await addPrescription(patientId, {
                medications: selectedMedications.map((med) => ({
                    name: med.name,
                    dosage: med.dosage,
                    route:
                        med.route === 'Intravenous'
                            ? 'IV'
                            : med.route === 'Intramuscular'
                              ? 'injection'
                              : med.route.toLowerCase(),
                    frequency: med.frequency,
                    scheduleTimes: med.scheduleTimes.map((t) => t.time).filter(Boolean),
                    priority: med.priority,
                    instructions: med.instructions,
                    duration: med.duration,
                    durationUnit: med.durationUnit,
                })),
            })

            if (isEditMode && editingPrescription) {
                await updatePrescriptionStatus(editingPrescription._id, 'amended')
                toast.success('Prescription updated successfully')
            } else {
                toast.success('Prescription added successfully')
            }

            setPage(1)
            setPrescriptionRefreshKey((k) => k + 1)
            onSuccess()
            handleClosePrescriptionModal()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsSaving(false)
        }
    }

    const handleClosePrescriptionModal = () => {
        setShowPrescriptionModal(false)
        setMedicationSearch('')
        setDosage('')
        setAvailableStrengths([])
        setSelectedMedicineName('')
        setSelectedMedications([])
        setMedicineSuggestions([])
        setEditingPrescription(null)
        setIsEditMode(false)
        setOriginalPrescription([])
    }

    const handleOpenVitalsModal = () => {
        setShowVitalsModal(true)
    }

    const handleCloseVitalsModal = () => {
        setShowVitalsModal(false)
        setSelectedVitals([])
        setVitalsInstructions('')
        setVitalsPreferences({ ...DEFAULT_VITALS_PREFERENCES })
    }

    const handleToggleVital = (vitalId: VitalPlanOptionId) => {
        setSelectedVitals((current) =>
            current.includes(vitalId) ? current.filter((id) => id !== vitalId) : [...current, vitalId],
        )
    }

    const handleUpdateVitalPreference = (
        vitalId: VitalPlanOptionId,
        field: 'frequency' | 'duration',
        value: string,
    ) => {
        setVitalsPreferences((current) => ({
            ...current,
            [vitalId]: {
                ...current[vitalId],
                [field]: value,
            },
        }))
    }

    const handleConfirmVitalsRequest = async () => {
        if (!patientId || selectedVitals.length === 0) return

        setIsSavingVitalPlan(true)
        try {
            await createVitalPlan(patientId, {
                vitals: selectedVitals.map((vitalId) => ({
                    type: vitalId,
                    ...parseFrequency(vitalsPreferences[vitalId].frequency),
                    ...parseDuration(vitalsPreferences[vitalId].duration),
                })),
                instructions: vitalsInstructions.trim() || undefined,
            })
            onSuccess()

            toast.success('Vitals check request created')
            handleCloseVitalsModal()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsSavingVitalPlan(false)
        }
    }

    const hasChanges = isEditMode && JSON.stringify(selectedMedications) !== JSON.stringify(originalPrescription)

    const hasValidScheduleTimes = selectedMedications.every(
        (med) => med.scheduleTimes.length > 0 && med.scheduleTimes.every((t) => t.time && t.time.trim() !== ''),
    )

    return (
        <>
            <Section
                title="Current Medication"
                actions={
                    <div className={styles.sectionActions}>
                        <Button
                            disabled={!hasConditions}
                            onClick={() => setShowPrescriptionModal(true)}
                            className={styles.prescriptionBtn}
                        >
                            Prescription
                        </Button>
                        <Button disabled={!hasConditions} className={styles.vitalsBtn} onClick={handleOpenVitalsModal}>
                            Vitals
                        </Button>
                    </div>
                }
            >
                {flattenedMedications.length === 0 && !isLoadingPrescriptions ? (
                    <p className={styles.emptyMessage}>No prescriptions available for this patient.</p>
                ) : (
                    <div className={styles.tableSection}>
                        <DataTable
                            data={flattenedMedications}
                            columns={medicationColumns}
                            keyExtractor={(item) => `${item.prescriptionId}-${item.name}`}
                            isLoading={isLoadingPrescriptions}
                        >
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    totalCount={totalCount}
                                    limit={DEFAULT_PAGINATION.limit}
                                    onPageChange={setPage}
                                />
                            )}
                        </DataTable>
                    </div>
                )}
            </Section>

            <PrescriptionModal
                isOpen={showPrescriptionModal}
                onClose={handleClosePrescriptionModal}
                isEditMode={isEditMode}
                medicationSearch={medicationSearch}
                setMedicationSearch={setMedicationSearch}
                dosage={dosage}
                setDosage={setDosage}
                availableStrengths={availableStrengths}
                selectedMedicineName={selectedMedicineName}
                selectedMedications={selectedMedications}
                setSelectedMedications={setSelectedMedications}
                medicineSuggestions={medicineSuggestions}
                isSearchingMedicines={isSearchingMedicines}
                isSaving={isSaving}
                onMedicineSearch={handleMedicineSearch}
                onMedicineSelect={handleMedicineSelect}
                onAddMedication={handleAddMedicationToList}
                onRemoveMedication={handleRemoveMedication}
                onUpdateField={handleUpdateMedicationField}
                onUpdateScheduleTime={handleUpdateScheduleTime}
                onSave={handleAddPrescription}
                hasValidScheduleTimes={hasValidScheduleTimes}
                hasChanges={hasChanges}
            />

            <VitalsCheckRequestModal
                isOpen={showVitalsModal}
                onClose={handleCloseVitalsModal}
                patientName={patientName}
                vitalPlan={vitalPlan ?? []}
                selectedVitals={selectedVitals}
                vitalsInstructions={vitalsInstructions}
                setVitalsInstructions={setVitalsInstructions}
                vitalsPreferences={vitalsPreferences}
                isSavingVitalPlan={isSavingVitalPlan}
                frequencyOptions={FREQUENCY_OPTIONS}
                durationOptions={DURATION_OPTIONS}
                vitalOptions={vitalOptions}
                onToggleVital={handleToggleVital}
                onUpdatePreference={handleUpdateVitalPreference}
                onSave={handleConfirmVitalsRequest}
            />
        </>
    )
}
export default MedicationTable
