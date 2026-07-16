export const getTimePeriod = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Morning'
    if (hour >= 12 && hour < 17) return 'Afternoon'
    if (hour >= 17 && hour < 21) return 'Evening'
    return 'Night'
}

export const isToday = (dateStr: string) =>
    new Date(dateStr).toDateString() === new Date().toDateString()

export const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }
    return age
}

export const formatMessageTime = (dateStr: string): string =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export const nowHHMM = (): string => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const formatDateSeparator = (dateStr: string): string => {
    const d = new Date(dateStr)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) return 'Today'
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
}

export const formatRelativeDate = (isoString: string): string => {
    const today = new Date()
    const date = new Date(isoString)
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return `Overdue (${Math.abs(diffDays)}d)`
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `${diffDays} days away`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
