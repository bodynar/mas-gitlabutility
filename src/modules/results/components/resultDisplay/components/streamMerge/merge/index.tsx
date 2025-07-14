import { FC } from "react";

import { emptyFn } from "@bodynarf/utils";
import Text from "@bodynarf/react.components/components/primitives/text";

import { MergeActionResult, MergeParameters } from "@app/models";
import { getLocalizedText } from "@app/locale";

import MergeRequestsLists from "../../shared/mergeRequestsLists";
import { ActionResultDisplayProps } from "../../../component";

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
                label={{ caption: getLocalizedText("parameters.from"), horizontal: true }}
            />
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.targetBranch}
                label={{ caption: getLocalizedText("parameters.to"), horizontal: true }}
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
