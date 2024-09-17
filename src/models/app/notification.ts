import { Moment } from "moment";

/** Types of displayable notification */
export enum NotificationType {
    /** Informational notification */
    info,

    /** Some positive result notification */
    success,

    /** Near-emergency result notification */
    warn,

    /** Error result notification */
    error,
}

/** Displayable notification */
export interface Notification {
    /** Unique identifier */
    id: string;

    /** Date of creation */
    createdOn: Moment;

    /** Textual content */
    message: string;

    /** Meaning type */
    type: NotificationType;

    /**
     * Is notification important.
     * Important notification do not hide automatically
     */
    important?: boolean;

    /** Was notification hidden by user */
    hidden: boolean;

    /**
     * Link configuration.
     * Will be displayed after main message with link icon
     */
    link?: NotificationReference;
}

/** Notification link configuration */
export interface NotificationReference {
    /** Display text */
    caption: string;

    /** Reference to */
    ref: string;
}
