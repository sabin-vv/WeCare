import type { DayScheduleRowProps } from '../types/doctor.types'

import styles from './DayScheduleRow.module.css'
import TimeRangeInput from './TimeRangeInput'

import ToggleSwitch from '@/shared/components/ToggleSwitch/ToggleSwitch'

export const DayScheduleRow = ({
    data,
    slotDuration,
    canAddRange,
    onToggleAvailability,
    onRangeChange,
    onAddRange,
    onDeleteRange,
}: DayScheduleRowProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <ToggleSwitch checked={data.isAvailable} onChange={onToggleAvailability} />
                <span className={styles.day}>{data.day.slice(0, 1).toUpperCase() + data.day.slice(1)}</span>
            </div>

            <div className={styles.right}>
                {data.isAvailable ? (
                    <>
                        {data.timeRanges.map((range, i) => (
                            <div key={i} className={styles.rangeRow}>
                                <TimeRangeInput
                                    value={range}
                                    slotDuration={slotDuration}
                                    minStartTime={data.timeRanges[i - 1]?.endTime}
                                    maxEndTime={data.timeRanges[i + 1]?.startTime}
                                    onChange={(value) => onRangeChange(i, value)}
                                    onDelete={() => onDeleteRange(i)}
                                />
                            </div>
                        ))}

                        <button type="button" className={styles.addBtn} onClick={onAddRange} disabled={!canAddRange}>
                            +
                        </button>
                    </>
                ) : (
                    <span className={styles.inactive}>Not active</span>
                )}
            </div>
        </div>
    )
}
