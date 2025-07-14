import { generateGuid } from "@bodynarf/utils";

import { Actions } from "@app/models";

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
export abstract class ParametrizedAction<TParameters extends object> extends Action {
    /** Action parameters */
    readonly parameters: TParameters;

    /**
     * Creating an instance of `ParametrizedAction`
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

/** Base type for action parameters with app state extra values */
export type StateBasedParameters = {
    /** User configured extra branches */
    extraBranches: Array<string>;
};

/**
 * @abstract
 * @description Same as `ParametrizedAction`, but parameters based on `StateBasedParameters` (with state extra values)
 */
export abstract class StateBasedParametrizedAction<TParameters extends StateBasedParameters> extends ParametrizedAction<TParameters> {
    /**
     * Creating an instance of `StateBasedParametrizedAction`
     * @param type Action type
     * @param projects Project identifier numbers
     * @param parameters Additional parameters
     */
    constructor(
        type: Actions,
        projects: Array<number>,
        parameters: TParameters,
    ) {
        super(type, projects, parameters);
    }
}
