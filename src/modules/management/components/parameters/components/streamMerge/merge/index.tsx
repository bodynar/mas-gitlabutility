import { FC, useCallback, useState } from "react";

import { isNullOrEmpty, isNullOrUndefined } from "@bodynarf/utils";
import { useMount } from "@bodynarf/react.components";
import Button from "@bodynarf/react.components/components/button/component";
import Dropdown, { SelectableItem } from "@bodynarf/react.components/components/dropdown";
import Text from "@bodynarf/react.components/components/primitives/text/component";
import Icon from "@bodynarf/react.components/components/icon/component";

import { Actions, BaseParametersComponentProps, DEFAULT_BRANCHES, DefaultBranch, MergeParameters } from "@app/models";
import { getLocalizedText } from "@app/locale";

import { createValidationConfig, ParametersValidationConfigProvider } from "../../..";
import { getActionDescription } from "@app/core/gitlab/actions";

/** Props of `MergeParametersConfiguration` */
type MergeParametersConfigurationProps = BaseParametersComponentProps<MergeParameters>;

/** Merge parameters configuration */
const MergeParametersConfiguration: FC<MergeParametersConfigurationProps> = ({
    branches,
    parameters,
    setCanExecute, setShouldConfirm,
    getValidationState, onValuesChange,
}) => {
    const selectedFrom = branches.find(({ value }) => parameters?.sourceBranch === value);
    const selectedTo = branches.find(({ value }) => parameters?.targetBranch === value);

    const [isManualName, setIsManualName] = useState(isNullOrEmpty(parameters?.template));
    const [manualRerenderCount, manualRerender] = useState(0);
    const [isHintVisible, setHintVisibility] = useState(false);

    const updateParametersValues = useCallback(
        (source?: string, target?: string) => {
            const shouldConfirm = checkShouldConfirm(source, target);

            const formattedName = isManualName
                ? parameters.name
                : parameters.template.format(source, target);

            setShouldConfirm(shouldConfirm);
            onValuesChange([
                { key: "name", value: formattedName },
                { key: "sourceBranch", value: source },
                { key: "targetBranch", value: target }
            ]);

            manualRerender(x => ++x);
            setHintVisibility(target === DefaultBranch.Master);
        },
        [isManualName, parameters, onValuesChange, setShouldConfirm]
    );

    const onFromBranchSelected = useCallback(
        (value?: SelectableItem) => {
            updateParametersValues(
                value?.value,
                parameters.targetBranch,
            );
        }, [parameters, updateParametersValues]
    );

    const onToBranchSelected = useCallback(
        (value?: SelectableItem) => {
            updateParametersValues(
                parameters.sourceBranch,
                value?.value,
            );
        },
        [parameters.sourceBranch, updateParametersValues]
    );

    const onSwitchBranchClick = useCallback(
        () => {
            updateParametersValues(
                parameters.targetBranch,
                parameters.sourceBranch,
            );
        }, [parameters.sourceBranch, parameters.targetBranch, updateParametersValues]);

    const onMrNameChange = useCallback(
        (name?: string) => {
            setIsManualName(true);
            onValuesChange([{ key: "name", value: name }]);
        }, [onValuesChange]
    );

    const onUseTemplateClick = useCallback(() => {
        onValuesChange([{ key: "name", value: parameters.template.format(parameters.sourceBranch, parameters.targetBranch) }]);
        manualRerender(x => ++x);
        setIsManualName(false);
    }, [parameters, onValuesChange]);

    useMount(() => {
        if (isNullOrEmpty(parameters?.name) || parameters.sourceBranch === parameters.targetBranch) {
            return;
        }

        setCanExecute(true);
    });

    return (
        <section role="parameters">
            <div className="columns">
                <div className="column">
                    <Text
                        key={manualRerenderCount}
                        onValueChange={onMrNameChange}
                        defaultValue={parameters?.name}
                        validationState={getValidationState("name")}
                        label={{ caption: getLocalizedText("parameters.requestName"), horizontal: false, }}
                        hint={isManualName ? undefined : {
                            grey: true,
                            italic: true,
                            content: getLocalizedText("management.parameters.streamMerge.templateWouldNotBeApplied"),
                        }}
                    />
                </div>
            </div>
            {isManualName &&
                <div className="columns">
                    <div className="column">
                        <Button
                            type="white"
                            onClick={onUseTemplateClick}
                            caption={getLocalizedText("management.parameters.streamMerge.useTemplate")}
                        />
                    </div>
                </div>
            }
            <div className="columns">
                <div className="column">
                    <Dropdown
                        hideOnOuterClick
                        items={branches}
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
                        onClick={onSwitchBranchClick}
                        icon={{ name: "arrow-down-up" }}
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
            {isHintVisible &&
                <div className="columns">
                    <p className="column has-text-right is-italic">
                        <Icon name="question-circle" /> {getLocalizedText("management.parameters.streamMerge.merge.releaseNoteTemplate").format(getActionDescription(Actions.release))}
                    </p>
                </div>
            }
        </section>
    );
};

export default MergeParametersConfiguration;

/**
 * Get current component parameters validation config provider fn
 * @returns Validator config provider fn
 */
export const getValidationConfig: ParametersValidationConfigProvider<MergeParameters> = () => createValidationConfig<MergeParameters>([
    [

        "name", [
            ({ name }) => isNullOrEmpty(name)
                ? getLocalizedText("management.parameters.streamMerge.merge.nameMustBeSet")
                : null,
        ]
    ],
    [
        null, [
            ({ sourceBranch, targetBranch }) => sourceBranch === targetBranch
                ? getLocalizedText("management.parameters.sourceBranchSameAsTarget")
                : null,
        ]
    ]
]);

/**
 * Check need extra confirmation for merge action
 * @param source Source branch (where take changes)
 * @param target Target branch (where put changes)
 * @returns `true` if extra confirm is required; otherwise - `false`
 */
const checkShouldConfirm = (
    source?: string,
    target?: string,
): boolean => {
    if (isNullOrUndefined(source) || isNullOrUndefined(target)) {
        return false;
    }

    if (!DEFAULT_BRANCHES.includes(source) || !DEFAULT_BRANCHES.includes(target)) {
        return true;
    }

    const sourceBranchIndex = DEFAULT_BRANCHES.indexOf(source as DefaultBranch);
    const targetBranchIndex = DEFAULT_BRANCHES.indexOf(target as DefaultBranch);

    const diff = Math.abs(targetBranchIndex - sourceBranchIndex);

    return diff > 1 || sourceBranchIndex < targetBranchIndex;
};
