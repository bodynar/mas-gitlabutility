import { Action as ReduxAction } from "@reduxjs/toolkit";
import { ThunkAction, ThunkDispatch } from "redux-thunk";

import moment, { Moment } from "moment";

import { isNullOrUndefined, Optional } from "@bodynarf/utils";

import { ActionResult, ActionResultState, Actions, actionToDescriptionMap, CancellationToken, OperationResult, ProcessStateEmitter } from "@app/models";
import { flash, preventClose } from "@app/core";
import { ActionBuilder, buildOperationResult, OperationError, performAction } from "@app/core/gitlab/actions";

import { buildMergeActionConfig, buildReleaseActionConfig } from "@app/core/gitlab/actions/builders/streamMerge";
import { buildCheckDiffsActionConfig, buildCheckNonActualTagsActionConfig, buildMoveTagActionConfig } from "@app/core/gitlab/actions/builders/tag";
import { buildCreateBranchActionConfig, buildDeleteBranchActionConfig } from "@app/core/gitlab/actions/builders/branch";
import { buildCloseMergeRequestActionConfig,  buildMergeRequestActionConfig } from "@app/core/gitlab/actions/builders/mergeRequest";

import { GlobalAppState } from "@app/store";
import { ApplicationStatus, LoadingStateConfig, setAppStatus, transitIntoLoadingState, updateLoadingProcessingState } from "@app/store/app";
import { addOperationResult } from "@app/store/gitlab";
import { ShowSimpleMessageFn, getDisplayErrorFn, getDisplaySuccessFn, getDisplayWarnFn } from "@app/store/notificator";

/**
 * Map of action type to action config builder
 */
const actionToActionConfigBuilder: Map<Actions, ActionBuilder<any, any>> = new Map([
    [Actions.merge, buildMergeActionConfig as ActionBuilder<any, any>],
    [Actions.release, buildReleaseActionConfig as ActionBuilder<any, any>],
    [Actions.moveTag, buildMoveTagActionConfig as ActionBuilder<any, any>],
    [Actions.checkDiffs, buildCheckDiffsActionConfig as ActionBuilder<any, any>],
    [Actions.checkNonActualTags, buildCheckNonActualTagsActionConfig as ActionBuilder<any, any>],
    [Actions.createBranch, buildCreateBranchActionConfig as ActionBuilder<any, any>],
    [Actions.deleteBranch, buildDeleteBranchActionConfig as ActionBuilder<any, any>],
    [Actions.closeMergeRequest, buildCloseMergeRequestActionConfig as ActionBuilder<any, any>],
    [Actions.mergeRequest, buildMergeRequestActionConfig as ActionBuilder<any, any>],
]);

/** Action result state to notification display function matching set */
const operationStatusToNotificationFnMap: Map<ActionResultState, (dispatch: ThunkDispatch<GlobalAppState, unknown, ReduxAction>) => ShowSimpleMessageFn> = new Map([
    [ActionResultState.success, getDisplaySuccessFn],
    [ActionResultState.warn, getDisplayWarnFn],
    [ActionResultState.error, getDisplayErrorFn],
    [ActionResultState.cancelled, getDisplayWarnFn],
]);

/**
 * Perform gitlab operation on projects
 * @param action Selected action
 * @param parameters Action parameters
 */
export const executeGitlabAction = (
    action: Actions,
    parameters: any,
): ThunkAction<void, GlobalAppState, unknown, ReduxAction> =>
    async (
        dispatch: ThunkDispatch<GlobalAppState, unknown, ReduxAction>,
        getState: () => GlobalAppState,
    ): Promise<void> => {
        const projectIds = getState().gitlab.selectedProjects ?? [];

        if (projectIds.length === 0) {
            endExecution(
                dispatch,
                buildOperationResult(
                    action, [],
                    "No project selected"
                )
            );

            return;
        }

        if (!actionToActionConfigBuilder.has(action)) {
            endExecution(
                dispatch,
                buildOperationResult(
                    action, projectIds,
                    `Action "${action}" is not configured properly`
                )
            );

            return;
        }

        const cancellationToken: CancellationToken = CancellationToken.create();
        const messageUpdateEventEmitter = new ProcessStateEmitter(projectIds.length);

        messageUpdateEventEmitter.subscribe(
            (state, message, maxState) =>
                dispatch(
                    updateLoadingProcessingState([
                        state,
                        message,
                        maxState
                    ])
                )
        );

        preventClose(false);
        dispatch(
            transitIntoLoadingState(
                LoadingStateConfig.withCancel(
                    `Performing operation "${actionToDescriptionMap.get(action)}"`,
                    () => { cancellationToken.cancel(); },
                    { caption: "Cancel operation", },
                    { maxState: projectIds.length, state: 0 }
                )
            )
        );

        const startedOn = moment();
        let completedOn: Moment = undefined;
        let result: ActionResult = undefined;
        let errorMessage: Optional<string>;

        const actionConfig = actionToActionConfigBuilder.get(action)(projectIds, parameters);

        try {
            result = await performAction(actionConfig, cancellationToken, messageUpdateEventEmitter);

            completedOn = moment();
        } catch (error) {
            const operationError = error as OperationError;

            if (!isNullOrUndefined(operationError)) {
                errorMessage = operationError.message;
            } else {
                errorMessage = error as string;
            }
        }

        endExecution(
            dispatch,
            buildOperationResult(
                action, projectIds,
                errorMessage,
                startedOn, completedOn,
                result, parameters
            )
        );
    };

/**
 * End gitlab operation execution
 * @param dispatch Store dispatch to execute store actions
 * @param operationResult Result of performed gitlab operation
 */
const endExecution = (
    dispatch: ThunkDispatch<GlobalAppState, unknown, ReduxAction>,
    operationResult: OperationResult<ActionResult>,
): void => {
    const { id, shortId, error, result } = operationResult;

    if (!isNullOrUndefined(error)) {
        const showError = getDisplayErrorFn(dispatch);

        showError(`Operation failed. Check result for more information`, true, false, { caption: shortId, ref: `/r/${id}` });
    } else if (!isNullOrUndefined(result)) {
        const { status } = result;

        const showNotificationFn = operationStatusToNotificationFnMap.get(status)(dispatch);

        showNotificationFn(
            `Operation ${status === ActionResultState.cancelled
                ? "cancelled"
                : "completed"
            }. See operation details in`,
            true, false, { caption: shortId, ref: `/r/${id}` }
        );
    }

    dispatch(addOperationResult(operationResult));
    dispatch(setAppStatus(ApplicationStatus.idle));
    preventClose(true);
    flash();
};
