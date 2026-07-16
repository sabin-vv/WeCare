import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import ErrorField from '../ErrorField/ErrorField'

import styles from './TimePicker.module.css'
import type { TimePickerProps } from './TimePicker.types'

const to24 = (hour12: number, minute: string, period: 'AM' | 'PM'): string => {
    let h = hour12
    if (period === 'PM' && h !== 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${minute}`
}

const from24 = (value: string) => {
    const hasSuffix = /AM|PM/i.test(value)
    const cleaned = value.replace(/\s*(AM|PM)\s*$/i, '').trim()
    const [h, m] = cleaned.split(':').map(Number)
    const isPM = hasSuffix ? /PM/i.test(value) : h >= 12
    const hour12 = hasSuffix
        ? (isNaN(h) ? 12 : h === 0 ? 12 : h)
        : (isNaN(h) ? 12 : h === 0 ? 12 : h > 12 ? h - 12 : h)
    return { hour12, minute: isNaN(m) ? '00' : String(m).padStart(2, '0'), period: isPM ? 'PM' : 'AM' } as const
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const PERIODS = ['AM', 'PM'] as const

const toTotalMinutes = (hour12: number, minute: string, period: 'AM' | 'PM'): number => {
    let h = hour12
    if (period === 'PM' && h !== 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    return h * 60 + parseInt(minute)
}

const parseTimeBound = (time?: string): number | undefined => {
    if (!time) return undefined
    const [h, m] = time.split(':').map(Number)
    if (isNaN(h) || isNaN(m)) return undefined
    return h * 60 + m
}

const Column = ({
    items,
    selected,
    onSelect,
    itemWidth,
    disabledItems,
}: {
    items: readonly (string | number)[]
    selected: string | number
    onSelect: (item: string | number) => void
    itemWidth?: string
    disabledItems?: ReadonlySet<string | number>
}) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return
        const selectedEl = ref.current.querySelector(`[data-selected="true"]`) as HTMLElement | null
        if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'center', behavior: 'auto' })
        }
    }, [])

    return (
        <div className={styles.column} ref={ref} style={itemWidth ? { maxWidth: itemWidth } : undefined}>
            <div className={styles.columnPadding} />
            {items.map((item) => {
                const disabled = disabledItems?.has(item)
                return (
                    <button
                        key={item}
                        type="button"
                        data-selected={item === selected}
                        className={`${styles.columnItem} ${item === selected ? styles.columnItemSelected : ''} ${disabled ? styles.columnItemDisabled : ''}`}
                        onClick={() => !disabled && onSelect(item)}
                        disabled={disabled}
                    >
                        {item}
                    </button>
                )
            })}
            <div className={styles.columnPadding} />
        </div>
    )
}

const TimePicker = ({ value, onChange, placeholder = 'Select time', label, error, minTime, maxTime }: TimePickerProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const generatedId = useId()
    const [isOpen, setIsOpen] = useState(false)

    const parsed = value ? from24(value) : { hour12: 12, minute: '00', period: 'AM' as const }
    const [hour12, setHour12] = useState(parsed.hour12)
    const [minute, setMinute] = useState(parsed.minute)
    const [period, setPeriod] = useState<'AM' | 'PM'>(parsed.period)

    const minMinutes = parseTimeBound(minTime)
    const maxMinutes = parseTimeBound(maxTime)

    const disabledHours = new Set(
        HOURS.filter((h) => {
            if (minMinutes === undefined && maxMinutes === undefined) return false
            const h24 = period === 'PM' && h !== 12 ? h + 12 : period === 'AM' && h === 12 ? 0 : h
            const minPossible = h24 * 60
            const maxPossible = h24 * 60 + 59
            if (minMinutes !== undefined && maxPossible < minMinutes) return true
            if (maxMinutes !== undefined && minPossible > maxMinutes) return true
            return false
        }),
    )

    const disabledMinutes = new Set(
        MINUTES.filter((m) => {
            if (minMinutes === undefined && maxMinutes === undefined) return false
            const total = toTotalMinutes(hour12, m, period)
            if (minMinutes !== undefined && total < minMinutes) return true
            if (maxMinutes !== undefined && total > maxMinutes) return true
            return false
        }),
    )

    const disabledPeriods = new Set(
        PERIODS.filter((p) => {
            if (minMinutes === undefined && maxMinutes === undefined) return false
            const startH = p === 'AM' ? 0 : 12
            const endH = p === 'AM' ? 11 : 23
            const minPossible = startH * 60
            const maxPossible = endH * 60 + 59
            if (minMinutes !== undefined && maxPossible < minMinutes) return true
            if (maxMinutes !== undefined && minPossible > maxMinutes) return true
            return false
        }),
    )

    const commit = useCallback(
        (h: number, m: string, p: 'AM' | 'PM') => {
            onChange?.(to24(h, m, p))
        },
        [onChange],
    )

    useEffect(() => {
        if (!isOpen) {
            if (value) {
                const p = from24(value)
                setHour12(p.hour12)
                setMinute(p.minute)
                setPeriod(p.period)
            }
        } else {
            if (value) {
                const p = from24(value)
                let h = p.hour12
                let m = p.minute
                let per = p.period
                const total = toTotalMinutes(h, m, per)
                if (minMinutes !== undefined && total < minMinutes) {
                    const clampH = Math.floor(minMinutes / 60)
                    const clampM = String(minMinutes % 60).padStart(2, '0')
                    const clampPeriod = clampH < 12 ? 'AM' : 'PM'
                    const clampHour12 = clampH === 0 ? 12 : clampH > 12 ? clampH - 12 : clampH
                    h = clampHour12
                    m = clampM
                    per = clampPeriod as 'AM' | 'PM'
                } else if (maxMinutes !== undefined && total > maxMinutes) {
                    const clampH = Math.floor(maxMinutes / 60)
                    const clampM = String(maxMinutes % 60).padStart(2, '0')
                    const clampPeriod = clampH < 12 ? 'AM' : 'PM'
                    const clampHour12 = clampH === 0 ? 12 : clampH > 12 ? clampH - 12 : clampH
                    h = clampHour12
                    m = clampM
                    per = clampPeriod as 'AM' | 'PM'
                }
                setHour12(h)
                setMinute(m)
                setPeriod(per)
            }
        }
    }, [isOpen, value, minMinutes, maxMinutes])

    useEffect(() => {
        if (!isOpen) return
        const handlePointerDown = (event: MouseEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                commit(hour12, minute, period)
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handlePointerDown)
        return () => document.removeEventListener('mousedown', handlePointerDown)
    }, [isOpen, hour12, minute, period, commit])

    const handleDone = () => {
        commit(hour12, minute, period)
        setIsOpen(false)
    }

    const displayText = value
        ? (() => {
              const p = from24(value)
              return `${p.hour12}:${p.minute} ${p.period}`
          })()
        : ''

    return (
        <div className={styles.fieldWrapper}>
            {label && <label htmlFor={`${generatedId}-trigger`}>{label}</label>}
            <div className={styles.wrapper} ref={wrapperRef}>
                <button
                    type="button"
                    id={`${generatedId}-trigger`}
                    className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((o) => !o)}
                >
                    <span className={displayText ? styles.selectedText : styles.placeholder}>
                        {displayText || placeholder}
                    </span>
                    <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`} aria-hidden="true">
                        <ChevronDown size={16} />
                    </span>
                </button>

                {isOpen && (
                    <div className={styles.popover} role="dialog" aria-labelledby={`${generatedId}-trigger`}>
                        <div className={styles.columns}>
                            <Column
                                items={HOURS}
                                selected={hour12}
                                onSelect={(item) => setHour12(item as number)}
                                disabledItems={disabledHours}
                            />

                            <Column
                                items={MINUTES}
                                selected={minute}
                                onSelect={(item) => setMinute(item as string)}
                                disabledItems={disabledMinutes}
                            />
                            <Column
                                items={PERIODS}
                                selected={period}
                                onSelect={(item) => setPeriod(item as 'AM' | 'PM')}
                                itemWidth="60px"
                                disabledItems={disabledPeriods}
                            />
                        </div>
                        <button type="button" className={styles.doneBtn} onClick={handleDone}>
                            Done
                        </button>
                    </div>
                )}
            </div>
            <ErrorField error={error} />
        </div>
    )
}

export default TimePicker
