import { isNullOrUndefined } from "@bodynarf/utils";
import { HttpError } from "@bodynarf/utils/api/simple";

import { ActionResultState, CancellationToken, CheckNonActualTagsAction, CheckNonActualTagsActionError, CheckNonActualTagsActionErrorType, CheckNonActualTagsActionResult, DefaultBranch, NotActualTagInfo, ProcessStateEmitter } from "@app/models";
import { checkHasBranch, getBranchInfo, getTag } from "@app/core/gitlab/project";

import { actionHandler } from "../common";

/**
 * Check tags that not placed on a latest commit on master branch
 * @param action Action configuration
 * @param cancellationToken Token for operation cancel
 * @param messageUpdateEventEmitter Process state event emitter
 * @returns Promise with operation result
 */
export const performCheckNonActualTagsAction: actionHandler = async (
    action: CheckNonActualTagsAction,
    cancellationToken: CancellationToken,
    messageUpdateEventEmitter: ProcessStateEmitter,
): Promise<CheckNonActualTagsActionResult> => {
    const actual: Array<number> = [];
    const nonActual: Array<NotActualTagInfo> = [];
    const errors: Array<CheckNonActualTagsActionError> = [];

    for (let index = 0; index < action.projects.length; index++) {
        if (cancellationToken.isCancelled) {
            return {
                status: ActionResultState.cancelled,
                actual,
                nonActual,
                errors: errors.sort((current, next) => current.type - next.type),
            };
        }

        messageUpdateEventEmitter.trigger({
            state: index,
            message: `Processing ${index + 1}\\${action.projects.length}`
        });

        const projectId = action.projects[index];

        try {
            const hasBranch = await checkHasBranch(projectId, DefaultBranch.Master);

            if (!hasBranch) {
                errors.push({
                    projectId,
                    message: "Master branch not found",
                    type: CheckNonActualTagsActionErrorType.branchNotFound,
                });

                continue;
            }

            const tagInfo = await getTag(projectId, action.parameters.name);

            if (isNullOrUndefined(tagInfo)) {
                errors.push({
                    projectId,
                    message: "Tag not found",
                    type: CheckNonActualTagsActionErrorType.tagNotFound,
                });

                continue;
            }

            const branchInfo = await getBranchInfo(projectId, DefaultBranch.Master);

            if (tagInfo.commitSha !== branchInfo.commitSha) {
                nonActual.push({
                    projectId,
                    commitSha: tagInfo.commitSha,
                    commitLink: tagInfo.commitLink,
                    latestCommitSha: branchInfo.commitSha,
                    latestCommitLink: branchInfo.commitLink,
                });

                continue;
            }

            actual.push(projectId);
        } catch (error) {
            if (error instanceof HttpError) {
                errors.push({
                    projectId,
                    message: `Error during execution, "${error.message}" ${error.response.status} (${error.response.statusText})`,
                    type: CheckNonActualTagsActionErrorType.error,
                });

                continue;
            }

            errors.push({
                projectId,
                message: `Error during execution, ${error}`,
                type: CheckNonActualTagsActionErrorType.error,
            });
        }
    }

    if (cancellationToken.isCancelled) {
        return {
            status: ActionResultState.cancelled,
            actual,
            nonActual,
            errors: errors.sort((current, next) => current.type - next.type),
        };
    }

    let status = ActionResultState.success;

    if (errors.length > 0) {
        status = nonActual.length === 0 && actual.length === 0
            ? ActionResultState.error
            : ActionResultState.warn;
    }

    return {
        status,
        actual,
        nonActual,
        errors: errors.sort((current, next) => current.type - next.type),
    };
};
