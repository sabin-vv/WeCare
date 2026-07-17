import type { ChatLayoutProps } from '../types/chat.types'

import styles from './Chat.module.css'

const ChatLayout = ({ children, hasActiveChat }: ChatLayoutProps) => {
    return <div className={`${styles.layout} ${hasActiveChat ? styles.hasActiveChat : ''}`}>{children}</div>
}

export default ChatLayout
