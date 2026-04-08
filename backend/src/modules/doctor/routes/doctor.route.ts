import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { validate } from '../../../core/middleware/validateMiddleware'
import { DoctorController } from '../controller/doctor.controller'
import { DoctorSchema } from '../validator/registerDoctor.schema'

export const createDoctorRoutes = () => {
    const router = Router()
    const doctorController = container.resolve(DoctorController)

    router.post('/profile', requireAuth, validate(DoctorSchema), doctorController.createProfile)

    return router
}
