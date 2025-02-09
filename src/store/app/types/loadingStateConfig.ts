import { isNullOrEmpty, isNullish } from "@bodynarf/utils";
import { ButtonProps, ElementIcon } from "@bodynarf/react.components";

/** Cancel button configuration */
export type CancelOperationButtonConfig = {
    /** Caption */
    caption?: string;

    /** Button icon */
    icon?: ElementIcon;

    /** Click handler */
    clickHandler: () => void;
};

/** Configuration for loading\processing bar */
export type ProcessStateLoadingMessageConfig = {
    /** Current state */
    state: number;

    /** Max state value */
    maxState: number;

    /** Explanation message */
    message?: string;
};

/** Configuration for transition app into loading state */
type LoadingStateConfigParams = {
    /** Loading state message */
    message: string;

    /** Cancel operation button configuration */
    cancelButtonConfig?: CancelOperationButtonConfig;

    /** Process state config */
    processState?: ProcessStateLoadingMessageConfig;
};

/** Application loading state configuration */
export class LoadingStateConfig {
    /** Loading state message */
    public message: string;

    /** Cancel operation button configuration */
    public buttonConfig?: Pick<ButtonProps, "caption" | "onClick" | "icon">;

    /** Process state config */
    public processState?: ProcessStateLoadingMessageConfig;

    /** Protected constructor for access manage */
    private constructor(params: LoadingStateConfigParams) {
        this.message = params?.message ?? "";

        if (!isNullish(params?.cancelButtonConfig)) {
            this.buttonConfig = {
                caption: params.cancelButtonConfig.caption,
                onClick: params.cancelButtonConfig.clickHandler,
                icon: params.cancelButtonConfig.icon,
            };
        }

        if (!isNullish(params?.processState)) {
            this.processState = params.processState;
        }
    }

    /**
     * Construct a `LoadingStateConfig` for simple transition into loading state
     * @param message Loading state message
     * @returns Instance of @see LoadingStateConfig
     */
    public static basic(message?: string): LoadingStateConfig {
        return new LoadingStateConfig(
            isNullOrEmpty(message) ? null : { message }
        );
    }

    /**
     * Construct a `LoadingStateConfig` for transition into loading state with option to cancel operation
     * @param message Loading state message
     * @param clickHandler Cancel button click handler
     * @param caption Cancel button caption
     * @param icon Cancel button icon
     * @returns Instance of @see LoadingStateConfig
     * @throws {TypeError} Caption or icon must be provided
     */
    public static withCancel(
        message: string,
        clickHandler: () => void,
        content: { caption?: string, icon?: ElementIcon, },
        processState?: ProcessStateLoadingMessageConfig
    ): LoadingStateConfig {
        if (isNullOrEmpty(content?.caption) && isNullish(content?.icon)) {
            throw new TypeError(`Cannot use these parameters for cancel button: icon or caption should be provided`);
        }

        const config = new LoadingStateConfig({
            message,
            cancelButtonConfig: {
                caption: content?.caption,
                icon: content?.icon,
                clickHandler,
            },
            processState,
        });

        return config;
    }
}
