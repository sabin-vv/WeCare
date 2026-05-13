import { VitalDocument, VitalPlanDocument, VitalPlanStatus, VitalType } from '../types/vital.types'

export interface IVitalRepository {
    create(data: Partial<VitalDocument>): Promise<VitalDocument>
    findById(id: string): Promise<VitalDocument | null>
    findByPatientId(patientId: string): Promise<VitalDocument[]>
    findByPatientIdAndType(patientId: string, type: VitalType): Promise<VitalDocument[]>
    createVitalPlan(data: Partial<VitalPlanDocument>): Promise<VitalPlanDocument>
    findVitalPlansByPatientId(patientId: string): Promise<VitalPlanDocument[]>
    findVitalPlansByPatientIdAndStatus(patientId: string, status: VitalPlanStatus): Promise<VitalPlanDocument[]>
}
