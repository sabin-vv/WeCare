import styles from '../../pages/CaregiverReminders.module.css'
import type { CreateReminderDTO } from '../../types/caregiver.types'

import DateTimePicker from '@/shared/components/DateTimePicker/DateTimePicker'
import InputField from '@/shared/components/InputField/InputField'
import Modal from '@/shared/components/Modal/Modal'

interface CreateReminderModalProps {
    isOpen: boolean
    onClose: () => void
    formState: CreateReminderDTO
    setFormState: React.Dispatch<React.SetStateAction<CreateReminderDTO>>
    onSave: () => void
    isSaving: boolean
    patientName: string
}

const priorityOptions: { value: 'low' | 'medium' | 'high'; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
]

const CreateReminderModal = ({
    isOpen,
    onClose,
    formState,
    setFormState,
    onSave,
    isSaving,
    patientName,
}: CreateReminderModalProps) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Create Reminder"
        size="sm"
        footer={
            <>
                <button type="button" className={styles.modalCancelBtn} onClick={onClose}>
                    Cancel
                </button>
                <button
                    type="button"
                    className={styles.modalSaveBtn}
                    disabled={!formState.title.trim() || !formState.scheduleTime || isSaving}
                    onClick={onSave}
                >
                    {isSaving ? 'Saving...' : 'Create'}
                </button>
            </>
        }
    >
        <div className={styles.modalBody}>
            {patientName && <InputField label="Patient" value={patientName} readOnly />}

            <InputField
                label="Title *"
                value={formState.title}
                placeholder="Type reminder title"
                onChange={(e) => setFormState((f) => ({ ...f, title: e.target.value }))}
            />

            <label className={styles.textareaField}>
                <span className={styles.modalLabel}>Description</span>
                <textarea
                    className={styles.modalTextarea}
                    value={formState.description ?? ''}
                    placeholder="Optional note"
                    onChange={(e) => setFormState((f) => ({ ...f, description: e.target.value }))}
                />
            </label>
            <DateTimePicker
                label="Date & time *"
                value={
                    formState.scheduleTime
                        ? {
                              date: formState.scheduleTime.split('T')[0],
                              time: formState.scheduleTime.split('T')[1],
                          }
                        : undefined
                }
                minDate={new Date()}
                onChange={(val) =>
                    setFormState((f) => ({
                        ...f,
                        scheduleTime: `${val.date}T${val.time}`,
                    }))
                }
            />

            <span className={styles.modalLabel}>Priority</span>
            <div className={styles.priorityRow}>
                {priorityOptions.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        className={`${styles.priorityBtn} ${formState.priority === opt.value ? styles.priorityBtnActive : ''}`}
                        onClick={() => setFormState((f) => ({ ...f, priority: opt.value }))}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    </Modal>
)

export default CreateReminderModal
