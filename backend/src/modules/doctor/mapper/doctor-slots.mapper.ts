import { DoctorAvailabilityDocument, DoctorSlotsResponse, WeeklySchedule } from '../types/doctor.types'

const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
}

const fromMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

const generateSlots = (schedule: WeeklySchedule, slotDuration: number): DoctorSlotsResponse['slots'] => {
    if (!schedule.isAvailable || schedule.timeRanges.length === 0) {
        return []
    }

    const slots: DoctorSlotsResponse['slots'] = []

    for (const range of schedule.timeRanges) {
        let currentMinutes = toMinutes(range.startTime)
        const endMinutes = toMinutes(range.endTime)

        while (currentMinutes + slotDuration <= endMinutes) {
            slots.push({
                start: fromMinutes(currentMinutes),
                end: fromMinutes(currentMinutes + slotDuration),
                available: true,
            })
            currentMinutes += slotDuration
        }
    }

    return slots
}

export const toDoctorSlotsResponse = (
    doctorId: string,
    date: string,
    availability: DoctorAvailabilityDocument | null,
): DoctorSlotsResponse => {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as WeeklySchedule['day']

    const schedule = availability?.weeklySchedule.find((s) => s.day === dayOfWeek) || {
        day: dayOfWeek,
        isAvailable: false,
        timeRanges: [],
    }

    const slotDuration = availability?.slotDuration || 15

    const slots = generateSlots(schedule, slotDuration)

    return {
        doctorId,
        date,
        timezone: availability?.timezone || 'UTC',
        slotDuration,
        slots,
    }
}
