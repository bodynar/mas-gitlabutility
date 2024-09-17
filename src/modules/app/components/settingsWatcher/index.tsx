import { useEffect } from "react";
import { connect } from "react-redux";

import { isNullOrUndefined } from "@bodynarf/utils";

import { checkHasStorage, getDiff, getSettingsFromStorage, saveSettingsToStorage, setApiBase, setCurrentToken } from "@app/core";
import { GlobalAppState } from "@app/store";
import { AppSettings, ApplicationStatus, SettingsUpdatePair, saveSettings, setAppStatus, transitIntoLoadingState } from "@app/store/app";

/** Props type of `SettingsWatcher` */
interface SettingsWatcherProps {
    /** Current application state */
    state: ApplicationStatus;

    /** Application settings */
    settings: AppSettings;

    /** Previous application settings */
    previousSettings?: AppSettings;

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
}

/**
 * Application settings watcher.
 * Watches settings change to save in store.
 * Restores settings on app starting
 */
const SettingsWatcher = ({
    state,
    settings, previousSettings,
    saveSettings, setAppStatus, transitIntoLoadingState,
}: SettingsWatcherProps): JSX.Element => {
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
        setTimeout(() => {
            setAppStatus(ApplicationStatus.afterInit);
        }, 3 * 1000);
    }, [saveSettings, setAppStatus, state]);

    useEffect(() => {
        if (state !== ApplicationStatus.idle) {
            return;
        }

        const diff = getDiff(settings, previousSettings);

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

    return (<></>);
};

/**
 * Application settings watcher.
 * Watches settings change to save in store.
 * Restores settings on app starting
 */
export default connect(
    ({ app }: GlobalAppState) => ({
        state: app.status,
        settings: app.settings,
        previousSettings: app.previousSettings,
    }) as Partial<SettingsWatcherProps>,
    {
        saveSettings: (settings: Array<SettingsUpdatePair>, isStorageEmpty: boolean) => saveSettings([settings, !isStorageEmpty]),
        setAppStatus,
        transitIntoLoadingState,
    } as Partial<SettingsWatcherProps>
)(SettingsWatcher);
