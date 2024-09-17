import { useCallback, useEffect, useState } from "react";

import { isNullOrEmpty } from "@bodynarf/utils";
import Button from "@bodynarf/react.components/components/button/component";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox/component";
import Text from "@bodynarf/react.components/components/primitives/text";

import { BaseParametersComponentProps, ReleaseParameters } from "@app/models";

/** Release parameters configuration props*/
type ReleaseParametersProps = BaseParametersComponentProps<ReleaseParameters>;

/** Release action parameters component */
const ReleaseParametersConfiguration = ({
    parameters, setParameters,
    setCanExecute, setError,
}: ReleaseParametersProps): JSX.Element => {
    const [isManualName, setIsManualName] = useState(isNullOrEmpty(parameters?.template));
    const [manualRerenderCount, manualRerender] = useState(0);

    const onVersionChange = useCallback(
        (value?: string) => {

            const formattedName = isManualName
                ? parameters.mergeRequestName
                : parameters.template.format(value);

            setParameters({
                ...parameters,
                version: value,
                mergeRequestName: formattedName,
            });
            manualRerender(x => ++x);
        }, [isManualName, parameters, setParameters]);

    const onSetTagChange = useCallback(
        (value: boolean) => setParameters({
            ...parameters,
            setVersionTagAfter: value,
        }), [parameters, setParameters]);

    const onMrNameChange = useCallback(
        (name?: string) => {
            setIsManualName(true);
            setParameters({
                ...parameters,
                mergeRequestName: name,
            });
        }, [parameters, setParameters]
    );

    const onUseTemplateClick = useCallback(() => {
        setParameters({
            ...parameters,
            mergeRequestName: parameters.template.format(parameters.version),
        });
        manualRerender(x => ++x);
        setIsManualName(false);
    }, [parameters, setParameters]);

    useEffect(() => {
        if (isNullOrEmpty(parameters?.version)) {
            setError("Version cannot be empty");
            return;
        }

        if (isNullOrEmpty(parameters.mergeRequestName)) {
            setCanExecute(false);
            setError("Merge request name must be set");
            return;
        }

        setCanExecute(true);
    }, [parameters, setCanExecute, setError]);

    return (
        <section>
            <Text
                onValueChange={onVersionChange}
                defaultValue={parameters?.version}
                label={{ caption: "Version", horizontal: true }}
            />

            <CheckBox
                isFormLabel
                onValueChange={onSetTagChange}
                defaultValue={parameters?.setVersionTagAfter ?? true}
                label={{ caption: "Set version tag on merge commit", horizontal: true }}
            />
            <div className="columns">
                <div className="column">
                    <Text
                        key={manualRerenderCount}
                        onValueChange={onMrNameChange}
                        defaultValue={parameters?.mergeRequestName}
                        label={{ caption: "Merge request name", horizontal: true }}
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
        </section>
    );
};

export default ReleaseParametersConfiguration;
