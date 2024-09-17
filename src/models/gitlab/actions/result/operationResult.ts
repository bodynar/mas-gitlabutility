import { Moment } from "moment";

import { ActionResult, Actions } from "@app/models";

/** Result of performed gitlab operation */
export interface OperationResult<TResult extends ActionResult> {
    /** Unique identifier */
    id: string;

    /** Short version of id */
    shortId: string;

    /** Type of performed action */
    action: Actions;

    /** Identifiers of projects which were affected by operation */
    affectedProjects: Array<number>;

    /** When result was created */
    createdOn: Moment;

    /** When the operation was started */
    startedOn?: Moment;

    /** When the operation completed if it was successful */
    completedOn?: Moment;

    /** Data representing completion time */
    completionTime?: {
        /** Time measurement */
        measurement: string;

        /** Amount of time */
        value: number;
    };

    /** Error that occurred during the operation */
    error?: string;

    /** Result of the operation if it was successful */
    result?: TResult;

    /** Action parameters */
    parameters?: any;
}
