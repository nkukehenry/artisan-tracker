import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(tz);

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formats a datetime from the API to DD/MMM/YYYY HH:mm format
 * @param dateTime - Date string, Date object, or dayjs-compatible date value from API
 * @returns Formatted date string in DD/MMM/YYYY HH:mm format (e.g., "15/Jan/2024 14:30")
 */
export function formatDateTime(dateTime: string | Date | dayjs.Dayjs | null | undefined): string {
    if (!dateTime) {
        return '';
    }
    return dayjs.utc(dateTime).tz(dayjs.tz.guess()).format('DD/MMM/YYYY HH:mm');
}


/**
 * Formats a datetime from the API to DD/MMM/YYYY format
 * @param dateTime - Date string, Date object, or dayjs-compatible date value from API
 * @returns Formatted date string in DD/MMM/YYYY format (e.g., "15/Jan/2024")
 */
export function formatDate(dateTime: string | Date | dayjs.Dayjs | null | undefined): string {
    if (!dateTime) {
        return '';
    }
    return dayjs.utc(dateTime).tz(dayjs.tz.guess()).format('DD/MMM/YYYY');
}

/**
 * Calculates the difference in minutes between now and the passed datetime
 * @param dateTime - Date string, Date object, or dayjs-compatible date value from API
 * @returns Difference in minutes (positive if dateTime is in the past, negative if in the future). Returns 0 if dateTime is null/undefined
 */
export function getMinutesDifference(dateTime: string | Date | dayjs.Dayjs | null | undefined): number {
    if (!dateTime) {
        return 0;
    }
    const now = dayjs.utc().tz(dayjs.tz.guess());
    const target = dayjs.utc(dateTime).tz(dayjs.tz.guess());
    return now.diff(target, 'minute');
}
