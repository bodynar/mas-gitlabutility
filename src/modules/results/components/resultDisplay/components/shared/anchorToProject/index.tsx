import { FC } from "react";

import { isNullOrUndefined } from "@bodynarf/utils";
import Anchor from "@bodynarf/react.components/components/anchor";

import { Project } from "@app/models";
import { getLocalizedText } from "@app/locale";

/** Props of @see AnchorToProject */
type AnchorToProjectProps = {
    /** Related project entity */
    project: Project;

    /** Related project identifier */
    projectId: number;
};

/**
 * Anchor ref to project.
 * If project is not found - there will be a red text with project identifier
*/
const AnchorToProject: FC<AnchorToProjectProps> = ({
    projectId, project,
}) => {
    if (isNullOrUndefined(project)) {
        return (
            <span className="has-text-danger">
                {getLocalizedText("results.projectNotFoundTemplate").format(`${projectId}`)}
            </span>
        );
    }

    return (
        <Anchor
            target="_blank"
            href={project.link}
            className="is-underlined"
            caption={project.fullName}
        />
    );
};

export default AnchorToProject;
