import { isNullish } from "@bodynarf/utils";
import { HttpError } from "@bodynarf/utils/api/simple";

import { ActionResultState, CheckDiffsAction, CheckDiffsActionResult, CheckDiffsActionConfig, CancellationToken } from "@app/models";

import { actionHandler } from "./common";
import { checkHasDiffs } from "../project";

/**
 * Check diffs between specified branches
 * @param action Action configuration
 * @param cancellationToken Token for operation cancel
 * @returns Promise with operation result
 */
export const performCheckDiffsAction: actionHandler = async (
    action: CheckDiffsAction, cancellationToken: CancellationToken
): Promise<CheckDiffsActionResult> => {
    const errors: Array<[number, string]> = [];
    const withDiffs: Array<number> = [];
    const withoutDiffs: Array<number> = [];

    for (const projectId of action.projects) {
        if (cancellationToken.isCancelled) {
            return {
                status: ActionResultState.cancelled,
                hasDiffs: withDiffs,
                noDiffs: withoutDiffs,
                errors,
            };
        }

        const diffResult = await checkDiffs(projectId, action.parameters);

        if (typeof diffResult === "string") {
            errors.push([projectId, diffResult as string]);
            continue;
        }

        const hasDiffsResult = diffResult as boolean;

        if (hasDiffsResult) {
            withDiffs.push(projectId);
        } else {
            withoutDiffs.push(projectId);
        }
    }

    if (cancellationToken.isCancelled) {
        return {
            status: ActionResultState.cancelled,
            hasDiffs: withDiffs,
            noDiffs: withoutDiffs,
            errors,
        };
    }

    let status = ActionResultState.success;

    if (errors.length > 0) {
        status = withDiffs.length === 0 && withoutDiffs.length === 0
            ? ActionResultState.error
            : ActionResultState.warn;
    }

    return {
        status,
        hasDiffs: withDiffs,
        noDiffs: withoutDiffs,
        errors,
    };
};

/**
 * Check diffs between branches with error catch
 * @param projectId Project identifier
 * @param config Action configuration
 * @returns Promise with result
 */
const checkDiffs = async (projectId: number, config: CheckDiffsActionConfig): Promise<string | boolean> => {
    try {
        const hasDiffs = await checkHasDiffs(projectId, config.source + " e", config.target);

        return hasDiffs;
    } catch (error) {
        if (error instanceof HttpError) {
            if (error.response.status == 404) {
                const responseObject: { message: string; } = await error.response.json();

                if (!isNullish(responseObject) && responseObject.message === "404 Ref Not Found") {
                    return "Project doesn't have one of merging branches";
                }
            }
        }

        return error as string;
    }
};
