import { ErrorInfo } from "react";

/**
 * Log unhandled error
 * @param error Unhandled error
 * @param errorInfo Information about the cause of the error
 */
export const logError = (error: Error, errorInfo: ErrorInfo): void => {
    window.electron.log.error(error, errorInfo);
};

/** Open current log file */
export const openCurrentErrorLogFile = (): void => {
    window.electron.log.open();
};
