import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { PatientController } from '../controller/patient.controller'
import { registerPatientSchema } from '../validator/patient.schema'
import { UpdatePatientSettingsSchema } from '../validator/updatePatientSettings.schema'

export const createPatientRoutes = () => {
    const router = Router()
    const patientController = container.resolve(PatientController)

    router.get('/', requireAuth, patientController.getPatients)

    router.post('/register', validate(registerPatientSchema), patientController.registerPatient)
    router.get('/me', requireAuth, patientController.getProfile)
    router.put('/me', requireAuth, validate(UpdatePatientSettingsSchema), patientController.updateProfile)

    return router
}
