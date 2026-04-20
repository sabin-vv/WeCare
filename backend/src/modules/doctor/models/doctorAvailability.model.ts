import { model, Schema } from 'mongoose'

import { DoctorAvailabilityDocument } from '../types/doctor.types'

const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const defaultWeeklySchedule = () =>
    weekDays.map((day) => ({
        day,
        isAvailable: false,
        timeRanges: [],
    }))

const timeRangeSchema = new Schema(
    {
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
    },
    { _id: false },
)

const weeklyScheduleSchema = new Schema(
    {
        day: {
            type: String,
            enum: weekDays,
            required: true,
        },
        isAvailable: {
            type: Boolean,
            required: true,
            default: false,
        },
        timeRanges: {
            type: [timeRangeSchema],
            default: [],
        },
    },
    { _id: false },
)

const doctorAvailabilitySchema = new Schema<DoctorAvailabilityDocument>(
    {
        doctorId: {
            type: Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true,
            unique: true,
            index: true,
        },
        timezone: {
            type: String,
            required: true,
            default: 'UTC',
        },
        weeklySchedule: {
            type: [weeklyScheduleSchema],
            default: defaultWeeklySchedule,
        } as never,
        slotDuration: {
            type: Number,
            enum: [15, 30, 45, 60],
            required: true,
            default: 15,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
    },
    { timestamps: true },
)

export const DoctorAvailabilityModel = model<DoctorAvailabilityDocument>('DoctorAvailability', doctorAvailabilitySchema)
