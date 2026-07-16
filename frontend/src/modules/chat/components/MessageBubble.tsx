import styles from './Chat.module.css'

import type { MessageBubbleProps } from '@/modules/chat/types/chat.types'
import { formatMessageTime } from '@/shared/utils/time.utils'

const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
    return (
        <div className={`${styles.bubbleRow} ${isOwn ? styles.bubbleRowEnd : styles.bubbleRowStart}`}>
            <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}>
                <div className={styles.bubbleText}>{message.message}</div>

                <div className={styles.footer}>
                    <span className={styles.bubbleTime}>{formatMessageTime(message.createdAt)}</span>
                </div>
            </div>
        </div>
    )
}

export default MessageBubble
