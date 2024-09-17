import { delayResolve, isNullish, isNullOrUndefined } from "@bodynarf/utils";
import { HttpError } from "@bodynarf/utils/api/simple";

import { isTooManyTries, retryAsync } from "ts-retry";

import { ActionResultState, CancellationToken, MergeAction, MergeActionConfig, MergeActionResult, MergeResult, NotMergeReasonEnum, NotMergedRequestInfo, SafeActionResult } from "@app/models";

import { actionHandler } from "./common";
import { checkHasDiffs, createMergeRequest, getInfo, merge } from "../project";

/**
 * Merge specified branches for specified projects
 * @param action Merge action configuration
 * @param cancellationToken Token for operation cancel
 * @returns Promise with operation result
 */
export const performMergeAction: actionHandler = async (
    action: MergeAction, cancellationToken: CancellationToken
): Promise<MergeActionResult> => {
    const mergedRequests: Array<MergeResult> = [];
    const notMergedRequests: Array<NotMergedRequestInfo> = [];

    const replayRequests = [];

    for (const projectId of action.projects) {
        if (cancellationToken.isCancelled) {
            return {
                status: ActionResultState.cancelled,
                mergedRequests,
                notMergedRequests: notMergedRequests.sort((current, next) => current.reasonType - next.reasonType),
            };
        }

        const createResult = await tryToCreateMerge(projectId, action.parameters);

        if (!createResult.created) {
            notMergedRequests.push({
                projectId: projectId,
                reason: createResult.reason,
                reasonType: createResult.reasonType,
            });

            continue;
        }

        const requestInfo = await delayResolve(1.5 * 1000, getInfo(projectId, createResult.id));

        if (requestInfo.hasConflicts) {
            notMergedRequests.push({
                projectId: projectId,
                reason: "Merge conflicts",
                reasonType: NotMergeReasonEnum.conflicts,
                mergeRequestId: requestInfo.id,
                link: requestInfo.link,
                ref: requestInfo.ref,
            } as NotMergedRequestInfo);

            continue;
        }

        if (!requestInfo.canBeMergedByCurrentUser) {
            notMergedRequests.push({
                projectId: projectId,
                mergeRequestId: requestInfo.id,
                link: requestInfo.link,
                ref: requestInfo.ref,
                reason: "You're don't have enough access rights to merge",
                reasonType: NotMergeReasonEnum.noAccess,
            } as NotMergedRequestInfo);

            continue;
        }

        const mergeResult = await safeMergeWithRetry(projectId, requestInfo.id, false);

        if (mergeResult.hasError()) {
            replayRequests.push({
                projectId,
                id: requestInfo.id,
            });
            continue;
        }

        mergedRequests.push(mergeResult.result);
    }

    if (cancellationToken.isCancelled) {
        return {
            status: ActionResultState.cancelled,
            mergedRequests,
            notMergedRequests: notMergedRequests.sort((current, next) => current.reasonType - next.reasonType),
        };
    }

    for (const { projectId, id } of replayRequests) {
        if (cancellationToken.isCancelled) {
            return {
                status: ActionResultState.cancelled,
                mergedRequests,
                notMergedRequests: notMergedRequests.sort((current, next) => current.reasonType - next.reasonType),
            };
        }

        const mergeResult = await safeMergeWithRetry(projectId, id);

        if (mergeResult.hasError()) {
            notMergedRequests.push({
                ...mergeResult.error,
                projectId: projectId,
                mergeRequestId: id,
            } as NotMergedRequestInfo);

            continue;
        }

        mergedRequests.push(mergeResult.result);
    }

    if (cancellationToken.isCancelled) {
        return {
            status: ActionResultState.cancelled,
            mergedRequests,
            notMergedRequests: notMergedRequests.sort((current, next) => current.reasonType - next.reasonType),
        };
    }

    let status = ActionResultState.success;

    if (mergedRequests.length === 0) {
        status = ActionResultState.error;
    } else if (notMergedRequests.length > 0) {
        status = ActionResultState.warn;
    }

    return {
        status,
        mergedRequests,
        notMergedRequests: notMergedRequests.sort((current, next) => current.reasonType - next.reasonType),
    };
};

