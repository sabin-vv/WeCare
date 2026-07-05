import type { ReactNode } from 'react'

import styles from '../viewPatient/MedicationTable.module.css'

import Modal from '@/shared/components/Modal/Modal'
import SelectField from '@/shared/components/SelectField/SelectField'

type VitalPlanOptionId = 'blood_pressure' | 'heart_rate' | 'spo2' | 'blood_sugar'

interface VitalsCheckRequestModalProps {
    isOpen: boolean
    onClose: () => void
    patientName: string
    vitalPlan: string[]
    selectedVitals: VitalPlanOptionId[]
    vitalsInstructions: string
    setVitalsInstructions: (value: string) => void
    vitalsPreferences: Record<VitalPlanOptionId, { frequency: string; duration: string }>
    isSavingVitalPlan: boolean
    frequencyOptions: string[]
    durationOptions: string[]
    vitalOptions: Array<{ id: VitalPlanOptionId; label: string; icon: ReactNode; iconClassName: string }>
    onToggleVital: (vitalId: VitalPlanOptionId) => void
    onUpdatePreference: (vitalId: VitalPlanOptionId, field: 'frequency' | 'duration', value: string) => void
    onSave: () => void
}

const VitalsCheckRequestModal = ({
    isOpen,
    onClose,
    patientName,
    vitalPlan,
    selectedVitals,
    vitalsInstructions,
    setVitalsInstructions,
    vitalsPreferences,
    isSavingVitalPlan,
    frequencyOptions,
    durationOptions,
    vitalOptions,
    onToggleVital,
    onUpdatePreference,
    onSave,
}: VitalsCheckRequestModalProps) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Create Vitals Check Request"
        size="md"
        footer={
            <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={onClose} type="button">
                    Cancel
                </button>
                <button
                    className={styles.addPrescriptionBtn}
                    onClick={onSave}
                    disabled={selectedVitals.length === 0 || isSavingVitalPlan}
                    type="button"
                >
                    {isSavingVitalPlan ? 'Saving...' : 'Confirm'}
                </button>
            </div>
        }
    >
        <div className={styles.vitalsModalContent}>
            <p className={styles.vitalsSubtext}>{patientName} needs specific vital monitoring.</p>
            <div className={styles.vitalsStep}>
                <span className={styles.stepBadge}>1</span>
                <span className={styles.stepTitle}>Select Vitals to Monitor</span>
            </div>
            <div className={styles.vitalsOptionsGrid}>
                {vitalOptions.map((vital) => {
                    const isSelected = selectedVitals.includes(vital.id)
                    const isAlreadyActive = vitalPlan?.includes(vital.id)
                    return (
                        <button
                            key={vital.id}
                            type="button"
                            className={`${styles.vitalOptionCard} ${isSelected ? styles.vitalOptionCardActive : ''}`}
                            onClick={() => onToggleVital(vital.id)}
                            disabled={isAlreadyActive}
                        >
                            <div className={styles.vitalOptionTop}>
                                <span className={`${styles.vitalOptionIcon} ${vital.iconClassName}`}>
                                    {vital.icon}
                                </span>
                                {isAlreadyActive && <span className={styles.activeBadge}>Active</span>}
                            </div>
                            <span className={styles.vitalOptionLabel}>{vital.label}</span>
                        </button>
                    )
                })}
            </div>
            {selectedVitals.length > 0 && (
                <>
                    <div className={styles.vitalsStep}>
                        <span className={styles.stepBadge}>2</span>
                        <span className={styles.stepTitle}>Set Individual Monitoring Frequency</span>
                    </div>
                    <div className={styles.vitalsMonitorList}>
                        {vitalOptions
                            .filter((vital) => selectedVitals.includes(vital.id))
                            .map((vital) => (
                                <div key={vital.id} className={styles.vitalMonitorCard}>
                                    <div className={styles.vitalMonitorHeader}>
                                        <span className={`${styles.vitalOptionIcon} ${vital.iconClassName}`}>
                                            {vital.icon}
                                        </span>
                                        <span className={styles.vitalMonitorTitle}>{vital.label}</span>
                                    </div>
                                    <div className={styles.vitalMonitorFields}>
                                        <div className={styles.fieldGroup}>
                                            <SelectField
                                                label="Frequency"
                                                options={frequencyOptions.map((f) => ({ label: f, value: f }))}
                                                value={vitalsPreferences[vital.id].frequency}
                                                onChange={(e) => onUpdatePreference(vital.id, 'frequency', e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.fieldGroup}>
                                            <SelectField
                                                label="Duration"
                                                options={durationOptions.map((d) => ({ label: d, value: d }))}
                                                value={vitalsPreferences[vital.id].duration}
                                                onChange={(e) => onUpdatePreference(vital.id, 'duration', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                    <div className={styles.instructionsSection}>
                        <label className={styles.instructionsLabel}>Instructions for Nursing Staff (Optional)</label>
                        <textarea
                            className={styles.instructionsInput}
                            placeholder="e.g., Please wake patient if asleep for BP check..."
                            value={vitalsInstructions}
                            onChange={(e) => setVitalsInstructions(e.target.value)}
                        />
                    </div>
                </>
            )}
        </div>
    </Modal>
)

export default VitalsCheckRequestModal
