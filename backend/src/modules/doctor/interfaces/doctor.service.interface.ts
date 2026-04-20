import { DoctorAvailability, DoctorDocument, DoctorProfileResponse } from '../types/doctor.types'
import { DoctorDTO } from '../validator/registerDoctor.schema'
import { UpdateDoctorAvailabilityDTO } from '../validator/updateDoctorAvailability.schema'
import { UpdateDoctorSettingsDTO } from '../validator/updateDoctorSettings.schema'

export interface IDoctorService {
    createProfile(userId: string, dto: DoctorDTO): Promise<DoctorDocument>
    getProfile(userId: string): Promise<DoctorProfileResponse>
    updateProfile(userId: string, dto: UpdateDoctorSettingsDTO): Promise<DoctorProfileResponse>
    getAvailability(userId: string): Promise<DoctorAvailability>
    updateAvailability(userId: string, dto: UpdateDoctorAvailabilityDTO): Promise<DoctorAvailability>
}
