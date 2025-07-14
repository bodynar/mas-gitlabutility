import { FC, useCallback } from "react";

import { isNullOrEmpty } from "@bodynarf/utils";
import { useMount } from "@bodynarf/react.components";
import Dropdown, { SelectableItem } from "@bodynarf/react.components/components/dropdown";
import Text from "@bodynarf/react.components/components/primitives/text/component";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox";

import { BaseParametersComponentProps, CreateBranchParameters } from "@app/models";
import { getLocalizedText } from "@app/locale";

import { createValidationConfig, ParametersValidationConfigProvider } from "../../..";

/** Props of `CreateBranchParametersConfiguration` */
type CreateBranchParametersConfigurationProps = BaseParametersComponentProps<CreateBranchParameters>;

/** CreateBranch parameters configuration */
const CreateBranchParametersConfiguration: FC<CreateBranchParametersConfigurationProps> = ({
    branches,
    parameters,
    setCanExecute,
    onValuesChange, getValidationState, getShouldDisplayRequiredMark,
}) => {
    const selectedFrom = branches.find(({ value }) => parameters?.source === value);

    const onSourceBranchSelected = useCallback(
        (value?: SelectableItem) => onValuesChange([{ key: "source", value: value?.value, }]),
        [onValuesChange]
    );

    const onNameChange = useCallback(
        (branchName?: string) => onValuesChange([{ key: "branchName", value: branchName, }]),
        [onValuesChange]
    );

    const onSaveAsAdditionalBranchChange = useCallback(
        (value: boolean) => onValuesChange([{ key: "saveAsAdditionalBranch", value }]),
        [onValuesChange]
    );

    useMount(() => {
        if (parameters.source === parameters.branchName
            || isNullOrEmpty(parameters.branchName)
        ) {
            return;
        }

        setCanExecute(true);
    });

    return (
        <section role="parameters">
            <Dropdown
                hideOnOuterClick
                items={branches}
                value={selectedFrom}
                onSelect={onSourceBranchSelected}
                placeholder={getLocalizedText("parameters.from")}
                label={{ caption: getLocalizedText("parameters.from"), horizontal: true, }}
            />
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
                onValueChange={onSaveAsAdditionalBranchChange}
                defaultValue={parameters?.saveAsAdditionalBranch ?? false}
                label={{ caption: getLocalizedText("parameters.branch.create.saveBranchAsAdditionalBranch"), horizontal: true }}
            />
        </section>
    );
};

export default CreateBranchParametersConfiguration;

/**
 * Get current component parameters validation config provider fn
 * @returns Validator config provider fn
 */
export const getValidationConfig: ParametersValidationConfigProvider<CreateBranchParameters> = () => createValidationConfig([
    [
        "branchName", [
            ({ branchName }) => isNullOrEmpty(branchName)
                ? getLocalizedText("management.parameters.branchNameCannotBeEmpty")
                : null
        ]
    ],
    [
        null, [
            ({ source, branchName }) => source.toLowerCase().trim() === branchName?.toLowerCase().trim()
                ? getLocalizedText("management.parameters.branch.create.sourceBranchNameSameAsTarget")
                : null,
            ({ branchName, saveAsAdditionalBranch }, { branches }) => saveAsAdditionalBranch
                && branches.map(({ value }) => value.toLocaleLowerCase()).includes(branchName?.toLocaleLowerCase())
                ? getLocalizedText("management.parameters.branch.create.branchIsAlreadyPresentedInExtraBranchListTemplate").format(branchName)
                : null
        ]
    ]
]);
