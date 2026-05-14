import type { RouteObject } from 'react-router-dom'

import CaregiverActivityLog from '../pages/CaregiverActivityLog'
import CaregiverDashboard from '../pages/CaregiverDashboard'
import CaregiverMedicationMonitorPage from '../pages/CaregiverMedicationMonitorPage'
import CaregiverPatients from '../pages/CaregiverPatients'
import CaregiverReminders from '../pages/CaregiverReminders'
import CaregiverSettings from '../pages/CaregiverSettings'

import CaregiverLayout from '@/layout/CaregiverLayout'

export const CaregiverRoutes: RouteObject[] = [
    {
        path: '/caregiver',
        element: <CaregiverLayout />,
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
