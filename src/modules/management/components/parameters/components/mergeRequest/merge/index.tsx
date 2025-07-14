import { FC, useCallback } from "react";

import { isNullOrEmpty } from "@bodynarf/utils";
import { useMount } from "@bodynarf/react.components";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox";
import Text from "@bodynarf/react.components/components/primitives/text/component";

import { BaseParametersComponentProps, MergeRequestParameters } from "@app/models";
import { getLocalizedText } from "@app/locale";

import { createValidationConfig, ParametersValidationConfigProvider } from "../../..";

/** Props of `MergeRequestParametersConfiguration` */
type MergeRequestParametersConfigurationProps = BaseParametersComponentProps<MergeRequestParameters>;

/** MergeRequest parameters configuration */
const MergeRequestParametersConfiguration: FC<MergeRequestParametersConfigurationProps> = ({
    parameters,
    setCanExecute,
    onValuesChange, getValidationState, getShouldDisplayRequiredMark,
}) => {
    const onNameChange = useCallback(
        (requestName?: string) => onValuesChange([{ key: "requestName", value: requestName }]),
        [onValuesChange]
    );

    const onSetTagChange = useCallback(
        (value: boolean) => onValuesChange([{ key: "removeBranch", value }]),
        [onValuesChange]
    );

    useMount(() => {
        if (isNullOrEmpty(parameters?.requestName)) {
            return;
        }

        setCanExecute(true);
    });

    return (
        <section role="parameters">
            <div className="columns">
                <div className="column">
                    <Text
                        onValueChange={onNameChange}
                        defaultValue={parameters?.requestName}
                        validationState={getValidationState("requestName")}
                        label={{
                            caption: getLocalizedText("parameters.requestName"),
                            horizontal: true,
                            className: getShouldDisplayRequiredMark("requestName") ? "is-required-visible" : null,
                            title: getShouldDisplayRequiredMark("requestName") ? getLocalizedText("management.parameters.parameterIsNotSet") : null,
                        }}
                    />
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <CheckBox
                        isFormLabel
                        onValueChange={onSetTagChange}
                        defaultValue={parameters?.removeBranch ?? false}
                        label={{ caption: getLocalizedText("parameters.mergeRequest.deleteBranchAfter"), horizontal: true }}
                    />
                </div>
            </div>
        </section>
    );
};

export default MergeRequestParametersConfiguration;

/**
 * Get current component parameters validation config provider fn
 * @returns Validator config provider fn
 */
export const getValidationConfig: ParametersValidationConfigProvider<MergeRequestParameters> = () => createValidationConfig([
    [
        "requestName", [
            ({ requestName }) => isNullOrEmpty(requestName)
                ? getLocalizedText("management.parameters.mergeRequest.requestNameCannotBeEmpty")
                : null,
        ]
    ]
]);
