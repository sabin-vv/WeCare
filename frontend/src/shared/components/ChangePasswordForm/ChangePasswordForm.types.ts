export interface ChangePasswordFormProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (currentPassword: string, newPassword: string) => Promise<void>
    isLoading: boolean
}