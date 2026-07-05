import styles from '../../pages/CaregiverPatients.module.css'
import type { SymptomLogFormState, SymptomSeverity } from '../../types/caregiver.types'

import Modal from '@/shared/components/Modal/Modal'

interface SymptomLogModalProps {
    isOpen: boolean
    onClose: () => void
    formState: SymptomLogFormState
    setFormState: React.Dispatch<React.SetStateAction<SymptomLogFormState>>
    onSave: () => void
    isSaving: boolean
    symptomOptions: string[]
}

const SymptomLogModal = ({
    isOpen,
    onClose,
    formState,
    setFormState,
    onSave,
    isSaving,
    symptomOptions,
}: SymptomLogModalProps) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Log Symptom"
        size="sm"
        footer={
            <div className={styles.modalFooter}>
                <button type="button" className={styles.modalCancelBtn} onClick={onClose}>
                    Cancel
                </button>
                <button
                    type="button"
                    className={styles.modalSaveBtn}
                    disabled={isSaving || !formState.symptom || !formState.onsetTime}
                    onClick={onSave}
                >
                    {isSaving ? 'Saving...' : 'Save Log'}
                </button>
            </div>
        }
    >
        <div className={styles.symptomModalBody}>
            <div className={styles.modalFieldGrid}>
                <label className={styles.modalField}>
                    <span className={styles.modalLabel}>Select Symptom</span>
                    <select
                        className={styles.modalSelect}
                        value={formState.symptom}
                        onChange={(e) =>
                            setFormState((current) => ({
                                ...current,
                                symptom: e.target.value,
                            }))
                        }
                    >
                        {symptomOptions.map((symptom) => (
                            <option key={symptom} value={symptom}>
                                {symptom}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={styles.modalField}>
                    <span className={styles.modalLabel}>Onset Time</span>
                    <input
                        type="time"
                        className={styles.modalInput}
                        value={formState.onsetTime}
                        onChange={(e) =>
                            setFormState((current) => ({
                                ...current,
                                onsetTime: e.target.value,
                            }))
                        }
                    />
                </label>
            </div>

            <div className={styles.severitySection}>
                <span className={styles.modalLabel}>Severity Level</span>
                <div className={styles.severityGrid}>
                    {(['mild', 'moderate', 'severe', 'critical'] as SymptomSeverity[]).map((level) => (
                        <button
                            key={level}
                            type="button"
                            className={`${styles.severityPill} ${styles[`severity${level.charAt(0).toUpperCase() + level.slice(1)}`]} ${formState.severity === level ? styles.severityPillActive : ''}`}
                            onClick={() =>
                                setFormState((current) => ({
                                    ...current,
                                    severity: level,
                                }))
                            }
                        >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <label className={styles.modalField}>
                <span className={styles.modalLabel}>Detailed Observations</span>
                <textarea
                    className={styles.modalTextarea}
                    placeholder="Provide context, triggers, or specific details..."
                    value={formState.observations}
                    onChange={(e) =>
                        setFormState((current) => ({
                            ...current,
                            observations: e.target.value,
                        }))
                    }
                />
            </label>
        </div>
    </Modal>
)

export default SymptomLogModal
