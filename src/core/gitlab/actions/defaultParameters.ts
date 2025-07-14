import { Actions, CheckDiffsParameters, CheckNonActualTagsParameters, CloseMergeRequestParameters, CreateBranchParameters, DefaultBranch, DeleteBranchParameters, MergeParameters, MergeRequestParameters, MoveTagParameters, ReleaseParameters } from "@app/models";
import { AppSettings } from "@app/store/app";

/**
 * Parameters builder fn type
 * @param appSettings Application settings
 */
type parametersBuilder = (appSettings: AppSettings) => object;

/**
 * Get default parameters object
 * @description The function provides a default value for a specific action. And if the default parameters are not specified - `undefined`
 * @param action Selected action
 * @param appSettings Application settings
 * @returns Instance of default parameters for specific action or `undefined`
 */
export const getDefaultParameters = (
    action: Actions,
    appSettings: AppSettings,
): object | undefined => {
    if (!defaultParametersProviders.has(action)) {
        return undefined;
    }

    const builderFn = defaultParametersProviders.get(action);

    return builderFn(appSettings);
};

// #region Branch

/**
 * Default parameters for check diffs action provider
 * @returns Instance of @see CheckDiffsParameters
 */
const checkDiffsParametersBuilder: parametersBuilder = () => {
    return {
        source: DefaultBranch.Master,
        target: DefaultBranch.Test,
    } as CheckDiffsParameters;
};

/**
 * Default parameters for create branch action provider
 * @returns Instance of @see CreateBranchParameters
 */
const createBranchParametersBuilder: parametersBuilder = () => {
    return {
        source: DefaultBranch.Develop,
        saveAsAdditionalBranch: false,
    } as CreateBranchParameters;
};

/**
 * Default parameters for delete branch action provider
 * @returns Instance of @see DeleteBranchParameters
 */
const deleteBranchParametersBuilder: parametersBuilder = () => {
    return {
        branchName: null,
    } as DeleteBranchParameters;
};

// #endregion

// #region Merge request

/**
 * Default parameters for close merge request action provider
 * @returns Instance of @see CloseMergeRequestParameters
 */
const closeMergeRequestParametersBuilder: parametersBuilder = () => {
    return {
        requestName: null,
    } as CloseMergeRequestParameters;
};

/**
 * Default parameters for merge MR action provider
 * @returns Instance of @see MergeRequestParameters
 */
const mergeRequestParametersBuilder: parametersBuilder = () => {
    return {
        requestName: null,
    } as MergeRequestParameters;
};

// #endregion

// #region Stream merge

/**
 * Default parameters for merge action provider
 * @param appSettings Application settings
 * @returns Instance of @see MergeParameters
 */
const mergeParametersBuilder: parametersBuilder = (appSettings: AppSettings) => {
    return {
        sourceBranch: DefaultBranch.Test,
        targetBranch: DefaultBranch.Develop,
        name: appSettings.mergeRequestNameTemplate.format(DefaultBranch.Test, DefaultBranch.Develop),
        template: appSettings.mergeRequestNameTemplate,
    } as MergeParameters;
};

/**
 * Default parameters for release action provider
 * @param appSettings Application settings
 * @returns Instance of @see ReleaseParameters
 */
const releaseParametersBuilder: parametersBuilder = (appSettings: AppSettings) => {
    return {
        setVersionTagAfter: true,
        version: appSettings.releaseTagNameTemplate,
        mergeRequestName: appSettings.releaseMergeRequestNameTemplate.format(appSettings.releaseTagNameTemplate),
        template: appSettings.releaseMergeRequestNameTemplate,
        tagVersionTemplate: appSettings.releaseTagNameTemplate,
        testBranch: DefaultBranch.Test,
        productionBranch: DefaultBranch.Master,
    } as ReleaseParameters;
};

// #endregion

// #region Tag

/**
 * Default parameters for move tag action provider
 * @param appSettings Application settings
 * @returns Instance of @see MoveTagParameters
 */
const moveTagParametersBuilder: parametersBuilder = ({ releaseTagNameTemplate }: AppSettings) => {
    return {
        createIfNotExist: false,
        name: releaseTagNameTemplate,
        branch: DefaultBranch.Master,
    } as MoveTagParameters;
};

/**
 * Default parameters for check non actual tags action provider
 * @param appSettings Application settings
 * @returns Instance of @see CheckNonActualTagsParameters
 */
const checkNonActualTagsParametersBuilder: parametersBuilder = ({ releaseTagNameTemplate }: AppSettings) => {
    return {
        name: releaseTagNameTemplate,
        branch: DefaultBranch.Master,
    } as CheckNonActualTagsParameters;
};

// #endregion

/**
 * Set of builders for each action
 */
const defaultParametersProviders: Map<Actions, parametersBuilder> = new Map([
    [Actions.checkDiffs, checkDiffsParametersBuilder],
    [Actions.createBranch, createBranchParametersBuilder],
    [Actions.deleteBranch, deleteBranchParametersBuilder],

    [Actions.closeMergeRequest, closeMergeRequestParametersBuilder],
    [Actions.mergeRequest, mergeRequestParametersBuilder],

    [Actions.merge, mergeParametersBuilder],
    [Actions.release, releaseParametersBuilder],

    [Actions.moveTag, moveTagParametersBuilder],
    [Actions.checkNonActualTags, checkNonActualTagsParametersBuilder],
]);
