import { z } from 'zod'

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:mm format')

const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
}

const timeRangeSchema = z
    .object({
        startTime: timeSchema,
        endTime: timeSchema,
    })
    .refine((range) => toMinutes(range.endTime) > toMinutes(range.startTime), {
        message: 'End time must be after start time',
        path: ['endTime'],
    })

const weeklyScheduleSchema = z
    .object({
        day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        isAvailable: z.boolean(),
        timeRanges: z.array(timeRangeSchema),
    })
    .superRefine((schedule, ctx) => {
        if (!schedule.isAvailable && schedule.timeRanges.length > 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'Inactive days cannot have time ranges',
                path: ['timeRanges'],
            })
        }

        if (schedule.isAvailable && schedule.timeRanges.length === 0) {
            ctx.addIssue({
                code: 'custom',
                message: 'Available days must have at least one time range',
                path: ['timeRanges'],
            })
        }

        const sortedRanges = [...schedule.timeRanges].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))

        for (let index = 1; index < sortedRanges.length; index += 1) {
            const previousRange = sortedRanges[index - 1]
            const currentRange = sortedRanges[index]

            if (toMinutes(currentRange.startTime) < toMinutes(previousRange.endTime)) {
                ctx.addIssue({
                    code: 'custom',
                    message: `${schedule.day} has overlapping time ranges`,
                    path: ['timeRanges'],
                })
                break
            }
        }
    })

export const UpdateDoctorAvailabilitySchema = z
    .object({
        timezone: z.string().trim().min(1, 'Timezone is required'),
        weeklySchedule: z.array(weeklyScheduleSchema).length(7, 'Weekly schedule must include all 7 days'),
        slotDuration: z.union([z.literal(15), z.literal(30), z.literal(45), z.literal(60)]),
        startDate: z.string(),
        endDate: z.string(),
    })
    .superRefine((availability, ctx) => {
        const days = availability.weeklySchedule.map((schedule) => schedule.day)
        const uniqueDays = new Set(days)

        if (uniqueDays.size !== days.length) {
            ctx.addIssue({
                code: 'custom',
                message: 'Weekly schedule cannot contain duplicate days',
                path: ['weeklySchedule'],
            })
        }

        if (availability.startDate && availability.endDate && availability.endDate < availability.startDate) {
            ctx.addIssue({
                code: 'custom',
                message: 'End date must be after start date',
                path: ['endDate'],
            })
        }

        availability.weeklySchedule.forEach((schedule, scheduleIndex) => {
            schedule.timeRanges.forEach((range, rangeIndex) => {
                const duration = toMinutes(range.endTime) - toMinutes(range.startTime)

                if (duration % availability.slotDuration !== 0) {
                    ctx.addIssue({
                        code: 'custom',
                        message: 'Time range duration must align with slot duration',
                        path: ['weeklySchedule', scheduleIndex, 'timeRanges', rangeIndex],
                    })
                }
            })
        })
    })

export type UpdateDoctorAvailabilityDTO = z.infer<typeof UpdateDoctorAvailabilitySchema>
