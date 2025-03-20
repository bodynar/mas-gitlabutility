import { FC, useCallback, useEffect } from "react";

import { isNullOrEmpty } from "@bodynarf/utils";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox";
import Text from "@bodynarf/react.components/components/primitives/text/component";

import { BaseParametersComponentProps, CloseMergeRequestParameters } from "@app/models";

/** CloseMergeRequest parameters configuration props */
type CloseMergeRequestParametersProps = BaseParametersComponentProps<CloseMergeRequestParameters>;

/** CloseMergeRequest parameters configuration */
const CloseMergeRequestParametersConfiguration: FC<CloseMergeRequestParametersProps> = ({
    parameters, setParameters,
    setCanExecute, setError,
}) => {

    const onNameChange = useCallback(
        (requestName?: string) => {
            setParameters({
                ...parameters,
                requestName,
            });
        }, [parameters, setParameters]
    );

    const onSetTagChange = useCallback(
        (value: boolean) => setParameters({
            ...parameters,
            removeBranch: value,
        }), [parameters, setParameters]);

    useEffect(() => {
        if (isNullOrEmpty(parameters?.requestName)) {
            setCanExecute(false);
            return;
        }

        setCanExecute(true);
    }, [parameters, setCanExecute, setError]);

    return (
        <section role="CloseMergeRequest-parameters">
            <div className="columns">
                <div className="column">
                    <Text
                        onValueChange={onNameChange}
                        defaultValue={parameters?.requestName}
                        label={{ caption: "MR name", horizontal: true }}
                    />
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <CheckBox
                        isFormLabel
                        onValueChange={onSetTagChange}
                        defaultValue={parameters?.removeBranch ?? false}
                        label={{ caption: "Delete source branch after", horizontal: true }}
                    />
                </div>
            </div>
        </section>
    );
};

export default CloseMergeRequestParametersConfiguration;
