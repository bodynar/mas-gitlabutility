import { createAction } from "@reduxjs/toolkit";

import { Optional } from "@bodynarf/utils";

import { StorageHistoryDto } from "@app/models";
import { SettingsUpdatePair, ApplicationStatus, LoadingStateConfig } from ".";

/**
 * Set app current status.
 * For transition into Loading state - use action `transitIntoLoadingState`
 * @param _ New application status
 */
export const setAppStatus = createAction<ApplicationStatus>("mas.gua/app/setAppStatus");

/**
 * Transit loading state
 * @param _ Configuration for loading state
 */
export const transitIntoLoadingState = createAction<Optional<LoadingStateConfig>>("mas.gua/app/transitIntoLoadingState");

/**
 * Update loading processing state
 * @param _ New processing config
 */
export const updateLoadingProcessingState = createAction<[number, Optional<string>, Optional<number>]>("mas.gua/app/updateLoadingProcessingState");

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

/**
 * Save initial app history
 * @param _ History data
 */
export const initHistory = createAction<StorageHistoryDto>("mas.gua/app/initHistory");

/**
 * Save app history
 * @param _ History data
 */
export const saveHistory = createAction<StorageHistoryDto>("mas.gua/app/saveHistory");

/**
 * Remove app history
 */
export const removeHistory = createAction("mas.gua/app/removeHistory");

/**
 * Save user configured extra branches
 * @param _ Extra branches
 */
export const setExtraBranches = createAction<Array<string>>("mas.gua/app/setExtraBranches");
