import { MergeActionResult, ReleaseAction, MergeAction, ReleaseActionResult, TagResult, DefaultBranch, ActionResultState, CancellationToken } from "@app/models";

import { actionHandler } from "./common";
import { addTag, getBranchInfo } from "../project";
import { performMergeAction } from "./merge";

/**
 * Release specified projects
 * @description Merge test into master with optional tagging action
 * @param action Release action configuration
 * @param cancellationToken Token for operation cancel
 * @returns Promise with operation result
 */
export const performReleaseAction: actionHandler = async (
    action: ReleaseAction, cancellationToken: CancellationToken
): Promise<ReleaseActionResult> => {
    const mergeResult =
        await performMergeAction(
            new MergeAction(action.projects,
                {
                    name: action.parameters.mergeRequestName,
                    source: DefaultBranch.Test,
                    target: DefaultBranch.Master,
                }
            ),
            cancellationToken
        ) as MergeActionResult;


    if (cancellationToken.isCancelled) {
        return {
            status: ActionResultState.cancelled,
            ...mergeResult,
            createdTags: [],
        };
    }

    if (!action.parameters.setVersionTagAfter) {
        return {
            ...mergeResult,
            createdTags: [],
        };
    }

    const updatedProjectsIds =
        mergeResult.mergedRequests
            .map(({ projectId }) => projectId)
            .concat(mergeResult.notMergedRequests.map(({ projectId }) => projectId))
            .withoutDuplicate();

    const upToDateProjectsIds = action.projects.filter(x => !updatedProjectsIds.includes(x));

    const branchInfoItems: Array<{ projectId: number, commitSha: string; }> =
        mergeResult.mergedRequests
            .map(({ projectId, mergeCommitSha }) => ({ projectId, commitSha: mergeCommitSha }));

    for (let index = 0; index < upToDateProjectsIds.length; index++) {
        if (cancellationToken.isCancelled) {
            return {
                status: ActionResultState.cancelled,
                ...mergeResult,
                createdTags: [],
            };
        }

        const projectId = upToDateProjectsIds[index];

        const { commitSha } = await getBranchInfo(projectId, "master");
        branchInfoItems.push({ commitSha, projectId });
    }

    const createdTags: Array<TagResult> = [];

    for (let index = 0; index < branchInfoItems.length; index++) {
        if (cancellationToken.isCancelled) {
            return {
                status: ActionResultState.cancelled,
                ...mergeResult,
                createdTags,
            };
        }

        const { projectId, commitSha } = branchInfoItems[index];

        const tag = await addTag(projectId, action.parameters.version, commitSha);

        createdTags.push({
            link: tag.commitLink,
            name: action.parameters.version,
            projectId: tag.projectId,
            markOnly: upToDateProjectsIds.includes(tag.projectId),
        });
    }

    if (cancellationToken.isCancelled) {
        return {
            status: ActionResultState.cancelled,
            ...mergeResult,
            createdTags,
        };
    }

    return {
        ...mergeResult,
        createdTags,
    };
};
