import { Action, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";

import { GlobalAppState } from "@app/store";
import { closeCurrentSession } from "@app/core";

/**
 * Handle app closing as redux action
 */
export const handleAppCloseAsync = (
): ThunkAction<void, GlobalAppState, unknown, Action> => async (
    _: ThunkDispatch<GlobalAppState, unknown, Action>,
    getState: () => GlobalAppState,
): Promise<void> => {
    const state = getState();

    closeCurrentSession(state.app.appHistory);
};
