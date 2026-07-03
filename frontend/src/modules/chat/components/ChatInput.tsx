import { useState, type FormEvent, type KeyboardEvent } from 'react'

import type { ChatInputProps } from '../types/chat.types'

import styles from './Chat.module.css'

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
    const [text, setText] = useState('')

    const handleSend = () => {
        const trimmed = text.trim()
        if (!trimmed) return
        onSend(trimmed)
        setText('')
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        handleSend()
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const canSend = !!text.trim()

    return (
        <form onSubmit={handleSubmit} className={styles.inputForm}>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={disabled}
                rows={1}
                className={styles.inputField}
            />
            <button
                type="submit"
                disabled={disabled || !canSend}
                className={`${styles.sendBtn} ${canSend ? styles.sendBtnActive : styles.sendBtnDisabled}`}
            >
                Send
            </button>
        </form>
    )
}

export default ChatInput
