import { isNullish, isNullOrEmpty } from "@bodynarf/utils";
import { HttpError } from "@bodynarf/utils/api/simple";

import { ActionResultState, CancellationToken, CreateBranchAction, CreateBranchActionError, CreateBranchActionErrorType, CreateBranchActionResult, ProcessStateEmitter } from "@app/models";
import { getLocalizedText } from "@app/locale";
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
    let isBranchAdded = false;

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
                message: getLocalizedText("core.gitlab.processingStateTemplate").format(`${index + 1}`, `${action.projects.length}`)
            });

            const hasBranch = await checkHasBranch(projectId, action.parameters.source);

            if (!hasBranch) {
                errors.push({
                    message: getLocalizedText("core.gitlab.branchNotFoundTemplate").format(action.parameters.source),
                    projectId: projectId,
                    type: CreateBranchActionErrorType.sourceBranchNotFound,
                });

                continue;
            }

            const branchInfo = await getBranchInfo(projectId, action.parameters.source);

            const branch = await createBranch(projectId, branchInfo.commitSha, action.parameters.branchName);

            if (isNullish(branch)) {
                errors.push({
                    message: getLocalizedText("core.gitlab.branch.create.branchNotCreatedTemplate").format(action.parameters.branchName),
                    projectId: projectId,
                    type: CreateBranchActionErrorType.sourceBranchNotFound,
                });

                continue;
            }

            success.push(projectId);

            if (!isBranchAdded
                && action.parameters.saveAsAdditionalBranch
            ) {
                isBranchAdded = true; // if error occurs - do not try again

                action.parameters.extraBranches = [
                    ...action.parameters.extraBranches,
                    action.parameters.branchName
                ];
            }
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

    if (cancellationToken.isCancelled) {
        return {
            status: ActionResultState.cancelled,
            success,
            errors: errors.sort((x, y) => x.type - y.type)
        };
    }

    messageUpdateEventEmitter.trigger({
        state: action.projects.length,
        message: getLocalizedText("core.gitlab.processingStateTemplate").format(`${action.projects.length}`, `${action.projects.length}`)
    });

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
