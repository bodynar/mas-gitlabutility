import { isNullish, isNullOrEmpty } from "@bodynarf/utils";
import { HttpError } from "@bodynarf/utils/api/simple";

import { ActionResultState, CancellationToken, CreateBranchAction, CreateBranchActionResult, ProcessStateEmitter } from "@app/models";

import { actionHandler } from "./common";
import { createBranch, getBranchInfo } from "../project";

/** Categories of createBranch operation errors */
enum ErrorType {
    /** Source branch not found */
    sourceBranchNotFound = 1,

    /** New branch not created */
    notCreated = 2,

    /** Uncategorized error */
    otherError = 3,
}

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
    const errors: Array<{
        message: string,
        project: number,
        type: ErrorType,
    }> = [];

    for (let index = 0; index < action.projects.length; index++) {
        const projectId = action.projects[index];

        try {
            if (cancellationToken.isCancelled) {
                return {
                    status: ActionResultState.cancelled,
                    success,
                    errors:
                        errors
                            .sort((x, y) => x.type - y.type)
                            .map(({ message, project }) => [project, message])
                };
            }

            messageUpdateEventEmitter.trigger({
                state: index,
                message: `Processing ${index + 1}\\${action.projects.length}`
            });

            const branchInfo = await getBranchInfo(projectId, action.parameters.source);

            if (isNullish(branchInfo)) {
                errors.push({
                    message: `Branch ${action.parameters.source} not found`,
                    project: projectId,
                    type: ErrorType.sourceBranchNotFound,
                });

                continue;
            }

            const branch = await createBranch(projectId, branchInfo.commitSha, action.parameters.branchName);

            if (isNullish(branch)) {
                errors.push({
                    message: `Branch ${action.parameters.branchName} not created`,
                    project: projectId,
                    type: ErrorType.sourceBranchNotFound,
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
                            project: projectId,
                            type: ErrorType.otherError,
                        });

                        continue;
                    }

                    errors.push({
                        message: error.response.statusText,
                        project: projectId,
                        type: ErrorType.otherError,
                    });

                    continue;
                }
            }

            errors.push({
                message: error,
                project: projectId,
                type: ErrorType.otherError,
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
            errors:
                errors
                    .sort((x, y) => x.type - y.type)
                    .map(({ message, project }) => [project, message])
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
        errors:
            errors
                .sort((x, y) => x.type - y.type)
                .map(({ message, project }) => [project, message])
    };
};
