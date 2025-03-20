import { SelectableItem } from "@bodynarf/react.components";

/**
 * Base type for parameters view components
 */
export interface BaseParametersComponentProps<TParameter> {
    /** Current parameters value */
    parameters: TParameter;

    /** Branches for dropdown */
    branches: Array<SelectableItem>;

    /** Save new parameters value */
    setParameters: (parameters: TParameter) => void;

    /** Update availability of execute button */
    setCanExecute: (canExecute: boolean) => void;

    /**
     * Set parameters error
     * @description Function must be used to signalize a user that current parameters is not valid by any rule and shortly explain that validation error
     * @example setError("From branch cannot be same as target branch")
     * @param error Error message to display
     */
    setError: (error: string) => void;

    /**
     * Set the need for additional confirmation
     * @param shouldConfirm Should require additional confirmation
     */
    setShouldConfirm?: (shouldConfirm: boolean) => void;
}
