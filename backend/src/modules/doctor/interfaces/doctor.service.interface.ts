import { DoctorDocument } from '../types/doctor.types'
import { DoctorDTO } from '../validator/registerDoctor.schema'

export interface IDoctorService {
    createProfile(userId: string, dto: DoctorDTO): Promise<DoctorDocument>
}
