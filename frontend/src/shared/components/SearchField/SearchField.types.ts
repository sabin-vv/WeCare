export interface SearchFieldProps {
    value: string
    placeholder?: string
    onSearch?: (value: string) => void
    onChange?: (value: string) => void
    delay?: number
    suggestions?: string[]
    isLoading?: boolean
    onSelect?: (value: string) => void
}
