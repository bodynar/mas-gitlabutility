import { useCallback, useEffect } from "react";

import { isNullOrEmpty } from "@bodynarf/utils";
import Dropdown, { SelectableItem } from "@bodynarf/react.components/components/dropdown";
import Text from "@bodynarf/react.components/components/primitives/text/component";

import { BaseParametersComponentProps, CreateBranchParameters } from "@app/models";

/** CreateBranch parameters configuration props*/
type CreateBranchParametersProps = BaseParametersComponentProps<CreateBranchParameters>;

const CreateBranchParametersConfiguration = ({
    branches,
    parameters, setParameters,
    setCanExecute, setError,
}: CreateBranchParametersProps): JSX.Element => {
    const selectedFrom = branches.find(({ value }) => parameters?.source === value);

    const onSourceBranchSelected = useCallback(
        (value?: SelectableItem) => {
            setParameters({
                ...parameters,
                source: value?.value,
            });
        }, [parameters, setParameters]
    );

    const onNameChange = useCallback(
        (branchName?: string) => {
            setParameters({
                ...parameters,
                branchName,
            });
        }, [parameters, setParameters]
    );

    useEffect(() => {
        if (isNullOrEmpty(parameters?.source) || isNullOrEmpty(parameters?.branchName)) {
            setCanExecute(false);
            return;
        }

        if (parameters.source === parameters.branchName) {
            setCanExecute(false);
            setError("Branch name cannot have same name as source branch");
            return;
        }

        setCanExecute(true);
    }, [parameters, setCanExecute, setError]);

    return (
        <section role="CreateBranch-parameters">
            <div className="columns">
                <div className="column">
                    <Dropdown
                        hideOnOuterClick
                        placeholder="From"
                        value={selectedFrom}
                        items={branches}
                        onSelect={onSourceBranchSelected}
                        label={{ caption: "Source branch", horizontal: false, }}
                    />
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <Text
                        onValueChange={onNameChange}
                        defaultValue={parameters?.branchName}
                        label={{ caption: "Branch name", horizontal: false }}
                    />
                </div>
            </div>
        </section>
    );
};

export default CreateBranchParametersConfiguration;
