import { OperationResult, Session, Notification } from "@app/models";

/** App history data */
export type AppHistory = {
    /** App sessions */
    sessions: Array<Session>;

    /** Notifications history */
    notifications: Array<Notification>;

    /** Operation results history */
    results: Array<OperationResult<any>>;
};
