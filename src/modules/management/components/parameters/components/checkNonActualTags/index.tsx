import { useCallback, useEffect } from "react";

import { isNullOrEmpty } from "@bodynarf/utils";
import Text from "@bodynarf/react.components/components/primitives/text";

import { BaseParametersComponentProps, CheckNonActualTagsParameters } from "@app/models";

/** CheckNonActualTags parameters configuration props*/
type CheckNonActualTagsParametersProps = BaseParametersComponentProps<CheckNonActualTagsParameters>;

/** Check tags not on a latest commit on master branch parameters configuration component */
const CheckNonActualTagsParametersConfiguration = ({
    parameters, setParameters,
    setCanExecute, setError,
}: CheckNonActualTagsParametersProps): JSX.Element => {
    const onNameChange = useCallback(
        (value?: string) => setParameters({
            ...parameters,
            name: value,
        }), [parameters, setParameters]);

    useEffect(() => {
        if (isNullOrEmpty(parameters?.name)) {
            setCanExecute(false);
            return;
        }

        setCanExecute(true);
    }, [parameters, setCanExecute, setError]);

    return (
        <div>
            <Text
                onValueChange={onNameChange}
                defaultValue={parameters?.name}
                label={{ caption: "Tag name", horizontal: true }}
            />
        </div>
    );
};

export default CheckNonActualTagsParametersConfiguration;
