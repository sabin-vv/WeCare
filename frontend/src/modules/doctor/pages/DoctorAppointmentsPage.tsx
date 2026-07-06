import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { getDoctorAppointments } from '../api/doctor.api'
import { CONSULTATION_STATUS_OPTIONS, formatAppointmentStatusLabel } from '../constants/doctor.constants'
import type { DoctorAppointment } from '../types/doctor.types'

import styles from './DoctorAppointmentsPage.module.css'

import MainWrapper from '@/shared/components/MainWrapper/MainWrapper'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import DataTable from '@/shared/components/Table/DataTable'
import type { Column } from '@/shared/components/Table/dataTable.types'
import { DEFAULT_PAGINATION } from '@/shared/constants/pagination.constants'
import { DATE_FORMAT, formatDate, getInitials } from '@/shared/utils/format'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { getFileUrl } from '@/utils/getFileUrl'

const DoctorAppointmentsPage = () => {
    const [appointments, setAppointments] = useState<DoctorAppointment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [consultationStatus, setConsultationStatus] = useState('all')
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => {
            const fetchAppointments = async () => {
                setIsLoading(true)
                try {
                    const data = await getDoctorAppointments(search, page, pagination.limit)
                    setAppointments(data.appointments)
                    setPagination(data.pagination)
                } catch (error) {
                    toast.error(getErrorMessage(error))
                } finally {
                    setIsLoading(false)
                }
            }

            fetchAppointments()
        }, 300)

        return () => clearTimeout(timer)
    }, [search, page, pagination.limit])

    useEffect(() => {
        setPage(1)
    }, [search])

    const filteredAppointments = appointments.filter(
        (appointment) => consultationStatus === 'all' || appointment.status === consultationStatus,
    )

    const PatientAvatar = ({ name, profileImage }: { name?: string; profileImage?: string }) => {
        const [hasError, setHasError] = useState(false)
        const imageUrl = profileImage ? getFileUrl(profileImage) : ''
        const safeName = name?.trim() || 'Unknown Patient'
        if (!imageUrl || hasError) {
            const initials = getInitials(safeName)
            return <div className={styles.avatarFallback}>{initials}</div>
        }
        return <img src={imageUrl} alt={safeName} className={styles.avatarImage} onError={() => setHasError(true)} />
    }

    const columns: Column<DoctorAppointment>[] = [
        {
            header: 'Patient',
            key: 'name',
            render: (item) => (
                <div className={styles.patientCell}>
                    <PatientAvatar name={item.name} profileImage={item.profileImage} />
                    <div className={styles.patientInfo}>
                        <span className={styles.patientName}>{item.name}</span>
                        <span className={styles.patientEmail}>{item.email}</span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Date',
            key: 'appointmentDate',
            render: (item) => <span>{formatDate(item.appointmentDate, DATE_FORMAT.SHORT)}</span>,
        },
        {
            header: 'Time',
            key: 'slotStart',
            render: (item) => (
                <span>
                    {item.slotStart} - {item.slotEnd}
                </span>
            ),
        },
        {
            header: 'Consultation Status',
            key: 'status',
            render: (item) => (
                <span className={`${styles.badge} ${styles[item.status]}`}>
                    {formatAppointmentStatusLabel(item.status)}
                </span>
            ),
        },
        {
            header: 'Action',
            key: 'appointmentId',
            render: (item) => (
                <button className={styles.viewBtn} onClick={() => navigate(`/doctor/patients/${item.patientId}`)}>
                    View
                </button>
            ),
        },
    ]

    return (
        <MainWrapper title="Appointments" subtitle="Track consultations and payment progress">
            <div className={styles.filterSection}>
                <div className={styles.searchWrapper}>
                    <SearchField value={search} onSearch={setSearch} placeholder="Search by patient name or email..." />
                </div>
                <div className={styles.filtersWrapper}>
                    <div className={styles.filterGroup}>
                        <ul className={styles.filterList}>
                            {CONSULTATION_STATUS_OPTIONS.map((option) => (
                                <li
                                    key={option.value}
                                    className={styles.filterItem}
                                    onClick={() => setConsultationStatus(option.value)}
                                    aria-current={consultationStatus === option.value}
                                >
                                    {option.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <DataTable
                data={filteredAppointments}
                columns={columns}
                keyExtractor={(item) => item.appointmentId}
                isLoading={isLoading}
            >
                {!isLoading && appointments.length > 0 && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalCount={pagination.totalCount}
                        limit={pagination.limit}
                        onPageChange={setPage}
                    />
                )}
            </DataTable>
        </MainWrapper>
    )
}

export default DoctorAppointmentsPage
