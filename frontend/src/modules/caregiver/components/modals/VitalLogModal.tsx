import { Gauge } from 'lucide-react'

import styles from '../../pages/CaregiverPatients.module.css'
import type { VitalLogFormState, VitalScheduleItem } from '../../types/caregiver.types'

import Modal from '@/shared/components/Modal/Modal'

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

const labelMap: Record<string, string> = {
    blood_pressure: 'Blood Pressure',
    blood_sugar: 'Blood Sugar',
    heart_rate: 'Heart Rate',
    spo2: 'SpO2',
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
}: VitalLogModalProps) => (
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
            <label className={styles.modalField}>
                <span className={styles.modalLabel}>Vital Type</span>
                <select
                    className={styles.modalSelect}
                    value={formState.vitalType}
                    onChange={(e) => onVitalTypeChange(e.target.value)}
                >
                    {vitalSchedules.length > 0 ? (
                        [...new Set(vitalSchedules.map((s) => s.vitalType))].map((type) => (
                            <option key={type} value={type}>
                                {labelMap[type] || type}
                            </option>
                        ))
                    ) : (
                        <option value="blood_pressure">Blood Pressure</option>
                    )}
                </select>
            </label>

            {isBloodPressure ? (
                <div className={styles.vitalMeasureSection}>
                    <span className={styles.modalLabel}>Blood Pressure Measurement</span>
                    <div className={styles.bpGrid}>
                        <label className={styles.modalField}>
                            <span className={styles.measureLabel}>Systolic</span>
                            <div className={styles.unitInputWrap}>
                                <input
                                    className={styles.modalInput}
                                    value={formState.systolic}
                                    onChange={(e) =>
                                        setFormState((current) => ({
                                            ...current,
                                            systolic: e.target.value,
                                        }))
                                    }
                                />
                                <span className={styles.inputUnit}>mmHg</span>
                            </div>
                        </label>
                        <label className={styles.modalField}>
                            <span className={styles.measureLabel}>Diastolic</span>
                            <div className={styles.unitInputWrap}>
                                <input
                                    className={styles.modalInput}
                                    value={formState.diastolic}
                                    onChange={(e) =>
                                        setFormState((current) => ({
                                            ...current,
                                            diastolic: e.target.value,
                                        }))
                                    }
                                />
                                <span className={styles.inputUnit}>mmHg</span>
                            </div>
                        </label>
                    </div>
                    <span className={styles.rangeHint}>Normal range: 90-120 systolic / 60-80 diastolic</span>
                </div>
            ) : (
                <label className={styles.modalField}>
                    <span className={styles.modalLabel}>{selectedVitalLabel} Measurement</span>
                    <div className={styles.singleMeasureWrap}>
                        <Gauge size={18} className={styles.measureIcon} />
                        <input
                            className={styles.measureInput}
                            value={formState.value}
                            onChange={(e) => setFormState((current) => ({ ...current, value: e.target.value }))}
                            placeholder={`Enter ${selectedVitalLabel.toLowerCase()}`}
                        />
                        <span className={styles.measureUnit}>{selectedVitalUnit}</span>
                    </div>
                </label>
            )}

            <label className={styles.modalField}>
                <span className={styles.modalLabel}>Recorded At</span>
                <input
                    type="time"
                    className={styles.modalInput}
                    value={formState.recordedAt}
                    onChange={(e) => setFormState((current) => ({ ...current, recordedAt: e.target.value }))}
                />
            </label>

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

export default VitalLogModal
