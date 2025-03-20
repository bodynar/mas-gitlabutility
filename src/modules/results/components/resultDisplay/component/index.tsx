import { useCallback, useMemo } from "react";

import { isNullOrUndefined } from "@bodynarf/utils";

import { ActionResult, Actions, Project } from "@app/models";

import MergeResultDisplay from "../components/streamMerge/merge";
import ReleaseResultDisplay from "../components/streamMerge/release";

import MoveTagResultDisplay from "../components/tag/move";
import CheckNonActualTagsResultDisplay from "../components/tag/checkNonActual";

import CheckDiffsResultDisplay from "../components/branch/checkDiffs";
import DeleteBranchResultDisplay from "../components/branch/delete";
import CreateBranchResultDisplay from "../components/branch/create";

import CloseMergeRequestResultDisplay from "../components/mergeRequest/close";
import MergeRequestResultDisplay from "../components/mergeRequest/merge";

import "./style.scss";

/** Props of `ResultDisplay` */
export interface ResultDisplayProps<TResult extends ActionResult> {
    /** Type of performed action */
    action: Actions;

    /** Result of the operation */
    result: TResult;

    /** Action parameters */
    parameters?: object;

    /** Available projects */
    projects: Array<Project>;
}

/** Concrete result display component */
const ResultDisplay = (props: ResultDisplayProps<ActionResult>): JSX.Element => {
    let componentFn: (args: ActionResultDisplayProps<any, any>) => JSX.Element = () => <>NOT_FOUND</>;

    switch (props.action) {
        case Actions.merge:
            componentFn = (args) => <MergeResultDisplay {...args} />;
            break;

        case Actions.release:
            componentFn = (args) => <ReleaseResultDisplay {...args} />;
            break;

        case Actions.moveTag:
            componentFn = (args) => <MoveTagResultDisplay {...args} />;
            break;

        case Actions.checkDiffs:
            componentFn = (args) => <CheckDiffsResultDisplay {...args} />;
            break;

        case Actions.checkNonActualTags:
            componentFn = (args) => <CheckNonActualTagsResultDisplay {...args} />;
            break;

        case Actions.createBranch:
            componentFn = (args) => <CreateBranchResultDisplay {...args} />;
            break;

        case Actions.deleteBranch:
            componentFn = (args) => <DeleteBranchResultDisplay {...args} />;
            break;

        case Actions.closeMergeRequest:
            componentFn = (args) => <CloseMergeRequestResultDisplay {...args} />;
            break;

        case Actions.mergeRequest:
            componentFn = (args) => <MergeRequestResultDisplay {...args} />;
            break;
    }

    const projectsMap = useMemo(() => new Map(props.projects.map(x => [x.id, x])), [props.projects]);
    const getProjectJiraRef = useCallback((projectId: number) => {
        const project = projectsMap.get(projectId);

        return isNullOrUndefined(project)
            ? `(PROJECT "${projectId}" NOT FOUND)`
            : `[${project.name}|${project.link}]`
            ;
    }, [projectsMap]);

    return componentFn({
        ...props,
        projects: projectsMap,
        getProjectJiraRef,
    });
};

export default ResultDisplay;

/** Base interface for concrete operation result component props */
export interface ActionResultDisplayProps<TResult extends ActionResult, TParameters> {
    /** Result of the operation */
    result: TResult;

    /** Action parameters */
    parameters?: TParameters;

    /** Available projects */
    projects: Map<number, Project>;

    /**
     * Get link to project in JIRA link notation
     * @param projectId Project identifier
     * @returns Link to project for JIRA
     */
    getProjectJiraRef: (projectId: number) => string;
}
