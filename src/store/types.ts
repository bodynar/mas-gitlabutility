import { CommonAppState } from "./app";
import { NotificatorState } from "./notificator";
import { GitlabState } from "./gitlab";

/** Current application state as composition of all states */
export interface GlobalAppState {
    /** Application state */
    app: CommonAppState;

    /** App notifications state */
    notificator: NotificatorState;

    /** Gitlab integration state */
    gitlab: GitlabState;
}
