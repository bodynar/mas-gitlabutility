import { FC, useCallback, useEffect, useState } from "react";

import { isNullOrEmpty, isNullOrUndefined } from "@bodynarf/utils";
import Button from "@bodynarf/react.components/components/button/component";
import Dropdown, { SelectableItem } from "@bodynarf/react.components/components/dropdown";
import Text from "@bodynarf/react.components/components/primitives/text/component";
import Icon from "@bodynarf/react.components/components/icon/component";

import { Actions, actionToDescriptionMap, BaseParametersComponentProps, DEFAULT_BRANCHES, DefaultBranch, MergeParameters } from "@app/models";

/** Merge parameters configuration props*/
type MergeParametersProps = BaseParametersComponentProps<MergeParameters>;

const MergeParametersConfiguration: FC<MergeParametersProps> = ({
    branches,
    parameters, setParameters,
    setCanExecute, setError, setShouldConfirm,
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
            setParameters({
                ...parameters,

                name: formattedName,
                sourceBranch: source,
                targetBranch: target,
            });
            manualRerender(x => ++x);
            setHintVisibility(target === DefaultBranch.Master);
        },
        [isManualName, parameters, setParameters, setShouldConfirm]
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
            setParameters({
                ...parameters,
                name,
            });
        }, [parameters, setParameters]
    );

    const onUseTemplateClick = useCallback(() => {
        setParameters({
            ...parameters,
            name: parameters.template.format(parameters.sourceBranch, parameters.targetBranch),
        });
        manualRerender(x => ++x);
        setIsManualName(false);
    }, [parameters, setParameters]);

    useEffect(() => {
        if (isNullOrEmpty(parameters?.sourceBranch) || isNullOrEmpty(parameters?.targetBranch)) {
            setCanExecute(false);
            return;
        }

        if (parameters.sourceBranch === parameters.targetBranch) {
            setCanExecute(false);
            setError("From branch cannot be same as target branch");
            return;
        }

        if (isNullOrEmpty(parameters.name)) {
            setCanExecute(false);
            setError("Name must be set");
            return;
        }

        setCanExecute(true);
    }, [parameters, setCanExecute, setError]);

    return (
        <section role="merge-parameters">
            <div className="columns">
                <div className="column">
                    <Text
                        key={manualRerenderCount}
                        onValueChange={onMrNameChange}
                        defaultValue={parameters?.name}
                        label={{ caption: "MR name", horizontal: false }}
                        hint={isManualName ? undefined : {
                            content: "Once you make changes here, the template will no longer apply",
                            italic: true,
                            grey: true,
                        }}
                    />
                </div>
            </div>
            {isManualName &&
                <div className="columns">
                    <div className="column">
                        <Button
                            type="white"
                            caption="Use template from setting"
                            onClick={onUseTemplateClick}
                        />
                    </div>
                </div>
            }
            <div className="columns">
                <div className="column">
                    <Dropdown
                        hideOnOuterClick
                        placeholder="From"
                        value={selectedFrom}
                        items={branches}
                        onSelect={onFromBranchSelected}
                        label={{ caption: "From", horizontal: false, }}
                    />
                </div>
                <div className="column is-1 is-flex is-align-items-flex-end is-justify-content-center" id="switchBranchesContainer">
                    <Button
                        type="white"
                        title="Switch branches"
                        icon={{ name: "arrow-down-up" }}
                        onClick={onSwitchBranchClick}
                        disabled={isNullOrUndefined(selectedFrom) || isNullOrUndefined(selectedTo)}
                    />
                </div>
                <div className="column">
                    <Dropdown
                        placeholder="To"
                        hideOnOuterClick
                        value={selectedTo}
                        items={branches}
                        onSelect={onToBranchSelected}
                        label={{ caption: "To", horizontal: false, }}
                    />
                </div>
            </div>
            {isHintVisible &&
                <div className="columns">
                    <p className="column has-text-right is-italic">
                        <Icon name="question-circle" /> If you want to perform an release, please, use action called &quot;{actionToDescriptionMap.get(Actions.release)}&quot;
                    </p>
                </div>
            }
        </section>
    );
};

export default MergeParametersConfiguration;

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
