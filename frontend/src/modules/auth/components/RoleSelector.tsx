import { Role, type RoleSelectorProps } from '../types/auth.types'

import styles from './RoleSelector.module.css'

const roles = [
    { label: 'Doctor', value: Role.DOCTOR },
    { label: 'Caregiver', value: Role.CAREGIVER },
    { label: 'Patient', value: Role.PATIENT },
]

const RoleSelector = ({ role, onChange }: RoleSelectorProps) => {
    const activeIndex = roles.findIndex((r) => r.value === role)

    return (
        <div className={styles.roleSelectorWrapper}>
            <p className={styles.title}>I am signing in as a:</p>

            <div className={styles.roleSelector} role="tablist" aria-label="Select Role">
                <div
                    className={styles.activeIndicator}
                    style={{
                        transform: `translateX(${activeIndex * 100}%)`,
                    }}
                />

                {roles.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        role="tab"
                        aria-selected={role === item.value}
                        className={`${styles.roleButton} ${role === item.value ? styles.active : ''}`}
                        onClick={() => onChange(item.value)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default RoleSelector
