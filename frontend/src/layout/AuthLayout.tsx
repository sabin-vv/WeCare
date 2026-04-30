import type { ReactNode } from 'react'

import Footer from '../shared/components/Footer/Footer'

import styles from './AuthLayout.module.css'

import Header from '@/shared/components/Header/Header'

const AuthLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className={styles.pageLayout}>
            <Header />
            {children}
            <Footer />
        </div>
    )
}
export default AuthLayout
