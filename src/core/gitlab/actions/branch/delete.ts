import { isNullOrEmpty } from "@bodynarf/utils";
import { HttpError } from "@bodynarf/utils/api/simple";

import { ActionResultState, BranchAmbiguityData, CancellationToken, DeleteBranchAction, DeleteBranchActionResult, DeleteBranchError, DeleteBranchErrorType, ProcessStateEmitter } from "@app/models";
import { getLocalizedText } from "@app/locale";
import { deleteBranch, getBranches } from "@app/core/gitlab/project";

import { actionHandler } from "../common";

/**
 * Delete branch
 * @param action Action configuration
 * @param cancellationToken Token for operation cancel
 * @param messageUpdateEventEmitter Process state event emitter
 * @returns Promise with operation result
 */
export const performDeleteBranchAction: actionHandler = async (
    action: DeleteBranchAction,
    cancellationToken: CancellationToken,
    messageUpdateEventEmitter: ProcessStateEmitter,
): Promise<DeleteBranchActionResult> => {
    const deleted: Array<number> = [];
    const ambiguityItems: Array<BranchAmbiguityData> = [];
    const errors: Array<DeleteBranchError> = [];
    let isBranchDeleted = false;

    for (let index = 0; index < action.projects.length; index++) {
        const projectId = action.projects[index];

        try {
            if (cancellationToken.isCancelled) {
                return {
                    status: ActionResultState.cancelled,
                    deleted,
                    ambiguityItems,
                    errors: errors.sort((x, y) => x.type - y.type),
                };
            }

            messageUpdateEventEmitter.trigger({
                state: index,
                message: getLocalizedText("core.gitlab.processingStateTemplate").format(`${index + 1}`, `${action.projects.length}`)
            });

            const branches = await getBranches(projectId, action.parameters.branchName);

            if (branches.length === 0) {
                errors.push({
                    projectId,
                    type: DeleteBranchErrorType.branchNotFound,
                    message: getLocalizedText("core.gitlab.branchNotFoundTemplate").format(action.parameters.branchName)
                });

                continue;
            }

            if (branches.length > 1) {
                ambiguityItems.push({
                    branchesCount: branches.length,
                    projectId
                });

                continue;
            }

            deleteBranch(projectId, action.parameters.branchName);

            deleted.push(projectId);

            if (!isBranchDeleted
                && action.parameters.deleteBranchFromAdditionalBranches
            ) {
                isBranchDeleted = true; // if error occurs - do not try again

                action.parameters.extraBranches = action.parameters.extraBranches.filter(x => x !== action.parameters.branchName);
            }
        } catch (error) {
            if (error instanceof HttpError) {
                if (error.response.status === 400) {
                    const response = await error.response.json();

                    if (!isNullOrEmpty(response["message"])) {
                        errors.push({
                            projectId,
                            type: DeleteBranchErrorType.error,
                            message: response["message"]
                        });

                        continue;
                    }

                    errors.push({
                        projectId,
                        type: DeleteBranchErrorType.error,
                        message: error.response.statusText
                    });

                    continue;
                }
            }

            errors.push({
                projectId,
                type: DeleteBranchErrorType.error,
                message: error
            });
        }
    }

    if (cancellationToken.isCancelled) {
        return {
            status: ActionResultState.cancelled,
            deleted,
            ambiguityItems,
            errors: errors.sort((x, y) => x.type - y.type),
        };
    }

    messageUpdateEventEmitter.trigger({
        state: action.projects.length,
        message: getLocalizedText("core.gitlab.processingStateTemplate").format(`${action.projects.length}`, `${action.projects.length}`)
    });

    let status = ActionResultState.success;

    if (deleted.length === 0) {
        status = ActionResultState.error;
    } else if (ambiguityItems.length > 0) {
        status = ActionResultState.warn;
    }

    return {
        status,
        deleted,
        ambiguityItems,
        errors: errors.sort((x, y) => x.type - y.type),
    };
};
