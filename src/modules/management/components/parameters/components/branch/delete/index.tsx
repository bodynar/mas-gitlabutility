import { FC, useCallback, useEffect } from "react";

import { isNullOrEmpty } from "@bodynarf/utils";
import Text from "@bodynarf/react.components/components/primitives/text/component";

import { BaseParametersComponentProps, DEFAULT_BRANCHES, DeleteBranchParameters } from "@app/models";

/** DeleteBranch parameters configuration props */
type DeleteBranchParametersProps = BaseParametersComponentProps<DeleteBranchParameters>;

/** DeleteBranch parameters configuration */
const DeleteBranchParametersConfiguration: FC<DeleteBranchParametersProps> = ({
    parameters, setParameters,
    setCanExecute, setError,
}) => {

    const onNameChange = useCallback(
        (branchName?: string) => {
            setParameters({
                ...parameters,
                branchName,
            });
        }, [parameters, setParameters]
    );

    useEffect(() => {
        if (isNullOrEmpty(parameters?.branchName)) {
            setCanExecute(false);
            return;
        }

        if (DEFAULT_BRANCHES.includes(parameters?.branchName?.toLowerCase())) {
            setCanExecute(false);
            setError("Default branches cannot be deleted");
            return;
        }

        setCanExecute(true);
    }, [parameters, setCanExecute, setError]);

    return (
        <section role="DeleteBranch-parameters">
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

export default DeleteBranchParametersConfiguration;
