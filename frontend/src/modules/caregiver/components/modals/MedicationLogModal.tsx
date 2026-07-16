import { CheckCircle2, CircleX, Clock4 } from 'lucide-react'

import { ROUTE_OPTIONS } from '../../constants/caregiver.constants'
import styles from '../../pages/CaregiverPatients.module.css'
import type { MedicationLogFormState, MedicationSchedule } from '../../types/caregiver.types'

import InputField from '@/shared/components/InputField/InputField'
import Modal from '@/shared/components/Modal/Modal'
import SelectField from '@/shared/components/SelectField/SelectField'
import TimePicker from '@/shared/components/TimePicker/TimePicker'

interface MedicationLogModalProps {
    isOpen: boolean
    onClose: () => void
    medication: MedicationSchedule | null
    formState: MedicationLogFormState
    setFormState: React.Dispatch<React.SetStateAction<MedicationLogFormState>>
    onSave: () => void
    isSaving: boolean
}

const nowString = () => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
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
        size="sm"
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
                    <InputField label="Medicine Name" value={medication.medicineName} readOnly />
                    <InputField label="Dosage Amount" value={medication.dosage} readOnly />
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
                    <TimePicker
                        label="Taken Time"
                        value={formState.takenTime}
                        onChange={(value) => setFormState((current) => ({ ...current, takenTime: value }))}
                        maxTime={nowString()}
                    />

                    <SelectField
                        label="Route"
                        options={ROUTE_OPTIONS}
                        onChange={(e) => setFormState((current) => ({ ...current, route: e.target.value }))}
                    />
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
