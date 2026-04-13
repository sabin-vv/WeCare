import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { upload } from '../../../core/middleware/upload'
import { validate } from '../../../core/middleware/validateMiddleware'
import { DoctorController } from '../controller/doctor.controller'
import { DoctorSchema } from '../validator/registerDoctor.schema'
import { UpdateDoctorSettingsSchema } from '../validator/updateDoctorSettings.schema'

export const createDoctorRoutes = () => {
    const router = Router()
    const doctorController = container.resolve(DoctorController)

    router.get('/me', requireAuth, doctorController.getProfile)
    router.put('/me', requireAuth, upload.none(), validate(UpdateDoctorSettingsSchema), doctorController.updateProfile)
    router.post('/profile', requireAuth, upload.none(), validate(DoctorSchema), doctorController.createProfile)

    return router
}
