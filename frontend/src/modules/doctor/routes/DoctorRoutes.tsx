import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

import RequireDoctorProfile from '../components/RequireDoctorProfile/RequireDoctorProfile'

const AlertPage = lazy(() => import('../pages/AlertPage'))
const AvailabilityPage = lazy(() => import('../pages/AvailabilityPage'))
const DoctorAppointmentsPage = lazy(() => import('../pages/DoctorAppointmentsPage'))
const DoctorDashboard = lazy(() => import('../pages/DoctorDashboard'))
const DoctorSettings = lazy(() => import('../pages/DoctorSettings'))
const PatientList = lazy(() => import('../pages/PatientList'))
const PatientMedicalRecordPage = lazy(() => import('../pages/PatientMedicalRecordPage'))
const PatientViewPage = lazy(() => import('../pages/PatientViewPage'))
const DoctorLayout = lazy(() => import('@/layout/DoctorLayout'))
const DoctorChatPage = lazy(() => import('@/modules/chat/pages/DoctorChatPage'))

import { Role } from '@/modules/auth/types/auth.types'
import ProtectedRoute from '@/shared/components/ProtectedRoute/ProtectedRoute'

export const DoctorRoutes: RouteObject[] = [
    {
        path: '/doctor',
        element: (
            <ProtectedRoute allowedRoles={[Role.DOCTOR]}>
                <DoctorLayout />
            </ProtectedRoute>
        ),

        children: [
            {
                path: '/doctor/dashboard',
                element: <DoctorDashboard />,
            },
            {
                element: <RequireDoctorProfile />,
                children: [
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
                    {
                        path: '/doctor/patients/:patientId/medical-record',
                        element: <PatientMedicalRecordPage />,
                    },
                    {
                        path: '/doctor/alerts',
                        element: <AlertPage />,
                    },
                    {
                        path: '/doctor/chat',
                        element: <DoctorChatPage />,
                    },
                ],
            },
        ],
    },
]
