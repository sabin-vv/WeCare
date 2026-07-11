import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { getActivityLogs } from '../api/admin.api'
import {
    CATEGORY_OPTIONS,
    INITIAL_ACTIVITY_LOG_FILTERS,
    ROLE_OPTIONS,
    TARGET_TYPE_OPTIONS,
} from '../constants/admin.constants'
import type { ActivityLogFilters } from '../types/admin.types'
import type { ActivityLogEntry } from '../types/admin.types'

import styles from './ActivityLogsPage.module.css'

import DateRangePicker from '@/shared/components/DateRangePicker/DateRangePicker'
import PageHeader from '@/shared/components/PageHeader/PageHeader'
import Pagination from '@/shared/components/Pagination/Pagination'
import SearchField from '@/shared/components/SearchField/SearchField'
import SelectField from '@/shared/components/SelectField/SelectField'
import DataTable from '@/shared/components/Table/DataTable'
import type { Column } from '@/shared/components/Table/DataTable.types'
import { DEFAULT_PAGINATION } from '@/shared/constants/pagination.constants'
import type { PaginationData } from '@/shared/types/pagination.types'
import { DATE_FORMAT, formatDate } from '@/shared/utils/format'

const columns: Column<ActivityLogEntry>[] = [
    {
        header: 'Date & Time',
        key: 'createdAt',
        render: (item) => <span className={styles.timestamp}>{formatDate(item.createdAt, DATE_FORMAT.DATE_TIME)}</span>,
    },
    {
        header: 'Performed By',
        key: 'performedByRole',
        render: (item) => (
            <span className={styles.userCell}>{item.performedByRole ? item.performedByRole : 'System'}</span>
        ),
    },
    {
        header: 'Category',
        key: 'category',
        render: (item) => <span className={styles.badge}>{item.category.replace(/_/g, ' ')}</span>,
    },
    {
        header: 'Action',
        key: 'action',
        render: (item) => item.action.replace(/_/g, ' '),
    },
    {
        header: 'Description',
        key: 'description',
    },
]

const ActivityLogsPage = () => {
    const [logs, setLogs] = useState<ActivityLogEntry[]>([])
    const [pagination, setPagination] = useState<PaginationData>(DEFAULT_PAGINATION)
    const [filters, setFilters] = useState(INITIAL_ACTIVITY_LOG_FILTERS)
    const [loading, setLoading] = useState(true)

    const fetchLogs = useCallback(
        async (page: number) => {
            setLoading(true)
            try {
                const activeFilters: ActivityLogFilters = {}
                for (const [key, value] of Object.entries(filters)) {
                    if (value) activeFilters[key as keyof ActivityLogFilters] = value
                }
                const res = await getActivityLogs(page, pagination.limit, activeFilters)
                setLogs(res.data)
                setPagination(res.pagination)
            } catch {
                setLogs([])
            } finally {
                setLoading(false)
            }
        },
        [filters, pagination.limit],
    )

    useEffect(() => {
        fetchLogs(1)
    }, [fetchLogs])

    const updateFilter = (key: keyof ActivityLogFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters(INITIAL_ACTIVITY_LOG_FILTERS)
    }

    const hasActiveFilters = Object.values(filters).some((v) => v !== '')

    return (
        <>
            <PageHeader title="Activity Logs" subtitle="Track all system-wide actions and changes" />

            <div className={styles.filterSection}>
                <div className={styles.searchRow}>
                    <SearchField
                        placeholder="Search descriptions..."
                        value={filters.search!}
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
                            options={ROLE_OPTIONS}
                            value={filters.performedByRole}
                            onChange={(e) => updateFilter('performedByRole', e.target.value)}
                        />
                    </div>
                    <div className={styles.filterItem}>
                        <SelectField
                            options={CATEGORY_OPTIONS}
                            value={filters.category}
                            onChange={(e) => updateFilter('category', e.target.value)}
                        />
                    </div>
                    <div className={styles.filterItem}>
                        <SelectField
                            options={TARGET_TYPE_OPTIONS}
                            value={filters.targetType}
                            onChange={(e) => updateFilter('targetType', e.target.value)}
                        />
                    </div>
                    <div className={styles.dateRangeItem}>
                        <DateRangePicker
                            value={{ start: filters.startDate ?? '', end: filters.endDate ?? '' }}
                            onChange={(v) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    startDate: v.start,
                                    endDate: v.end,
                                }))
                            }
                            maxDate={new Date()}
                        />
                    </div>
                </div>
            </div>

            <DataTable data={logs} columns={columns} keyExtractor={(item) => item.id} isLoading={loading}>
                {logs.length > 0 && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalCount={pagination.totalCount}
                        limit={pagination.limit}
                        onPageChange={(page) => fetchLogs(page)}
                    />
                )}
            </DataTable>
        </>
    )
}

export default ActivityLogsPage
