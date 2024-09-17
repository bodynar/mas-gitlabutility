import { Action, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";

import { HttpError } from "@bodynarf/utils/api/simple";

import { name, version, author } from "package.json";

import { getVersion } from "@app/core/gitlab/version";
import { MAX_GITLAB_VERSION } from "@app/shared/settings";

import { GlobalAppState } from "@app/store";
import { getDisplayErrorFn, getDisplayWarnFn } from "@app/store/notificator";
import { markThatVersionWarningWasShown, saveApiInInaccessible } from "@app/store/gitlab";
import { ApplicationStatus, setAppStatus, transitIntoLoadingState } from "@app/store/app";

/**
 * Check gitlab site version and compare with supported by app
 * @param skipAccessibleCheck Skip accessible check
 */
export const checkVersion = (
    skipAccessibleCheck = false,
    displayLoadingState = false,
): ThunkAction<Promise<boolean>, GlobalAppState, unknown, Action> => async (
    dispatch: ThunkDispatch<GlobalAppState, unknown, Action>,
    getState: () => GlobalAppState,
): Promise<boolean> => {
        const { gitlab } = getState();

        const accessibleCheckResult = skipAccessibleCheck ? false : gitlab.apiIsInaccessible === true;

        if (accessibleCheckResult || gitlab.versionWarningShown) {
            return;
        }

        const warnFn = getDisplayWarnFn(dispatch);

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
                const appNameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);

                warnFn(
                    `Gitlab site runs on v${gitlabVersion}.
                But ${appNameCapitalized} app supports v${MAX_GITLAB_VERSION} and earlier.
                Some functions may be unstable.
                Please, contact the app owner for updates`,
                    true,
                    false,
                    {
                        caption: "Send email",
                        ref: `mailto:${author.email}`
                            + "?subject=" + encodeURI(`[${name}] App update request`)
                            + "&body=" + encodeURI(`&body=My app is v${version} [support site v${MAX_GITLAB_VERSION}],
gitlab site is ${gitlabVersion}`
                            )
                    }
                );

                dispatch(markThatVersionWarningWasShown());
            }
        } catch (error) {
            dispatch(saveApiInInaccessible(true));
            dispatch(setAppStatus(ApplicationStatus.idle));

            if (error instanceof HttpError) {
                const errorFn = getDisplayErrorFn(dispatch);

                if (error.response.status === 401) {
                    errorFn("Gitlab auth token is incorrect");
                } else if (error.message === "TypeError: Failed to fetch") {
                    errorFn("Gitlab is inaccessible");
                }
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
