import {
    CircleUserRound,
    ClipboardClock,
    Clock,
    Contact,
    HeartHandshake,
    LayoutDashboard,
    MessageCircleMore,
    NotebookText,
    NotepadText,
    Siren,
    Stethoscope,
    Wallet,
} from 'lucide-react'

import type { NavLinks } from '@/shared/components/Header/Header.types'

export const patientNavLinks: NavLinks[] = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Book a doctor', path: '/doctors', icon: Stethoscope },
    { label: 'Appointments', path: '/appointments', icon: NotepadText },
    { label: 'Wallet', path: '/wallet', icon: Wallet },
    { label: 'Care Team', path: '/care-team', icon: HeartHandshake },
]

export const caregiverNavLinks: NavLinks[] = [
    { label: 'Dashboard', path: '/caregiver/dashboard', icon: LayoutDashboard },
    { label: 'Patients', path: '/caregiver/patients', icon: CircleUserRound },
    { label: 'Chat', path: '/caregiver/chat', icon: MessageCircleMore },
    { label: 'Alerts', path: '/caregiver/alerts', icon: Siren },
    { label: 'Reminders', path: '/caregiver/reminders', icon: Clock },
    { label: 'Activity Log', path: '/caregiver/activity-log', icon: NotebookText },
]

export const doctorNavLinks: NavLinks[] = [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { label: 'Patient List', path: '/doctor/patients', icon: Contact },
    { label: 'Appointments', path: '/doctor/appointments', icon: NotepadText },
    { label: 'Chat', path: '/doctor/chat', icon: MessageCircleMore },
    { label: 'Schedule', path: '/doctor/availability', icon: ClipboardClock },
    { label: 'Alerts', path: '/doctor/alerts', icon: Siren },
]
