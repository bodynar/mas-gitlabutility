import { FC, useCallback } from "react";

import { isNullOrEmpty } from "@bodynarf/utils";
import { SelectableItem, useMount } from "@bodynarf/react.components";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox/component";
import Dropdown from "@bodynarf/react.components/components/dropdown";
import Text from "@bodynarf/react.components/components/primitives/text";

import { BaseParametersComponentProps, MoveTagParameters } from "@app/models";
import { getLocalizedText } from "@app/locale";

import { createValidationConfig, ParametersValidationConfigProvider } from "../../..";

/** Props of `MoveTagParametersConfiguration` */
type MoveTagParametersConfigurationProps = BaseParametersComponentProps<MoveTagParameters>;

/** Move release tag further on branch parameters configuration component */
const MoveTagParametersConfiguration: FC<MoveTagParametersConfigurationProps> = ({
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

    const onCreateIfNotExistChange = useCallback(
        (value: boolean) => onValuesChange([{ key: "createIfNotExist", value: value ?? false, }]),
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

            <CheckBox
                isFormLabel
                onValueChange={onCreateIfNotExistChange}
                defaultValue={parameters?.createIfNotExist ?? false}
                label={{ caption: getLocalizedText("parameters.tag.move.createTagIfNotExist"), horizontal: true }}
            />
        </section>
    );
};

export default MoveTagParametersConfiguration;

/**
 * Get current component parameters validation config provider fn
 * @returns Validator config provider fn
 */
export const getValidationConfig: ParametersValidationConfigProvider<MoveTagParameters> = () => createValidationConfig([
    [
        "name", [
            ({ name }) => isNullOrEmpty(name)
                ? getLocalizedText("management.parameters.tag.nameIsEmpty")
                : null,
        ]
    ],
]);
