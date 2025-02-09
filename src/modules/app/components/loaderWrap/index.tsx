import { FC, ReactNode } from "react";

import { isNullOrEmpty, isNullOrUndefined } from "@bodynarf/utils";
import Button from "@bodynarf/react.components/components/button/component";
import { ButtonProps } from "@bodynarf/react.components";

import { ProcessStateLoadingMessageConfig } from "@app/store/app";

import "./style.scss";

/** Loader wrapper props */
type LoaderWrapProps = {
    /** Is app currently in loading mode */
    loading: boolean;

    /** Loading state message */
    message?: string;

    /** State of process loader */
    processState?: ProcessStateLoadingMessageConfig;

    /** Cancel operation button configuration */
    cancelOptions?: Pick<ButtonProps, "caption" | "onClick" | "icon">;

    /** Wrapped contentА */
    children: ReactNode;
};

/** Content loader wrapper */
const LoaderWrap: FC<LoaderWrapProps> = ({
    loading, message, cancelOptions,
    children, processState,
}) => {
    return (
        <div className="app-loading-cover">
            {loading &&
                <div className="app-loading-cover__image">
                    <div className="loader-wrapper">
                        <progress
                            className="progress"
                            max={processState?.maxState ?? 100}
                            value={processState?.state ?? undefined}
                        >{processState?.state ?? undefined}</progress>
                    </div>
                    <ExtraLoadingContent
                        message={message}
                        extra={processState?.message}
                        cancelOptions={cancelOptions}
                    />
                </div>
            }
            <div
                className="app-loading-cover__content"
                data-disabled={loading}
            >
                {children}
            </div>
        </div>
    );
};

export default LoaderWrap;

/** Loading state block extra information */
const ExtraLoadingContent: FC<
    Pick<LoaderWrapProps, "message" | "cancelOptions">
    & { extra?: string; }
> = ({
    message, cancelOptions,
    extra
}) => {
        if (isNullOrEmpty(message) && isNullOrUndefined(cancelOptions)) {
            return (<></>);
        }

        return (
            <div className="is-flex is-align-items-center is-flex-direction-column">
                <p>
                    {message}
                </p>
                {!isNullOrEmpty(extra) &&
                    <p className="is-italic">
                        {extra}
                    </p>
                }
                {!isNullOrUndefined(cancelOptions) &&
                    <Button
                        outlined
                        type="danger"
                        className="mt-2"
                        icon={cancelOptions.icon}
                        caption={cancelOptions.caption}
                        onClick={cancelOptions.onClick}
                    />
                }
            </div>
        );
    };
