import { useCallback } from "react";

import { ElementColor } from "@bodynarf/react.components";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox/component";

import { Group } from "@app/models";

/** Single line of group option to preload component props */
interface PreloadGroupItemProps {
    /** Group information */
    group: Group;

    /** Is group in preload list */
    isPreloading: boolean;

    /** On preload flag change */
    onFavoriteChange: (groupId: number, flagValue: boolean) => void;
}

/** Single line of group option to preload component */
const PreloadGroupItem = ({
    group, isPreloading, onFavoriteChange,
}: PreloadGroupItemProps): JSX.Element => {
    const onSelectionChange = useCallback(
        (value?: boolean) => onFavoriteChange(group.id, value ?? false),
        [group.id, onFavoriteChange]
    );

    return (
        <CheckBox
            hasBackgroundColor
            fixBackgroundColor
            defaultValue={isPreloading}
            style={ElementColor.Success}
            onValueChange={onSelectionChange}
            label={{
                caption: group.fullName,
                horizontal: true
            }}
        />
    );
};

export default PreloadGroupItem;
