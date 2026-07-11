import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const CaregiverRegisterPage = lazy(() => import('../pages/CaregiverRegisterPage'))
const DoctorRegisterPage = lazy(() => import('../pages/DoctorRegisterPage'))
const ForgotPasswordNewPasswordPage = lazy(() => import('../pages/ForgotPasswordNewPasswordPage'))
const ForgotPasswordOtpPage = lazy(() => import('../pages/ForgotPasswordOtpPage'))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const PatientRegisterPage = lazy(() => import('../pages/PatientRegisterPage'))

export const AuthRoutes: RouteObject[] = [
    {
        path: '/auth/login',
        element: <LoginPage />,
    },
    {
        path: '/auth/doctors/register',
        element: <DoctorRegisterPage />,
    },
    {
        path: '/auth/caregivers/register',
        element: <CaregiverRegisterPage />,
    },
    {
        path: '/auth/patients/register',
        element: <PatientRegisterPage />,
    },
    {
        path: '/auth/forgot-password',
        element: <ForgotPasswordPage />,
    },
    {
        path: '/auth/forgot-password/verify-otp',
        element: <ForgotPasswordOtpPage />,
    },
    {
        path: '/auth/forgot-password/new-password',
        element: <ForgotPasswordNewPasswordPage />,
    },
]
