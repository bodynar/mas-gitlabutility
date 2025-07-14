import { SelectableProject } from "@app/models";

import ProjectListEntry from "../projectItem";
import { FC } from "react";

/** Selectable project list component props */
type ProjectListProps = {
    /** Is projects could be selected */
    canSelect: boolean;

    /** Project items to display */
    projects: Array<SelectableProject>;

    /**
     * Item select change handler
     * @param id Element identifier
     * @param type Element type
     * @param selected Current selection value
     */
    onSelectChange: (id: number, type: "group" | "project", selected: boolean) => void;
};

/** Selectable project list component */
const ProjectList: FC<ProjectListProps> = ({
    projects,
    canSelect, onSelectChange,
}) => {
    return (
        <ul>
            {projects.map(x =>
                <ProjectListEntry
                    key={`${x.id}-${x.selected}`}

                    item={x}
                    canSelect={canSelect}
                    onSelectChange={onSelectChange}
                />
            )}
        </ul>
    );
};

export default ProjectList;
