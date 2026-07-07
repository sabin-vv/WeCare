import { Loader } from 'lucide-react'
import { Suspense } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'

import { AdminRoutes } from './modules/admin/routes/AdminRoutes'
import { AuthRoutes } from './modules/auth/routes/auth.routes'
import { Role } from './modules/auth/types/auth.types'
import { CaregiverRoutes } from './modules/caregiver/routes/CaregiverRoutes'
import { DoctorRoutes } from './modules/doctor/routes/DoctorRoutes'
import { PatientRoutes } from './modules/patient/routes/PatientRoutes'
import { PublicRoutes } from './modules/public/routes/PublicRoutes'
import VideoCallPage from './modules/videoCall/pages/VideoCallPage'
import PageNotFound from './shared/components/PageNotFound/PageNotFound'
import ProtectedRoute from './shared/components/ProtectedRoute/ProtectedRoute'
import ScrollToTop from './shared/components/ScrollToTop/ScrollToTop'

const RootLayout = () => (
    <>
        <ScrollToTop />
        <Suspense
            fallback={
                <div className="suspense-loader">
                    <Loader /> Loading...
                </div>
            }
        >
            <Outlet />
        </Suspense>
    </>
)

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            ...PublicRoutes,
            ...AuthRoutes,
            ...AdminRoutes,
            ...DoctorRoutes,
            ...CaregiverRoutes,
            ...PatientRoutes,
            {
                path: '/video-call/:appointmentId',
                element: (
                    <ProtectedRoute allowedRoles={[Role.DOCTOR, Role.PATIENT]}>
                        <VideoCallPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: '*',
                element: <PageNotFound />,
            },
        ],
    },
])
