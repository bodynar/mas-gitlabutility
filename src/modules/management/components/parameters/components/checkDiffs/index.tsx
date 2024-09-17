import { useCallback, useEffect } from "react";

import { isNullOrEmpty, isNullOrUndefined } from "@bodynarf/utils";
import Button from "@bodynarf/react.components/components/button/component";
import Dropdown, { SelectableItem } from "@bodynarf/react.components/components/dropdown";

import { BaseParametersComponentProps, CheckDiffsParameters, DefaultBranch } from "@app/models";
import { branchesSelectList } from "@app/shared/values";

/** Check diffs parameters configuration props*/
type CheckDiffsParametersProps = BaseParametersComponentProps<CheckDiffsParameters>;

const CheckDiffsParametersConfiguration = ({
    parameters, setParameters,
    setCanExecute, setError,
}: CheckDiffsParametersProps): JSX.Element => {
    const selectedFrom = branchesSelectList.find(({ value }) => parameters?.source === value);
    const selectedTo = branchesSelectList.find(({ value }) => parameters?.target === value);

    const updateParametersValues = useCallback(
        (source?: DefaultBranch, target?: DefaultBranch) => {
            setParameters({
                ...parameters,

                source: source,
                target: target,
            });
        },
        [parameters, setParameters]
    );

    const onFromBranchSelected = useCallback(
        (value?: SelectableItem) => {
            updateParametersValues(
                value?.value as DefaultBranch,
                parameters.target as DefaultBranch,
            );
        }, [parameters, updateParametersValues]
    );

    const onToBranchSelected = useCallback(
        (value?: SelectableItem) => {
            updateParametersValues(
                parameters.source as DefaultBranch,
                value?.value as DefaultBranch,
            );
        },
        [parameters.source, updateParametersValues]
    );

    const onSwitchBranchClick = useCallback(
        () => {
            updateParametersValues(
                parameters.target as DefaultBranch,
                parameters.source as DefaultBranch,
            );
        }, [parameters.source, parameters.target, updateParametersValues]);


    useEffect(() => {
        if (isNullOrEmpty(parameters?.source) || isNullOrEmpty(parameters?.target)) {
            setCanExecute(false);
            return;
        }

        if (parameters.source === parameters.target) {
            setCanExecute(false);
            setError("From branch cannot be same as target branch");
            return;
        }

        setCanExecute(true);
    }, [parameters, setCanExecute, setError]);

    return (
        <section>
            <div className="columns">
                <div className="column">
                    <Dropdown
                        hideOnOuterClick
                        placeholder="From"
                        value={selectedFrom}
                        items={branchesSelectList}
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
                        items={branchesSelectList}
                        onSelect={onToBranchSelected}
                        label={{ caption: "To", horizontal: false, }}
                    />
                </div>
            </div>
        </section>
    );
};

export default CheckDiffsParametersConfiguration;
