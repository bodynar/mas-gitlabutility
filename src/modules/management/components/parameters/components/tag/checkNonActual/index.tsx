import { FC, useCallback } from "react";

import { isNullOrEmpty } from "@bodynarf/utils";
import { SelectableItem, useMount } from "@bodynarf/react.components";
import Dropdown from "@bodynarf/react.components/components/dropdown";
import Text from "@bodynarf/react.components/components/primitives/text";

import { BaseParametersComponentProps, CheckNonActualTagsParameters } from "@app/models";
import { getLocalizedText } from "@app/locale";

import { createValidationConfig, ParametersValidationConfigProvider } from "../../..";

/** Props of `CheckNonActualTagsParametersConfiguration` */
type CheckNonActualTagsParametersConfigurationProps = BaseParametersComponentProps<CheckNonActualTagsParameters>;

/** Check tags not on a latest commit on branch parameters configuration component */
const CheckNonActualTagsParametersConfiguration: FC<CheckNonActualTagsParametersConfigurationProps> = ({
    branches,
    parameters,
    setCanExecute,
    getValidationState, onValuesChange,
}) => {
    const selectedBranch = branches.find(({ value }) => parameters?.branch === value);
    const onNameChange = useCallback(
        (value?: string) => onValuesChange([{ key: "name", value: value }]),
        [onValuesChange]
    );

    const onBranchSelected = useCallback(
        (value?: SelectableItem) => onValuesChange([{ key: "branch", value: value.value, }]),
        [onValuesChange]
    );

    useMount(() => {
        if (isNullOrEmpty(parameters?.name)) {
            return;
        }

        setCanExecute(true);
    });

    return (
        <section role="parameters">
            <Dropdown
                hideOnOuterClick
                items={branches}
                value={selectedBranch}
                onSelect={onBranchSelected}
                placeholder={getLocalizedText("parameters.tag.branch")}
                label={{ caption: getLocalizedText("parameters.tag.branch"), horizontal: true, }}
            />

            <Text
                onValueChange={onNameChange}
                defaultValue={parameters?.name}
                validationState={getValidationState("name")}
                label={{ caption: getLocalizedText("parameters.tag.tagName"), horizontal: true, }}
            />
        </section>
    );
};

export default CheckNonActualTagsParametersConfiguration;

/**
 * Get current component parameters validation config provider fn
 * @returns Validator config provider fn
 */
export const getValidationConfig: ParametersValidationConfigProvider<CheckNonActualTagsParameters> = () => createValidationConfig([
    [
        "name", [
            ({ name }) => isNullOrEmpty(name)
                ? getLocalizedText("management.parameters.tag.nameIsEmpty")
                : null,
        ]
    ],
]);
