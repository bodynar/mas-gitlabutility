import { FC, useCallback, useMemo, useState } from "react";

import { getClassName, isNullish } from "@bodynarf/utils";
import { ElementColor } from "@bodynarf/react.components";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox/component";
import Icon from "@bodynarf/react.components/components/icon/component";

import { Group, SelectableProject } from "@app/models";
import { getLocalizedText, LocaleKeys } from "@app/locale";

import ProjectList from "../projects";

/** Group with expandable project list component props */
type ExpandableGroupListItemProps = {
    /** Group to display */
    group: Group;

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

/** Group with expandable project list component */
const ExpandableGroupListItem: FC<ExpandableGroupListItemProps> = ({
    group, canSelect,
    onSelectChange, selectedProjects,
}) => {
    const [expanded, setIsExpanded] = useState(false);
    const hasChildren = useMemo(() => group.projects.length > 0, [group.projects.length]);

    const onCaptionClick = useCallback(() => {
        if (hasChildren) {
            setIsExpanded(value => !value);
        }
    }, [hasChildren]);

    const className = getClassName([
        "app-expandable-menu__item",
        expanded ? "is-expanded" : undefined,
    ]);

    const onSelect = useCallback(
        (value?: boolean) => onSelectChange(group.id, "group", value ?? false),
        [group.id, onSelectChange]
    );

    const allChildrenSelected = useMemo(
        () =>
            group.projects.filter(({ id }) => !selectedProjects.includes(id)).length === 0
            && group.projects.length !== 0,
        [group.projects, selectedProjects]
    );

    const selectedChildrenCount = useMemo(() => {
        const selectedCount = group.projects.filter(({ id }) => selectedProjects.includes(id)).length;

        return selectedCount === 0 || selectedCount === group.projects.length
            ? undefined
            : selectedCount;
    }, [group.projects, selectedProjects]);

    const projects = useMemo(() =>
        group.projects.map(x => ({
            ...x,
            selected: selectedProjects.includes(x.id)
        } as SelectableProject)),
        [group.projects, selectedProjects]
    );

    const caption = isNullish(selectedChildrenCount)
        ? group.fullName
        : `${group.fullName} ${getLocalizedText("management.expandableGroupListItemSelectedTemplate").format(`${selectedChildrenCount}`, `${group.projects.length}`)}`;

    const checkboxTitle = getDisabledGroupSelectReasonTitle(hasChildren, canSelect);

    return (
        <>
            <a
                className={expanded && hasChildren ? "is-active" : null}
                onClick={onCaptionClick}
            >
                <div className="is-flex">
                    <div className={hasChildren ? "mr-3" : "mr-4 pl-3"}>
                        {hasChildren &&
                            <Icon
                                name={expanded ? "chevron-up" : "chevron-down"}
                            />
                        }
                    </div>
                    <div className="app-expandable-menu__checkbox">
                        <CheckBox
                            key={`${allChildrenSelected}`}

                            hasBackgroundColor
                            fixBackgroundColor
                            onValueChange={onSelect}
                            style={ElementColor.Primary}
                            defaultValue={allChildrenSelected}
                            disabled={!canSelect || !hasChildren}
                            title={isNullish(checkboxTitle) ? null : getLocalizedText(checkboxTitle)}
                        />
                    </div>
                    <span>{caption}</span>
                </div>
            </a>
            {hasChildren &&
                <div className={className}>
                    <div className="app-expandable-menu__item-content">
                        <ProjectList
                            projects={projects}
                            canSelect={canSelect}
                            onSelectChange={onSelectChange}
                        />
                    </div>
                </div>
            }
        </>
    );
};

export default ExpandableGroupListItem;

/**
 * Get reason why group selection is disabled as locale key. If group can be selected - `null`
 * @param hasChildren Is group contains loaded children
 * @param canSelect Is action selected
 * @returns Locale key of reason why group selection is disabled; otherwise - `null`
 */
const getDisabledGroupSelectReasonTitle = (
    hasChildren: boolean,
    canSelect: boolean,
): keyof LocaleKeys | null => {
    if (canSelect && hasChildren) {
        return null;
    }

    if (!canSelect) {
        return "management.actionIsNotSelected";
    }

    return "management.groupIsEmpty";
};
