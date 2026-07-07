import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const AdminLayout = lazy(() => import('../../../layout/AdminLayout'))
const ActivityLogsPage = lazy(() => import('../pages/ActivityLogsPage'))
const AdminAppointmentsPage = lazy(() => import('../pages/AdminAppointmentsPage'))
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'))
const AdminLoginPage = lazy(() => import('../pages/AdminLoginPage'))
const AdminPaymentsPage = lazy(() => import('../pages/AdminPaymentsPage'))
const AdminSettings = lazy(() => import('../pages/AdminSettings'))
const CaregiverVerificationPage = lazy(() => import('../pages/CaregiverVerificationPage'))
const DoctorVerificationPage = lazy(() => import('../pages/DoctorVerificationPage'))
const UserManagementPage = lazy(() => import('../pages/UserManagementPage'))

import { Role } from '@/modules/auth/types/auth.types'
import ProtectedRoute from '@/shared/components/ProtectedRoute/ProtectedRoute'

export const AdminRoutes: RouteObject[] = [
    {
        path: '/auth/admin/login',
        element: <AdminLoginPage />,
    },
    {
        path: '/admin',
        element: (
            <ProtectedRoute allowedRoles={[Role.ADMIN]} loginPath="/auth/admin/login">
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <AdminDashboard />,
            },
            {
                path: 'users',
                element: <UserManagementPage />,
            },
            {
                path: 'doctors/verification',
                element: <DoctorVerificationPage />,
            },
            {
                path: 'caregivers/verification',
                element: <CaregiverVerificationPage />,
            },
            {
                path: 'settings',
                element: <AdminSettings />,
            },
            {
                path: 'appointments',
                element: <AdminAppointmentsPage />,
            },
            {
                path: 'payments',
                element: <AdminPaymentsPage />,
            },
            {
                path: 'activity-logs',
                element: <ActivityLogsPage />,
            },
        ],
    },
]
