import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const DoctorAvailabilityPage = lazy(() => import('../pages/DoctorAvailabilityPage'))
const DoctorBookingPage = lazy(() => import('../pages/DoctorBookingPage'))
const LandingPage = lazy(() => import('../pages/LandingPage'))
const PublicLayout = lazy(() => import('@/layout/PublicLayout'))

export const PublicRoutes: RouteObject[] = [
    {
        path: '/',
        element: <PublicLayout />,

        children: [
            {
                path: '/',
                element: <LandingPage />,
            },
            {
                path: '/doctors',
                element: <DoctorBookingPage />,
            },
            {
                path: '/doctors/:doctorId',
                element: <DoctorAvailabilityPage />,
            },
        ],
    },
]
