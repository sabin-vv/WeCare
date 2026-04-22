import { PatientResponseDTO } from '../mapper/patient.mapper'
import { RegisterPatientDTO } from '../validator/patient.schema'

export interface IPatientService {
    registerPatient(dto: RegisterPatientDTO): Promise<PatientResponseDTO>
}
