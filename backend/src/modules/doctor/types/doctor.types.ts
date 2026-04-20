import { Document, Types } from 'mongoose'

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface TimeRange {
    startTime: string
    endTime: string
}

export interface WeeklySchedule {
    day: WeekDay
    isAvailable: boolean
    timeRanges: TimeRange[]
}

export interface DoctorAvailability {
    timezone: string
    weeklySchedule: WeeklySchedule[]
    slotDuration: number
    startDate: string
    endDate: string
}

export interface DoctorAvailabilityDocument extends Document {
    doctorId: Types.ObjectId
    timezone: string
    weeklySchedule: WeeklySchedule[]
    slotDuration: number
    startDate?: Date
    endDate?: Date
}

export interface DoctorSpecialization {
    name: string
    documentImage: string
}

export interface DoctorEntity {
    userId: Types.ObjectId
    medicalCertificateNumber: string
    medicalCouncilRegisterNumber: string

    specializations: DoctorSpecialization[]

    govIdImage: string
    profileImage: string
    medicalCertificateImage: string
    medicalCouncilImage: string
}

type specialization = {
    name: string
    verified?: boolean
    documentImage: string
}

type verificationStataus = 'pending' | 'verified' | 'rejected'

export interface DoctorDocument extends Document {
    userId: Types.ObjectId
    medicalCertificateNumber: string
    medicalCouncilRegisterNumber: string

    specializations: specialization[]

    verificationStatus: verificationStataus
    verifiedBy: Types.ObjectId
    verifiedAt: Date
    rejectReason: string

    govIdImage: string
    profileImage: string
    medicalCouncilImage: string
    medicalCertificateImage: string

    consultationFee: number
    isActive: boolean
}

export interface DoctorProfileResponse {
    id: string
    fullName: string
    email: string
    phoneNumber: string
    profileImage?: string
    professionalTitle?: string
    consultationFee: number
    medicalLicenseNumber: string
    medicalCouncilRegistrationNumber: string
    experienceCertificatesCount: number
    isActive: boolean
    verificationStatus: verificationStataus
}
