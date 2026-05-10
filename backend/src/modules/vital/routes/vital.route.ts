import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { VitalController } from '../controller/vital.controller'
import { createVitalSchema } from '../validator/vital.schema'

export const createVitalRoutes = () => {
    const router = Router()
    const vitalController = container.resolve(VitalController)

    router.use(requireAuth)

    router.post('/', validate(createVitalSchema), vitalController.createVital)
    router.get('/patient/:patientId', vitalController.getPatientVitals)

    return router
}
