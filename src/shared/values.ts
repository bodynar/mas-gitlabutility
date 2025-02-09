import { isNullish, Optional } from "@bodynarf/utils";
import { SelectableItem } from "@bodynarf/react.components";

import { DEFAULT_BRANCHES, Session } from "@app/models";

/** Default branches as selectable list */
export const branchesSelectList: Array<SelectableItem> =
    DEFAULT_BRANCHES
        .map(branchName => ({
            displayValue: branchName,
            id: branchName,
            value: branchName,
        }));

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
}
