import { PatientProfileResponseDTO, PatientResponseDTO } from '../mapper/patient.mapper'
import { RegisterPatientDTO } from '../validator/patient.schema'
import { UpdatePatientSettingsDTO } from '../validator/updatePatientSettings.schema'

export interface IPatientService {
    registerPatient(dto: RegisterPatientDTO): Promise<PatientResponseDTO>
    getProfile(userId: string): Promise<PatientProfileResponseDTO>
    updateProfile(userId: string, dto: UpdatePatientSettingsDTO): Promise<PatientProfileResponseDTO>
}
