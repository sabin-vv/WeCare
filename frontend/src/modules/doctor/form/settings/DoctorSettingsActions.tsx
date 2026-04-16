import type { DoctorSettingsActionsProps } from '../../types/doctor.types'
import styles from '../DoctorSettingsForm.module.css'

const DoctorSettingsActions = ({
    hasChanges,
    isSaving,
    isLoadingProfile,
    onDiscard,
    onSave,
}: DoctorSettingsActionsProps) => {
    return (
        <div className={styles.actions}>
            <button
                type="button"
                className={styles.ghostButton}
                onClick={onDiscard}
                disabled={!hasChanges || isSaving || isLoadingProfile}
            >
                Discard
            </button>
            <button
                type="button"
                className={styles.saveButton}
                onClick={onSave}
                disabled={!hasChanges || isSaving || isLoadingProfile}
            >
                {isSaving ? 'Saving Changes...' : 'Save All Changes'}
            </button>
        </div>
    )
}

export default DoctorSettingsActions
