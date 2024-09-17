import { SerializableStateInvariantMiddlewareOptions, configureStore } from "@reduxjs/toolkit";

import { reducer as notificatorReducer } from "./notificator/reducer";
import { reducer as appReducer } from "./app/reducer";
import { reducer as gitlabReducer } from "./gitlab/reducer";

import { GlobalAppState } from ".";

/** Global application store */
const store = configureStore<GlobalAppState>({
    reducer: {
        app: appReducer,
        notificator: notificatorReducer,
        gitlab: gitlabReducer,
    },
    middleware: defaultMiddlewareProvider => defaultMiddlewareProvider({
        serializableCheck: {
            ignoredPaths: [
                /[^.]*\.?\d*\.(createdOn|createdAt|completedOn|startedOn)/,
                "app.loadingStateConfig",
            ],
            ignoredActionPaths: [
                /[^.]*\.?\d*\.(createdOn|createdAt|completedOn|startedOn)/,
            ]
        } as SerializableStateInvariantMiddlewareOptions
    })
});

export default store;
