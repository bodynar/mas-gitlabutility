import { FC, useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import { connect } from "react-redux";

import { getIsAppConfigured } from "@app/core";
import { GlobalAppState } from "@app/store";
import { ApplicationStatus, LoadingStateConfig } from "@app/store/app";

import { siteMenu } from "@app/modules/routes";

import AppMenu from "../components/menu";
import LoaderWrap from "../components/loaderWrap";
import Brand from "../components/brand";
import NotificationProvider from "../components/notificationProvider";
import SettingsWatcher from "../components/settingsWatcher";
import SplashScreen from "../components/splashScreen";
import ErrorBoundary from "../components/error/component";

/** Application root component props */
type AppProps = {
    /** Current application state */
    state: ApplicationStatus;

    /** Current loading state overlay configuration */
    loadingStateConfig?: LoadingStateConfig;

    /** Is gitlab settings set (token & api address) */
    isApiConfigured: boolean;
};

/** Application root component */
const App: FC<AppProps> = ({
    state, isApiConfigured, loadingStateConfig,
}) => {
    const leftMenu = useMemo(() => siteMenu.filter(({ display }) => display), []);

    const isInitState = useMemo(
        () => [ApplicationStatus.init, ApplicationStatus.afterInit].includes(state),
        [state]
    );

    return (
        <ErrorBoundary>
            <SettingsWatcher />

            {isInitState
                ? <SplashScreen />
                : <>
                    <LoaderWrap
                        loading={state === ApplicationStatus.loading}
                        message={loadingStateConfig?.message}
                        cancelOptions={loadingStateConfig?.buttonConfig}
                    >
                        <NotificationProvider />
                        <div className="container pt-5">
                            <Brand />
                            <div className="columns">
                                <div className="column is-2">
                                    <div className="box">
                                        <AppMenu
                                            menu={leftMenu}
                                            isApiConfigured={isApiConfigured}
                                        />
                                    </div>
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
                </>
            }
        </ErrorBoundary>
    );
};

/** Application root component */
export default connect(
    ({ app, gitlab }: GlobalAppState) => ({
        state: app.status,
        loadingStateConfig: app.loadingStateConfig,
        isApiConfigured: getIsAppConfigured(app.settings) && gitlab.apiIsInaccessible !== true
    }) as Partial<AppProps>,
    undefined
)(App);
