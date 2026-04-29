import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import {
    DoctorAvailabilityPersistenceData,
    IDoctorAvailabilityRepository,
} from '../interfaces/doctor-availability.repository.interface'
import { DoctorAvailabilityModel } from '../models/doctorAvailability.model'
import { DoctorAvailabilityDocument } from '../types/doctor.types'

@injectable()
export class DoctorAvailabilityRepository implements IDoctorAvailabilityRepository {
    async findByDoctorId(doctorId: Types.ObjectId): Promise<DoctorAvailabilityDocument | null> {
        return DoctorAvailabilityModel.findOne({ doctorId }).lean()
    }

    async createOrUpdateByDoctorId(
        doctorId: Types.ObjectId,
        data: DoctorAvailabilityPersistenceData,
    ): Promise<DoctorAvailabilityDocument> {
        const availability = await DoctorAvailabilityModel.findOneAndUpdate(
            { doctorId },
            {
                ...data,
                doctorId,
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
        ).lean()

        if (!availability) {
            throw new Error('Doctor availability could not be created or updated')
        }

        return availability
    }
}
