import { Types } from 'mongoose'

import { DoctorEntity } from '../types/doctor.types'
import { DoctorDTO } from '../validator/registerDoctor.schema'

export const toDoctorEntity = (userId: Types.ObjectId, dto: DoctorDTO): DoctorEntity => {
    return {
        userId,
        medicalCertificateNumber: dto.medicalCertificateNumber,
        medicalCouncilRegisterNumber: dto.medicalCouncilRegisterNumber,

        specializations: dto.specializations.map((spec, index) => ({
            name: spec.name,
            documentImage: dto.specializationDocumentKeys?.[index] ?? '',
        })),

        govIdImage: dto.govIdImage ?? '',
        profileImage: dto.profileImage ?? '',
        medicalCertificateImage: dto.medicalCertificateImage ?? '',
        medicalCouncilImage: dto.medicalCouncilImage ?? '',
    }
}