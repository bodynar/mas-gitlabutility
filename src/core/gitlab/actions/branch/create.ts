import { isNullish, isNullOrEmpty } from "@bodynarf/utils";
import { HttpError } from "@bodynarf/utils/api/simple";

import { ActionResultState, CancellationToken, CreateBranchAction, CreateBranchActionError, CreateBranchActionErrorType, CreateBranchActionResult, ProcessStateEmitter } from "@app/models";
import { checkHasBranch, createBranch, getBranchInfo } from "@app/core/gitlab/project";

import { actionHandler } from "../common";

/**
 * Create new branch
 * @param action Action configuration
 * @param cancellationToken Token for operation cancel
 * @param messageUpdateEventEmitter Process state event emitter
 * @returns Promise with operation result
 */
export const performCreateBranchAction: actionHandler = async (
    action: CreateBranchAction,
    cancellationToken: CancellationToken,
    messageUpdateEventEmitter: ProcessStateEmitter,
): Promise<CreateBranchActionResult> => {
    const success: Array<number> = [];
    const errors: Array<CreateBranchActionError> = [];

    for (let index = 0; index < action.projects.length; index++) {
        const projectId = action.projects[index];

        try {
            if (cancellationToken.isCancelled) {
                return {
                    status: ActionResultState.cancelled,
                    success,
                    errors: errors.sort((x, y) => x.type - y.type)
                };
            }

            messageUpdateEventEmitter.trigger({
                state: index,
                message: `Processing ${index + 1}\\${action.projects.length}`
            });

            const hasBranch = await checkHasBranch(projectId, action.parameters.source);

            if (!hasBranch) {
                errors.push({
                    message: `Branch ${action.parameters.source} not found`,
                    projectId: projectId,
                    type: CreateBranchActionErrorType.sourceBranchNotFound,
                });

                continue;
            }

            const branchInfo = await getBranchInfo(projectId, action.parameters.source);

            const branch = await createBranch(projectId, branchInfo.commitSha, action.parameters.branchName);

            if (isNullish(branch)) {
                errors.push({
                    message: `Branch ${action.parameters.branchName} not created`,
                    projectId: projectId,
                    type: CreateBranchActionErrorType.sourceBranchNotFound,
                });

                continue;
            }

            success.push(projectId);
        } catch (error) {
            if (error instanceof HttpError) {
                if (error.response.status === 400) {
                    const response = await error.response.json();

                    if (!isNullOrEmpty(response["message"])) {
                        errors.push({
                            message: response["message"],
                            projectId: projectId,
                            type: CreateBranchActionErrorType.error,
                        });

                        continue;
                    }

                    errors.push({
                        message: error.response.statusText,
                        projectId: projectId,
                        type: CreateBranchActionErrorType.error,
                    });

                    continue;
                }
            }

            errors.push({
                message: error,
                projectId: projectId,
                type: CreateBranchActionErrorType.error,
            });
        }
    }

    messageUpdateEventEmitter.trigger({
        state: action.projects.length,
        message: `Processing ${action.projects.length}\\${action.projects.length}`
    });

    if (cancellationToken.isCancelled) {
        return {
            status: ActionResultState.cancelled,
            success,
            errors: errors.sort((x, y) => x.type - y.type)
        };
    }

    let status = ActionResultState.success;

    if (success.length === 0) {
        status = ActionResultState.error;
    } else if (errors.length > 0) {
        status = ActionResultState.warn;
    }

    return {
        status,
        success,
        errors: errors.sort((x, y) => x.type - y.type)
    };
};
