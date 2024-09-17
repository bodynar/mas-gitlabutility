import { Actions, BaseParametersComponentProps } from "@app/models";

import MergeParameters from "../components/merge";
import ReleaseParameters from "../components/release";
import MoveTagParameters from "../components/moveTag";
import CheckDiffsParameters from "../components/checkDiffs";
import CheckNonActualTagsParameters from "../components/checkNonActualTags";

import "./style.scss";

/** Props of `ParametersConfigurator` */
interface ParametersConfiguratorProps extends BaseParametersComponentProps<any> {
    /** Selected action */
    action: Actions;
}

/** Selected action parameters configurator */
const ParametersConfigurator = (props: ParametersConfiguratorProps): JSX.Element => {
    let componentFn: (args: BaseParametersComponentProps<any>) => JSX.Element = () => <>NOT_FOUND</>;

    switch (props.action) {
        case Actions.merge:
            componentFn = (args) => <MergeParameters {...args} />;
            break;

        case Actions.release:
            componentFn = (args) => <ReleaseParameters {...args} />;
            break;

        case Actions.moveTag:
            componentFn = (args) => <MoveTagParameters {...args} />;
            break;

        case Actions.checkDiffs:
            componentFn = (args) => <CheckDiffsParameters {...args} />;
            break;

        case Actions.checkNonActualTags:
            componentFn = (args) => <CheckNonActualTagsParameters {...args} />;
            break;
    }

    return componentFn(props);
};

export default ParametersConfigurator;
