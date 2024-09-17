import { isNullOrUndefined } from "@bodynarf/utils";

import { ActionResultState, CancellationToken, CheckNonActualTagsAction, CheckNonActualTagsActionResult, NotActualTagInfo } from "@app/models";

import { actionHandler } from "./common";
import { checkHasBranch, getBranchInfo, getTag } from "../project";

/** Action performing is cancelled */
enum ReasonType {
    /** Some error caused during operation */
    error = 0,

    /** Master branch not found */
    branchNotFound = 1,

    /** Specified tag not found */
    tagNotFound = 2,
}

/**
 * Check tags that not placed on a latest commit on master branch
 * @param action Action configuration
 * @param cancellationToken Token for operation cancel
 * @returns Promise with operation result
 */
export const performCheckNonActualTagsAction: actionHandler = async (
    action: CheckNonActualTagsAction, cancellationToken: CancellationToken
): Promise<CheckNonActualTagsActionResult> => {
    const actual: Array<number> = [];
    const nonActual: Array<NotActualTagInfo> = [];
    const errors: Array<[number, string, ReasonType]> = [];

    for (let index = 0; index < action.projects.length; index++) {
        if (cancellationToken.isCancelled) {
            return {
                status: ActionResultState.cancelled,
                actual,
                nonActual,
                errors: errors.sort((current, next) => current[2] - next[2]).map(x => [x[0], x[1]]),
            };
        }

        const projectId = action.projects[index];

        try {
            const hasBranch = await checkHasBranch(projectId, "master");

            if (!hasBranch) {
                errors.push([
                    projectId,
                    "Master branch not found",
                    ReasonType.branchNotFound,
                ]);

                continue;
            }

            const branchInfo = await getBranchInfo(projectId, "master");

            if (isNullOrUndefined(branchInfo)) {
                errors.push([
                    projectId,
                    "Master branch not found",
                    ReasonType.branchNotFound,
                ]);

                continue;
            }

            const tagInfo = await getTag(projectId, action.parameters.name);

            if (isNullOrUndefined(tagInfo)) {
                errors.push([
                    projectId,
                    "Tag not found",
                    ReasonType.tagNotFound,
                ]);

                continue;
            }

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
            errors.push([
                projectId,
                `Error during execution, ${error}`,
                ReasonType.error,
            ]);
        }
    }

    if (cancellationToken.isCancelled) {
        return {
            status: ActionResultState.cancelled,
            actual,
            nonActual,
            errors: errors.sort((current, next) => current[2] - next[2]).map(x => [x[0], x[1]]),
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
        errors: errors.sort((current, next) => current[2] - next[2]).map(x => [x[0], x[1]]),
    };
};
