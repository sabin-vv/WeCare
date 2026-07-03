import type { ChatLayoutProps } from '../types/chat.types'

import styles from './Chat.module.css'

const ChatLayout = ({ children }: ChatLayoutProps) => {
    return <div className={styles.layout}>{children}</div>
}

export default ChatLayout
