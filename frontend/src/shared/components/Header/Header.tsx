import { BellRing, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import Button from '../Button/Button'

import styles from './Header.module.css'
import type { HeaderProps, NavLink, RoleRoute } from './Header.types'

import { env } from '@/config/env'
import LogoutButton from '@/shared/components/LogoutButton/LogoutButton'
import { useAuth } from '@/shared/context/AuthContext'
import { usePlatform } from '@/shared/context/PlatformContext'

const Header = ({ titlePrefix = '', subtitle, navLinks = [], children }: HeaderProps) => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { settings } = usePlatform()
    const baseUrl = env.AWS_BASE_URL

    const isAuthenticated = !!user

    const publicLinks: NavLink[] = [
        { label: 'Home', path: '/' },
        { label: 'Book an Appointment', path: '/appointments' },
    ]

    const links = isAuthenticated ? navLinks : publicLinks

    const roleRoutes: RoleRoute = {
        doctor: {
            notification: '/doctor/notification',
            settings: '/doctor/settings',
        },
        caregiver: {
            notification: '/caregiver/notification',
            settings: '/caregiver/settings',
        },
        patient: {
            notification: '/notification',
            settings: '/settings',
        },
        admin: {
            notification: '/admin/notification',
            settings: '/admin/settings',
        },
    }

    const currentRoutes = user ? roleRoutes[user.role] : null

    return (
        <header className={styles.navbar}>
            <div className={styles.left}>
                <img
                    src={`${baseUrl}${settings?.platformLogo}`}
                    alt="logo"
                    className={styles.logo}
                    onClick={() => navigate('/')}
                />
            </div>

            <nav className={styles.center}>
                <ul>
                    {links.map((link) => (
                        <li key={link.path} className={styles.link} onClick={() => navigate(link.path)}>
                            {link.label}
                        </li>
                    ))}
                </ul>
                {children}
            </nav>

            <div className={styles.right}>
                {isAuthenticated ? (
                    <>
                        <BellRing
                            className={styles.icon}
                            onClick={() => {
                                navigate(currentRoutes?.notification || '/')
                            }}
                        />
                        <Settings
                            className={styles.icon}
                            onClick={() => {
                                navigate(currentRoutes?.settings || '/')
                            }}
                        />

                        <LogoutButton />

                        <div className={styles.profile}>
                            <div className={styles.profileText}>
                                <h4>
                                    {titlePrefix}
                                    {user?.name}
                                </h4>
                                {subtitle && <p>{subtitle}</p>}
                            </div>
                            {user?.profileImage ? (
                                <img
                                    src={`${baseUrl}${user?.profileImage}`}
                                    alt="/profile"
                                    className={styles.profileImg}
                                />
                            ) : (
                                <div className={styles.avatarFallback}>
                                    <h1>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</h1>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className={styles.authBtn}>
                        <Button onClick={() => navigate('/auth/login')}>Login</Button>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header
