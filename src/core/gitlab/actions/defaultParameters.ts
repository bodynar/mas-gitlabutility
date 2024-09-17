import { Actions, CheckDiffsParameters, CheckNonActualTagsParameters, DefaultBranch, MergeParameters, MoveTagParameters, ReleaseParameters } from "@app/models";
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

//#region Builder

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
    } as ReleaseParameters;
};

/**
 * Default parameters for move tag action provider
 * @param appSettings Application settings
 * @returns Instance of @see MoveTagParameters
 */
const moveTagParametersBuilder: parametersBuilder = ({ releaseTagNameTemplate }: AppSettings) => {
    return {
        createIfNotExist: false,
        name: releaseTagNameTemplate,
    } as MoveTagParameters;
};

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
 * Default parameters for check non actual tags action provider
 * @param appSettings Application settings
 * @returns Instance of @see CheckNonActualTagsParameters
 */
const checkNonActualTagsParametersBuilder: parametersBuilder = ({ releaseTagNameTemplate }: AppSettings) => {
    return {
        name: releaseTagNameTemplate,
    } as CheckNonActualTagsParameters;
};

//#endregion

/**
 * Set of builders for each action
 */
const defaultParametersProviders: Map<Actions, parametersBuilder> = new Map([
    [Actions.merge, mergeParametersBuilder],
    [Actions.release, releaseParametersBuilder],
    [Actions.moveTag, moveTagParametersBuilder],
    [Actions.checkDiffs, checkDiffsParametersBuilder],
    [Actions.checkNonActualTags, checkNonActualTagsParametersBuilder],
]);
