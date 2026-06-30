import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { VideoCallController } from '../controller/videoCall.controller'

export const createVideoCallRoutes = () => {
    const router = Router()
    const controller = container.resolve(VideoCallController)

    router.post('/room', requireAuth, controller.createRoom)
    router.get('/token/:roomName', requireAuth, controller.getToken)
    router.get('/room/appointment/:appointmentId', requireAuth, controller.getRoomByAppointment)
    router.post('/room/:roomName/end', requireAuth, controller.endRoom)
    router.post('/room/:roomName/complete', requireAuth, controller.completeRoom)

    return router
}
