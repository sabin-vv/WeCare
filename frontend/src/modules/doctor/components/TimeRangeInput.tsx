import { Trash2 } from 'lucide-react'

import type { TimeRangeInputProps } from '../types/doctor.types'

import styles from './TimeRangeInput.module.css'

const addMinutesToTime = (time: string, minutesToAdd: number) => {
    if (!time) return '00:00'
    const parts = time.split(':')
    if (parts.length < 2) return '00:00'

    const [hours, minutes] = parts.map(Number)
    const totalMinutes = hours * 60 + minutes + minutesToAdd
    const normalizedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
    const nextHours = Math.floor(normalizedMinutes / 60)
    const nextMinutes = normalizedMinutes % 60

    return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`
}

const toMinutes = (time: string) => {
    if (!time) return 0
    const parts = time.split(':')
    if (parts.length < 2) return 0

    const [hours, minutes] = parts.map(Number)
    return hours * 60 + minutes
}

const buildTimeOptions = (stepMinutes: number) => {
    const options = []

    for (let totalMinutes = 0; totalMinutes < 24 * 60; totalMinutes += stepMinutes) {
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        options.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
    }

    return options
}

const formatTimeLabel = (time: string) => {
    if (!time) return ''
    const parts = time.split(':')
    if (parts.length < 2) return ''

    const [hours, minutes] = parts.map(Number)
    const suffix = hours >= 12 ? 'PM' : 'AM'
    const normalizedHours = hours % 12 || 12

    return `${String(normalizedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`
}

const startTimeOptions = buildTimeOptions(15)
const lastEndTimeMinutes = 23 * 60 + 45
const buildEndTimeOptions = (startTime: string, slotDuration: number, maxEndTime?: string) => {
    const startTotalMinutes = toMinutes(startTime)
    const maxEndMinutes = maxEndTime ? Math.min(toMinutes(maxEndTime), lastEndTimeMinutes) : lastEndTimeMinutes
    const options = []

    for (
        let nextMinutes = startTotalMinutes + slotDuration;
        nextMinutes <= maxEndMinutes;
        nextMinutes += slotDuration
    ) {
        const hours = Math.floor(nextMinutes / 60)
        const minutes = nextMinutes % 60
        options.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
    }

    return options
}

const normalizeTime = (time: string) => {
    if (!time) return '00:00'
    const parts = time.split(':')
    if (parts.length < 2) return '00:00'
    const [h, m] = parts.map(Number)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const TimeRangeInput = ({ value, slotDuration, minStartTime, maxEndTime, onChange, onDelete }: TimeRangeInputProps) => {
    const vStart = normalizeTime(value.startTime)
    const vEnd = normalizeTime(value.endTime)

    const minStartMinutes = minStartTime ? toMinutes(minStartTime) : 0
    const maxStartMinutes = maxEndTime
        ? Math.min(toMinutes(maxEndTime), lastEndTimeMinutes) - slotDuration
        : lastEndTimeMinutes - slotDuration

    const availableStartTimeOptions = startTimeOptions.filter((option) => {
        const optionMinutes = toMinutes(option)
        return optionMinutes >= minStartMinutes && optionMinutes <= maxStartMinutes
    })

    const selectedStartTime = availableStartTimeOptions.includes(vStart)
        ? vStart
        : (availableStartTimeOptions[0] ?? vStart)

    const minimumEndTime = addMinutesToTime(selectedStartTime, slotDuration)
    const endTimeOptions = buildEndTimeOptions(selectedStartTime, slotDuration, maxEndTime)

    const selectedEndTime = endTimeOptions.includes(vEnd) ? vEnd : (endTimeOptions[0] ?? minimumEndTime)

    return (
        <div className={styles.wrapper}>
            <div className={styles.timeBox}>
                <select
                    value={selectedStartTime}
                    onChange={(e) => {
                        const nextStartTime = e.target.value
                        const nextEndTimeOptions = buildEndTimeOptions(nextStartTime, slotDuration, maxEndTime)
                        const nextMinimumEndTime = addMinutesToTime(nextStartTime, slotDuration)

                        onChange({
                            startTime: nextStartTime,
                            endTime: nextEndTimeOptions.includes(vEnd) ? vEnd : nextMinimumEndTime,
                        })
                    }}
                    aria-label="Start time"
                    className={`${styles.input} ${styles.select}`}
                >
                    {availableStartTimeOptions.map((option) => (
                        <option key={option} value={option}>
                            {formatTimeLabel(option)}
                        </option>
                    ))}
                </select>

                <span className={styles.separator}>to</span>

                <select
                    value={selectedEndTime}
                    onChange={(e) => onChange({ ...value, endTime: e.target.value })}
                    aria-label="End time"
                    className={`${styles.input} ${styles.select}`}
                >
                    {endTimeOptions.map((option) => (
                        <option key={option} value={option}>
                            {formatTimeLabel(option)}
                        </option>
                    ))}
                </select>
            </div>

            {onDelete && (
                <button type="button" onClick={onDelete} className={styles.deleteBtn} aria-label="Delete time range">
                    <Trash2 />
                </button>
            )}
        </div>
    )
}
export default TimeRangeInput
