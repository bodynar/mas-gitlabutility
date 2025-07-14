import { isNullOrUndefined } from "@bodynarf/utils";

import { ActionResultState, CancellationToken, MoveTagAction, MoveTagActionResult, MovedTagInfo, NotMovedTagInfo, NotMovedTagReason, ProcessStateEmitter } from "@app/models";
import { getLocalizedText } from "@app/locale";
import { addTag, checkHasBranch, getBranchInfo, getTag, removeTag } from "@app/core/gitlab/project";

import { actionHandler } from "../common";

/**
 * Move release tag to latest commit
 * @param action Move tag action configuration
 * @param cancellationToken Token for operation cancel
 * @param messageUpdateEventEmitter Process state event emitter
 * @returns Promise with operation result
 */
export const performMoveTagAction: actionHandler = async (
    action: MoveTagAction,
    cancellationToken: CancellationToken,
    messageUpdateEventEmitter: ProcessStateEmitter,
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

        messageUpdateEventEmitter.trigger({
            state: index,
            message: getLocalizedText("core.gitlab.processingStateTemplate").format(`${index + 1}`, `${action.projects.length}`),
        });

        const projectId = action.projects[index];

        try {
            const hasBranch = await checkHasBranch(projectId, action.parameters.branch);

            if (!hasBranch) {
                notMovedTags.push({
                    projectId,
                    reason: getLocalizedText("core.gitlab.branchNotFoundTemplate").format(action.parameters.branch),
                    reasonType: NotMovedTagReason.branchNotFound,
                });

                continue;
            }

            const branchInfo = await getBranchInfo(projectId, action.parameters.branch);

            if (isNullOrUndefined(branchInfo)) {
                notMovedTags.push({
                    projectId,
                    reason: getLocalizedText("core.gitlab.branchNotFoundTemplate").format(action.parameters.branch),
                    reasonType: NotMovedTagReason.branchNotFound,
                });

                continue;
            }

            const tagInfo = await getTag(projectId, action.parameters.name);

            if (isNullOrUndefined(tagInfo)) {
                if (!action.parameters.createIfNotExist) {
                    notMovedTags.push({
                        projectId,
                        reason: getLocalizedText("core.gitlab.tag.tagNotFound"),
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
                    reason: getLocalizedText("core.gitlab.tag.move.tagIsUpToDate"),
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
                reason: getLocalizedText("core.gitlab.tag.errorDuringExecutionTemplate").format(error),
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

    messageUpdateEventEmitter.trigger({
        state: action.projects.length,
        message: getLocalizedText("core.gitlab.processingStateTemplate").format(`${action.projects.length}`, `${action.projects.length}`),
    });

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
