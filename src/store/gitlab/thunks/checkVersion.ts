import { Action, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";

import { isNullOrEmpty } from "@bodynarf/utils";
import { HttpError } from "@bodynarf/utils/api/simple";

import { name, version, author } from "package.json";

import { getLocalizedText } from "@app/locale";
import { logError } from "@app/core/log";
import { getVersion } from "@app/core/gitlab/version";
import { MAX_GITLAB_VERSION } from "@app/shared/settings";

import { GlobalAppState } from "@app/store";
import { getDisplayErrorFn, getDisplayWarnFn } from "@app/store/notificator";
import { markThatVersionWarningWasShown, saveApiInInaccessible } from "@app/store/gitlab";
import { ApplicationStatus, setAppStatus, transitIntoLoadingState } from "@app/store/app";

/**
 * Check gitlab site version and compare with supported by app
 * @param skipAccessibleCheck Skip accessible check
 * @param displayLoadingState Transit app to loading state
 */
export const checkVersion = (
    skipAccessibleCheck = false,
    displayLoadingState = false,
): ThunkAction<Promise<boolean>, GlobalAppState, unknown, Action> => async (
    dispatch: ThunkDispatch<GlobalAppState, unknown, Action>,
    getState: () => GlobalAppState,
): Promise<boolean> => {
        const { gitlab, app } = getState();

        const accessibleCheckResult = skipAccessibleCheck ? false : gitlab.apiIsInaccessible === true;

        if (accessibleCheckResult || gitlab.versionWarningShown) {
            return;
        }

        if (isNullOrEmpty(app.settings.gitlabAuthToken)) {
            const errorFn = getDisplayErrorFn(dispatch);

            errorFn(
                getLocalizedText("store.gitlab.tokenIsNotSet")
            );

            return false;
        }

        try {
            decodeURIComponent(escape(app.settings.gitlabAuthToken));
        } catch (error) {
            const errorFn = getDisplayErrorFn(dispatch);

            errorFn(
                getLocalizedText("store.gitlab.tokenContainsInvalidCharacters")
            );

            return false;
        }

        try {
            if (displayLoadingState) {
                dispatch(transitIntoLoadingState());
            }

            const gitlabVersion = await getVersion();
            dispatch(saveApiInInaccessible(false));

            if (displayLoadingState) {
                dispatch(setAppStatus(ApplicationStatus.idle));
            }

            const shouldShowWarning = getShouldShowWarning(gitlabVersion);

            if (shouldShowWarning) {
                const appNameCapitalized = name.capitalize();

                const message = getLocalizedText("store.gitlab.gitlabVersionNoteTemplate").format(
                    gitlabVersion,
                    appNameCapitalized,
                    MAX_GITLAB_VERSION
                );

                const warnFn = getDisplayWarnFn(dispatch);

                warnFn(
                    message,
                    true,
                    false,
                    {
                        caption: getLocalizedText("store.gitlab.versionWarning.sendEmail"),
                        ref: `mailto:${author.email}`
                            + "?subject=" + encodeURI(
                                getLocalizedText("store.gitlab.versionWarning.subjectTemplate").format(name)
                            )
                            + "&body=" + encodeURI(
                                getLocalizedText("store.gitlab.versionWarning.bodyTemplate").format(version, MAX_GITLAB_VERSION, gitlabVersion)
                            )
                    }
                );

                dispatch(markThatVersionWarningWasShown());
            }
        } catch (error) {
            dispatch(saveApiInInaccessible(true));
            dispatch(setAppStatus(ApplicationStatus.idle));

            const errorFn = getDisplayErrorFn(dispatch);

            if (error instanceof HttpError) {
                if (error.response.status === 401) {
                    errorFn(
                        getLocalizedText("store.gitlab.tokenIsIncorrect")
                    );
                } else if (error.message === "TypeError: Failed to fetch") {
                    errorFn(
                        getLocalizedText("store.gitlab.gitlabIsInaccessible")
                    );
                }
            } else {
                logError(error, {
                    componentStack: error.stack,
                });

                errorFn(
                    getLocalizedText("store.gitlab.gitlabAccessCheckUnknownError"),
                    true,
                    false,
                    {
                        caption: getLocalizedText("app.error.openLogsActionTitle"),
                        ref: "#!command_open"
                    }
                );
            }

            return false;
        }

        return true;
    };

/**
 * Check can app properly handle gitlab version
 * @param version Current gitlab version
 * @returns `true` if gitlab version is supported by app; otherwise - `false`
 */
const getShouldShowWarning = (version: string): boolean => {
    const currentVersion =
        version.split(".").map(x => parseInt(x));

    const handledVersion =
        MAX_GITLAB_VERSION.split(".").map(x => parseInt(x));

    for (let index = 0; index < handledVersion.length; index++) {
        const handledPart = handledVersion[index];
        const currentPart = currentVersion[index] ?? 0;

        if (currentPart > handledPart) {
            return true;
        }
        if (currentPart < handledPart) {
            return false;
        }
    }

    return false;
};
