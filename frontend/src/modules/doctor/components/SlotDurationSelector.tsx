import type { SlotDurationSelctorProps } from '../types/doctor.types'

import styles from './SlotDurationSelector.module.css'

const default_options = [15, 30, 45, 60]

export const SlotDurationSelector = ({ value, onChange, options = default_options }: SlotDurationSelctorProps) => {
    return (
        <div className={styles.container}>
            {options.map((opt) => (
                <button
                    type="button"
                    key={opt}
                    className={`${styles.btn} ${value === opt ? styles.active : ''}`}
                    onClick={() => onChange(opt)}
                >
                    {opt}m
                </button>
            ))}
        </div>
    )
}
