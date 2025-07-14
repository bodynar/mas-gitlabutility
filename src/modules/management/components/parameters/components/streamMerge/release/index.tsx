import { FC, useCallback, useMemo, useState } from "react";

import { isNullOrEmpty } from "@bodynarf/utils";
import { SelectableItem, useMount } from "@bodynarf/react.components";
import Button from "@bodynarf/react.components/components/button/component";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox/component";
import Dropdown from "@bodynarf/react.components/components/dropdown";
import Text from "@bodynarf/react.components/components/primitives/text";

import { BaseParametersComponentProps, DefaultBranch, ReleaseParameters } from "@app/models";
import { getLocalizedText } from "@app/locale";

import { createValidationConfig, ParametersValidationConfigProvider } from "../../..";

/** Props of `ReleaseParametersConfiguration` */
type ReleaseParametersConfigurationProps = BaseParametersComponentProps<ReleaseParameters>;

/** Release action parameters component */
const ReleaseParametersConfiguration: FC<ReleaseParametersConfigurationProps> = ({
    branches,
    parameters,
    setCanExecute,
    getValidationState, onValuesChange, getShouldDisplayRequiredMark
}) => {
    const testBranches = useMemo(
        () => branches.filter(
            ({ id }) => id !== DefaultBranch.Develop && id !== (DefaultBranch.Master as string)
        ),
        [branches]
    );
    const productionBranches = useMemo(
        () => branches.filter(
            ({ id }) => id !== DefaultBranch.Develop && id !== (DefaultBranch.Test as string)
        ),
        [branches]
    );

    const [isManualName, setIsManualName] = useState(isNullOrEmpty(parameters?.template));
    const [manualRerenderCount, manualRerender] = useState(0);

    const selectedFrom = testBranches.find(({ value }) => parameters?.testBranch === value);
    const selectedTo = productionBranches.find(({ value }) => parameters?.productionBranch === value);

    const onVersionChange = useCallback(
        (value?: string) => {
            const formattedName = isManualName
                ? parameters.mergeRequestName
                : parameters.template.format(value);

            onValuesChange([
                { key: "version", value: value },
                { key: "mergeRequestName", value: formattedName }
            ]);

            manualRerender(x => ++x);
        }, [isManualName, onValuesChange, parameters.mergeRequestName, parameters.template]);

    const onSetTagChange = useCallback(
        (value: boolean) => onValuesChange([{ key: "setVersionTagAfter", value: value }]), [onValuesChange]
    );

    const onMrNameChange = useCallback(
        (name?: string) => {
            setIsManualName(true);

            onValuesChange([{ key: "mergeRequestName", value: name }]);
        }, [onValuesChange]
    );

    const onFromBranchSelected = useCallback(
        (value?: SelectableItem) => onValuesChange([{ key: "testBranch", value: value?.value }]),
        [onValuesChange]
    );

    const onToBranchSelected = useCallback(
        (value?: SelectableItem) => onValuesChange([{ key: "productionBranch", value: value?.value }]),
        [onValuesChange]
    );

    const onUseTemplateClick = useCallback(() => {
        onValuesChange([{ key: "mergeRequestName", value: parameters.template.format(parameters.version) }]);
        manualRerender(x => ++x);
        setIsManualName(false);
    }, [onValuesChange, parameters.template, parameters.version]);

    useMount(() => {
        if (parameters?.testBranch === parameters?.productionBranch
            || parameters?.version.trimEnd() === parameters?.tagVersionTemplate
            || isNullOrEmpty(parameters.mergeRequestName)
            || isNullOrEmpty(parameters?.version)
        ) {
            return;
        }

        setCanExecute(true);
    });

    return (
        <section role="parameters">
            <Dropdown
                hideOnOuterClick
                value={selectedFrom}
                items={testBranches}
                onSelect={onFromBranchSelected}
                title={getLocalizedText("management.parameters.streamMerge.release.branchWithTestedCode")}
                placeholder={getLocalizedText("management.parameters.streamMerge.release.branchWithTestedCode")}
                label={{ caption: getLocalizedText("parameters.streamMerge.release.testBranch"), horizontal: true, }}
            />
            <Dropdown
                hideOnOuterClick
                value={selectedTo}
                items={productionBranches}
                onSelect={onToBranchSelected}
                title={getLocalizedText("management.parameters.streamMerge.release.branchWithProductiveCode")}
                placeholder={getLocalizedText("management.parameters.streamMerge.release.branchWithProductiveCode")}
                label={{ caption: getLocalizedText("parameters.streamMerge.release.productiveBranch"), horizontal: true, }}
            />
            <Text
                onValueChange={onVersionChange}
                defaultValue={parameters?.version}
                validationState={getValidationState("version")}
                label={{
                    caption: getLocalizedText("parameters.streamMerge.release.version"),
                    horizontal: true,
                    className: getShouldDisplayRequiredMark("version") ? "is-required-visible" : null,
                    title: getShouldDisplayRequiredMark("version") ? getLocalizedText("management.parameters.parameterIsNotSet") : null,
                }}
            />

            <CheckBox
                isFormLabel
                onValueChange={onSetTagChange}
                defaultValue={parameters?.setVersionTagAfter ?? true}
                label={{ caption: getLocalizedText("parameters.streamMerge.release.setVersionTagOnMergeCommit"), horizontal: true }}
            />
            <Text
                key={manualRerenderCount}
                onValueChange={onMrNameChange}
                defaultValue={parameters?.mergeRequestName}
                validationState={getValidationState("mergeRequestName")}
                label={{ caption: getLocalizedText("parameters.requestName"), horizontal: true, }}
                hint={isManualName ? undefined : {
                    italic: true,
                    grey: true,
                    content: getLocalizedText("management.parameters.streamMerge.templateWouldNotBeApplied"),
                }}
            />
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
        </section>
    );
};

export default ReleaseParametersConfiguration;

/**
 * Get current component parameters validation config provider fn
 * @returns Validator config provider fn
 */
export const getValidationConfig: ParametersValidationConfigProvider<ReleaseParameters> = () =>
    createValidationConfig<ReleaseParameters>([
        [
            "mergeRequestName", [
                ({ mergeRequestName }) => isNullOrEmpty(mergeRequestName)
                    ? getLocalizedText("management.parameters.streamMerge.release.requestNameIsNotSet")
                    : null,
            ]
        ],
        [
            "version", [
                ({ version }) => isNullOrEmpty(version)
                    ? getLocalizedText("management.parameters.streamMerge.release.versionCannotBeEmpty")
                    : null,

                ({ version, tagVersionTemplate }) => version.trimEnd() === tagVersionTemplate
                    ? getLocalizedText("management.parameters.streamMerge.release.versionNumberIsNotSet")
                    : null,
            ]
        ],
        [
            null, [
                ({ testBranch, productionBranch }) => testBranch === productionBranch
                    ? getLocalizedText("management.parameters.sourceBranchSameAsTarget")
                    : null,
            ]
        ]
    ]);
