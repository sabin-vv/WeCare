import { Types } from 'mongoose'

import { AppointmentDocument } from '../../appointment/types/appointment.types'
import { UserDocument } from '../../auth/types/auth.types'
import { ListPatientMapper, PatientDocument, PatientEntity, PatientProfileResponseDTO } from '../types/patient.types'
import { RegisterPatientDTO } from '../validator/patient.schema'

export interface PatientResponseDTO {
    id: string
    userId: string
    patientId: string
    dateOfBirth: string
    gender: string
    profileImage?: string
    isActive: boolean
}

export const toPatientEntity = (userId: Types.ObjectId, patientId: string, dto: RegisterPatientDTO): PatientEntity => {
    return {
        userId,
        patientId,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
    }
}

export const toPatientResponseDTO = (user: UserDocument, patient: PatientDocument): PatientResponseDTO => {
    return {
        id: patient._id.toString(),
        userId: patient.userId.toString(),
        patientId: patient.patientId,
        dateOfBirth: patient.dateOfBirth.toISOString(),
        gender: patient.gender,
        profileImage: patient.profileImage,
        isActive: user.isActive,
    }
}

export const toPatientProfileResponseDTO = (
    user: UserDocument,
    patient: PatientDocument,
): PatientProfileResponseDTO => {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        patientId: patient.patientId,
        dateOfBirth: patient.dateOfBirth.toISOString(),
        gender: patient.gender,
        conditions: patient.conditions ?? [],
        profileImage: patient.profileImage,
        isActive: user.isActive,
    }
}

export const toListPatientsMapper = (
    user: UserDocument,
    patient: PatientDocument,
    appointment: AppointmentDocument | null,
    caregiver: UserDocument | null,
): ListPatientMapper => {
    const status =
        appointment?.status === 'pending_payment' || appointment?.status === 'confirmed'
            ? 'pending_consultation'
            : appointment?.status || patient.clinicalStatus || patient.accountStatus || 'active'

    return {
        patientId: patient.patientId,
        name: user.name,
        profileImage: patient.profileImage,
        conditions: patient.conditions || [],
        riskLevel: patient.riskLevel || 'NILL',
        caregiver: caregiver?.name || 'Unassigned',
        status,
    }
}
