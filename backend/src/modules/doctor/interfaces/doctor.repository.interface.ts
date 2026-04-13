import { Types } from 'mongoose'

import { DoctorDocument } from '../types/doctor.types'

export interface IDoctorRepository {
    findByUserId(userId: Types.ObjectId): Promise<DoctorDocument | null>
    create(data: Partial<DoctorDocument>): Promise<DoctorDocument>
    updateByUserId(userId: Types.ObjectId, data: Partial<DoctorDocument>): Promise<DoctorDocument>
    createOrUpdateByUserId(userId: Types.ObjectId, data: Partial<DoctorDocument>): Promise<DoctorDocument>
}
