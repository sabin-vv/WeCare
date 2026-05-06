import type { ReactNode } from 'react'

import Footer from '../shared/components/Footer/Footer'

import styles from './AuthLayout.module.css'

import PatientHeader from '@/modules/patient/component/PatientHeader'

const AuthLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className={styles.pageLayout}>
            <PatientHeader />
            {children}
            <Footer />
        </div>
    )
}
export default AuthLayout
