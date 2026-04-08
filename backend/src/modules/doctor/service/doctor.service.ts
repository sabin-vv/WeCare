import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { IDoctorRepository } from '../interfaces/doctor.repository.interface'
import { IDoctorService } from '../interfaces/doctor.service.interface'
import { toDoctorEntity } from '../mapper/doctor.mapper'
import { DoctorDTO } from '../validator/registerDoctor.schema'

@injectable()
export class DoctorService implements IDoctorService {
    constructor(
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
    ) {}

    async createProfile(userId: string, dto: DoctorDTO) {
        const existingDoctor = await this._doctorRepo.findByUserId(new Types.ObjectId(userId))
        if (existingDoctor) {
            throw new AppError(HTTP_STATUS.CONFLICT, 'Doctor profile already exists')
        }

        const doctorData = toDoctorEntity(new Types.ObjectId(userId), dto)

        const doctor = await this._doctorRepo.create(doctorData)
        await this._userRepo.update(userId, { isProfileComplete: true })

        return doctor
    }
}
