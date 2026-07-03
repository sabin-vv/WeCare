import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { ICaregiverRepository } from '../../caregiver/interfaces/caregiver.repository.interface'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { IMedicalRecordRepository } from '../../medicalRecord/interfaces/medicalRecord.repository.interface'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'

@injectable()
export class PatientTool {
    constructor(
        @inject(TOKENS.IPatientRepository) private readonly _patientRepo: IPatientRepository,
        @inject(TOKENS.IUserRepository) private readonly _userRepo: IUserRepository,
        @inject(TOKENS.IDoctorRepository) private readonly _doctorRepo: IDoctorRepository,
        @inject(TOKENS.ICaregiverRepository) private readonly _caregiverRepo: ICaregiverRepository,
        @inject(TOKENS.IMedicalRecordRepository) private readonly _medicalRecordRepo: IMedicalRecordRepository,
    ) {}

    async getProfile(userId: string): Promise<string | null> {
        const user = await this._userRepo.findById(userId)
        if (!user) return null

        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) return null

        return `Name: ${user.name} | Email: ${user.email} | DOB: ${new Date(patient.dateOfBirth).toLocaleDateString()} | Gender: ${patient.gender} | ID: ${patient.patientId}`
    }

    async getCareTeam(userId: string): Promise<string | null> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) return null

        const parts: string[] = []

        if (patient.primaryDoctorId) {
            const doctor = await this._doctorRepo.findById(patient.primaryDoctorId.toString())
            if (doctor) {
                const doctorUser = await this._userRepo.findById(doctor.userId.toString())
                if (doctorUser) {
                    parts.push(`Primary Doctor: ${doctorUser.name}`)
                }
            }
        }

        if (patient.caregiverId) {
            const caregiver = await this._caregiverRepo.findById(patient.caregiverId.toString())
            if (caregiver) {
                const caregiverUser = await this._userRepo.findById(caregiver.userId.toString())
                if (caregiverUser) {
                    parts.push(`Caregiver: ${caregiverUser.name}`)
                }
            }
        }

        return parts.length ? parts.join(' | ') : null
    }

    async getConditions(userId: string): Promise<string | null> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) return null

        const parts: string[] = []
        if (patient.conditions?.length) parts.push(`Conditions: ${patient.conditions.join(', ')}`)
        if (patient.clinicalStatus) parts.push(`Status: ${patient.clinicalStatus}`)
        if (patient.riskLevel) parts.push(`Risk: ${patient.riskLevel}`)

        return parts.length ? parts.join(' | ') : null
    }

    async getAllergies(userId: string): Promise<string | null> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) return null

        const record = await this._medicalRecordRepo.findByPatientId(patient._id.toString())
        if (!record?.allergies?.length) return null

        return record.allergies.join(', ')
    }

    async getContext(userId: string): Promise<string | null> {
        return this.getProfile(userId)
    }
}
