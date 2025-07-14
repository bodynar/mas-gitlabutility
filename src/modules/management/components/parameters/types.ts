import { Optional } from "@bodynarf/utils";

import { BaseParametersComponentProps } from "@app/models";

/**
 * Action parameters validator function
 * @param values Current parameter values
 * @param extra Extra arguments provided as props to component
 * @returns Validation error if validation fails; otherwise - `null`
 */
export type ValidatorFn<TParameters = object> = (
    values: TParameters,
    extra?: Omit<
        BaseParametersComponentProps<object>,
        | "parameters" | "setCanExecute"
        | "setError" | "setShouldConfirm"
        | "getValidationState" | "onValuesChange"
        | "getShouldDisplayRequiredMark"
    >
) => Optional<string>;

type ValidatorsMap<TParameters = object> = Map<
    keyof TParameters | null,
    Array<ValidatorFn<TParameters>>
>;

/**
 * Validation config for parameters page provider fn
 */
export type ParametersValidationConfigProvider<TParameters = object> = () => ValidatorsMap<TParameters>;

/**
 * Create set of validation rules to satisfy type guard
 * @param entries Validation configuration
 * @returns Set of validation rules
 * @example
 * ```
  * const exampleProvider: ParametersValidationConfigProvider<SomeParameters> = () => createValidationConfig([
 *   [
 *      "name", [
 *          ({ branchName }) => isNullOrEmpty(branchName) ? "Branch name is empty" : null
 *      ]
 *   ]
 * ]);
 * ```
 */
export const createValidationConfig = <TParameters = object>(
    entries: Array<[
        keyof TParameters | null,
        Array<ValidatorFn<TParameters>>
    ]>
): ValidatorsMap<TParameters> => {
    return new Map(entries);
};

