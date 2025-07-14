import { Action as ReduxAction } from "@reduxjs/toolkit";
import { ThunkAction, ThunkDispatch } from "redux-thunk";

import moment, { Moment } from "moment";

import { isNullish, isNullOrUndefined, Optional } from "@bodynarf/utils";

import { Action, ActionResult, ActionResultState, Actions, CancellationToken, OperationResult, ProcessStateEmitter, StateBasedParametrizedAction } from "@app/models";
import { flash, preventClose, setTaskbarProgressState } from "@app/core";
import { getLocalizedText } from "@app/locale";
import { ActionBuilder, buildOperationResult, getActionDescription, OperationError, performAction } from "@app/core/gitlab/actions";

import { buildMergeActionConfig, buildReleaseActionConfig } from "@app/core/gitlab/actions/builders/streamMerge";
import { buildCheckDiffsActionConfig, buildCheckNonActualTagsActionConfig, buildMoveTagActionConfig } from "@app/core/gitlab/actions/builders/tag";
import { buildCreateBranchActionConfig, buildDeleteBranchActionConfig } from "@app/core/gitlab/actions/builders/branch";
import { buildCloseMergeRequestActionConfig, buildMergeRequestActionConfig } from "@app/core/gitlab/actions/builders/mergeRequest";

import { GlobalAppState } from "@app/store";
import { ApplicationStatus, LoadingStateConfig, setAppStatus, transitIntoLoadingState, updateExtraBranchesAsync, updateLoadingProcessingState } from "@app/store/app";
import { addOperationResult } from "@app/store/gitlab";
import { ShowSimpleMessageFn, getDisplayErrorFn, getDisplaySuccessFn, getDisplayWarnFn } from "@app/store/notificator";

/**
 * Map of action type to action config builder
 */
const actionToActionConfigBuilder: Map<Actions, ActionBuilder<Action, unknown>> = new Map([
    [Actions.checkDiffs, buildCheckDiffsActionConfig as ActionBuilder<Action, unknown>],
    [Actions.createBranch, buildCreateBranchActionConfig as ActionBuilder<Action, unknown>],
    [Actions.deleteBranch, buildDeleteBranchActionConfig as ActionBuilder<Action, unknown>],

    [Actions.closeMergeRequest, buildCloseMergeRequestActionConfig as ActionBuilder<Action, unknown>],
    [Actions.mergeRequest, buildMergeRequestActionConfig as ActionBuilder<Action, unknown>],

    [Actions.merge, buildMergeActionConfig as ActionBuilder<Action, unknown>],
    [Actions.release, buildReleaseActionConfig as ActionBuilder<Action, unknown>],

    [Actions.moveTag, buildMoveTagActionConfig as ActionBuilder<Action, unknown>],
    [Actions.checkNonActualTags, buildCheckNonActualTagsActionConfig as ActionBuilder<Action, unknown>],
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
    parameters: unknown,
): ThunkAction<void, GlobalAppState, unknown, ReduxAction> =>
    async (
        dispatch: ThunkDispatch<GlobalAppState, unknown, ReduxAction>,
        getState: () => GlobalAppState,
    ): Promise<void> => {

        const { gitlab, app } = getState();
        const projectIds = gitlab.selectedProjects ?? [];
        const showAppProgressbar = app.settings.showLoadingStateAtTaskbar;

        if (projectIds.length === 0) {
            endExecution(
                dispatch,
                buildOperationResult(
                    action, [],
                    getLocalizedText("store.gitlab.noProjectsSelected")
                )
            );

            return;
        }

        if (!actionToActionConfigBuilder.has(action)) {
            endExecution(
                dispatch,
                buildOperationResult(
                    action, projectIds,
                    getLocalizedText("store.gitlab.actionIsNotImplemented").format(`${action}`)
                )
            );

            return;
        }

        const cancellationToken: CancellationToken = CancellationToken.create();
        const messageUpdateEventEmitter = new ProcessStateEmitter(projectIds.length);

        messageUpdateEventEmitter.subscribe(
            (state, message, maxState) => {
                dispatch(
                    updateLoadingProcessingState([
                        state,
                        message,
                        maxState
                    ])
                );

                if (showAppProgressbar) {
                    setTaskbarProgressState(state, maxState ?? projectIds.length);
                }
            }
        );

        preventClose(false);
        dispatch(
            transitIntoLoadingState(
                LoadingStateConfig.withCancel(
                    getLocalizedText("store.gitlab.performingOperation").format(getActionDescription(action)),
                    () => { cancellationToken.cancel(); },
                    { caption: getLocalizedText("store.gitlab.cancelOperation"), },
                    { maxState: projectIds.length, state: 0 }
                )
            )
        );

        const startedOn = moment();
        let completedOn: Moment = undefined;
        let result: ActionResult = undefined;
        let errorMessage: Optional<string>;

        const actionConfig = actionToActionConfigBuilder.get(action)(
            projectIds,
            parameters,
            { extraBranches: app.extraBranches }
        );

        try {
            result = await performAction(actionConfig, cancellationToken, messageUpdateEventEmitter);

            if (actionConfig instanceof StateBasedParametrizedAction
                && !isNullish(actionConfig.parameters.extraBranches)
            ) {
                dispatch(updateExtraBranchesAsync(actionConfig.parameters.extraBranches));
            }

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

        showError(
            getLocalizedText("store.gitlab.operationFailed"),
            true,
            false,
            { caption: shortId, ref: `/r/${id}` }
        );
    } else if (!isNullOrUndefined(result)) {
        const { status } = result;

        const showNotificationFn = operationStatusToNotificationFnMap.get(status)(dispatch);

        const notificationContent = status === ActionResultState.success
            ? "store.gitlab.operationCompleted"
            : getLocalizedText(status === ActionResultState.cancelled
                ? "store.gitlab.operationCancelled"
                : "store.gitlab.operationCompleted"
            );

        showNotificationFn(
            notificationContent,
            true, false,
            { caption: shortId, ref: `/r/${id}` }
        );
    }

    dispatch(addOperationResult(operationResult));
    dispatch(setAppStatus(ApplicationStatus.idle));
    preventClose(true);
    flash();
    setTaskbarProgressState(0, 1, true);
};
