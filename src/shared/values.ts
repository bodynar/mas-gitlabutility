import { SelectableItem } from "@bodynarf/react.components";

import { DEFAULT_BRANCHES } from "@app/models";

/** Default branches as selectable list */
export const branchesSelectList: Array<SelectableItem> =
    DEFAULT_BRANCHES
        .map(branchName => ({
            displayValue: branchName,
            id: branchName,
            value: branchName,
        }));
