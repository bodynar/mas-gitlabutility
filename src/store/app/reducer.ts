import { createReducer } from "@reduxjs/toolkit";

import { isNullOrEmpty, isNullOrUndefined } from "@bodynarf/utils";

import { AppSettings, ApplicationStatus, CommonAppState, SettingsUpdatePair, favoriteGroup, resetTemplates, saveSettings, setAppStatus, templateSettings, transitIntoLoadingState } from ".";
import { saveApiInInaccessible } from "../gitlab";

const defaultSettings: AppSettings = {
    apiUrl: "",
    gitlabAuthToken: "",

    releaseTagNameTemplate: "",
    mergeRequestNameTemplate: "",
    releaseMergeRequestNameTemplate: "",

    preloadGroupIds: [],
};

const defaultState: CommonAppState = {
    status: ApplicationStatus.init,
    settings: defaultSettings,
    previousSettings: defaultSettings,
};

/** Application shared state reducer */
export const reducer = createReducer(defaultState,
    (builder) => {
        builder
            .addCase(setAppStatus, (state, { payload }) => {
                if (payload === ApplicationStatus.loading) {
                    throw new TypeError("For transition into load state use different action, transitIntoLoadingState");
                }

                state.status = payload;

                if (!isNullOrUndefined(state.loadingStateConfig)) {
                    state.loadingStateConfig = undefined;
                }
            })
            .addCase(transitIntoLoadingState, (state, { payload }) => {
                state.status = ApplicationStatus.loading;
                state.loadingStateConfig = payload;
            })
            .addCase(saveSettings, (state, { payload }) => {
                const [settings, isInit] = payload;

                if (settings.length === 0) {
                    return;
                }

                const needToClearFavGroups = shouldClearFavoriteGroups(settings, state.settings);

                if (needToClearFavGroups) {
                    state.settings.preloadGroupIds = [];
                }

                settings
                    .forEach(({ value, key }) => {
                        if (key === "preloadGroupIds") {
                            state.previousSettings[key] = (isInit ? value : state.settings[key]) as Array<number>;
                            state.settings[key] = value as Array<number>;
                        } else {
                            state.previousSettings[key] = (isInit ? value : state.settings[key]) as string;
                            state.settings[key] = value as string;
                        }
                    });
            })
            .addCase(favoriteGroup, (state, { payload }) => {
                const [groupId, flagValue] = payload;

                const isFavorite = state.settings.preloadGroupIds.includes(groupId);

                if ((isFavorite === flagValue)) {
                    return;
                }

                state.previousSettings.preloadGroupIds = state.settings.preloadGroupIds;

                state.settings.preloadGroupIds = flagValue
                    ? state.settings.preloadGroupIds.concat([groupId])
                    : state.settings.preloadGroupIds.filter(x => x !== groupId);
            })
            .addCase(resetTemplates, (state) => {
                templateSettings.forEach(key => {
                    if (key !== "preloadGroupIds") {
                        state.previousSettings[key] = state.settings[key] as string;
                        state.settings[key] = defaultSettings[key];
                    }
                });
            })
            .addCase(saveApiInInaccessible, (state, { payload }) => {
                if (payload) {
                    state.previousSettings.preloadGroupIds = state.settings.preloadGroupIds;
                    state.settings.preloadGroupIds = [];
                }
            })
            ;
    }
);

/**
 * Check should favorite groups be cleared when api url is changed
 * @param settings New settings values
 * @param previousSettings Current setting values
 * @returns `true` if api url is changed to new value; otherwise - `false`
 */
const shouldClearFavoriteGroups = (settings: Array<SettingsUpdatePair>, previousSettings: AppSettings): boolean => {
    if (isNullOrEmpty(previousSettings.apiUrl) || settings.length === 0) {
        return false;
    }

    const apiUrl = settings.find(({ key }) => key === "apiUrl");

    if (isNullOrUndefined(apiUrl)) {
        return false;
    }

    return previousSettings.apiUrl.toLowerCase() === (apiUrl.value as string).toLowerCase();
};
