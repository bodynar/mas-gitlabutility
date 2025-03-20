import { Actions, BaseParametersComponentProps } from "@app/models";

import MergeParameters from "../components/streamMerge/merge";
import ReleaseParameters from "../components/streamMerge/release";

import MoveTagParameters from "../components/tag/move";
import CheckNonActualTagsParameters from "../components/tag/checkNonActual";

import CheckDiffsParameters from "../components/branch/checkDiffs";
import CreateBranchParameters from "../components/branch/create";
import DeleteBranchParameters from "../components/branch/delete";

import CloseMergeRequestParameters from "../components/mergeRequest/close";
import MergeRequestParameters from "../components/mergeRequest/merge";

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

        case Actions.createBranch:
            componentFn = (args) => <CreateBranchParameters {...args} />;
            break;

        case Actions.deleteBranch:
            componentFn = (args) => <DeleteBranchParameters {...args} />;
            break;

        case Actions.closeMergeRequest:
            componentFn = (args) => <CloseMergeRequestParameters {...args} />;
            break;

        case Actions.mergeRequest:
            componentFn = (args) => <MergeRequestParameters {...args} />;
            break;
    }

    return componentFn(props);
};

export default ParametersConfigurator;
