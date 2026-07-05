import { CheckCircle2, CircleX, Clock4 } from 'lucide-react'

import styles from '../../pages/CaregiverPatients.module.css'
import type { MedicationLogFormState, MedicationSchedule } from '../../types/caregiver.types'

import Modal from '@/shared/components/Modal/Modal'

interface MedicationLogModalProps {
    isOpen: boolean
    onClose: () => void
    medication: MedicationSchedule | null
    formState: MedicationLogFormState
    setFormState: React.Dispatch<React.SetStateAction<MedicationLogFormState>>
    onSave: () => void
    isSaving: boolean
}

const MedicationLogModal = ({
    isOpen,
    onClose,
    medication,
    formState,
    setFormState,
    onSave,
    isSaving,
}: MedicationLogModalProps) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Log Medication"
        size="md"
        footer={
            <div className={styles.modalFooter}>
                <button type="button" className={styles.modalCancelBtn} onClick={onClose}>
                    Cancel
                </button>
                <button
                    type="button"
                    className={styles.modalSaveBtn}
                    disabled={isSaving || !formState.takenTime || !formState.route}
                    onClick={onSave}
                >
                    {isSaving ? 'Saving...' : 'Save Log'}
                </button>
            </div>
        }
    >
        {medication && (
            <div className={styles.medicationModalBody}>
                <div className={styles.modalFieldGrid}>
                    <label className={styles.modalField}>
                        <span className={styles.modalLabel}>Medication Selection</span>
                        <input className={styles.modalInput} value={medication.medicineName} readOnly />
                    </label>
                    <label className={styles.modalField}>
                        <span className={styles.modalLabel}>Dosage Amount</span>
                        <input className={styles.modalInput} value={medication.dosage} readOnly />
                    </label>
                </div>

                <div className={styles.statusSection}>
                    <span className={styles.modalLabel}>Medication Status</span>
                    <div className={styles.statusPillGroup}>
                        <button
                            type="button"
                            className={`${styles.statusPill} ${formState.status === 'on_time' ? styles.statusPillActive : ''}`}
                            onClick={() => setFormState((current) => ({ ...current, status: 'on_time' }))}
                        >
                            <CheckCircle2 size={18} />
                            On Time
                        </button>
                        <button
                            type="button"
                            className={`${styles.statusPill} ${formState.status === 'taken_late' ? styles.statusPillActive : ''}`}
                            onClick={() => setFormState((current) => ({ ...current, status: 'taken_late' }))}
                        >
                            <Clock4 size={18} />
                            Taken Late
                        </button>
                        <button
                            type="button"
                            className={`${styles.statusPill} ${formState.status === 'skipped' ? styles.statusPillActive : ''}`}
                            onClick={() => setFormState((current) => ({ ...current, status: 'skipped' }))}
                        >
                            <CircleX size={18} />
                            Skipped
                        </button>
                    </div>
                </div>

                <div className={styles.modalFieldGrid}>
                    <label className={styles.modalField}>
                        <span className={styles.modalLabel}>Taken Time</span>
                        <input
                            type="time"
                            className={styles.modalInput}
                            value={formState.takenTime}
                            onChange={(e) => setFormState((current) => ({ ...current, takenTime: e.target.value }))}
                        />
                    </label>
                    <label className={styles.modalField}>
                        <span className={styles.modalLabel}>Route</span>
                        <select
                            className={styles.modalSelect}
                            value={formState.route}
                            onChange={(e) => setFormState((current) => ({ ...current, route: e.target.value }))}
                        >
                            <option value="oral">Oral</option>
                            <option value="injection">Injection</option>
                            <option value="IV">IV</option>
                            <option value="inhalation">Inhalation</option>
                        </select>
                    </label>
                </div>

                <label className={styles.modalField}>
                    <span className={styles.modalLabel}>Observations</span>
                    <textarea
                        className={styles.modalTextarea}
                        placeholder="Provide context, triggers, or specific details..."
                        value={formState.observations}
                        onChange={(e) => setFormState((current) => ({ ...current, observations: e.target.value }))}
                    />
                </label>
            </div>
        )}
    </Modal>
)

export default MedicationLogModal
