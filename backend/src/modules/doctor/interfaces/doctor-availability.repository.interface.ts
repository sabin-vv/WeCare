import { Types } from 'mongoose'

import { DoctorAvailabilityDocument, WeeklySchedule } from '../types/doctor.types'

export interface DoctorAvailabilityPersistenceData {
    timezone: string
    weeklySchedule: WeeklySchedule[]
    slotDuration: number
    startDate?: Date
    endDate?: Date
}

export interface IDoctorAvailabilityRepository {
    findByDoctorId(doctorId: Types.ObjectId): Promise<DoctorAvailabilityDocument | null>
    createOrUpdateByDoctorId(
        doctorId: Types.ObjectId,
        data: DoctorAvailabilityPersistenceData,
    ): Promise<DoctorAvailabilityDocument>
}
