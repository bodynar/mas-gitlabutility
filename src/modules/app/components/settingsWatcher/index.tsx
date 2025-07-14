import { FC, useEffect } from "react";
import { connect } from "react-redux";

import { isNullOrUndefined } from "@bodynarf/utils";

import { OperationResult, StorageHistoryDto, Notification, ActionResult } from "@app/models";
import { setSession } from "@app/shared/values";
import { checkHasStorage, getSettingsDiff, getHistoryFromStorage, getSettingsFromStorage, initSession, saveSettingsToStorage, setCurrentToken, saveHistoryToStorage, getSessionStateDiff, loadExtraBranches, setApiBase } from "@app/core";
import { GlobalAppState } from "@app/store";
import { AppSettings, ApplicationStatus, SettingsUpdatePair, saveSettings, setAppStatus, transitIntoLoadingState, saveHistory, AppHistory, handleAppCloseAsync, initHistory, setExtraBranches } from "@app/store/app";

/** Props type of `SettingsWatcher` */
type SettingsWatcherProps = {
    /** Current application state */
    state: ApplicationStatus;

    /** Application settings */
    settings: AppSettings;

    /** Previous application settings */
    previousSettings?: AppSettings;

    /** History of app */
    appHistory: AppHistory;

    /** All notifications */
    notifications: Array<Notification>;

    /** Results of the operations performed */
    operationsResults: Array<OperationResult<ActionResult>>;

    /**
     * Save current settings values
     * @param settings New app settings
     * @param isFirstRun Is app first run
     */
    saveSettings: (settings: Array<SettingsUpdatePair>, isFirstRun: boolean) => void;

    /**
     * Set application status
     * @param newStatus New application state
     */
    setAppStatus: (newStatus: ApplicationStatus) => void;

    /** Transit app into loading state */
    transitIntoLoadingState: () => void;

    /** Set app initial history loaded from storage */
    initHistory: (history: StorageHistoryDto) => void;

    /** Set app history loaded from storage */
    saveHistory: (history: StorageHistoryDto) => void;

    /** Save session info to storage */
    handleAppClose: () => Promise<void>;

    /** Save extra branches */
    saveExtraBranches: (branches: Array<string>) => void;
};

/**
 * Application settings watcher.
 * Watches settings change to save in store.
 * Restores settings on app starting
 */
const SettingsWatcher: FC<SettingsWatcherProps> = ({
    state,
    settings, previousSettings,
    appHistory, notifications, operationsResults,
    saveSettings, setAppStatus, transitIntoLoadingState,
    initHistory, saveHistory, handleAppClose,
    saveExtraBranches,
}) => {
    useEffect(() => {
        if (state !== ApplicationStatus.init) {
            return;
        }

        const hasAnyStorage = checkHasStorage();
        const valuesFromStorage = getSettingsFromStorage(!hasAnyStorage);

        const apiBase = valuesFromStorage.find(({ key }) => key === "apiUrl");

        if (!isNullOrUndefined(apiBase)) {
            setApiBase(apiBase.value as string);
        }

        const apiToken = valuesFromStorage.find(({ key }) => key === "gitlabAuthToken");
        if (!isNullOrUndefined(apiToken)) {
            setCurrentToken(apiToken.value as string);
        }

        saveSettings(valuesFromStorage, !hasAnyStorage);

        // Initializing app session
        const session = initSession();
        setSession(session);

        // History loads here due to init state value
        const history = getHistoryFromStorage();

        history.sessions.push(session);
        initHistory(history);

        const extraBranches = loadExtraBranches();
        saveExtraBranches(extraBranches);

        setTimeout(() => {
            setAppStatus(ApplicationStatus.afterInit);
        }, 3 * 1000);
    }, [initHistory, saveExtraBranches, saveHistory, saveSettings, setAppStatus, state]);

    useEffect(() => {
        if (state !== ApplicationStatus.idle) {
            return;
        }

        const diff = getSettingsDiff(settings, previousSettings);

        if (diff.length > 0) {
            transitIntoLoadingState();

            const apiBase = diff.find(({ key }) => key === "apiUrl");

            if (!isNullOrUndefined(apiBase)) {
                setApiBase(apiBase.value as string);
            }

            const apiToken = diff.find(({ key }) => key === "gitlabAuthToken");
            if (!isNullOrUndefined(apiToken)) {
                setCurrentToken(apiToken.value as string);
            }

            saveSettingsToStorage(diff);
            setAppStatus(ApplicationStatus.idle);
        }
    }, [previousSettings, setAppStatus, settings, state, transitIntoLoadingState]);

    useEffect(() => {
        if (state !== ApplicationStatus.idle) {
            return;
        }

        const diff = getSessionStateDiff(appHistory, notifications, operationsResults);

        if (diff.notifications.length > 0
            || diff.results.length > 0
        ) {
            transitIntoLoadingState();

            const updatedHistory = saveHistoryToStorage(appHistory, diff);
            saveHistory(updatedHistory);

            setAppStatus(ApplicationStatus.idle);
        }
    }, [appHistory, notifications, operationsResults, saveHistory, setAppStatus, state, transitIntoLoadingState]);

    useEffect(() => {
        window.electron.app.onBeforeAppClose(handleAppClose);
    }, [handleAppClose]);

    return (<></>);
};

/**
 * Application settings watcher.
 * Watches settings change to save in store.
 * Restores settings on app starting
 */
export default connect(
    ({ app, notificator, gitlab }: GlobalAppState) => ({
        state: app.status,
        settings: app.settings,
        previousSettings: app.previousSettings,

        appHistory: app.appHistory,
        notifications: notificator.notifications,
        operationsResults: gitlab.operationsResults,
    }),
    {
        saveSettings: (settings: Array<SettingsUpdatePair>, isStorageEmpty: boolean) => saveSettings([settings, !isStorageEmpty]),
        setAppStatus,
        transitIntoLoadingState,
        initHistory,
        saveHistory,
        saveExtraBranches: setExtraBranches,
        handleAppClose: handleAppCloseAsync,
    }
)(SettingsWatcher);
