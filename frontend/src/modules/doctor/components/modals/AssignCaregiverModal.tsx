import styles from '../../pages/PatientViewPage.module.css'
import type { CaregiverOption } from '../../types/doctor.types'


import Modal from '@/shared/components/Modal/Modal'
import SearchField from '@/shared/components/SearchField/SearchField'

interface AssignCaregiverModalProps {
    isOpen: boolean
    onClose: () => void
    caregiverSearch: string
    setCaregiverSearch: (search: string) => void
    caregivers: CaregiverOption[]
    selectedCaregiver: CaregiverOption | null
    setSelectedCaregiver: (caregiver: CaregiverOption | null) => void
    isLoadingCaregivers: boolean
    isAssigningCaregiver: boolean
    onSearch: (search: string) => void
    onAssign: () => void
}

const AssignCaregiverModal = ({
    isOpen,
    onClose,
    caregiverSearch,
    setCaregiverSearch,
    caregivers,
    selectedCaregiver,
    setSelectedCaregiver,
    isLoadingCaregivers,
    isAssigningCaregiver,
    onSearch,
    onAssign,
}: AssignCaregiverModalProps) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Assign Caregiver"
        footer={
            <div className={styles.modalFooter}>
                <button type="button" className={styles.closeBtn} onClick={onClose}>
                    Cancel
                </button>
                <button
                    type="button"
                    className={styles.applyBtn}
                    onClick={onAssign}
                    disabled={!selectedCaregiver || isAssigningCaregiver}
                >
                    {isAssigningCaregiver ? 'Assigning...' : 'Assign'}
                </button>
            </div>
        }
    >
        <div className={styles.modalBody}>
            <div className={styles.searchWrapper}>
                <SearchField
                    placeholder="Search caregiver..."
                    value={caregiverSearch}
                    onChange={setCaregiverSearch}
                    onSearch={onSearch}
                    suggestions={caregivers.map((cg) => cg.fullName)}
                    isLoading={isLoadingCaregivers}
                    onSelect={(name) => {
                        const caregiver = caregivers.find((cg) => cg.fullName === name)
                        setSelectedCaregiver(caregiver || null)
                    }}
                />
            </div>
            {selectedCaregiver && (
                <div className={styles.selectedCaregiver}>
                    <p>
                        <strong>Selected:</strong> {selectedCaregiver.fullName}
                    </p>
                    <p>
                        <strong>Email:</strong> {selectedCaregiver.email}
                    </p>
                    <p>
                        <strong>Phone:</strong> {selectedCaregiver.phoneNumber}
                    </p>
                </div>
            )}
        </div>
    </Modal>
)

export default AssignCaregiverModal
