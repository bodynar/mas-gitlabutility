/** Global IPC message prefix */
const prefix = "electron";

/** IPC message prefix for store operations */
const storePrefix = `${prefix}-store`;

/** IPC message prefix for log operations */
const logPrefix = `${prefix}-log`;

const appPrefix = `${prefix}-app`;

/** IPC operation messages */
export const ipcMessages = {
    /** store operations */
    store: {
        /** Get store entry */
        get: `${storePrefix}_get`,

        /** Set store entry */
        set: `${storePrefix}_set`,

        /** Check has store entry */
        has: `${storePrefix}_has`,
    },

    /** log operations */
    log: {
        /** Write error */
        write: `${logPrefix}_error-write`,

        /** Open error log */
        open: `${logPrefix}_error-open`,
    },

    /** app operations */
    app: {
        /** Flash if app in foreground */
        flash: `${appPrefix}_flash`,

        /** Prevent app from closing */
        preventClose: `${appPrefix}_preventCloseChange`,
    },
};
