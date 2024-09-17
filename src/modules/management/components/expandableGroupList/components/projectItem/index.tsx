import { useCallback } from "react";

import { ElementColor } from "@bodynarf/react.components";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox";

import { SelectableProject } from "@app/models";

/** Props type of @see ProjectListEntry */
interface ProjectListEntryProps {
    /** Is projects could be selected */
    canSelect: boolean;

    /** Project item to display */
    item: SelectableProject;

    /**
     * Item select change handler
     * @param id Element identifier
     * @param type Element type
     * @param selected Current selection value
     */
    onSelectChange: (id: number, type: "group" | "project", selected: boolean) => void;
}

/** Single selectable project list item component */
const ProjectListEntry = ({
    canSelect, onSelectChange,
    item
}: ProjectListEntryProps): JSX.Element => {
    const onSelect = useCallback(
        (value?: boolean) => onSelectChange(item.id, "project", value ?? false),
        [item.id, onSelectChange]
    );

    return (
        <li>
            <a>
                <CheckBox
                    hasBackgroundColor
                    fixBackgroundColor
                    disabled={!canSelect}
                    onValueChange={onSelect}
                    defaultValue={item.selected}
                    style={ElementColor.Primary}
                    label={{ caption: item.name, horizontal: true, }}
                />
            </a>
        </li>
    );
};

export default ProjectListEntry;
