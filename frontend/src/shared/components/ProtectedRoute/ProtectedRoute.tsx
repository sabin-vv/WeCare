import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import type { Role } from '@/modules/auth/types/auth.types'
import { useAuth } from '@/shared/context/AuthContext'

interface ProtectedRouteProps {
    allowedRoles: Role[]
    children: ReactNode
    loginPath?: string
}

const ProtectedRoute = ({ allowedRoles, children, loginPath = '/auth/login' }: ProtectedRouteProps) => {
    const { user, isAuthLoading } = useAuth()

    if (isAuthLoading) {
        return null
    }

    if (!user) {
        return <Navigate to={loginPath} replace />
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
