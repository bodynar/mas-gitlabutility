import moment, { Moment } from "moment";

import { delayResolve, generateGuid, isNullOrUndefined } from "@bodynarf/utils";

import { Action, ActionResult, Actions, actionToDescriptionMap, CancellationToken, OperationResult } from "@app/models";

import { performMergeAction } from "./merge";
import { performReleaseAction } from "./release";
import { performMoveTagAction } from "./moveTag";
import { performCheckDiffsAction } from "./checkDiffs";
import { performCheckNonActualTagsAction } from "./checkNonActualTags";

/** Action type to handler map */
const actionToHandlerMap: Map<Actions, actionHandler> = new Map([
    [Actions.merge, performMergeAction],
    [Actions.release, performReleaseAction],
    [Actions.moveTag, performMoveTagAction],

    [Actions.checkDiffs, performCheckDiffsAction],
    [Actions.checkNonActualTags, performCheckNonActualTagsAction],
]);

/**
 * Gitlab action handler
 * @description Per one `Actions` item must be only one handler
 * @param action Action configuration
 * @param cancellationToken Token for operation cancel
 */
export type actionHandler = (action: Action, cancellationToken: CancellationToken) => Promise<ActionResult>;

/**
 * Perform gitlab action by its configuration
 * @param action Action configuration
 * @param cancellationToken Token for operation cancel
 * @throws {OperationError} Action cannot be handled
 * @throws {OperationError} Action execution failed with error
 */
export const performAction = async <TAction extends Action, TResult extends ActionResult>(
    action: TAction,
    cancellationToken: CancellationToken
): Promise<TResult> => {
    const isHandlerDefined = actionToHandlerMap.has(action.type);

    if (!isHandlerDefined) {
        throw new OperationError(`Operation type "${action.type}" is not registered`, action);
    }

    const handler = actionToHandlerMap.get(action.type);

    try {
        await delayResolve(1.5 * 1000, 0); // pause in 1.5 sec
        const result = await handler(action, cancellationToken);

        return result as TResult;
    } catch (error) {
        throw new OperationError(`Error during performing operation "${actionToDescriptionMap.get(action.type)}"`, action, error);
    }
};

/** Error caused during executing gitlab operation */
export class OperationError extends Error {
    /**
     * Create an instance of `OperationError`
     * @param message Error message
     * @param actionConfig Action configuration, which passed for performing
     * @param sourceError Original error, raised during performing
     */
    constructor(
        message: string,
        actionConfig: Action,
        sourceError?: unknown,
    ) {
        super(message, {
            cause: {
                actionConfig,
                sourceError,
            }
        });
    }
}

/**
 * Array of time range names for moment dates difference
 */
const timeRangeNames = [
    "seconds",
    "minutes",
    "hours",
];

/**
 * Create an instance of `OperationResult<any>` with required props
 * @param action Type of performed action
 * @param affectedProjects Identifiers of projects which were affected by operation
 * @param error Error that occurred during the operation
 * @param startedOn When the operation was started
 * @param completedOn When the operation completed if it was successful
 * @param result Result of the operation if it was successful
 * @param parameters Action parameters
 * @returns An instance of `OperationResult<any>`
 */
export const buildOperationResult = (
    action: Actions,
    affectedProjects: Array<number>,
    error?: string,
    startedOn?: Moment,
    completedOn?: Moment,
    result?: unknown,
    parameters?: unknown,
): OperationResult<any> => {
    let completionTime: { measurement: string, value: number, } | undefined = undefined;

    if (!isNullOrUndefined(startedOn) && !isNullOrUndefined(completedOn)) {
        let diff = completedOn.diff(startedOn, "seconds");
        let timeRangeIndex = 0;

        while (diff >= 60) {
            diff = Math.round((diff / 60 + Number.EPSILON) * 100) / 100;

            timeRangeIndex += 1;
        }

        completionTime = {
            measurement: timeRangeNames[timeRangeIndex],
            value: diff,
        };
    }

    const id = generateGuid();

    return {
        id,
        shortId: id.slice(0, 8),
        createdOn: moment(),
        action,
        affectedProjects,
        error,

        startedOn,
        completedOn,
        result,
        completionTime,
        parameters,
    };
};
