import { FC } from "react";

import { Project } from "@app/models";

import AnchorToProject from "../anchorToProject";

/** Props of `ResultListItem` */
export type ResultListItemProps = {
    /** Description message */
    text: string;

    /** Related project entity */
    project: Project;

    /** Related project identifier */
    projectId: number;

    /** Item text should be red colored */
    isError?: boolean;
};

/** Single list item of result list */
export const ResultListItem: FC<ResultListItemProps> = ({
    project, projectId, text, isError = false,
}) => {
    return (
        <li>
            <span>
                <AnchorToProject
                    project={project}
                    projectId={projectId}
                />: <span
                    className={isError ? "has-text-danger" : undefined}
                >
                    {text}
                </span>
            </span>
        </li>
    );
};
