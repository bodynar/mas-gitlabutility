import { isNullOrEmpty, isNullOrUndefined } from "@bodynarf/utils";
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

/** Configuration for transition app into loading state */
type LoadingStateConfigParams = {
    /** Loading state message */
    message: string;

    /** Cancel operation button configuration */
    cancelButtonConfig?: CancelOperationButtonConfig;
};

/** Application loading state configuration */
export class LoadingStateConfig {
    /** Loading state message */
    public message: string;

    /** Cancel operation button configuration */
    public buttonConfig?: Pick<ButtonProps, "caption" | "onClick" | "icon">;

    /** Protected constructor for access manage */
    private constructor(params: LoadingStateConfigParams) {
        this.message = params?.message ?? "";

        if (!isNullOrUndefined(params?.cancelButtonConfig)) {
            this.buttonConfig = {
                caption: params.cancelButtonConfig.caption,
                onClick: params.cancelButtonConfig.clickHandler,
                icon: params.cancelButtonConfig.icon,
            };
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
    ): LoadingStateConfig {
        if (isNullOrEmpty(content?.caption) && isNullOrUndefined(content?.icon)) {
            throw new TypeError(`Cannot use these parameters for cancel button: icon or caption should be provided`);
        }

        return new LoadingStateConfig({
            message,
            cancelButtonConfig: {
                caption: content?.caption,
                icon: content?.icon,
                clickHandler,
            }
        });
    }
}
