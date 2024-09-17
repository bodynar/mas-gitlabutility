/** To use dynamic import in @app/modules/app/components/brand */
declare module "*.scss";

import { ErrorInfo } from "react";

declare global {
    interface Window {
        electron: {
            /** Persistent data storage */
            store: {
                /**
                 * Get value from persistent storage
                 * @param key Storage unique key
                 * @returns Value if it was found; otherwise - undefined
                 */
                get: <TValue>(key: string) => TValue | undefined;

                /**
                 * Save value in storage
                 * @param key Storage unique key
                 * @param value Value to store
                 */
                set: <TValue>(key: string, value: TValue) => void;

                /**
                 * Check is any value stored with specified key in storage
                 * @param key Storage unique key
                 * @returns `true` if storage contains stored value for this key; otherwise - `false`
                 */
                has: (key: string) => boolean;
            };

            /** Application logs */
            log: {
                /**
                 * Log unhandled error
                 * @param error Unhandled error
                 * @param errorInfo Information about the cause of the error
                 */
                error: (error: Error, errorInfo: ErrorInfo) => void;

                /**
                 * Open current error log file
                 */
                open: () => void;

                /**
                 * Open error logs folder
                 */
                folder: () => void;
            };

            /** Application common fns */
            app: {
                /** Flash app task icon if app not in focus */
                flash: () => void;

                /**
                 * Prevent app close (display warning message box)
                 * @param canClose Should app close be prevented
                 */
                preventClose: (canClose: boolean) => void;
            }
        };
    }
}
