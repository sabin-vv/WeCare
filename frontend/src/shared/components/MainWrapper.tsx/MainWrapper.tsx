import type { ReactNode } from 'react'

import styles from './MainWrapper.module.css'

const MainWrapper = ({ children }: { children: ReactNode }) => {
    return (
        <main className={styles.wrapper}>
            <div className={styles.container}>{children}</div>
        </main>
    )
}
export default MainWrapper
