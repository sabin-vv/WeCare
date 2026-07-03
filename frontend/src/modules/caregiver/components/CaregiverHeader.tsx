import Header from '../../../shared/components/Header/Header'

import { useUnreadChatCount } from '@/modules/chat/hooks/useUnreadChatCount'
import { caregiverNavLinks } from '@/shared/constants/navLinks'

const CaregiverHeader = () => {
    const { unreadChatCount } = useUnreadChatCount()

    const links = caregiverNavLinks.map((link) =>
        link.label === 'Chat' ? { ...link, badge: unreadChatCount } : link,
    )

    return <Header navLinks={links} />
}

export default CaregiverHeader
