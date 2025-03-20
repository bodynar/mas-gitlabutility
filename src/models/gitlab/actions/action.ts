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
