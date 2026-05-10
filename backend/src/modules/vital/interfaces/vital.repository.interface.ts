import { VitalDocument, VitalType } from '../types/vital.types'

export interface IVitalRepository {
    create(data: Partial<VitalDocument>): Promise<VitalDocument>
    findById(id: string): Promise<VitalDocument | null>
    findByPatientId(patientId: string): Promise<VitalDocument[]>
    findByPatientIdAndType(patientId: string, type: VitalType): Promise<VitalDocument[]>
}
