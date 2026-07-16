import { Fragment, useEffect, useRef } from 'react'

import styles from './Chat.module.css'
import ChatInput from './ChatInput'
import MessageBubble from './MessageBubble'

import type { ChatWindowProps } from '@/modules/chat/types/chat.types'
import { formatDateSeparator } from '@/shared/utils/time.utils'
import { getFileUrl } from '@/utils/getFileUrl'

const ChatWindow = ({
    messages,
    patientName,
    otherPersonName,
    otherPersonProfileImage,
    currentUserId,
    onSend,
    disabled,
    isLoading,
}: ChatWindowProps) => {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = containerRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [messages])

    return (
        <div className={styles.chatWindow}>
            <div className={styles.chatWindowHeader}>
                <div className={styles.chatWindowHeaderAvatar}>
                    {otherPersonProfileImage ? (
                        <img
                            src={getFileUrl(otherPersonProfileImage)}
                            alt=""
                            className={styles.chatWindowHeaderAvatarImg}
                        />
                    ) : (
                        otherPersonName.charAt(0).toUpperCase()
                    )}
                </div>
                <div className={styles.chatWindowHeaderText}>
                    <div className={styles.chatWindowHeaderName}>{otherPersonName}</div>
                    <div className={styles.chatWindowHeaderAbout}>about {patientName}</div>
                </div>
            </div>

            <div ref={containerRef} className={styles.messagesContainer}>
                {isLoading ? (
                    <div className={styles.emptyState}>Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className={styles.emptyState}>No messages yet. Start the conversation!</div>
                ) : null}
                {!isLoading &&
                    messages.map((msg, i) => {
                        const showDivider =
                            i === 0 ||
                            new Date(msg.createdAt).toDateString() !==
                                new Date(messages[i - 1].createdAt).toDateString()
                        return (
                            <Fragment key={msg.id}>
                                {showDivider && (
                                    <div className={styles.dateDivider}>
                                        {formatDateSeparator(msg.createdAt)}
                                    </div>
                                )}
                                <MessageBubble message={msg} isOwn={msg.senderId === currentUserId} />
                            </Fragment>
                        )
                    })}
            </div>

            <ChatInput onSend={onSend} disabled={disabled} />
        </div>
    )
}

export default ChatWindow
