import moment, { Moment } from "moment";

import { delayResolve, generateGuid, isNullish } from "@bodynarf/utils";

import { Action, ActionResult, Actions, CancellationToken, OperationResult, ProcessStateEmitter } from "@app/models";
import { getLocalizedText, LocaleKeys } from "@app/locale";
import { appSession } from "@app/shared/values";

import { performCloseMergeRequestAction, performMergeRequestAction } from "./mergeRequest";
import { performMergeAction, performReleaseAction } from "./streamMerge";
import { performCheckNonActualTagsAction, performMoveTagAction } from "./tag";
import { performCheckDiffsAction, performCreateBranchAction, performDeleteBranchAction } from "./branch";

/** Action type to handler map */
const actionToHandlerMap: Map<Actions, actionHandler> = new Map([
    [Actions.checkDiffs, performCheckDiffsAction],
    [Actions.createBranch, performCreateBranchAction],
    [Actions.deleteBranch, performDeleteBranchAction],

    [Actions.closeMergeRequest, performCloseMergeRequestAction],
    [Actions.mergeRequest, performMergeRequestAction],

    [Actions.merge, performMergeAction],
    [Actions.release, performReleaseAction],

    [Actions.moveTag, performMoveTagAction],
    [Actions.checkNonActualTags, performCheckNonActualTagsAction],
]);

/**
 * Gitlab action handler
 * @description Per one `Actions` item must be only one handler
 * @param action Action configuration
 * @param cancellationToken Token for operation cancel
 * @param messageUpdateEventEmitter Process state event emitter
 */
export type actionHandler = (
    action: Action,
    cancellationToken: CancellationToken,
    messageUpdateEventEmitter: ProcessStateEmitter
) => Promise<ActionResult>;

/**
 * Perform gitlab action by its configuration
 * @param action Action configuration
 * @param cancellationToken Token for operation cancel
 * @param messageUpdateEventEmitter Process state event emitter
 * @throws {OperationError} Action cannot be handled
 * @throws {OperationError} Action execution failed with error
 */
export const performAction = async <TAction extends Action, TResult extends ActionResult>(
    action: TAction,
    cancellationToken: CancellationToken,
    messageUpdateEventEmitter: ProcessStateEmitter,
): Promise<TResult> => {
    const isHandlerDefined = actionToHandlerMap.has(action.type);

    if (!isHandlerDefined) {
        throw new OperationError(`Operation type "${action.type}" is not registered`, action);
    }

    const handler = actionToHandlerMap.get(action.type);

    try {
        await delayResolve(1.5 * 1000, 0); // pause in 1.5 sec

        const result = await handler(action, cancellationToken, messageUpdateEventEmitter);

        await delayResolve(0.5 * 1000, 0); // pause in 0.5 sec

        return result as TResult;
    } catch (error) {
        throw new OperationError(`Error during performing operation "${getActionDescription(action.type)}"`, action, error);
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
 * Get operation duration in caption
 * @param start Date time of operation start
 * @param end Date time of operation completion
 * @returns Duration
 */
export const getDurationCaption = (start?: Moment, end?: Moment): string => {
    if (isNullish(start) || isNullish(end)) {
        return "";
    }

    const diff = moment(end).diff(moment(start), "seconds");

    const duration = moment.duration(diff, "seconds");

    const durationCaption = [
        [duration.hours(), "core.gitlab.timeRange.hour"],
        [duration.minutes(), "core.gitlab.timeRange.minute"],
        [duration.seconds(), "core.gitlab.timeRange.second"],
    ].reduce((result, [value, key]) => {
        const measurement = value as number;

        if (measurement <= 0) {
            return result;
        }

        return result + measurement + " " + getLocalizedText(key as keyof LocaleKeys) + " ";
    }, "");

    return durationCaption.trim();
};

/**
 * Create an instance of `OperationResult<ActionResult>` with required props
 * @param action Type of performed action
 * @param affectedProjects Identifiers of projects which were affected by operation
 * @param error Error that occurred during the operation
 * @param startedOn When the operation was started
 * @param completedOn When the operation completed if it was successful
 * @param result Result of the operation if it was successful
 * @param parameters Action parameters
 * @returns An instance of `OperationResult<ActionResult>`
 */
export const buildOperationResult = (
    action: Actions,
    affectedProjects: Array<number>,
    error?: string,
    startedOn?: Moment,
    completedOn?: Moment,
    result?: ActionResult,
    parameters?: unknown,
): OperationResult<ActionResult> => {
    const durationCaption = getDurationCaption(startedOn, completedOn);

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
        parameters,
        sessionId: appSession.id,
        duration: durationCaption,
    };
};

/** Action to its description map */
const actionToDescriptionMap = new Map([
    [Actions.merge, () => getLocalizedText("shared.actionDescriptions.merge")],
    [Actions.release, () => getLocalizedText("shared.actionDescriptions.release")],
    [Actions.moveTag, () => getLocalizedText("shared.actionDescriptions.moveTag")],
    [Actions.createBranch, () => getLocalizedText("shared.actionDescriptions.createBranch")],
    [Actions.deleteBranch, () => getLocalizedText("shared.actionDescriptions.deleteBranch")],
    [Actions.closeMergeRequest, () => getLocalizedText("shared.actionDescriptions.closeMergeRequest")],
    [Actions.mergeRequest, () => getLocalizedText("shared.actionDescriptions.mergeRequest")],
    [Actions.checkDiffs, () => getLocalizedText("shared.actionDescriptions.checkDiffs")],
    [Actions.checkNonActualTags, () => getLocalizedText("shared.actionDescriptions.checkNonActualTags")],
]);

/**
 * Get action description
 * @param action Action type
 * @returns Description of specified action
 */
export const getActionDescription = (action: Actions): string => {
    return actionToDescriptionMap.get(action)();
};
