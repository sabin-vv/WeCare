import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getAdminAppointments } from '../api/admin.api'
import { INITIAL_APPOINTMENT_FILTERS, STATUS_OPTIONS } from '../constants/admin.constants'
import type { AdminAppointment } from '../types/admin.types'

import styles from './AdminAppointmentsPage.module.css'

import DateRangePicker from '@/shared/components/DateRangePicker/DateRangePicker'
import PageHeader from '@/shared/components/PageHeader/PageHeader'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import SelectField from '@/shared/components/SelectField/SelectField'
import DataTable from '@/shared/components/Table/DataTable'
import type { Column } from '@/shared/components/Table/dataTable.types'
import { DATE_FORMAT } from '@/shared/constants/date.constants'
import { DEFAULT_PAGINATION } from '@/shared/constants/pagination.constants'
import { formatDate } from '@/utils/formatDate'
import { getErrorMessage } from '@/utils/getErrorMessage'

const STATUS_BADGE: Record<string, string> = {
    pending_payment: styles.badgePending,
    confirmed: styles.badgeConfirmed,
    in_consultation: styles.badgeConsultation,
    completed: styles.badgeCompleted,
    cancelled: styles.badgeCancelled,
    missed: styles.badgeMissed,
}

const statusLabel = (status: AdminAppointment['status']) =>
    status
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

const PaymentBadge = ({ status }: { status?: string }) => {
    if (!status) return <span className={styles.paymentNone}>—</span>
    const cls =
        status === 'success'
            ? styles.paymentSuccess
            : status === 'failed' || status === 'refunded'
              ? styles.paymentFailed
              : styles.paymentPending
    return <span className={`${styles.paymentBadge} ${cls}`}>{status}</span>
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

const columns: Column<AdminAppointment>[] = [
    {
        header: 'Patient',
        key: 'patientName',
        render: (item) => (
            <div className={styles.userCell}>
                <Avatar name={item.patientName} image={item.patientProfileImage} />
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{item.patientName}</span>
                    <span className={styles.userEmail}>{item.patientEmail}</span>
                </div>
            </div>
        ),
    },
    {
        header: 'Doctor',
        key: 'doctorName',
        render: (item) => (
            <div className={styles.userCell}>
                <Avatar name={item.doctorName} image={item.doctorProfileImage} />
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{item.doctorName}</span>
                    <span className={styles.userEmail}>{item.specialization}</span>
                </div>
            </div>
        ),
    },
    {
        header: 'Appointment ID',
        key: 'appointmentId',
        render: (item) => <span className={styles.idCell}>{item.appointmentId}</span>,
    },
    {
        header: 'Date',
        key: 'appointmentDate',
        render: (item) => (
            <span className={styles.dateCell}>{formatDate(item.appointmentDate, DATE_FORMAT.SHORT)}</span>
        ),
    },
    {
        header: 'Time',
        key: 'slotStart',
        render: (item) => (
            <span className={styles.timeCell}>
                {item.slotStart} - {item.slotEnd}
            </span>
        ),
    },
    {
        header: 'Status',
        key: 'status',
        render: (item) => (
            <span className={`${styles.statusBadge} ${STATUS_BADGE[item.status] || ''}`}>
                {statusLabel(item.status)}
            </span>
        ),
    },
    {
        header: 'Payment',
        key: 'paymentStatus',
        render: (item) => <PaymentBadge status={item.paymentStatus} />,
    },
]

const AdminAppointmentsPage = () => {
    const [appointments, setAppointments] = useState<AdminAppointment[]>([])
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
    const [filters, setFilters] = useState(INITIAL_APPOINTMENT_FILTERS)
    const [loading, setLoading] = useState(true)

    const fetchAppointments = useCallback(
        async (page: number) => {
            setLoading(true)
            try {
                const data = await getAdminAppointments(
                    page,
                    pagination.limit,
                    filters.search || undefined,
                    filters.status,
                    filters.startDate || undefined,
                    filters.endDate || undefined,
                )
                setAppointments(data.appointments)
                setPagination(data.pagination)
            } catch (error) {
                toast.error(getErrorMessage(error))
                setAppointments([])
            } finally {
                setLoading(false)
            }
        },
        [filters, pagination.limit],
    )

    useEffect(() => {
        fetchAppointments(1)
    }, [fetchAppointments])

    const updateFilter = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters(INITIAL_APPOINTMENT_FILTERS)
    }

    const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== 'all')

    return (
        <>
            <PageHeader title="Appointments" subtitle="View and manage all platform appointments" />

            <div className={styles.filterSection}>
                <div className={styles.searchRow}>
                    <SearchField
                        placeholder="Search by patient or doctor name/email..."
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
                            options={STATUS_OPTIONS}
                            value={filters.status}
                            onChange={(e) => updateFilter('status', e.target.value)}
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

            <DataTable
                data={appointments}
                columns={columns}
                keyExtractor={(item) => item.appointmentId}
                isLoading={loading}
            >
                {appointments.length > 0 && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalCount={pagination.totalCount}
                        limit={pagination.limit}
                        onPageChange={(page) => fetchAppointments(page)}
                    />
                )}
            </DataTable>
        </>
    )
}

export default AdminAppointmentsPage
