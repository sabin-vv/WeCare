import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { getCurrentUser } from '@/modules/auth/api/auth.api'
import type { AuthContextType, User } from '@/modules/auth/types/auth.types'
import { clearStoredUser, getStoredUser, setStoredUser } from '@/utils/authStorage'

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => getStoredUser())
    const [isAuthLoading, setIsAuthLoading] = useState(() => !!getStoredUser())

    useEffect(() => {
        const handleStorage = () => {
            setUser(getStoredUser())
        }

        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    useEffect(() => {
        const storedUser = getStoredUser()

        if (!storedUser) {
            setIsAuthLoading(false)
            return
        }

        let isMounted = true

        const validateSession = async () => {
            try {
                const profile = await getCurrentUser()
                const refreshedUser = { ...storedUser, ...profile.data }

                if (!isMounted) return

                setStoredUser(refreshedUser)
                setUser(refreshedUser)
            } catch {
                if (!isMounted) return

                clearStoredUser()
                setUser(null)
            } finally {
                if (isMounted) {
                    setIsAuthLoading(false)
                }
            }
        }

        validateSession()

        return () => {
            isMounted = false
        }
    }, [])

    const setAuth = useCallback((user: User) => {
        setStoredUser(user)
        setUser(user)
    }, [])

    const clearAuth = useCallback(() => {
        clearStoredUser()
        setUser(null)
    }, [])

    const value = useMemo(
        () => ({
            user,
            setAuth,
            clearAuth,
            isAuthenticated: !!user,
            isAuthLoading,
        }),
        [clearAuth, isAuthLoading, setAuth, user],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
    const auth = useContext(AuthContext)
    if (!auth) throw new Error('useAuth must be used inside <AuthProvider>')
    return auth
}
