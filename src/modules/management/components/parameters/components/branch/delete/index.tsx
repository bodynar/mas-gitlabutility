import { FC, useCallback } from "react";

import { isNullOrEmpty } from "@bodynarf/utils";
import { useMount } from "@bodynarf/react.components";
import Text from "@bodynarf/react.components/components/primitives/text/component";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox";

import { BaseParametersComponentProps, DEFAULT_BRANCHES, DeleteBranchParameters } from "@app/models";
import { getLocalizedText } from "@app/locale";

import { createValidationConfig, ParametersValidationConfigProvider } from "../../..";

/** Props of `DeleteBranchParametersConfiguration` */
type DeleteBranchParametersConfigurationProps = BaseParametersComponentProps<DeleteBranchParameters>;

/** DeleteBranch parameters configuration */
const DeleteBranchParametersConfiguration: FC<DeleteBranchParametersConfigurationProps> = ({
    parameters,
    setCanExecute,
    getValidationState, onValuesChange, getShouldDisplayRequiredMark,
}) => {
    const onNameChange = useCallback(
        (branchName?: string) => onValuesChange([{ key: "branchName", value: branchName }]),
        [onValuesChange]
    );

    const onDeleteBranchFromAdditionalBranchesChange = useCallback(
        (value: boolean) => onValuesChange([{ key: "deleteBranchFromAdditionalBranches", value }]),
        [onValuesChange]
    );

    useMount(() => {
        if (isNullOrEmpty(parameters?.branchName)
            || DEFAULT_BRANCHES.includes(parameters?.branchName?.toLowerCase())) {
            return;
        }

        setCanExecute(true);
    });

    return (
        <section role="parameters">
            <Text
                onValueChange={onNameChange}
                defaultValue={parameters?.branchName}
                validationState={getValidationState("branchName")}
                label={{
                    caption: getLocalizedText("parameters.branch.branchName"),
                    horizontal: true,
                    className: getShouldDisplayRequiredMark("branchName") ? "is-required-visible" : null,
                    title: getShouldDisplayRequiredMark("branchName") ? getLocalizedText("management.parameters.parameterIsNotSet") : null,
                }}
            />
            <CheckBox
                isFormLabel
                onValueChange={onDeleteBranchFromAdditionalBranchesChange}
                defaultValue={parameters?.deleteBranchFromAdditionalBranches ?? false}
                label={{ caption: getLocalizedText("parameters.branch.delete.deleteBranchFromAdditionalBranches"), horizontal: true }}
            />
        </section>
    );
};

export default DeleteBranchParametersConfiguration;

/**
 * Get current component parameters validation config provider fn
 * @returns Validator config provider fn
 */
export const getValidationConfig: ParametersValidationConfigProvider<DeleteBranchParameters> = () => createValidationConfig([
    [
        "branchName", [
            ({ branchName }) => isNullOrEmpty(branchName)
                ? getLocalizedText("management.parameters.branchNameCannotBeEmpty")
                : null,
            ({ branchName }) => DEFAULT_BRANCHES.includes(branchName?.toLowerCase())
                ? getLocalizedText("management.parameters.branch.delete.defaultBranchCannotBeDeleted")
                : null,
        ]
    ],
    [
        null, [
            ({ branchName, deleteBranchFromAdditionalBranches }, { branches }) => deleteBranchFromAdditionalBranches
                ? !branches.map(({ value }) => value.toLocaleLowerCase()).includes(branchName.toLocaleLowerCase())
                    ? getLocalizedText("management.parameters.branch.delete.branchIsNotPresentedInExtraBranchListTemplate").format(branchName)
                    : null
                : null
        ]
    ]
]);
