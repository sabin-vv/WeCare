import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getPendingDoctors, getRecentDoctorVerifications, verifyDoctor, verifySpecialization } from '../api/admin.api'
import DoctorDocumentViewer from '../components/modals/DoctorDocumentViewer'
import RejectionReasonModal from '../components/modals/RejectionReasonModal'
import type { PendingDoctor } from '../types/admin.types'

import styles from './Verification.module.css'

import PageHeader from '@/shared/components/PageHeader/PageHeader'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import { Section } from '@/shared/components/Section/Section'
import DataTable from '@/shared/components/Table/DataTable'
import { DEFAULT_PAGINATION } from '@/shared/constants/pagination.constants'
import { usePendingCount } from '@/shared/context/PendingCountContext'
import { DATE_FORMAT, formatDate } from '@/shared/utils/format'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { getFileUrl } from '@/utils/getFileUrl'

const DoctorVerificationPage = () => {
    const [doctors, setDoctors] = useState<PendingDoctor[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState<PendingDoctor | null>(null)
    const [recentDoctors, setRecentDoctors] = useState<PendingDoctor[]>([])
    const [recentLoading, setRecentLoading] = useState(true)
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false)
    const { refreshCounts } = usePendingCount()

    const fetchDoctors = async (page = 1, searchQuery = '') => {
        setLoading(true)
        try {
            const data = await getPendingDoctors(page, pagination.limit, searchQuery)
            setDoctors(data.doctors)
            setPagination(data.pagination)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const fetchRecentDoctors = async () => {
        setRecentLoading(true)
        try {
            const data = await getRecentDoctorVerifications(5)
            setRecentDoctors(data.doctors)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setRecentLoading(false)
        }
    }

    const handleAction = async (doctorId: string, status: 'verified' | 'rejected', reason?: string) => {
        try {
            await verifyDoctor(doctorId, status, reason)
            toast.success(`Doctor ${status === 'verified' ? 'approved' : 'rejected'} successfully`)
            setIsModalOpen(false)
            setIsRejectionModalOpen(false)
            fetchDoctors(pagination.page)
            fetchRecentDoctors()
            refreshCounts()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const openRejectionModal = () => {
        setIsRejectionModalOpen(true)
    }

    const handleSpecVerify = async (index: number) => {
        if (!selectedDoctor) return
        try {
            await verifySpecialization(selectedDoctor._id, index, true)
            toast.success('Specialization verified successfully')

            const updatedDoctors = doctors.map((d) => {
                if (d._id === selectedDoctor._id) {
                    const newSpecs = [...d.specializations]
                    newSpecs[index] = { ...newSpecs[index], verified: true }
                    return { ...d, specializations: newSpecs }
                }
                return d
            })
            setDoctors(updatedDoctors)
            setSelectedDoctor((prev) => {
                if (!prev) return null
                const newSpecs = [...prev.specializations]
                newSpecs[index] = { ...newSpecs[index], verified: true }
                return { ...prev, specializations: newSpecs }
            })
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const openDocumentViewer = (doctor: PendingDoctor) => {
        setSelectedDoctor(doctor)
        setIsModalOpen(true)
    }

    useEffect(() => {
        fetchDoctors()
        fetchRecentDoctors()
    }, [])

    const pendingColumns = [
        {
            header: 'Doctor Name',
            key: 'name' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <div className={styles.doctorInfo}>
                    <div className={styles.avatar}>
                        {doctor.profileImage ? (
                            <img src={getFileUrl(doctor.profileImage)} alt={doctor.name} />
                        ) : (
                            doctor.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                        )}
                    </div>
                    <div className={styles.infoContent}>
                        <h4>Dr. {doctor.name}</h4>
                        <p>{doctor.email}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'License Number',
            key: 'medicalCouncilRegisterNumber' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <span className={styles.license}>#{doctor.medicalCouncilRegisterNumber}</span>
            ),
        },
        {
            header: 'Submission Date',
            key: 'createdAt' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <div className={styles.date}>
                    {formatDate(doctor.createdAt, DATE_FORMAT.SHORT)}
                    <span className={styles.time}>{formatDate(doctor.createdAt, DATE_FORMAT.TIME)}</span>
                </div>
            ),
        },
        {
            header: 'Specialty',
            key: 'specializations' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <span className={styles.specialtyBadge}>{doctor.specializations?.[0]?.name || 'General'}</span>
            ),
        },
        {
            header: 'Documents',
            key: 'documents' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <button onClick={() => openDocumentViewer(doctor)} className={styles.viewDocBtn}>
                    📄 View Documents
                </button>
            ),
        },
        {
            header: 'Actions',
            key: 'actions' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <div className={styles.actions}>
                    <button className={styles.approveBtn} onClick={() => handleAction(doctor._id, 'verified')}>
                        Approve
                    </button>
                    <button
                        className={styles.rejectBtn}
                        onClick={() => {
                            setSelectedDoctor(doctor)
                            openRejectionModal()
                        }}
                    >
                        Reject
                    </button>
                </div>
            ),
        },
    ]

    const recentColumns = [
        {
            header: 'Doctor Name',
            key: 'name' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <div className={styles.doctorInfo}>
                    <div className={styles.avatar}>
                        {doctor.profileImage ? (
                            <img src={getFileUrl(doctor.profileImage)} alt={doctor.name} />
                        ) : (
                            doctor.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                        )}
                    </div>
                    <div className={styles.infoContent}>
                        <h4>Dr. {doctor.name}</h4>
                        <p>{doctor.email}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Status',
            key: 'verificationStatus' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <div className={styles.statusCell}>
                    <span
                        className={
                            doctor.verificationStatus === 'verified' ? styles.verifiedBadge : styles.rejectedBadge
                        }
                    >
                        {doctor.verificationStatus}
                    </span>
                    {doctor.verificationStatus === 'rejected' && doctor.rejectReason && (
                        <p className={styles.rejectReasonText} title={doctor.rejectReason}>
                            Reason: {doctor.rejectReason}
                        </p>
                    )}
                </div>
            ),
        },
        {
            header: 'Verified/Rejected On',
            key: 'updatedAt' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) =>
                formatDate(doctor.updatedAt || doctor.createdAt, DATE_FORMAT.SHORT),
        },
        {
            header: 'Documents',
            key: 'documents' as keyof PendingDoctor,
            render: (doctor: PendingDoctor) => (
                <button onClick={() => openDocumentViewer(doctor)} className={styles.viewDocBtn}>
                    📄 View
                </button>
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Pending Doctor Registrations"
                subtitle="Review and verify medical credentials for newly registered doctor accounts."
            />

            <div className={styles.searchContainer}>
                <SearchField
                    value={search}
                    placeholder="Search pending doctor by name or email ..."
                    onSearch={(query) => {
                        setSearch(query)
                        fetchDoctors(1, query)
                    }}
                />
            </div>

            {doctors.length > 0 && (
                <DataTable
                    data={doctors}
                    columns={pendingColumns}
                    keyExtractor={(doctor) => doctor._id}
                    isLoading={loading}
                >
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalCount={pagination.totalCount}
                        limit={pagination.limit}
                        onPageChange={(page) => fetchDoctors(page, search)}
                    />
                </DataTable>
            )}

            <Section title="Five Recent Verifications">
                <DataTable
                    data={recentDoctors}
                    columns={recentColumns}
                    keyExtractor={(doctor) => doctor._id}
                    isLoading={recentLoading}
                />
            </Section>

            <DoctorDocumentViewer
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                doctor={selectedDoctor}
                onApprove={() => selectedDoctor && handleAction(selectedDoctor._id, 'verified')}
                onReject={openRejectionModal}
                onSpecVerify={handleSpecVerify}
            />

            <RejectionReasonModal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                name={selectedDoctor?.name || ''}
                onConfirm={(reason) => selectedDoctor && handleAction(selectedDoctor._id, 'rejected', reason)}
            />
        </>
    )
}

export default DoctorVerificationPage
