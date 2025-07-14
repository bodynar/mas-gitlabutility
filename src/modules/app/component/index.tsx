import { FC, useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import { connect } from "react-redux";

import { getClassName } from "@bodynarf/utils";

import { getIsAppConfigured } from "@app/core";
import { GlobalAppState } from "@app/store";
import { ApplicationStatus, LoadingStateConfig } from "@app/store/app";

import { siteMenu } from "@app/modules/routes";

import "@app/shared/styles.dark.scss";

import "./styles.scss";

import AppMenu from "../components/menu";
import LoaderWrap from "../components/loaderWrap";
import Brand from "../components/brand";
import NotificationProvider from "../components/notificationProvider";
import SettingsWatcher from "../components/settingsWatcher";
import SplashScreen from "../components/splashScreen";
import ErrorBoundary from "../components/error";
import DarkThemeSwitcher from "../components/darkThemeSwitcher";

/** Application root component props */
type AppProps = {
    /** Current application state */
    state: ApplicationStatus;

    /** Current loading state overlay configuration */
    loadingStateConfig?: LoadingStateConfig;

    /** Is gitlab settings set (token & api address) */
    isApiConfigured: boolean;

    /** Is dark theme applied */
    isDarkTheme: boolean;
};

/** Application root component */
const App: FC<AppProps> = ({
    state, isApiConfigured, loadingStateConfig,
    isDarkTheme
}) => {
    const leftMenu = useMemo(() => siteMenu.filter(({ display }) => display), []);

    const isInitState = useMemo(
        () => [ApplicationStatus.init, ApplicationStatus.afterInit].includes(state),
        [state]
    );

    /**
     * App status is `Init` after open
     * Then SettingWatcher loads settings from persistent storage
     *  and changes status to `AfterInit` (after 3 sec delay)
     * AfterInit state - this is a trigger for SplashScreen to load data from API
     *  after successfully load - state being transited to idle (via `loadGroups` thunk)
     */

    const className = getClassName([
        "app",
        isDarkTheme ? "app--theme-dark" : undefined,
    ]);

    return (
        <ErrorBoundary>
            <SettingsWatcher />

            {isInitState
                ? <SplashScreen />
                : <main className={className}>
                    <LoaderWrap
                        loading={state === ApplicationStatus.loading}
                        message={loadingStateConfig?.message}
                        cancelOptions={loadingStateConfig?.buttonConfig}
                        processState={loadingStateConfig?.processState}
                    >
                        <NotificationProvider />
                        <div className="container pt-5">
                            <Brand />
                            <div className="columns">
                                <div className="column is-2 menu">
                                    <div className="box mb-3">
                                        <AppMenu
                                            menu={leftMenu}
                                            isApiConfigured={isApiConfigured}
                                        />
                                    </div>
                                    <DarkThemeSwitcher />
                                </div>
                                <div className="column is-10">
                                    <div className="box">
                                        <Routes>
                                            {siteMenu.map(x =>
                                                <Route
                                                    key={x.name}
                                                    path={x.link}
                                                    element={x.component}
                                                />
                                            )}
                                        </Routes>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </LoaderWrap>
                </main>
            }
        </ErrorBoundary>
    );
};

/** Application root component */
export default connect(
    ({ app, gitlab }: GlobalAppState) => ({
        state: app.status,
        loadingStateConfig: app.loadingStateConfig,
        isApiConfigured: getIsAppConfigured(app.settings) && gitlab.apiIsInaccessible !== true,
        isDarkTheme: app.settings.isDarkTheme,
    }) as Partial<AppProps>,
    undefined
)(App);
