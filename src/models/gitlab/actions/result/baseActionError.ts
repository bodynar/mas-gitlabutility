/** Base type for action error */
export type BaseActionError<TEnum> = {
    /** Project identifier */
    projectId: number;

    /** Error type */
    type: TEnum;

    /** Error message */
    message: string;
};
