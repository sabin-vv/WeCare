import { useNavigate } from 'react-router-dom'

import styles from './PageNotFound.module.css'

import Button from '@/shared/components/Button/Button'

const PageNotFound = () => {
    const navigate = useNavigate()

    return (
        <main className={styles.page}>
            <div className={styles.backgroundShapes}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className={styles.card}>
                <h1 className={styles.code}>404</h1>

                <h2 className={styles.title}>We couldn’t find that page</h2>

                <p className={styles.description}>
                    It might have been moved, deleted, or the link might be incorrect. Let’s help you get back on track.
                </p>

                <div className={styles.actions}>
                    <Button onClick={() => navigate('/')}>Back to Home</Button>

                    <button className={styles.secondary} onClick={() => navigate('/auth/login')}>
                        Go to Login
                    </button>
                </div>
            </div>
        </main>
    )
}

export default PageNotFound
