import { FC, useCallback } from "react";

import { isNullOrUndefined } from "@bodynarf/utils";
import { useMount } from "@bodynarf/react.components";
import Button from "@bodynarf/react.components/components/button/component";
import Dropdown, { SelectableItem } from "@bodynarf/react.components/components/dropdown";

import { BaseParametersComponentProps, CheckDiffsParameters } from "@app/models";
import { getLocalizedText } from "@app/locale";
import { createValidationConfig, ParametersValidationConfigProvider } from "../../..";

/** Props of `CheckDiffsParametersConfiguration` */
type CheckDiffsParametersConfigurationProps = BaseParametersComponentProps<CheckDiffsParameters>;

/** Check diffs parameters configuration component */
const CheckDiffsParametersConfiguration: FC<CheckDiffsParametersConfigurationProps> = ({
    branches,
    parameters, onValuesChange,
    setCanExecute,
}) => {
    const selectedFrom = branches.find(({ value }) => parameters?.source === value);
    const selectedTo = branches.find(({ value }) => parameters?.target === value);

    const onFromBranchSelected = useCallback(
        (value?: SelectableItem) => onValuesChange([{ key: "source", value: value?.value }]),
        [onValuesChange]
    );

    const onToBranchSelected = useCallback(
        (value?: SelectableItem) => onValuesChange([{ key: "target", value: value?.value }]),
        [onValuesChange]
    );

    const onSwitchBranchClick = useCallback(
        () => onValuesChange([
            { key: "source", value: parameters.target },
            { key: "target", value: parameters.source }
        ]),
        [onValuesChange, parameters.source, parameters.target]
    );

    useMount(() => {
        if (parameters.source === parameters.target) {
            return;
        }

        setCanExecute(true);
    });

    return (
        <section role="parameters">
            <div className="columns">
                <div className="column">
                    <Dropdown
                        items={branches}
                        hideOnOuterClick
                        value={selectedFrom}
                        onSelect={onFromBranchSelected}
                        placeholder={getLocalizedText("parameters.from")}
                        label={{ caption: getLocalizedText("parameters.from"), horizontal: false, }}
                    />
                </div>
                <div
                    id="switchBranchesContainer"
                    className="column is-1 is-flex is-align-items-flex-end is-justify-content-center"
                >
                    <Button
                        type="white"
                        icon={{ name: "arrow-down-up" }}
                        onClick={onSwitchBranchClick}
                        title={getLocalizedText("management.parameters.switchBranches")}
                        disabled={isNullOrUndefined(selectedFrom) || isNullOrUndefined(selectedTo)}
                    />
                </div>
                <div className="column">
                    <Dropdown
                        items={branches}
                        hideOnOuterClick
                        value={selectedTo}
                        onSelect={onToBranchSelected}
                        placeholder={getLocalizedText("parameters.to")}
                        label={{ caption: getLocalizedText("parameters.to"), horizontal: false, }}
                    />
                </div>
            </div>
        </section>
    );
};

export default CheckDiffsParametersConfiguration;

/**
 * Get current component parameters validation config provider fn
 * @returns Validator config provider fn
 */
export const getValidationConfig: ParametersValidationConfigProvider<CheckDiffsParameters> = () =>
    createValidationConfig<CheckDiffsParameters>([
        [
            null, [
                ({ source, target }) => source === target
                    ? getLocalizedText("management.parameters.sourceBranchSameAsTarget")
                    : null,
            ]
        ],
        [
            null, [
                ({ source, target }) => source === target
                    ? getLocalizedText("management.parameters.sourceBranchSameAsTarget")
                    : null,
            ]
        ]
    ]);

