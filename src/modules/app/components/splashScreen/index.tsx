import { FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";

import "./styles.scss";

import { name, version } from "package.json";
import logo from "@app/shared/assets/favicon.ico";

import { getIsAppConfigured } from "@app/core";
import { getLocalizedText, setCurrentLocale } from "@app/locale";
import { GlobalAppState } from "@app/store";
import { ApplicationStatus, setAppStatus } from "@app/store/app";
import { checkVersion, loadGroups } from "@app/store/gitlab";

/** Props of `SplashScreen` */
type SplashScreenProps = {
    /** Current application state */
    state: ApplicationStatus;

    /** Group ids to preload nested projects */
    favoriteGroups: Array<number>;

    /** Is gitlab settings set (token & api address) */
    isApiConfigured: boolean;

    /** Is app in dark mode */
    isDarkMode: boolean;

    /**
     * Load available groups
     * @param ids Specific groups ids to load nested projects
     * @param shouldSkipLoadingMode Should loading state be skipped
     */
    loadGroups: (ids?: Array<number>, shouldSkipLoadingMode?: boolean) => Promise<void>;

    /**
     * Set application status
     * @param newStatus New application state
     */
    setAppStatus: (newStatus: ApplicationStatus) => void;

    /**
     * Check gitlab site version and compare with supported by app
     */
    checkVersion: () => Promise<boolean>;
};

const SplashScreen: FC<SplashScreenProps> = ({
    state, isApiConfigured,
    favoriteGroups,
    loadGroups, setAppStatus,
    checkVersion,
    isDarkMode,
}) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (state !== ApplicationStatus.afterInit) {
            return;
        }

        // eslint-disable-next-line no-undef
        setCurrentLocale(appLocale);

        if (!isApiConfigured) {
            setAppStatus(ApplicationStatus.idle);
            navigate("/settings", { replace: true });

            return;
        }

        const asyncInit = async () => {
            await checkVersion()
                .then(async (success) => {
                    if (!success) {
                        navigate("/settings", { replace: true });
                        return;
                    }

                    await loadGroups(favoriteGroups, true)
                        .then(() => navigate("/main", { replace: true }));
                });
        };

        asyncInit();
    }, [checkVersion, favoriteGroups, isApiConfigured, loadGroups, navigate, setAppStatus, state]);

    const [dotsCount, setDotsCount] = useState(2);

    useEffect(() => {
        const interval = setInterval(() => setDotsCount(count => (count + 1) % 4), 0.5 * 1000);

        return () => clearInterval(interval);
    }, []);

    const colorClassName = isDarkMode ? "has-text-info" : "has-text-link-dark";

    return (
        <div
            role="splash-screen"
            className="is-flex is-justify-content-center"
            style={{ backgroundColor: isDarkMode ? "#1c1c1c" : null }}
        >
            <div
                role="splash-container"
                className={`m-4 p-4 is-flex is-flex-direction-column is-align-items-center ${colorClassName} is-justify-content-center is-clipped`}
            >
                <img
                    width={75}
                    src={logo}
                    className="mb-2"
                />
                <h2 className={`title is-2 ${colorClassName}`}>
                    <span className="is-capitalized">
                        {name}
                    </span> v{version}
                </h2>
                <div className="loading-title">
                    <span>
                        {getLocalizedText("common.loading")}
                    </span><span>{new Array(dotsCount + 1).join(".")}</span>
                </div>
            </div>
        </div>
    );
};

export default connect(
    ({ app, gitlab }: GlobalAppState) => ({
        state: app.status,
        favoriteGroups: app.settings.preloadGroupIds,
        isApiConfigured: getIsAppConfigured(app.settings) && gitlab.apiIsInaccessible !== true,
        isDarkMode: app.settings.isDarkTheme
    }) as Partial<SplashScreenProps>,
    {
        loadGroups,
        setAppStatus,
        checkVersion,
    }
)(SplashScreen);
