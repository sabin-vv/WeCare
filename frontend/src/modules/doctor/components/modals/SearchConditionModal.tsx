import styles from '../../pages/PatientViewPage.module.css'
import { type RiskLevel } from '../../types/doctor.types'

import type { ConditionResult } from '@/modules/doctor/api/conditionsApi'
import Modal from '@/shared/components/Modal/Modal'
import SearchField from '@/shared/components/SearchField/SearchField'

interface SearchConditionModalProps {
    isOpen: boolean
    onClose: () => void
    conditionQuery: string
    setConditionQuery: (query: string) => void
    selectedConditions: ConditionResult[]
    selectedSeverity: RiskLevel | ''
    setSelectedSeverity: (severity: RiskLevel | '') => void
    conditionSuggestions: ConditionResult[]
    isSearchingConditions: boolean
    isApplyingCondition: boolean
    severityOptions: Array<{ label: string; value: RiskLevel }>
    onSearch: (query: string) => void
    onSelect: (name: string) => void
    onRemove: (name: string) => void
    onApply: () => void
}

const SearchConditionModal = ({
    isOpen,
    onClose,
    conditionQuery,
    setConditionQuery,
    selectedConditions,
    selectedSeverity,
    setSelectedSeverity,
    conditionSuggestions,
    isSearchingConditions,
    isApplyingCondition,
    severityOptions,
    onSearch,
    onSelect,
    onRemove,
    onApply,
}: SearchConditionModalProps) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Search Condition"
        footer={
            <div className={styles.modalFooter}>
                <button type="button" className={styles.closeBtn} onClick={onClose}>
                    Cancel
                </button>
                <button
                    type="button"
                    className={styles.applyBtn}
                    onClick={onApply}
                    disabled={selectedConditions.length === 0 || !selectedSeverity || isApplyingCondition}
                >
                    {isApplyingCondition ? 'Saving...' : 'Apply'}
                </button>
            </div>
        }
    >
        <div className={styles.modalBody}>
            <div className={styles.searchWrapper}>
                <SearchField
                    placeholder="Search condition..."
                    value={conditionQuery}
                    onChange={setConditionQuery}
                    onSearch={onSearch}
                    suggestions={conditionSuggestions.map((condition) => condition.name)}
                    isLoading={isSearchingConditions}
                    onSelect={onSelect}
                />
            </div>
            {selectedConditions.length > 0 && (
                <div className={styles.selectedCondition}>
                    <div className={styles.conditionChips}>
                        {selectedConditions.map((condition) => (
                            <button
                                key={condition.name}
                                type="button"
                                className={styles.conditionChip}
                                onClick={() => onRemove(condition.name)}
                            >
                                {condition.name}
                                <span className={styles.conditionChipRemove}>x</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div className={styles.severitySection}>
                <span className={styles.severityLabel}>Overall Severity Level</span>
                <div className={styles.severityOptions}>
                    {severityOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={`${styles.severityBtn} ${
                                selectedSeverity === option.value ? styles.severityBtnActive : ''
                            }`}
                            onClick={() => setSelectedSeverity(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </Modal>
)

export default SearchConditionModal
