import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { MedicationController } from '../controller/medication.controller'

export const createMedicationRoutes = () => {
    const router = Router()
    const medicationController = container.resolve(MedicationController)

    router.get('/me', requireAuth, medicationController.getPatientMedications)

    router.post('/generate', medicationController.generateMedications)

    return router
}