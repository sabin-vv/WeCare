import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const CaregiverActivityLog = lazy(() => import('../pages/CaregiverActivityLog'))
const CaregiverAlertsPage = lazy(() => import('../pages/CaregiverAlertsPage'))
const CaregiverDashboard = lazy(() => import('../pages/CaregiverDashboard'))
const CaregiverPatients = lazy(() => import('../pages/CaregiverPatients'))
const CaregiverReminders = lazy(() => import('../pages/CaregiverReminders'))
const CaregiverSettings = lazy(() => import('../pages/CaregiverSettings'))
const PrescriptionPage = lazy(() => import('../pages/PrescriptionPage'))
const CaregiverChatPage = lazy(() => import('@/modules/chat/pages/CaregiverChatPage'))
const CaregiverLayout = lazy(() => import('@/layout/CaregiverLayout'))

import RequireCaregiverProfile from '../components/RequireCaregiverProfile/RequireCaregiverProfile'

import { Role } from '@/modules/auth/types/auth.types'
import ProtectedRoute from '@/shared/components/ProtectedRoute/ProtectedRoute'

export const CaregiverRoutes: RouteObject[] = [
    {
        path: '/caregiver',
        element: (
            <ProtectedRoute allowedRoles={[Role.CAREGIVER]}>
                <CaregiverLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <CaregiverDashboard />,
            },
            {
                element: <RequireCaregiverProfile />,
                children: [
                    {
                        path: 'patients',
                        element: <CaregiverPatients />,
                    },
                    {
                        path: 'patients/:patientId/prescription',
                        element: <PrescriptionPage />,
                    },
                    {
                        path: 'reminders',
                        element: <CaregiverReminders />,
                    },
                    {
                        path: 'alerts',
                        element: <CaregiverAlertsPage />,
                    },
                    {
                        path: 'activity-log',
                        element: <CaregiverActivityLog />,
                    },
                    {
                        path: 'settings',
                        element: <CaregiverSettings />,
                    },
                    {
                        path: 'chat',
                        element: <CaregiverChatPage />,
                    },
                ],
            },
        ],
    },
]
