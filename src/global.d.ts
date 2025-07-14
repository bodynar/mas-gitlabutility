/** To use dynamic import in @app/modules/app/components/brand */
declare module "*.scss";

import { ErrorInfo } from "react";

declare global {
    /** Application locale (initial value) */
    declare const appLocale: string;
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

                /**
                 * Remove storage entry by key
                 * @param key Storage unique key
                 */
                remove: (key: string) => void;
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
                 * Open error log file
                 * @param date Log file formatted date
                 * @returns Is log file for requested date exists
                 */
                open: (date: string) => boolean;

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

                /**
                 * Subscribe to app close
                 * @param callback Obligatory function
                 */
                onBeforeAppClose: (callback: () => Promise<void>) => void;

                /**
                 * Update loading state at taskbar if app is minimized
                 * @param state Current state (in range [0; 1.0])
                 * @param important Is important update (suppress checks)
                 */
                updateLoadingState: (state: number, important = false) => void;
            }
        };
    }
}
