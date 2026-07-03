import { useChatUnreadCount } from '@/shared/context/ChatUnreadCountContext'

export const useUnreadChatCount = () => {
    return useChatUnreadCount()
}
