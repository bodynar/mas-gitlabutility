import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";

import Icon from "@bodynarf/react.components/components/icon";

import "./styles.scss";

import { name, version } from "package.json";

import { getIsAppConfigured } from "@app/core";
import { GlobalAppState } from "@app/store";
import { ApplicationStatus, setAppStatus } from "@app/store/app";
import { checkVersion, loadGroups } from "@app/store/gitlab";

/** Props of `SplashScreen` */
interface SplashScreenProps {
    /** Current application state */
    state: ApplicationStatus;

    /** Group ids to preload nested projects */
    favoriteGroups: Array<number>;

    /** Is gitlab settings set (token & api address) */
    isApiConfigured: boolean;

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
}

const SplashScreen = ({
    state, isApiConfigured,
    favoriteGroups,
    loadGroups, setAppStatus,
    checkVersion,
}: SplashScreenProps): JSX.Element => {
    const navigate = useNavigate();

    useEffect(() => {
        if (state !== ApplicationStatus.afterInit) {
            return;
        }

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

    return (
        <div
            className="is-flex is-justify-content-center"
            role="splash-screen"
        >
            <div
                className="m-4 p-4 is-flex is-flex-direction-column is-align-items-center has-text-link-dark is-justify-content-center is-clipped"
                role="splash-container"
            >
                <Icon
                    name="gitlab"
                    className="is-size-1"
                />
                <h2 className="title is-2 has-text-link-dark">
                    <span className="is-capitalized">{name}</span> v{version}
                </h2>
                <div className="loading-title">
                    <span>Loading</span><span>{new Array(dotsCount + 1).join(".")}</span>
                </div>
            </div>
        </div>
    );
};

export default connect(
    ({ app, gitlab }: GlobalAppState) => ({
        state: app.status,
        favoriteGroups: app.settings.preloadGroupIds,
        isApiConfigured: getIsAppConfigured(app.settings) && gitlab.apiIsInaccessible !== true
    }),
    {
        loadGroups,
        setAppStatus,
        checkVersion,
    }
)(SplashScreen);
