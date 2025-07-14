import { isNullOrEmpty } from "@bodynarf/utils";
import { HttpError } from "@bodynarf/utils/api/simple";

import { ActionResultState, CancellationToken, CloseMergeRequestAction, CloseMergeRequestActionError, CloseMergeRequestActionResult, CloseMergeRequestError, ProcessStateEmitter, RequestAmbiguityData } from "@app/models";
import { getLocalizedText } from "@app/locale";

import { actionHandler } from "../common";
import { closeRequest, deleteBranch, getRequests } from "../../project";

/**
 * Close merge requests
 * @param action Action configuration
 * @param cancellationToken Token for operation cancel
 * @param messageUpdateEventEmitter Process state event emitter
 * @returns Promise with operation result
 */
export const performCloseMergeRequestAction: actionHandler = async (
    action: CloseMergeRequestAction,
    cancellationToken: CancellationToken,
    messageUpdateEventEmitter: ProcessStateEmitter,
): Promise<CloseMergeRequestActionResult> => {
    const closed: Array<number> = [];
    const ambiguityItems: Array<RequestAmbiguityData> = [];
    const errors: Array<CloseMergeRequestError> = [];

    for (let index = 0; index < action.projects.length; index++) {
        const projectId = action.projects[index];

        try {
            if (cancellationToken.isCancelled) {
                return {
                    status: ActionResultState.cancelled,
                    closed,
                    ambiguityItems,
                    errors: errors.sort((x, y) => x.type - y.type),
                };
            }

            messageUpdateEventEmitter.trigger({
                state: index,
                message: getLocalizedText("core.gitlab.processingStateTemplate").format(`${index + 1}`, `${action.projects.length}`),
            });

            const requests = await getRequests(projectId, action.parameters.requestName);

            if (requests.length === 0) {
                errors.push({
                    projectId,
                    type: CloseMergeRequestActionError.NotFound,
                    message: getLocalizedText("core.gitlab.mergeRequest.requestNotFound")
                });

                continue;
            }

            if (requests.length > 1) {
                ambiguityItems.push({
                    projectId,
                    requestsCount: requests.length,
                });

                continue;
            }

            closeRequest(projectId, requests[0].id);

            closed.push(projectId);

            if (action.parameters.removeBranch) {
                deleteBranch(projectId, requests[0].sourceBranch);
            }
        } catch (error) {
            if (error instanceof HttpError) {
                if (error.response.status === 400) {
                    const response = await error.response.json();

                    if (!isNullOrEmpty(response["message"])) {
                        errors.push({
                            projectId,
                            type: CloseMergeRequestActionError.Error,
                            message: response["message"]
                        });

                        continue;
                    }

                    errors.push({
                        projectId,
                        type: CloseMergeRequestActionError.Error,
                        message: error.response.statusText
                    });

                    continue;
                }
            }

            errors.push({
                projectId,
                type: CloseMergeRequestActionError.Error,
                message: error
            });
        }
    }

    if (cancellationToken.isCancelled) {
        return {
            status: ActionResultState.cancelled,
            closed,
            ambiguityItems,
            errors: errors.sort((x, y) => x.type - y.type),
        };
    }

    messageUpdateEventEmitter.trigger({
        state: action.projects.length,
        message: getLocalizedText("core.gitlab.processingStateTemplate").format(`${action.projects.length}`, `${action.projects.length}`),
    });

    const status = closed.length > 0
        ? ActionResultState.success
        : ActionResultState.error;

    return {
        status,
        closed,
        ambiguityItems,
        errors: errors.sort((x, y) => x.type - y.type),
    };
};
