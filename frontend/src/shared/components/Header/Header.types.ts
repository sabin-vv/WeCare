import type { ComponentType, ReactNode } from 'react'

export interface NavLinks {
    label: string
    path: string
    badge?: number
    icon?: ComponentType<{ size?: number; color?: string }>
}

export interface HeaderProps {
    titlePrefix?: string
    subtitle?: string
    navLinks?: NavLinks[]
    children?: ReactNode
    leading?: ReactNode
    trailing?: ReactNode
}

export interface navLinkRight {
    settings: string
}

export interface RoleRoute {
    doctor: navLinkRight
    caregiver: navLinkRight
    patient: navLinkRight
    admin: navLinkRight
}
