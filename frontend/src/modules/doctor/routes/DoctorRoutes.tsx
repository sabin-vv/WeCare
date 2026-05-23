import type { RouteObject } from 'react-router-dom'

import AvailabilityPage from '../pages/AvailabilityPage'
import DoctorAppointmentsPage from '../pages/DoctorAppointmentsPage'
import DoctorDashboard from '../pages/DoctorDashboard'
import DoctorSettings from '../pages/DoctorSettings'
import PatientList from '../pages/PatientList'
import PatientViewPage from '../pages/PatientViewPage'

export const DoctorRoutes: RouteObject[] = [
    {
        path: '/doctor/dashboard',
        element: <DoctorDashboard />,
    },
    {
        path: '/doctor/settings',
        element: <DoctorSettings />,
    },
    {
        path: '/doctor/availability',
        element: <AvailabilityPage />,
    },
    {
        path: '/doctor/appointments',
        element: <DoctorAppointmentsPage />,
    },
    {
        path: '/doctor/patients',
        element: <PatientList />,
    },
    {
        path: '/doctor/patients/:patientId',
        element: <PatientViewPage />,
    },
]
