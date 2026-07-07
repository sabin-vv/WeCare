import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const DoctorAvailabilityPage = lazy(() => import('../../public/pages/DoctorAvailabilityPage'))
const CareTeamPage = lazy(() => import('../pages/CareTeamPage'))
const PatientAppointmentDetailPage = lazy(() => import('../pages/PatientAppointmentDetailPage'))
const PatientAppointmentsPage = lazy(() => import('../pages/PatientAppointmentsPage'))
const PatientDashboardPage = lazy(() => import('../pages/PatientDashboardPage'))
const PatientSettings = lazy(() => import('../pages/PatientSettings'))
const WalletPage = lazy(() => import('../pages/WalletPage'))
const PatientLayout = lazy(() => import('@/layout/PatientLayout'))

import { Role } from '@/modules/auth/types/auth.types'
import ProtectedRoute from '@/shared/components/ProtectedRoute/ProtectedRoute'

export const PatientRoutes: RouteObject[] = [
    {
        path: '/',
        element: (
            <ProtectedRoute allowedRoles={[Role.PATIENT]}>
                <PatientLayout />
            </ProtectedRoute>
        ),

        children: [
            {
                path: '/dashboard',
                element: <PatientDashboardPage />,
            },
            {
                path: '/doctors/:doctorId/reschedule/:appointmentId',
                element: <DoctorAvailabilityPage />,
            },
            {
                path: '/appointments/:appointmentId',
                element: <PatientAppointmentDetailPage />,
            },
            {
                path: '/appointments',
                element: <PatientAppointmentsPage />,
            },
            {
                path: '/settings',
                element: <PatientSettings />,
            },
            {
                path: '/wallet',
                element: <WalletPage />,
            },
            {
                path: '/care-team',
                element: <CareTeamPage />,
            },
        ],
    },
]
