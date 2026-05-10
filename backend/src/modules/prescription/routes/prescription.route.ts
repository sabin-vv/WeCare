import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { PrescriptionController } from '../controller/prescription.controller'
import { createPrescriptionSchema, updatePrescriptionStatusSchema } from '../validator/prescription.schema'

export const createPrescriptionRoutes = () => {
    const router = Router()
    const prescriptionController = container.resolve(PrescriptionController)

    router.use(requireAuth)

    router.post('/', validate(createPrescriptionSchema), prescriptionController.createPrescription)
    router.get('/patient/:patientId', prescriptionController.getPatientPrescriptions)
    router.patch(
        '/:prescriptionId/status',
        validate(updatePrescriptionStatusSchema),
        prescriptionController.updatePrescriptionStatus,
    )

    return router
}
