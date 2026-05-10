import { PrescriptionDocument } from '../types/prescription.types'
import { CreatePrescriptionDTO, UpdatePrescriptionStatusDTO } from '../validator/prescription.schema'

export interface IPrescriptionService {
    createPrescription(doctorUserId: string, dto: CreatePrescriptionDTO): Promise<PrescriptionDocument>
    getPatientPrescriptions(patientId: string, status?: string): Promise<PrescriptionDocument[]>
    updatePrescriptionStatus(
        doctorUserId: string,
        prescriptionId: string,
        dto: UpdatePrescriptionStatusDTO,
    ): Promise<PrescriptionDocument>
}
