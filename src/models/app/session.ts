/** Application session */
export type Session = {
    /** Unique identifier */
    id: string;

    /** When was started (app launched) */
    startedAt: Date;

    /** When was ended (app closed) */
    canceledAt?: Date;
};
