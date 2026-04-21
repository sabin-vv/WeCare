import type { RouteObject } from 'react-router-dom'

import DoctorBookingPage from '../pages/DoctorBookingPage'

export const PatientRoutes: RouteObject[] = [
    {
        path: '/appointments',
        element: <DoctorBookingPage />,
    },
]
