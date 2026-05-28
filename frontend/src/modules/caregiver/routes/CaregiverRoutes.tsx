import type { RouteObject } from 'react-router-dom'

import CaregiverActivityLog from '../pages/CaregiverActivityLog'
import CaregiverDashboard from '../pages/CaregiverDashboard'
import CaregiverMedicationMonitorPage from '../pages/CaregiverMedicationMonitorPage'
import CaregiverPatients from '../pages/CaregiverPatients'
import CaregiverReminders from '../pages/CaregiverReminders'
import CaregiverSettings from '../pages/CaregiverSettings'

import CaregiverLayout from '@/layout/CaregiverLayout'
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
                path: 'patients',
                element: <CaregiverPatients />,
            },
            {
                path: 'patients/:patientId/medication-monitor',
                element: <CaregiverMedicationMonitorPage />,
            },
            {
                path: 'reminders',
                element: <CaregiverReminders />,
            },
            {
                path: 'activity-log',
                element: <CaregiverActivityLog />,
            },
            {
                path: 'settings',
                element: <CaregiverSettings />,
            },
        ],
    },
]
