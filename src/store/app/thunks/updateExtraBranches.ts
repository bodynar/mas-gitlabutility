import { Action, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";

import { GlobalAppState } from "@app/store";
import { saveExtraBranches } from "@app/core";
import { setExtraBranches } from "@app/store/app";

/**
 * Save extra branches to session store & storage
 * @param branches Extra branches to save
 */
export const updateExtraBranchesAsync = (
    branches: Array<string>
): ThunkAction<Promise<void>, GlobalAppState, unknown, Action> => async (
    dispatch: ThunkDispatch<GlobalAppState, unknown, Action>
): Promise<void> => {
        saveExtraBranches(branches);

        dispatch(setExtraBranches(branches));
    };
