import styles from './Chat.module.css'

import type { ConversationListProps } from '@/modules/chat/types/chat.types'
import { getFileUrl } from '@/utils/getFileUrl'

const ConversationList = ({
    conversations,
    selectedPatientId,
    onSelect,
    currentUserRole,
    onNewChat,
}: ConversationListProps) => {
    return (
        <div className={styles.convList}>
            <div className={styles.convListHeader}>
                <span className={styles.convListTitle}>Conversations</span>
                {onNewChat && (
                    <button type="button" onClick={onNewChat} className={styles.newChatBtn}>
                        + New Chat
                    </button>
                )}
            </div>
            {conversations.length === 0 && <div className={styles.loadingCenter}>No conversations yet</div>}
            {conversations.map((conv) => {
                const isSelected = conv.patientId === selectedPatientId
                return (
                    <button
                        type="button"
                        key={conv.patientId}
                        onClick={() => onSelect(conv.patientId)}
                        className={`${styles.convItem} ${isSelected ? styles.convItemSelected : ''}`}
                    >
                        <div className={styles.convItemContent}>
                            <div className={styles.convItemAvatar}>
                                {conv.otherPersonProfileImage ? (
                                    <img
                                        src={getFileUrl(conv.otherPersonProfileImage)}
                                        alt=""
                                        className={styles.convItemAvatarImg}
                                    />
                                ) : (
                                    conv.otherPersonName.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className={styles.convItemText}>
                                <div className={styles.convItemTop}>
                                    <span className={styles.convItemName}>{conv.otherPersonName}</span>
                                    {conv.unreadCount > 0 && <span className={styles.badge}>{conv.unreadCount}</span>}
                                </div>
                                <div
                                    className={`${styles.convItemPreview} ${conv.unreadCount > 0 ? styles.convItemPreviewNew : styles.convItemPreviewRead}`}
                                >
{conv.lastSenderId
    ? `${conv.lastSenderRole === currentUserRole ? 'You: ' : ''}`
    : ''}
                                    {conv.lastMessage}
                                </div>
                            </div>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}

export default ConversationList
