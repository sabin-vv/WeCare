import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { toUserEntity } from '../../auth/mapper/auth.mapper'
import { UserRole } from '../../auth/types/auth.types'
import { IPatientRepository } from '../interfaces/patient.repository.interface'
import { IPatientService } from '../interfaces/patient.service.interface'
import { toPatientEntity } from '../mapper/patient.mapper'
import { PatientDocument } from '../types/patient.types'
import { RegisterPatientDTO } from '../validator/patient.schema'

const STARTING_ID = 1000

@injectable()
export class PatientService implements IPatientService {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
    ) {}

    private async generateNextPatientId(): Promise<string> {
        const lastId = await this._patientRepo.getLastPatientId()
        const nextNumber = lastId ? parseInt(lastId, 10) + 1 : STARTING_ID
        return String(nextNumber)
    }

    async registerPatient(dto: RegisterPatientDTO): Promise<PatientDocument> {
        const existing = await this._userRepo.findByEmail(dto.email)
        if (existing) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'User already exist')

        const userData = await toUserEntity(dto, UserRole.PATIENT)
        const user = await this._userRepo.create(userData)

        const patientId = await this.generateNextPatientId()
        const patientData = toPatientEntity(user._id, patientId, dto)
        return this._patientRepo.create(patientData)
    }
}
