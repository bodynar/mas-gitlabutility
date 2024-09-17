import { SelectableProject } from "@app/models";

import ProjectListEntry from "../projectItem";

/** Selectable project list component props */
interface ProjectListProps {
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
}

/** Selectable project list component */
const ProjectList = ({
    projects,
    canSelect, onSelectChange,
}: ProjectListProps): JSX.Element => {
    return (
        <ul>
            {projects.map(x =>
                <ProjectListEntry
                    item={x}
                    key={`${x.id}-${x.selected}`}
                    canSelect={canSelect}
                    onSelectChange={onSelectChange}
                />
            )}
        </ul>
    );
};

export default ProjectList;
