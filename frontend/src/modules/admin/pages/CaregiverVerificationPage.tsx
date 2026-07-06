import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getPendingCaregivers, getRecentCaregiverVerifications, verifyCaregiver } from '../api/admin.api'
import CaregiverDocumentViewer from '../components/modals/CaregiverDocumentViewer'
import RejectionReasonModal from '../components/modals/RejectionReasonModal'
import type { PendingCaregiver, RecentCaregiver } from '../types/admin.types'

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

const pendingCaregiverColumns = [
    {
        header: 'Caregiver Name',
        key: 'name' as keyof PendingCaregiver,
        render: (caregiver: PendingCaregiver) => (
            <div className={styles.doctorInfo}>
                <div className={styles.avatar}>
                    {caregiver.profileImage ? (
                        <img src={getFileUrl(caregiver.profileImage)} alt={caregiver.name} />
                    ) : (
                        caregiver.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                    )}
                </div>
                <div className={styles.infoContent}>
                    <h4>{caregiver.name}</h4>
                    <p>{caregiver.email}</p>
                </div>
            </div>
        ),
    },
    {
        header: 'Certificate No',
        key: 'certificateNumber' as keyof PendingCaregiver,
        render: (caregiver: PendingCaregiver) => <span className={styles.license}>#{caregiver.certificateNumber}</span>,
    },
    {
        header: 'License No',
        key: 'licenseNumber' as keyof PendingCaregiver,
        render: (caregiver: PendingCaregiver) => <span className={styles.license}>#{caregiver.licenseNumber}</span>,
    },
    {
        header: 'Submission Date',
        key: 'createdAt' as keyof PendingCaregiver,
        render: (caregiver: PendingCaregiver) => (
            <div className={styles.date}>
                {formatDate(caregiver.createdAt, DATE_FORMAT.SHORT)}
                <span className={styles.time}>{formatDate(caregiver.createdAt, DATE_FORMAT.TIME)}</span>
            </div>
        ),
    },
]

const recentCaregiverColumns = [
    {
        header: 'Caregiver Name',
        key: 'name' as keyof RecentCaregiver,
        render: (caregiver: RecentCaregiver) => (
            <div className={styles.doctorInfo}>
                <div className={styles.avatar}>
                    {caregiver.profileImage ? (
                        <img src={getFileUrl(caregiver.profileImage)} alt={caregiver.name} />
                    ) : (
                        caregiver.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                    )}
                </div>
                <div className={styles.infoContent}>
                    <h4>{caregiver.name}</h4>
                    <p>{caregiver.email}</p>
                </div>
            </div>
        ),
    },
    {
        header: 'Status',
        key: 'verificationStatus' as keyof RecentCaregiver,
        render: (caregiver: RecentCaregiver) => (
            <span className={caregiver.verificationStatus === 'verified' ? styles.verifiedBadge : styles.rejectedBadge}>
                {caregiver.verificationStatus}
            </span>
        ),
    },
    {
        header: 'Verified/Rejected On',
        key: 'updatedAt' as keyof RecentCaregiver,
        render: (caregiver: RecentCaregiver) =>
            formatDate(caregiver.updatedAt || caregiver.createdAt, DATE_FORMAT.SHORT),
    },
]

const CaregiverVerificationPage = () => {
    const [caregivers, setCaregivers] = useState<PendingCaregiver[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCaregiver, setSelectedCaregiver] = useState<PendingCaregiver | null>(null)
    const [recentCaregivers, setRecentCaregivers] = useState<RecentCaregiver[]>([])
    const [recentLoading, setRecentLoading] = useState(true)
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false)
    const { refreshCounts } = usePendingCount()

    const fetchCaregivers = async (page = 1, searchQuery = '') => {
        setLoading(true)
        try {
            const data = await getPendingCaregivers(page, pagination.limit, searchQuery)
            setCaregivers(data.caregivers)
            setPagination(data.pagination)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const fetchRecentCaregivers = async () => {
        setRecentLoading(true)
        try {
            const data = await getRecentCaregiverVerifications(5)
            setRecentCaregivers(data.caregivers)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setRecentLoading(false)
        }
    }

    const handleAction = async (caregiverId: string, status: 'verified' | 'rejected', reason?: string) => {
        try {
            await verifyCaregiver(caregiverId, status, reason)
            toast.success(`Caregiver ${status === 'verified' ? 'approved' : 'rejected'} successfully`)
            setIsModalOpen(false)
            setIsRejectionModalOpen(false)
            fetchCaregivers(pagination.page)
            fetchRecentCaregivers()
            refreshCounts()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const openRejectionModal = () => {
        setIsRejectionModalOpen(true)
    }

    const openDocumentViewer = (caregiver: PendingCaregiver) => {
        setSelectedCaregiver(caregiver)
        setIsModalOpen(true)
    }

    useEffect(() => {
        fetchCaregivers()
        fetchRecentCaregivers()
    }, [])

    const columnsWithActions = [
        ...pendingCaregiverColumns,
        {
            header: 'Documents',
            key: 'documents' as keyof PendingCaregiver,
            render: (caregiver: PendingCaregiver) => (
                <button onClick={() => openDocumentViewer(caregiver)} className={styles.viewDocBtn}>
                    📄 View Documents
                </button>
            ),
        },
        {
            header: 'Actions',
            key: 'actions' as keyof PendingCaregiver,
            render: (caregiver: PendingCaregiver) => (
                <div className={styles.actions}>
                    <button className={styles.approveBtn} onClick={() => handleAction(caregiver._id, 'verified')}>
                        Approve
                    </button>
                    <button
                        className={styles.rejectBtn}
                        onClick={() => {
                            setSelectedCaregiver(caregiver)
                            openRejectionModal()
                        }}
                    >
                        Reject
                    </button>
                </div>
            ),
        },
    ]

    const recentColumnsWithView = [
        ...recentCaregiverColumns,
        {
            header: 'Documents',
            key: 'documents' as keyof RecentCaregiver,
            render: (caregiver: RecentCaregiver) => (
                <button
                    onClick={() => openDocumentViewer(caregiver as unknown as PendingCaregiver)}
                    className={styles.viewDocBtn}
                >
                    📄 View
                </button>
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Pending Caregiver Registrations"
                subtitle="Review and verify professional credentials for newly registered caregiver accounts."
            />

            <SearchField
                value={search}
                placeholder="Search caregiver by name or email ..."
                onSearch={(query) => {
                    setSearch(query)
                    fetchCaregivers(1, query)
                }}
            />

            {caregivers.length > 0 && (
                <DataTable
                    data={caregivers}
                    columns={columnsWithActions}
                    keyExtractor={(caregiver) => caregiver._id}
                    isLoading={loading}
                >
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalCount={pagination.totalCount}
                        limit={pagination.limit}
                        onPageChange={(page) => fetchCaregivers(page, search)}
                    />
                </DataTable>
            )}

            <Section title="Five Recent Verifications">
                <DataTable
                    data={recentCaregivers}
                    columns={recentColumnsWithView}
                    keyExtractor={(caregiver) => caregiver._id}
                    isLoading={recentLoading}
                />
            </Section>

            <CaregiverDocumentViewer
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                caregiver={selectedCaregiver}
                onApprove={() => selectedCaregiver && handleAction(selectedCaregiver._id, 'verified')}
                onReject={openRejectionModal}
            />

            <RejectionReasonModal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                name={selectedCaregiver?.name || ''}
                onConfirm={(reason) => selectedCaregiver && handleAction(selectedCaregiver._id, 'rejected', reason)}
            />
        </>
    )
}

export default CaregiverVerificationPage
