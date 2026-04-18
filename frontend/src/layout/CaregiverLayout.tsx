import { Outlet } from 'react-router-dom'

import styles from './CaregiverLayout.module.css'

import CaregiverSidebar from '@/modules/caregiver/components/CaregiverSidebar'
import CaregiverHeader from '@/shared/components/Header/CaregiverHeader'

const CaregiverLayout = () => {
    return (
        <div className={styles.shell}>
            <CaregiverHeader />
            <div className={styles.body}>
                <CaregiverSidebar />
                <main className={styles.main}>
                    <div className={styles.content}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default CaregiverLayout
