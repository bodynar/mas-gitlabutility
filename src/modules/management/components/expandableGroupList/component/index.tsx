import { FC } from "react";

import { Group } from "@app/models";

import "./style.scss";

import ExpandableGroupListItem from "../components/item";

/** Group list expander props type */
type ExpandableGroupListProps = {
    /** Groups to display */
    items: Array<Group>;

    /** Is projects could be selected */
    canSelect: boolean;

    /** Project identifiers selected for performing action */
    selectedProjects: Array<number>;

    /**
     * Item select change handler
     * @param id Element identifier
     * @param type Element type
     * @param selected Current selection value
     */
    onSelectChange: (id: number, type: "group" | "project", selected: boolean) => void;
};

/** Collapsible container with groups */
const ExpandableGroupList: FC<ExpandableGroupListProps> = ({
    items, canSelect,
    onSelectChange, selectedProjects,
}) => {
    return (
        <section
            className="menu app-expandable-menu"
        >
            <ul className="menu-list">
                {items.map(x =>
                    <li key={x.fullName}>
                        <ExpandableGroupListItem
                            group={x}
                            canSelect={canSelect}
                            onSelectChange={onSelectChange}
                            selectedProjects={selectedProjects}
                        />
                    </li>
                )}
            </ul>
        </section>
    );
};

export default ExpandableGroupList;
