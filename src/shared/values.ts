import { isNullish, Optional } from "@bodynarf/utils";
import { SelectableItem } from "@bodynarf/react.components";

import { DEFAULT_BRANCHES, ProjectViewMode, Session } from "@app/models";
import { getLocalizedText } from "@app/locale";

/** Default branches as selectable list */
export const branchesSelectList: Array<SelectableItem> =
    DEFAULT_BRANCHES
        .map(branchName => ({
            displayValue: branchName,
            id: branchName,
            value: branchName,
        }));

/**
 * View mode of selectable projects component baseline
 * (must be called to calculate textual values)
 */
export const projectsViewMode = [
    {
        id: "0",
        displayValue: () => getLocalizedText("shared.projectsViewMode.all"),
        value: ProjectViewMode.All,
        title: () => getLocalizedText("shared.projectsViewMode.allTitle"),
    },
    {
        id: "1",
        displayValue: () => getLocalizedText("shared.projectsViewMode.selected"),
        value: ProjectViewMode.OnlySelected,
        title: () => getLocalizedText("shared.projectsViewMode.selectedTitle"),
    },
    {
        id: "2",
        displayValue: () => getLocalizedText("shared.projectsViewMode.unselected"),
        value: ProjectViewMode.OnlyDeselected,
        title: () => getLocalizedText("shared.projectsViewMode.unselectedTitle"),
    },
];

/**
 * @constant
 * @description Current app session
 */
export let appSession: Optional<Session> = undefined;

/**
 * Save current session
 * @param session Instance of `Session`
 */
export const setSession = (session: Session): void => {
    if (!isNullish(appSession)) {
        throw new Error("Session is already set");
    }

    appSession = session;
};
