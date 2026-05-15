import { Payload } from '../../utils/jwt.types'

declare module 'express-serve-static-core' {
    interface Request {
        user?: Payload
    }
}

export {}
