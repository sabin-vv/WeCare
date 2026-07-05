import { Outlet } from 'react-router-dom'

import styles from './PatientLayout.module.css'

import PatientAssistantWidget from '@/modules/patient/components/PatientAssistantWidget'
import PatientHeader from '@/modules/patient/components/PatientHeader'
import Footer from '@/shared/components/Footer/Footer'

const PatientLayout = () => {
    return (
        <div className={styles.layout}>
            <PatientHeader />
            <PatientAssistantWidget />

            <main className={styles.content}>
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}

export default PatientLayout
