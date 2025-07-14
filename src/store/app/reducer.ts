import { createReducer } from "@reduxjs/toolkit";

import { isNullish } from "@bodynarf/utils";

import { getLocalizedText } from "@app/locale";
import { appSession } from "@app/shared/values";

import { AppSettings, ApplicationStatus, CommonAppState, SettingsUpdatePair, favoriteGroup, initHistory, removeEmptyHistoryEntries, removeHistory, resetTemplates, saveHistory, saveSettings, setAppStatus, setExtraBranches, templateSettings, transitIntoLoadingState, updateLoadingProcessingState } from ".";
import { saveApiInInaccessible } from "../gitlab";

const defaultSettings: AppSettings = {
    apiUrl: "",
    gitlabAuthToken: "",

    releaseTagNameTemplate: "v",
    mergeRequestNameTemplate: getLocalizedText("store.app.mergeRequestNameTemplate"),
    releaseMergeRequestNameTemplate: getLocalizedText("store.app.releaseMergeRequestNameTemplate"),

    preloadGroupIds: [],
    isDarkTheme: false,
    showLoadingStateAtTaskbar: true,
};

const defaultState: CommonAppState = {
    status: ApplicationStatus.init,
    settings: defaultSettings,
    previousSettings: defaultSettings,
    appHistory: {
        sessions: [],
        notifications: [],
        results: [],
    },
    extraBranches: [],
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

                if (!isNullish(state.loadingStateConfig)) {
                    state.loadingStateConfig = undefined;
                }
            })
            .addCase(transitIntoLoadingState, (state, { payload }) => {
                state.status = ApplicationStatus.loading;
                state.loadingStateConfig = payload;
            })
            .addCase(updateLoadingProcessingState, (state, { payload }) => {
                if (state.status !== ApplicationStatus.loading) {
                    return;
                }

                if (isNullish(state.loadingStateConfig)) {
                    return;
                }

                const [stateValue, message, maxState] = payload;

                state.loadingStateConfig = {
                    ...state.loadingStateConfig,
                    processState: {
                        ...state.loadingStateConfig?.processState,
                        state: stateValue,
                        message: message ?? state.loadingStateConfig?.processState?.message,
                        maxState: maxState ?? state.loadingStateConfig?.processState?.maxState,
                    },
                };
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
                        } else if (key === "isDarkTheme" || key === "showLoadingStateAtTaskbar") {
                            state.previousSettings[key] = (isInit ? value : state.settings[key]) as boolean;
                            state.settings[key] = !!value;
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
                    if (key !== "preloadGroupIds"
                        && key !== "isDarkTheme"
                        && key !== "showLoadingStateAtTaskbar"
                    ) {
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
            .addCase(saveHistory, (state, { payload }) => {
                state.appHistory = { ...payload };
            })
            .addCase(initHistory, (state, { payload }) => {
                state.appHistory = { ...payload };
            })
            .addCase(removeHistory, (state) => {
                state.appHistory = {
                    notifications: [],
                    results: [],
                    sessions: [appSession],
                };
            })
            .addCase(setExtraBranches, (state, { payload }) => {
                state.extraBranches = [...payload];
            })
            .addCase(removeEmptyHistoryEntries, (state, { payload }) => {
                state.appHistory = {
                    notifications: state.appHistory.notifications.filter(({ sessionId }) => !payload.includes(sessionId)),
                    results: state.appHistory.results.filter(({ sessionId }) => !payload.includes(sessionId)),
                    sessions: state.appHistory.sessions.filter(({ id }) => !payload.includes(id)),
                };
            })
            ;
    }
);

/**
 * Check should favorite groups be cleared when token is changed
 * @param settings New settings values
 * @param previousSettings Current setting values
 * @returns `true` if api token is changed to new value; otherwise - `false`
 */
const shouldClearFavoriteGroups = (settings: Array<SettingsUpdatePair>, previousSettings: AppSettings): boolean => {
    if (settings.length === 0) {
        return false;
    }

    const apiToken = settings.find(({ key }) => key === "gitlabAuthToken");

    if (isNullish(apiToken)) {
        return false;
    }

    return previousSettings.gitlabAuthToken.toLowerCase() === (apiToken.value as string).toLowerCase();
};
