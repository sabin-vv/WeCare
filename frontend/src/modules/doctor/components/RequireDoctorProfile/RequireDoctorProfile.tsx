import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/shared/context/AuthContext'

const RequireDoctorProfile = () => {
    const { user } = useAuth()

    if (!user?.isProfileComplete || user.verificationStatus !== 'verified') {
        return <Navigate to="/doctor/dashboard" replace />
    }

    return <Outlet />
}

export default RequireDoctorProfile
