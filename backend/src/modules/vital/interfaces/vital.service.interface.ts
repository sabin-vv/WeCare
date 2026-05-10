import { VitalDocument } from '../types/vital.types'
import { CreateVitalDTO } from '../validator/vital.schema'

export interface IVitalService {
    createVital(recordedBy: string, dto: CreateVitalDTO): Promise<VitalDocument>
    getPatientVitals(patientId: string, type?: string): Promise<VitalDocument[]>
}
