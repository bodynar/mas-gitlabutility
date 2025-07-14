import React, { ErrorInfo, ReactNode } from "react";
import { connect } from "react-redux";

import { Navigate } from "react-router-dom";

import { getIsAppConfigured } from "@app/core";
import { getLocalizedText } from "@app/locale";
import { GlobalAppState } from "@app/store";
import { logError } from "@app/core/log";
import { displayError } from "@app/store/notificator";

/** Props of `ErrorBoundary` */
type ErrorBoundaryProps = {
    /** Is gitlab settings set (token & api address) */
    isApiConfigured: boolean;

    /** Component child subtree */
    children: ReactNode;

    /** Display error message */
    displayError: (message: string) => void;
};

/** State of `ErrorBoundary` component */
type ErrorBoundaryState = {
    /** Is error catch */
    hasError: boolean;
};

/** Global unhandled error catcher */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    /** @inheritdoc */
    constructor(props: ErrorBoundaryProps) {
        super(props);

        this.state = {
            hasError: false,
        };
    }

    /** @inheritdoc */
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.props.displayError(
            getLocalizedText("app.error.message")
        );

        logError(error, errorInfo);

        this.setState({ hasError: true });
    }

    /** @inheritdoc */
    render() {
        if (this.state.hasError) {
            this.setState({ hasError: false });

            return this.props.isApiConfigured
                ? <Navigate to="/main" />
                : <Navigate to="/settings" />
            ;
        }

        return this.props.children;
    }
}

export default connect(
    ({ app, gitlab }: GlobalAppState) => ({
        isApiConfigured: getIsAppConfigured(app.settings) && gitlab.apiIsInaccessible !== true
    }),
    {
        displayError: (message: string) => displayError(
            message,
            undefined,
            {
                caption: getLocalizedText("app.error.openLogsActionTitle"),
                ref: "#!command_open"
            }
        ),
    }
)(ErrorBoundary);
