import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/shared/context/AuthContext'

const RequireCaregiverProfile = () => {
    const { user } = useAuth()

    if (!user?.isProfileComplete || user.verificationStatus !== 'verified') {
        return <Navigate to="/caregiver/dashboard" replace />
    }

    return <Outlet />
}

export default RequireCaregiverProfile
