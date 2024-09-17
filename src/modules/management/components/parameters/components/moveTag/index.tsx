import { useCallback, useEffect } from "react";

import { isNullOrEmpty } from "@bodynarf/utils";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox/component";
import Text from "@bodynarf/react.components/components/primitives/text";

import { BaseParametersComponentProps, MoveTagParameters } from "@app/models";

/** MoveTag parameters configuration props*/
type MoveTagParametersProps = BaseParametersComponentProps<MoveTagParameters>;

/** Move release tag further on branch parameters configuration component */
const MoveTagParametersConfiguration = ({
    parameters, setParameters,
    setCanExecute, setError,
}: MoveTagParametersProps): JSX.Element => {
    const onNameChange = useCallback(
        (value?: string) => setParameters({
            ...parameters,
            name: value,
        }), [parameters, setParameters]);

    const onCreateIfNotExistChange = useCallback(
        (value: boolean) => setParameters({
            ...parameters,
            createIfNotExist: value ?? false,
        }), [parameters, setParameters]
    );

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

            <CheckBox
                isFormLabel
                onValueChange={onCreateIfNotExistChange}
                defaultValue={parameters?.createIfNotExist ?? false}
                label={{ caption: "Create tag if not exist", horizontal: true }}
            />
        </div>
    );
};

export default MoveTagParametersConfiguration;
