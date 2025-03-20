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

    /** Search for tags, which not at last commit on a master branch */
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
    [Actions.merge, "Merge branches"],
    [Actions.release, "Make a release"], // previous text : Merge to master and push tag (optionally)
    [Actions.moveTag, "Move tag on master branch to latest commit"],
    [Actions.createBranch, "Create new branch"],
    [Actions.deleteBranch, "Delete branch"],
    [Actions.closeMergeRequest, "Close opened merge request"],
    [Actions.mergeRequest, "Merge opened request"],

    [Actions.checkDiffs, "Check diff between branches"],
    [Actions.checkNonActualTags, "Find tags not on last commit in master branch"],
]);
