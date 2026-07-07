import { Gauge } from 'lucide-react'

import { VITAL_LABEL_MAP } from '../../constants/caregiver.constants'
import styles from '../../pages/CaregiverPatients.module.css'
import type { VitalLogFormState, VitalScheduleItem } from '../../types/caregiver.types'

import InputField from '@/shared/components/InputField/InputField'
import Modal from '@/shared/components/Modal/Modal'
import SelectField from '@/shared/components/SelectField/SelectField'
import TimePicker from '@/shared/components/TimePicker/TimePicker'

interface VitalLogModalProps {
    isOpen: boolean
    onClose: () => void
    formState: VitalLogFormState
    setFormState: React.Dispatch<React.SetStateAction<VitalLogFormState>>
    onSave: () => void
    isSaving: boolean
    vitalSchedules: VitalScheduleItem[]
    isBloodPressure: boolean
    selectedVitalLabel: string
    selectedVitalUnit: string
    onVitalTypeChange: (nextType: string) => void
}

const VitalLogModal = ({
    isOpen,
    onClose,
    formState,
    setFormState,
    onSave,
    isSaving,
    vitalSchedules,
    isBloodPressure,
    selectedVitalLabel,
    selectedVitalUnit,
    onVitalTypeChange,
}: VitalLogModalProps) => {
    const vitalTypeOptions =
        vitalSchedules.length > 0
            ? [...new Set(vitalSchedules.map((s) => s.vitalType))].map((type) => ({
                  label: VITAL_LABEL_MAP[type] || type,
                  value: type,
              }))
            : [{ label: 'Blood Pressure', value: 'blood_pressure' }]

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Log Vital Reading"
            size="sm"
            footer={
                <div className={styles.modalFooter}>
                    <button type="button" className={styles.modalCancelBtn} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={styles.modalSaveBtn}
                        disabled={
                            isSaving ||
                            !formState.vitalType ||
                            !formState.recordedAt ||
                            (isBloodPressure ? !formState.systolic || !formState.diastolic : !formState.value)
                        }
                        onClick={onSave}
                    >
                        {isSaving ? 'Saving...' : 'Save Reading'}
                    </button>
                </div>
            }
        >
            <div className={styles.vitalModalBody}>
                <SelectField
                    label="Vital Type"
                    options={vitalTypeOptions}
                    value={formState.vitalType}
                    onChange={(e) => onVitalTypeChange(e.target.value)}
                />

                {isBloodPressure ? (
                    <div className={styles.vitalMeasureSection}>
                        <span className={styles.modalLabel}>Blood Pressure Measurement</span>
                        <div className={styles.bpGrid}>
                            <InputField
                                label="Systolic"
                                value={formState.systolic}
                                onChange={(e) =>
                                    setFormState((current) => ({
                                        ...current,
                                        systolic: e.target.value.replace(/\D/g, ''),
                                    }))
                                }
                                suffix="mmHg"
                            />
                            <InputField
                                label="Diastolic"
                                value={formState.diastolic}
                                onChange={(e) =>
                                    setFormState((current) => ({
                                        ...current,
                                        diastolic: e.target.value.replace(/\D/g, ''),
                                    }))
                                }
                                suffix="mmHg"
                            />
                        </div>
                    </div>
                ) : (
                    <label className={styles.modalField}>
                        <InputField
                            label={`${selectedVitalLabel} Measurement`}
                            icon={<Gauge size={18} color="#2b86f6" />}
                            value={formState.value}
                            suffix={selectedVitalUnit}
                            onChange={(e) =>
                                setFormState((current) => ({ ...current, value: e.target.value.replace(/\D/g, '') }))
                            }
                            placeholder={`Enter ${selectedVitalLabel.toLowerCase()} value`}
                        />
                    </label>
                )}

                <TimePicker
                    label="Recorded At"
                    value={formState.recordedAt}
                    onChange={(value) => setFormState((current) => ({ ...current, recordedAt: value }))}
                />

                <label className={styles.modalField}>
                    <span className={styles.modalLabel}>Observation / Notes</span>
                    <textarea
                        className={styles.modalTextarea}
                        placeholder="Optional: patient seated for 5 minutes, right arm measurement..."
                        value={formState.notes}
                        onChange={(e) => setFormState((current) => ({ ...current, notes: e.target.value }))}
                    />
                </label>
            </div>
        </Modal>
    )
}

export default VitalLogModal
