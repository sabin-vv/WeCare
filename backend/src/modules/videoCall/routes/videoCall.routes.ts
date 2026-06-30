import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { VideoCallController } from '../controller/videoCall.controller'

export const createVideoCallRoutes = () => {
    const router = Router()
    const controller = container.resolve(VideoCallController)

    router.post('/room', requireAuth, controller.createRoom)
    router.get('/token/:roomName', requireAuth, controller.getToken)
    router.post('/room/:roomName/end', requireAuth, controller.endRoom)

    return router
}
