import { Types } from 'mongoose'

import { PatientEntity } from '../types/patient.types'
import { RegisterPatientDTO } from '../validator/patient.schema'

export const toPatientEntity = (userId: Types.ObjectId, patientId: string, dto: RegisterPatientDTO): PatientEntity => {
    return {
        userId,
        patientId,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
        mobile: dto.mobile,
    }
}


