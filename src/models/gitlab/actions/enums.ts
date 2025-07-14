import { getLocalizedText } from "@app/locale";

/** Possible actions to perform with app */
export enum Actions {
    /** Merge branches */
    merge = 0,

    /** Make a release */
    release = 1,

    /** Move tag to latest commit */
    moveTag = 3,

    /** Create new branch */
    createBranch = 4,

    /** Delete branch */
    deleteBranch = 5,

    /** Close opened MR */
    closeMergeRequest = 6,

    /** Merge opened MR */
    mergeRequest = 7,

    /** Check branch difference */
    checkDiffs = 100,

    /** Search for tags, which not at last commit on a branch */
    checkNonActualTags = 101,
}

/** Actions that perform write actions during operations */
export const WritableActions = [
    Actions.merge,
    Actions.release,
    Actions.moveTag,
    Actions.createBranch,
    Actions.deleteBranch,
    Actions.closeMergeRequest,
    Actions.mergeRequest,
];

/** Action to its description map */
export const actionToDescriptionMap = new Map([
    [Actions.merge, getLocalizedText("shared.actionDescriptions.merge")],
    [Actions.release, getLocalizedText("shared.actionDescriptions.release")],
    [Actions.moveTag, getLocalizedText("shared.actionDescriptions.moveTag")],
    [Actions.createBranch, getLocalizedText("shared.actionDescriptions.createBranch")],
    [Actions.deleteBranch, getLocalizedText("shared.actionDescriptions.deleteBranch")],
    [Actions.closeMergeRequest, getLocalizedText("shared.actionDescriptions.closeMergeRequest")],
    [Actions.mergeRequest, getLocalizedText("shared.actionDescriptions.mergeRequest")],

    [Actions.checkDiffs, getLocalizedText("shared.actionDescriptions.checkDiffs")],
    [Actions.checkNonActualTags, getLocalizedText("shared.actionDescriptions.checkNonActualTags")],
]);
