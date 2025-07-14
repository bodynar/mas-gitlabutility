import { isNullOrEmpty } from "@bodynarf/utils";
import { HttpError } from "@bodynarf/utils/api/simple";

import { ActionResultState, CancellationToken, MergeRequestAction, MergeRequestActionError, MergeRequestActionResult, MergeRequestError, ProcessStateEmitter, RequestAmbiguityData } from "@app/models";
import { getLocalizedText } from "@app/locale";
import { deleteBranch, getBranches, getRequests, merge } from "@app/core/gitlab/project";

import { actionHandler } from "../common";

/**
 * Merge requests
 * @param action Action configuration
 * @param cancellationToken Token for operation cancel
 * @param messageUpdateEventEmitter Process state event emitter
 * @returns Promise with operation result
 */
export const performMergeRequestAction: actionHandler = async (
    action: MergeRequestAction,
    cancellationToken: CancellationToken,
    messageUpdateEventEmitter: ProcessStateEmitter,
): Promise<MergeRequestActionResult> => {
    const merged: Array<number> = [];
    const ambiguityItems: Array<RequestAmbiguityData> = [];
    const errors: Array<MergeRequestError> = [];

    for (let index = 0; index < action.projects.length; index++) {
        const projectId = action.projects[index];

        try {
            if (cancellationToken.isCancelled) {
                return {
                    status: ActionResultState.cancelled,
                    merged,
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
                    type: MergeRequestActionError.NotFound,
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

            merge(projectId, requests[0].id);

            merged.push(projectId);

            if (action.parameters.removeBranch) {
                const branches = await getBranches(projectId, requests[0].sourceBranch);

                if (branches.length !== 1) {
                    continue;
                }

                deleteBranch(projectId, requests[0].sourceBranch);
            }
        } catch (error) {
            if (error instanceof HttpError) {
                if (error.response.status === 400) {
                    const response = await error.response.json();

                    if (!isNullOrEmpty(response["message"])) {
                        errors.push({
                            projectId,
                            type: MergeRequestActionError.Error,
                            message: response["message"]
                        });

                        continue;
                    }

                    errors.push({
                        projectId,
                        type: MergeRequestActionError.Error,
                        message: error.response.statusText
                    });

                    continue;
                }
            }

            errors.push({
                projectId,
                type: MergeRequestActionError.Error,
                message: error
            });
        }
    }

    if (cancellationToken.isCancelled) {
        return {
            status: ActionResultState.cancelled,
            merged,
            ambiguityItems,
            errors: errors.sort((x, y) => x.type - y.type),
        };
    }

    messageUpdateEventEmitter.trigger({
        state: action.projects.length,
        message: getLocalizedText("core.gitlab.processingStateTemplate").format(`${action.projects.length}`, `${action.projects.length}`),
    });

    let status = ActionResultState.success;

    if (merged.length === 0) {
        status = ActionResultState.error;
    } else if (ambiguityItems.length > 0) {
        status = ActionResultState.warn;
    }

    return {
        status,
        merged,
        ambiguityItems,
        errors: errors.sort((x, y) => x.type - y.type),
    };
};
