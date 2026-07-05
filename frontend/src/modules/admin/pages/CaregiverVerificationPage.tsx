/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getPendingCaregivers, getRecentCaregiverVerifications, verifyCaregiver } from '../api/admin.api'
import type { PendingCaregiver, RecentCaregiver } from '../types/admin.types'

import styles from './DoctorVerification.module.css'

import Modal from '@/shared/components/Modal/Modal'
import PageHeader from '@/shared/components/PageHeader/PageHeader'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import { Section } from '@/shared/components/Section/Section'
import DataTable from '@/shared/components/Table/DataTable'
import { usePendingCount } from '@/shared/context/PendingCountContext'
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
                {new Date(caregiver.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })}
                <span className={styles.time}>
                    {new Date(caregiver.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </span>
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
            new Date(caregiver.updatedAt || caregiver.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
    },
]

const CaregiverVerificationPage = () => {
    const [caregivers, setCaregivers] = useState<PendingCaregiver[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalCount: 0, totalPages: 1 })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCaregiver, setSelectedCaregiver] = useState<PendingCaregiver | null>(null)
    const [activeTab, setActiveTab] = useState<'certificate' | 'license' | 'govid'>('certificate')
    const [recentCaregivers, setRecentCaregivers] = useState<RecentCaregiver[]>([])
    const [recentLoading, setRecentLoading] = useState(true)
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const { refreshCounts } = usePendingCount()

    const fetchCaregivers = async (page = 1, searchQuery = '') => {
        setLoading(true)
        try {
            const data = await getPendingCaregivers(page, 10, searchQuery)
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
            setRejectionReason('')
            fetchCaregivers(pagination.page)
            fetchRecentCaregivers()
            refreshCounts()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const openRejectionModal = () => {
        setRejectionReason('Information provided is insufficient')
        setIsRejectionModalOpen(true)
    }

    const openDocumentViewer = (caregiver: PendingCaregiver) => {
        setSelectedCaregiver(caregiver)
        setActiveTab('certificate')
        setIsModalOpen(true)
    }

    useEffect(() => {
        fetchCaregivers()
        fetchRecentCaregivers()
    }, [])

    const currentDocUrl = (() => {
        if (!selectedCaregiver) return ''
        if (activeTab === 'certificate') return selectedCaregiver.certificateImage
        if (activeTab === 'license') return selectedCaregiver.licenseImage
        return selectedCaregiver.govIdImage
    })()

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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Verification: ${selectedCaregiver?.name || ''}`}
                footer={
                    selectedCaregiver?.verificationStatus === 'pending' ? (
                        <>
                            <button className={styles.rejectBtn} onClick={openRejectionModal}>
                                Reject
                            </button>
                            <button
                                className={styles.approveBtn}
                                onClick={() => selectedCaregiver && handleAction(selectedCaregiver._id, 'verified')}
                            >
                                Approve
                            </button>
                        </>
                    ) : null
                }
            >
                {selectedCaregiver && (
                    <div className={styles.modalContent}>
                        <div className={styles.docHead}>
                            <p>
                                <strong>Certificate No:</strong> #{selectedCaregiver.certificateNumber}
                            </p>
                            <p>
                                <strong>License No:</strong> #{selectedCaregiver.licenseNumber}
                            </p>
                        </div>

                        <div className={styles.tabBar}>
                            <button
                                className={`${styles.tab} ${activeTab === 'certificate' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('certificate')}
                            >
                                Certificate
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'license' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('license')}
                            >
                                License
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'govid' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('govid')}
                            >
                                Govt ID
                            </button>
                        </div>

                        <div className={styles.docWrapper}>
                            {currentDocUrl?.endsWith('.pdf') ? (
                                <iframe
                                    key={currentDocUrl}
                                    src={getFileUrl(currentDocUrl)}
                                    className={styles.docIframe}
                                    title="Caregiver Document Viewer"
                                />
                            ) : currentDocUrl ? (
                                <img
                                    key={currentDocUrl}
                                    src={getFileUrl(currentDocUrl)}
                                    className={styles.docImage}
                                    alt="Caregiver Document Preview"
                                />
                            ) : (
                                <div className={styles.noDoc}>No document uploaded</div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                title="Reason for Rejection"
                footer={
                    <>
                        <button className={styles.cancelBtn} onClick={() => setIsRejectionModalOpen(false)}>
                            Cancel
                        </button>
                        <button
                            className={styles.rejectBtn}
                            onClick={() =>
                                selectedCaregiver && handleAction(selectedCaregiver._id, 'rejected', rejectionReason)
                            }
                        >
                            Confirm Reject
                        </button>
                    </>
                }
            >
                <div className={styles.rejectionBody}>
                    <p>Please provide a reason for rejecting {selectedCaregiver?.name}'s application:</p>
                    <textarea
                        className={styles.rejectionTextarea}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Certificate is expired or invalid..."
                        rows={4}
                    />
                </div>
            </Modal>
        </>
    )
}

export default CaregiverVerificationPage
