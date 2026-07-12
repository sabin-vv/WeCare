import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getAdminPayments } from '../api/admin.api'
import { INITIAL_PAYMENT_FILTERS, PAYMENT_STATUS_OPTIONS, PAYMENT_TYPE_OPTIONS } from '../constants/admin.constants'
import type { AdminPayment } from '../types/admin.types'

import styles from './AdminPaymentsPage.module.css'

import DateRangePicker from '@/shared/components/DateRangePicker/DateRangePicker'
import PageHeader from '@/shared/components/PageHeader/PageHeader'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import SelectField from '@/shared/components/SelectField/SelectField'
import DataTable from '@/shared/components/Table/DataTable'
import type { Column } from '@/shared/components/Table/DataTable.types'
import { DEFAULT_PAGINATION } from '@/shared/constants/pagination.constants'
import { DATE_FORMAT, formatCurrency, formatDate } from '@/shared/utils/format'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { getFileUrl } from '@/utils/getFileUrl'

const PAYMENT_STATUS_BADGE: Record<string, string> = {
    pending: styles.badgePending,
    success: styles.badgeSuccess,
    failed: styles.badgeFailed,
    refund_pending: styles.badgeRefundPending,
    refunded: styles.badgeRefunded,
}

const Avatar = ({ name, image }: { name: string; image?: string }) => {
    const [hasError, setHasError] = useState(false)
    const initials = name
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    if (!image || hasError) return <div className={styles.avatarFallback}>{initials}</div>
    return <img src={image} alt={name} className={styles.avatarImg} onError={() => setHasError(true)} />
}

const columns: Column<AdminPayment>[] = [
    {
        header: 'Patient',
        key: 'patientName',
        render: (item) => (
            <div className={styles.userCell}>
                <Avatar name={item.patientName} image={getFileUrl(item.patientProfileImage)} />
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{item.patientName}</span>
                    <span className={styles.userEmail}>{item.patientEmail}</span>
                </div>
            </div>
        ),
    },
    {
        header: 'Payment ID',
        key: 'paymentId',
        render: (item) => <span className={styles.idCell}>{item.paymentId.slice(-8).toUpperCase()}</span>,
    },
    {
        header: 'Type',
        key: 'paymentType',
        render: (item) => (
            <span className={styles.typeBadge}>
                {item.paymentType.charAt(0).toUpperCase() + item.paymentType.slice(1)}
            </span>
        ),
    },
    {
        header: 'Method',
        key: 'paymentMethod',
        render: (item) => (
            <span className={styles.methodBadge}>{item.paymentMethod === 'razorpay' ? 'Razorpay' : 'Wallet'}</span>
        ),
    },
    {
        header: 'Amount',
        key: 'totalAmount',
        render: (item) => <span className={styles.amountCell}>{formatCurrency(item.totalAmount)}</span>,
    },
    {
        header: 'Status',
        key: 'status',
        render: (item) => (
            <span className={`${styles.statusBadge} ${PAYMENT_STATUS_BADGE[item.status] || ''}`}>
                {item.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
        ),
    },
    {
        header: 'Date',
        key: 'createdAt',
        render: (item) => <span className={styles.dateCell}>{formatDate(item.createdAt, DATE_FORMAT.SHORT)}</span>,
    },
]

const AdminPaymentsPage = () => {
    const [payments, setPayments] = useState<AdminPayment[]>([])
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
    const [filters, setFilters] = useState(INITIAL_PAYMENT_FILTERS)
    const [loading, setLoading] = useState(true)

    const fetchPayments = useCallback(
        async (page: number) => {
            setLoading(true)
            try {
                const data = await getAdminPayments(
                    page,
                    pagination.limit,
                    filters.search || undefined,
                    filters.status,
                    filters.paymentType,
                    filters.startDate || undefined,
                    filters.endDate || undefined,
                )
                setPayments(data.payments)
                setPagination(data.pagination)
            } catch (error) {
                toast.error(getErrorMessage(error))
                setPayments([])
            } finally {
                setLoading(false)
            }
        },
        [filters, pagination.limit],
    )

    useEffect(() => {
        fetchPayments(1)
    }, [fetchPayments])

    const updateFilter = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters(INITIAL_PAYMENT_FILTERS)
    }

    const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== 'all')

    return (
        <>
            <PageHeader title="Payments" subtitle="View all platform payments and transactions" />

            <div className={styles.filterSection}>
                <div className={styles.searchRow}>
                    <SearchField
                        placeholder="Search by patient name or email..."
                        value={filters.search}
                        onChange={(value) => updateFilter('search', value)}
                    />
                    {hasActiveFilters && (
                        <button className={styles.clearBtn} onClick={clearFilters} type="button">
                            Clear
                            <X size={16} />
                        </button>
                    )}
                </div>
                <div className={styles.filterRow}>
                    <div className={styles.filterItem}>
                        <SelectField
                            options={PAYMENT_STATUS_OPTIONS}
                            value={filters.status}
                            onChange={(e) => updateFilter('status', e.target.value)}
                        />
                    </div>
                    <div className={styles.filterItem}>
                        <SelectField
                            options={PAYMENT_TYPE_OPTIONS}
                            value={filters.paymentType}
                            onChange={(e) => updateFilter('paymentType', e.target.value)}
                        />
                    </div>
                    <div className={styles.dateRangeItem}>
                        <DateRangePicker
                            value={{ start: filters.startDate, end: filters.endDate }}
                            onChange={(v) => setFilters((prev) => ({ ...prev, startDate: v.start, endDate: v.end }))}
                            maxDate={new Date()}
                        />
                    </div>
                </div>
            </div>

            <DataTable data={payments} columns={columns} keyExtractor={(item) => item.paymentId} isLoading={loading}>
                {payments.length > 0 && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalCount={pagination.totalCount}
                        limit={pagination.limit}
                        onPageChange={(page) => fetchPayments(page)}
                    />
                )}
            </DataTable>
        </>
    )
}

export default AdminPaymentsPage
