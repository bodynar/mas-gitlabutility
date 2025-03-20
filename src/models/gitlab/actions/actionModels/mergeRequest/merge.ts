import { Actions, ParametrizedAction } from "@app/models";

/** MergeRequest action parameters */
export type MergeRequestConfig = {
    /** Merge request name */
    requestName: string;

    /** Remove source branch after */
    removeBranch: boolean;
}

/** MergeRequest action */
export class MergeRequestAction extends ParametrizedAction<MergeRequestConfig> {
    /**
     * Creating an instance of `MergeRequest`
     * @param projects Project identifier numbers
     * @param parameters Check diffs request parameters
     */
    constructor(
        projects: Array<number>,
        parameters: MergeRequestConfig,
    ) {
        super(Actions.mergeRequest, projects, parameters);
    }
}

/** Parameters for check diffs action */
export type MergeRequestParameters = MergeRequestConfig;
