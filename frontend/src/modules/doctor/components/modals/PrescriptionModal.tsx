import { ADMINISTRATION_ROUTE, DURATION, FREQUENCY, MEDICAL_PRIORITY } from '../../constants/prescriptions.Constants'
import type { SelectedMedication } from '../../types/doctor.types'
import styles from '../viewPatient/MedicationTable.module.css'

import Button from '@/shared/components/Button/Button'
import Modal from '@/shared/components/Modal/Modal'
import SearchField from '@/shared/components/SearchField/SearchField'
import SelectField from '@/shared/components/SelectField/SelectField'
import TimePicker from '@/shared/components/TimePicker/TimePicker'

interface PrescriptionModalProps {
    isOpen: boolean
    onClose: () => void
    isEditMode: boolean
    medicationSearch: string
    setMedicationSearch: (value: string) => void
    dosage: string
    setDosage: (value: string) => void
    availableStrengths: string[]
    selectedMedicineName: string
    selectedMedications: SelectedMedication[]
    setSelectedMedications: React.Dispatch<React.SetStateAction<SelectedMedication[]>>
    medicineSuggestions: string[]
    isSearchingMedicines: boolean
    isSaving: boolean
    onMedicineSearch: (query: string) => void
    onMedicineSelect: (name: string) => void
    onAddMedication: () => void
    onRemoveMedication: (id: string) => void
    onUpdateField: (medicationId: string, field: keyof SelectedMedication, value: string | number) => void
    onUpdateScheduleTime: (medicationId: string, timeId: string, newTime: string) => void
    onSave: () => void
    hasValidScheduleTimes: boolean
    hasChanges: boolean
}

const PrescriptionModal = ({
    isOpen,
    onClose,
    isEditMode,
    medicationSearch,
    setMedicationSearch,
    dosage,
    setDosage,
    availableStrengths,
    selectedMedicineName,
    selectedMedications,
    setSelectedMedications,
    medicineSuggestions,
    isSearchingMedicines,
    isSaving,
    onMedicineSearch,
    onMedicineSelect,
    onAddMedication,
    onRemoveMedication,
    onUpdateField,
    onUpdateScheduleTime,
    onSave,
    hasValidScheduleTimes,
    hasChanges,
}: PrescriptionModalProps) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditMode ? 'Edit Prescription' : 'Prescription'}
        size="lg"
        footer={
            <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={onClose} type="button">
                    Cancel
                </button>
                <button
                    className={styles.addPrescriptionBtn}
                    onClick={onSave}
                    disabled={selectedMedications.length === 0 || isSaving || !hasValidScheduleTimes || (isEditMode && !hasChanges)}
                    type="button"
                >
                    {isSaving ? 'Saving...' : isEditMode ? 'Update Prescription' : 'Add Prescription'}
                </button>
            </div>
        }
    >
        <div className={styles.modalContent}>
            <div className={styles.searchSection}>
                <div className={styles.searchField}>
                    <label className={styles.searchLabel}>Search Medication</label>
                    <SearchField
                        placeholder="Start typing medication name (e.g. Amoxicillin)"
                        value={medicationSearch}
                        onChange={setMedicationSearch}
                        onSearch={isEditMode ? undefined : onMedicineSearch}
                        suggestions={isEditMode ? [] : medicineSuggestions}
                        isLoading={isEditMode ? false : isSearchingMedicines}
                        onSelect={isEditMode ? undefined : onMedicineSelect}
                        disabled={isEditMode}
                    />
                </div>
                <div className={styles.dosageField}>
                    <label className={styles.dosageLabel}>Dosage</label>
                    <div className={styles.dosageRow}>
                        <SelectField
                            options={availableStrengths.map((s) => ({ label: s, value: s }))}
                            value={dosage}
                            onChange={(e) => {
                                setDosage(e.target.value)
                                if (isEditMode && selectedMedications.length > 0) {
                                    setSelectedMedications(
                                        selectedMedications.map((med, i) =>
                                            i === 0 ? { ...med, dosage: e.target.value } : med,
                                        ),
                                    )
                                }
                            }}
                            disabled={availableStrengths.length === 0}
                        />
                        {!isEditMode && (
                            <Button
                                onClick={onAddMedication}
                                disabled={!selectedMedicineName || !dosage}
                                className={styles.addMedicationBtn}
                            >
                                Add
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {selectedMedications.length > 0 && (
                <div className={styles.selectedMedicationsSection}>
                    <h3 className={styles.selectedMedicationsTitle}>
                        Selected Medications ({selectedMedications.length})
                    </h3>
                    {selectedMedications.map((medication) => (
                        <div key={medication.id} className={styles.medicationCard}>
                            <div className={styles.medicationHeader}>
                                <div>
                                    <h4 className={styles.medicationName}>
                                        {medication.name} ({medication.dosage})
                                    </h4>
                                </div>
                                <button
                                    className={styles.medicationRemoveBtn}
                                    onClick={() => onRemoveMedication(medication.id)}
                                    type="button"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className={styles.medicationGrid}>
                                <div className={styles.fieldGroup}>
                                    <SelectField
                                        label="Frequency"
                                        options={FREQUENCY}
                                        value={medication.frequency}
                                        onChange={(e) => onUpdateField(medication.id, 'frequency', e.target.value)}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Duration</label>
                                    <div className={styles.durationContainer}>
                                        <input
                                            type="number"
                                            className={`${styles.fieldInput} ${styles.durationInput}`}
                                            value={medication.duration}
                                            onChange={(e) =>
                                                onUpdateField(medication.id, 'duration', parseInt(e.target.value) || 0)
                                            }
                                        />
                                        <SelectField
                                            options={DURATION}
                                            value={medication.durationUnit}
                                            onChange={(e) => onUpdateField(medication.id, 'durationUnit', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.medicationGrid}>
                                <div className={styles.fieldGroup}>
                                    <SelectField
                                        label="Medication Priority"
                                        options={MEDICAL_PRIORITY}
                                        value={medication.priority}
                                        onChange={(e) => onUpdateField(medication.id, 'priority', e.target.value)}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <SelectField
                                        label="Administration Route"
                                        options={ADMINISTRATION_ROUTE}
                                        value={medication.route}
                                        onChange={(e) => onUpdateField(medication.id, 'route', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className={styles.scheduleTimesSection}>
                                <label className={styles.scheduleTimesLabel}>Schedule Times</label>
                                <div className={styles.scheduleTimesList}>
                                    {medication.scheduleTimes.map((time) => (
                                        <div key={time.id}>
                                            <TimePicker
                                                value={time.time}
                                                onChange={(newValue) => onUpdateScheduleTime(medication.id, time.id, newValue)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.instructionsSection}>
                                <label className={styles.instructionsLabel}>Instructions about Medication</label>
                                <textarea
                                    className={styles.instructionsInput}
                                    placeholder="e.g. Take with food, finish the entire course"
                                    value={medication.instructions || ''}
                                    onChange={(e) => onUpdateField(medication.id, 'instructions', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </Modal>
)

export default PrescriptionModal
