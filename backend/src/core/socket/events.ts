export const SOCKET_EVENTS = {
    NEW_ALERT: 'new_alert',
    ALERT_ACKNOWLEDGED: 'alert_acknowledged',
    NEW_NOTIFICATION: 'new_notification',
    NEW_CHAT_MESSAGE: 'new_chat_message',
    CHAT_MESSAGE_SENT: 'chat_message_sent',
} as const

export const EVENTS = SOCKET_EVENTS
