import { Action as ReduxAction } from "@reduxjs/toolkit";
import { ThunkAction, ThunkDispatch } from "redux-thunk";

import { GlobalAppState } from "@app/store";
import { deselectGroup, deselectProject, selectGroup, selectProject } from "@app/store/gitlab";

/**
 * Toggle element selection state
 * @param id Element identifier
 * @param type Element type
 * @param selected Is element selected
 * @returns Action that could be called via redux dispatch
 */
export const toggleItemSelect = (
    id: number,
    type: "group" | "project",
    selected: boolean,
): ThunkAction<void, GlobalAppState, unknown, ReduxAction> => (
    dispatch: ThunkDispatch<GlobalAppState, unknown, ReduxAction>,
): void => {
        if (type === "group") {
            if (selected) {
                dispatch(selectGroup(id));
            } else {
                dispatch(deselectGroup(id));
            }
        } else {
            if (selected) {
                dispatch(selectProject(id));
            } else {
                dispatch(deselectProject(id));
            }
        }
    };
