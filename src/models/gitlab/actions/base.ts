import { generateGuid } from "@bodynarf/utils";

/** Possible actions to perform with app */
export enum Actions {
    /** Merge branches */
    merge = 0,

    /** Make a release */
    release = 1,

    /** Move tag to latest commit */
    moveTag = 3,

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
];

/** Action to its description map */
export const actionToDescriptionMap = new Map([
    [Actions.merge, "Merge branches"],
    [Actions.release, "Make a release"], // previous text : Merge to master and push tag (optionally)
    [Actions.moveTag, "Move tag on master branch to latest commit"],

    [Actions.checkDiffs, "Check diff between branches"],
    [Actions.checkNonActualTags, "Find tags not on last commit in master branch"],
]);

/**
 * @abstract
 * @description Action, which could be performed with app
 */
export abstract class Action {
    /** Unique identifier */
    readonly id: string;

    /** Action type */
    readonly type: Actions;

    /**
     * Project identifier numbers, included in operation
     */
    projects: Array<number>;

    /**
     * Creating an instance of `Action`
     * @param type Action type
     * @param projects Project identifier numbers
     */
    constructor(
        type: Actions,
        projects: Array<number>,
    ) {
        this.type = type;
        this.projects = projects;
        this.id = generateGuid();
    }
}

/**
 * @abstract
 * @description Action with extra custom parameters, which could be performed with app
 */
export abstract class ParametrizedAction<TParameters> extends Action {
    /** Action parameters */
    readonly parameters: TParameters;

    /**
     * Creating an instance of `Action`
     * @param type Action type
     * @param projects Project identifier numbers
     * @param parameters Additional parameters
     */
    constructor(
        type: Actions,
        projects: Array<number>,
        parameters: TParameters,
    ) {
        super(type, projects);

        this.parameters = parameters;
    }
}

/**
 * Base type for parameters view components
 */
export interface BaseParametersComponentProps<TParameter> {
    /** Current parameters value */
    parameters: TParameter;

    /** Save new parameters value */
    setParameters: (parameters: TParameter) => void;

    /** Update availability of execute button */
    setCanExecute: (canExecute: boolean) => void;

    /**
     * Set parameters error
     * @description Function must be used to signalize a user that current parameters is not valid by any rule and shortly explain that validation error
     * @example setError("From branch cannot be same as target branch")
     * @param error Error message to display
     */
    setError: (error: string) => void;

    /**
     * Set the need for additional confirmation
     * @param shouldConfirm Should require additional confirmation
     */
    setShouldConfirm?: (shouldConfirm: boolean) => void;
}
