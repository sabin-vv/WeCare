import { useCallback, useEffect, useState } from 'react'

import type { PatientOption, StartNewChatModalProps } from '../types/chat.types'

import styles from './Chat.module.css'

import Modal from '@/shared/components/Modal/Modal'

const StartNewChatModal = ({ isOpen, onClose, fetchPatients, onSelectPatient }: StartNewChatModalProps) => {
    const [patients, setPatients] = useState<PatientOption[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const data = await fetchPatients()
            setPatients(data)
        } catch {
            console.error('Failed to load patients')
        } finally {
            setLoading(false)
        }
    }, [fetchPatients])

    useEffect(() => {
        if (isOpen) {
            setSearch('')
            load()
        }
    }, [isOpen, load])

    const filtered = search.trim()
        ? patients.filter(
              (p) =>
                  p.name.toLowerCase().includes(search.toLowerCase()) ||
                  (p.subtitle && p.subtitle.toLowerCase().includes(search.toLowerCase())),
          )
        : patients

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Start New Conversation" size="md">
            <div className={styles.modalContent}>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.modalSearch}
                />
                {loading ? (
                    <div className={styles.loadingCenter}>Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className={styles.loadingCenter}>
                        {search ? 'No results match your search' : 'No patients available'}
                    </div>
                ) : (
                    <div className={styles.modalPatientList}>
                        {filtered.map((patient) => (
                            <button
                                type="button"
                                key={patient._id}
                                onClick={() => {
                                    onSelectPatient(patient._id, patient.name, patient.patientName)
                                    onClose()
                                }}
                                className={styles.modalPatientItem}
                            >
                                <div className={styles.modalAvatar}>
                                    {patient.profileImage ? (
                                        <img src={patient.profileImage} alt="" className={styles.modalAvatarImg} />
                                    ) : (
                                        patient.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className={styles.modalTextContainer}>
                                    <div className={styles.modalPatientName}>{patient.name}</div>
                                    {patient.subtitle && (
                                        <div className={styles.modalPatientSubtitle}>{patient.subtitle}</div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default StartNewChatModal
