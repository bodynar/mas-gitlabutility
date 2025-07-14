import { ErrorInfo } from "react";

import { Moment } from "moment";

/**
 * Log unhandled error
 * @param error Unhandled error
 * @param errorInfo Information about the cause of the error
 */
export const logError = (error: Error, errorInfo: ErrorInfo): void => {
    window.electron.log.error(error, errorInfo);
};

/**
 * Open log file
 * @param date Log file date
 */
export const openErrorLogFile = (date: Moment): boolean => {
    return window.electron.log.open(date.format("YYYY-MM-DD"));
};
