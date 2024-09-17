import { isNullOrUndefined } from "@bodynarf/utils";

import { ActionResultState, CancellationToken, MoveTagAction, MoveTagActionResult, MovedTagInfo, NotMovedTagInfo, NotMovedTagReason } from "@app/models";

import { actionHandler } from "./common";
import { addTag, checkHasBranch, getBranchInfo, getTag, removeTag } from "../project";

/**
 * Move release tag to last master commit
 * @param action Move tag action configuration
 * @param cancellationToken Token for operation cancel
 * @returns Promise with operation result
 */
export const performMoveTagAction: actionHandler = async (
    action: MoveTagAction, cancellationToken: CancellationToken
): Promise<MoveTagActionResult> => {
    const movedTags: Array<MovedTagInfo> = [];
    const notMovedTags: Array<NotMovedTagInfo> = [];

    for (let index = 0; index < action.projects.length; index++) {
        if (cancellationToken.isCancelled) {
            return {
                status: ActionResultState.cancelled,
                movedTags,
                notMovedTags: notMovedTags.sort((current, next) => current.reasonType - next.reasonType),
            };
        }

        const projectId = action.projects[index];

        try {
            const hasBranch = await checkHasBranch(projectId, "master");

            if (!hasBranch) {
                notMovedTags.push({
                    projectId,
                    reason: "Master branch not found",
                    reasonType: NotMovedTagReason.branchNotFound,
                });

                continue;
            }

            const branchInfo = await getBranchInfo(projectId, "master");

            if (isNullOrUndefined(branchInfo)) {
                notMovedTags.push({
                    projectId,
                    reason: "Master branch not found",
                    reasonType: NotMovedTagReason.branchNotFound,
                });

                continue;
            }

            const tagInfo = await getTag(projectId, action.parameters.name);

            if (isNullOrUndefined(tagInfo)) {
                if (!action.parameters.createIfNotExist) {
                    notMovedTags.push({
                        projectId,
                        reason: "Tag not found",
                        reasonType: NotMovedTagReason.tagNotFound,
                    });

                    continue;
                }

                await addTag(projectId, action.parameters.name, branchInfo.commitSha);

                movedTags.push({
                    projectId,
                    link: branchInfo.commitLink,
                    sha: branchInfo.commitSha,
                });

                continue;
            }

            if (tagInfo.commitSha === branchInfo.commitSha) {
                notMovedTags.push({
                    projectId,
                    reason: "Tag is up to date",
                    reasonType: NotMovedTagReason.tagIsUpToDate,
                });

                continue;
            }

            await removeTag(projectId, tagInfo.name);
            await addTag(projectId, action.parameters.name, branchInfo.commitSha);

            movedTags.push({
                projectId,
                link: branchInfo.commitLink,
                sha: branchInfo.commitSha,
            });
        } catch (error) {
            notMovedTags.push({
                projectId,
                reason: `Error during execution, ${error}`,
                reasonType: NotMovedTagReason.error,
            });
        }
    }

    if (cancellationToken.isCancelled) {
        return {
            status: ActionResultState.cancelled,
            movedTags,
            notMovedTags: notMovedTags.sort((current, next) => current.reasonType - next.reasonType),
        };
    }

    let status = ActionResultState.success;

    if (movedTags.length === 0) {
        status = ActionResultState.error;
    } else if (notMovedTags.length > 0) {
        status = ActionResultState.warn;
    }

    return {
        status,
        movedTags,
        notMovedTags: notMovedTags.sort((current, next) => current.reasonType - next.reasonType),
    };
};
