import { FC } from "react";

import { emptyFn } from "@bodynarf/utils";
import Text from "@bodynarf/react.components/components/primitives/text";

import { MergeActionResult, MergeParameters } from "@app/models";

import MergeRequestsLists from "../mergeRequestsLists";
import { ActionResultDisplayProps } from "../../component";

/** Props type of `MergeResultDisplay` */
type MergeResultDisplayProps = ActionResultDisplayProps<MergeActionResult, MergeParameters>;

/** Merge operation result display component */
const MergeResultDisplay: FC<MergeResultDisplayProps> = ({
    result, parameters, projects, getProjectJiraRef
}) => {
    return (
        <section>
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.sourceBranch}
                label={{ caption: "From", horizontal: true }}
            />
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.targetBranch}
                label={{ caption: "To", horizontal: true }}
            />
            <hr />
            <MergeRequestsLists
                {...result}
                projects={projects}
                getProjectJiraRef={getProjectJiraRef}
            />
        </section>
    );
};

export default MergeResultDisplay;
