import { FC, useCallback, useEffect, useState } from "react";

import { isNullish, isNullOrEmpty } from "@bodynarf/utils";
import { ValidationStatus } from "@bodynarf/react.components";

import { Actions, BaseParametersComponentProps } from "@app/models";
import { getLocalizedText } from "@app/locale";

import { ValidatorFn } from "../types";

import CheckDiffsParameters, { getValidationConfig as getCheckDiffsValidationRules } from "../components/branch/checkDiffs";
import CreateBranchParameters, { getValidationConfig as getCreateBranchValidationRules } from "../components/branch/create";
import DeleteBranchParameters, { getValidationConfig as getDeleteBranchValidationRules } from "../components/branch/delete";

import CloseMergeRequestParameters, { getValidationConfig as getCloseRequestValidationRules } from "../components/mergeRequest/close";
import MergeRequestParameters, { getValidationConfig as getMergeRequestValidationRules } from "../components/mergeRequest/merge";

import MergeParameters, { getValidationConfig as getMergeValidationRules } from "../components/streamMerge/merge";
import ReleaseParameters, { getValidationConfig as getReleaseValidationRules } from "../components/streamMerge/release";

import CheckNonActualTagsParameters, { getValidationConfig as getCheckNonActualTagsValidationRules } from "../components/tag/checkNonActual";
import MoveTagParameters, { getValidationConfig as getMoveTagValidationRules } from "../components/tag/move";

import "./style.scss";

/** Props of `ParametersConfigurator` */
type ParametersConfiguratorProps = Omit<
    BaseParametersComponentProps<object>,
    "getValidationState" | "onValuesChange" | "getShouldDisplayRequiredMark"
> & {
    /** Selected action */
    action: Actions;

    /** Save new parameters value */
    setParameters: (parameters: object) => void;
};

/**
 * Registered validation configurations for parameters components
 */
const validatorsMap = new Map<
    Actions,
    Map<string, Array<ValidatorFn<object>>>
>([
    [Actions.checkDiffs, getCheckDiffsValidationRules()],
    [Actions.createBranch, getCreateBranchValidationRules()],
    [Actions.deleteBranch, getDeleteBranchValidationRules()],

    [Actions.closeMergeRequest, getCloseRequestValidationRules()],
    [Actions.mergeRequest, getMergeRequestValidationRules()],

    [Actions.merge, getMergeValidationRules()],
    [Actions.release, getReleaseValidationRules()],

    [Actions.checkNonActualTags, getCheckNonActualTagsValidationRules()],
    [Actions.moveTag, getMoveTagValidationRules()],
]);

/** Selected action parameters configurator */
const ParametersConfigurator: FC<ParametersConfiguratorProps> = (props) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let componentFn: FC<BaseParametersComponentProps<any>> = () =>
        <>{getLocalizedText("management.componentNotFound")}</>
        ;

    const [validators] = useState(validatorsMap);
    const [validationStates, setValidationStates] = useState(new Map<string, Array<string>>());

    const getValidationState = useCallback(
        (key: string) => {
            if (!validationStates.has(key)) {
                return { messages: [], status: ValidationStatus.None };
            }

            const validationResult = validationStates.get(key);

            return validationResult.length > 0
                ? { messages: validationResult, status: ValidationStatus.Invalid }
                : { messages: [], status: ValidationStatus.Valid };
        },
        [validationStates]
    );

    const onValuesChange = useCallback(
        (values: Array<{ key: string, value: unknown; }> = []) => {
            if (values.length === 0) {
                return;
            }

            const updatedKeys = values.map(({ key }) => key);

            const updatedParameters = values.reduce((result, { key, value }) => ({
                ...result,
                [key]: value
            }), { ...props.parameters });

            let canExecute = true;
            let actionValidator: Map<string, Array<ValidatorFn<object>>> = null;

            Object.entries(updatedParameters)
                .forEach(([key]) => {
                    if (!validators.has(props.action)) {
                        return;
                    }

                    if (isNullish(actionValidator)) {
                        actionValidator = validators.get(props.action);
                    }

                    if (!actionValidator.has(key)) {
                        return;
                    }

                    const parameterValidators = actionValidator.get(key);

                    if (parameterValidators.length === 0) {
                        return;
                    }

                    const validationResult = parameterValidators.map(
                        validatorFn => validatorFn(
                            updatedParameters,
                            { ...props }
                        )
                    ).filter(x => !isNullOrEmpty(x));

                    if (updatedKeys.includes(key)) {
                        validationStates.set(key, validationResult);
                    }

                    canExecute &&= validationResult.length === 0;
                });

            if (!isNullish(actionValidator)) {
                const wholeParameterObjectValidators = actionValidator.get(null);

                const validationResult = wholeParameterObjectValidators?.map(
                    validatorFn => validatorFn(
                        updatedParameters,
                        { ...props }
                    )
                ).filter(x => !isNullOrEmpty(x)).join("\n");

                if (!isNullOrEmpty(validationResult)) {
                    props.setError(validationResult);
                    canExecute = false;
                } else {
                    props.setError(null);
                }
            }

            props.setCanExecute(canExecute);
            props.setParameters(updatedParameters);
        },
        [props, validationStates, validators]
    );

    const getShouldDisplayRequiredMark = useCallback(
        (key: string) => !validationStates.has(key),
        [validationStates]
    );

    useEffect(() =>
        setValidationStates(new Map<string, Array<string>>()),
        [props.action]
    );

    switch (props.action) {
        case Actions.merge:
            componentFn = (args) => <MergeParameters {...args} />;
            break;

        case Actions.release:
            componentFn = (args) => <ReleaseParameters {...args} />;
            break;

        case Actions.moveTag:
            componentFn = (args) => <MoveTagParameters {...args} />;
            break;

        case Actions.checkDiffs:
            componentFn = (args) => <CheckDiffsParameters {...args} />;
            break;

        case Actions.checkNonActualTags:
            componentFn = (args) => <CheckNonActualTagsParameters {...args} />;
            break;

        case Actions.createBranch:
            componentFn = (args) => <CreateBranchParameters {...args} />;
            break;

        case Actions.deleteBranch:
            componentFn = (args) => <DeleteBranchParameters {...args} />;
            break;

        case Actions.closeMergeRequest:
            componentFn = (args) => <CloseMergeRequestParameters {...args} />;
            break;

        case Actions.mergeRequest:
            componentFn = (args) => <MergeRequestParameters {...args} />;
            break;
    }

    return componentFn({
        ...props,
        getValidationState,
        onValuesChange,
        getShouldDisplayRequiredMark,
    });
};

export default ParametersConfigurator;

