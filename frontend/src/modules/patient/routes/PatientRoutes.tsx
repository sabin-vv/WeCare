import type { RouteObject } from 'react-router-dom'

import DoctorAvailabilityPage from '../pages/DoctorAvailabilityPage'
import DoctorBookingPage from '../pages/DoctorBookingPage'
import PatientAppointmentsPage from '../pages/PatientAppointmentsPage'
import PatientDashboardPage from '../pages/PatientDashboardPage'

export const PatientRoutes: RouteObject[] = [
    {
        path: '/dashboard',
        element: <PatientDashboardPage />,
    },
    {
        path: '/doctors',
        element: <DoctorBookingPage />,
    },
    {
        path: '/doctors/:doctorId',
        element: <DoctorAvailabilityPage />,
    },
    {
        path: '/appointments',
        element: <PatientAppointmentsPage />,
    },
]