/**
 * Try to merge a request with retry mechanism in safe mode
 * @param projectId Project identifier
 * @param id Created merge request identifier
 * @param useRetry Should retry mechanism be used (3 retries with 6 seconds delay)
 * @returns Instance of `MergeOperationResult` in promise
 */
const safeMergeWithRetry = async (projectId: number, id: number, useRetry = true): Promise<SafeActionResult<MergeResult, NotMergedRequestInfo>> => {
    try {
        const result = await retryAsync<SafeActionResult<MergeResult, NotMergedRequestInfo>>(
            async () => {
                const info = await getInfo(projectId, id);

                if (info.hasConflicts) {
                    return SafeActionResult.fail({
                        ...info,
                        projectId,
                        id,
                        reason: "Merge conflicts",
                        reasonType: NotMergeReasonEnum.conflicts,
                    });
                }

                if (info.status === "unchecked" || info.status === "checking") {
                    return undefined;
                }

                if (!info.canBeMergedByCurrentUser) {
                    return SafeActionResult.fail({
                        ...info,
                        projectId,
                        id,
                        reason: "You're don't have enough access rights to merge",
                        reasonType: NotMergeReasonEnum.error,
                    });
                }

                const mergeResult = await merge(projectId, id);

                return SafeActionResult.complete(mergeResult);
            },
            {
                maxTry: useRetry ? 3 : 1,
                delay: 6 * 1000,
                until: x => !isNullOrUndefined(x),
            }
        );

        return result;

    } catch (error) {
        if (isTooManyTries(error)) {
            return SafeActionResult.fail({
                id,
                projectId,
                reason: "Cannot merge. Check merge request",
                reasonType: NotMergeReasonEnum.error,
            });
        }

        let reason = error as string;

        if (error instanceof HttpError) {
            reason = `${error.response.status} ${error.response.statusText}`;
        }

        return SafeActionResult.fail({
            id,
            reason,
            projectId,
            reasonType: NotMergeReasonEnum.error,
        });
    }
};

/**
 * Try to create merge request if there any difference between branches
 * @param projectId Project identifier
 * @param config Action configuration
 * @returns Promise with try result
 */
const tryToCreateMerge = async (projectId: number, config: MergeActionConfig): Promise<CreateMergeStreamResult> => {
    try {
        const hasDiffs = await checkHasDiffs(projectId, config.source, config.target);

        if (!hasDiffs) {
            return {
                created: false,
                reason: "No diffs between branches were found",
                projectId,
                reasonType: NotMergeReasonEnum.noDiffs,
            };
        }
    } catch (error) {
        if (error instanceof HttpError) {
            if (error.response.status === 404) {
                const responseObject: { "message": string; } = await error.response.json();

                if (!isNullish(responseObject) && responseObject.message === "404 Ref Not Found") {
                    return {
                        created: false,
                        reason: "Project doesn't have one of merging branches",
                        reasonType: NotMergeReasonEnum.noBranches,
                        projectId,
                    };
                }
            }
        }

        return {
            created: false,
            reason: error as string,
            reasonType: NotMergeReasonEnum.error,
            projectId
        };
    }

    try {
        const result = await createMergeRequest(projectId, config.source, config.target, config.name);

        return {
            created: true,
            id: result.id,
            link: result.link,
            ref: result.ref,
            projectId,
        };
    } catch (error) {
        if (error instanceof HttpError) {
            let reason = error.response.statusText ?? error.message;

            if (error.response.status === 409) {
                const responseObject: { "message": Array<string>; } = await error.response.json();

                if (!isNullish(responseObject) && !isNullish(responseObject.message)) {
                    reason = responseObject.message.join(", ");
                }
            }

            return {
                created: false,
                projectId,
                reason,
                reasonType: NotMergeReasonEnum.error,
            };
        }

        return {
            created: false,
            projectId,
            reason: error as string,
            reasonType: NotMergeReasonEnum.error,
        };
    }
};

/** Merge stream operation result */
interface CreateMergeStreamResult {
    /** Created merge request unique identifier */
    id?: number;

    /** Project identifier */
    projectId: number;

    /** Link to merge request */
    link?: string;

    /** Is merge request created */
    created: boolean;

    /** Reason for not creating merge request */
    reason?: string;

    /** Categorized reason */
    reasonType?: NotMergeReasonEnum;

    /** Short ref name */
    ref?: string;
}
