/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation (default: 10)
 * @param ellipsis - The ellipsis character to use (default: '...')
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string | null | undefined, maxLength: number = 10, ellipsis: string = '...'): string => {
    if (!text) return '';

    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(0, maxLength) + ellipsis;
};

/**
 * Truncates text with a tooltip showing the full text
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation (default: 10)
 * @param ellipsis - The ellipsis character to use (default: '...')
 * @returns Object with truncated text and full text for tooltip
 */
export const truncateWithTooltip = (text: string | null | undefined, maxLength: number = 10, ellipsis: string = '...') => {
    const fullText = text || '';
    const truncated = truncateText(fullText, maxLength, ellipsis);

    return {
        display: truncated,
        fullText: fullText,
        isTruncated: fullText.length > maxLength
    };
};

/**
 * Truncates text for different contexts with predefined lengths
 */
export const truncate = {
    short: (text: string | null | undefined) => truncateText(text, 10),
    medium: (text: string | null | undefined) => truncateText(text, 20),
    long: (text: string | null | undefined) => truncateText(text, 50),
    custom: (text: string | null | undefined, length: number) => truncateText(text, length)
};
