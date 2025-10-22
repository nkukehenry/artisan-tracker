/**
 * Shared Message Types Configuration
 * This file contains the centralized list of supported message types
 * that can be used across both frontend and backend applications.
 */

export const MESSAGE_TYPES = [
    'SMS',
    'WHATSAPP',
    'TELEGRAM',
    'FACEBOOK',
    'INSTAGRAM',
    'TWITTER',
    'GMAIL',
    'TIKTOK',
    'OTHER'
] as const;

export type MessageType = typeof MESSAGE_TYPES[number];

/**
 * Message type labels for display purposes
 */
export const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
    SMS: 'SMS',
    WHATSAPP: 'WhatsApp',
    TELEGRAM: 'Telegram',
    FACEBOOK: 'Facebook',
    INSTAGRAM: 'Instagram',
    TWITTER: 'Twitter',
    GMAIL: 'Gmail',
    TIKTOK: 'TikTok',
    OTHER: 'Other'
};

/**
 * Get all message types as an array
 */
export const getAllMessageTypes = (): MessageType[] => {
    return [...MESSAGE_TYPES];
};

/**
 * Get message type options for dropdowns/selects
 */
export const getMessageTypeOptions = () => {
    return MESSAGE_TYPES.map(type => ({
        value: type,
        label: MESSAGE_TYPE_LABELS[type]
    }));
};

/**
 * Check if a string is a valid message type
 */
export const isValidMessageType = (type: string): type is MessageType => {
    return MESSAGE_TYPES.includes(type as MessageType);
};

/**
 * Get message type label
 */
export const getMessageTypeLabel = (type: MessageType): string => {
    return MESSAGE_TYPE_LABELS[type];
};
