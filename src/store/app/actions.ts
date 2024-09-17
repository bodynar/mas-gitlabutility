import { createAction } from "@reduxjs/toolkit";

import { SettingsUpdatePair, ApplicationStatus, LoadingStateConfig } from ".";

/**
 * Set app current status.
 * For transition into Loading state - use action `transitIntoLoadingState`
 * @param _ New application status
 */
export const setAppStatus = createAction<ApplicationStatus>("mas.gua/app/setAppStatus");

/**
 * Toggle loading state
 * @param _ [New status, configuration for loading state]
 */
export const transitIntoLoadingState = createAction<LoadingStateConfig | undefined>("mas.gua/app/transitIntoLoadingState");

/**
 * Save settings value
 * @param _ Array of new settings value
 */
export const saveSettings = createAction<[Array<SettingsUpdatePair>, boolean]>("mas.gua/app/saveSetting");

/**
 * Update favorite value of specific group
 * @param _ Pair of group identifier and current favorite flag
 */
export const favoriteGroup = createAction<[id: number, isFavorite: boolean]>("mas.gua/app/updateGroupFavorite");

/** Reset settings related with templates */
export const resetTemplates = createAction("mas.gua/app/resetTemplates");
