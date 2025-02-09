import { FC, useCallback, useState } from "react";
import { connect } from "react-redux";

import { ElementSize } from "@bodynarf/react.components";
import Text from "@bodynarf/react.components/components/primitives/text";
import Button from "@bodynarf/react.components/components/button";

import { GlobalAppState } from "@app/store";
import { updateExtraBranchesAsync } from "@app/store/app";

/** Props of `ExtraBranchList` */
type ExtraBranchListProps = {
    /** Extra branches */
    extraBranches: Array<string>;

    /**
     * Save updated extra branches list
     * @param branches Extra branches
     */
    onUpdateBranchList: (branches: Array<string>) => void;
};

const ExtraBranchList: FC<ExtraBranchListProps> = ({
    extraBranches, onUpdateBranchList
}) => {
    const onAdd = useCallback(
        (name: string) =>
            onUpdateBranchList([
                ...extraBranches,
                name
            ]
                .withoutDuplicate()
            ), [extraBranches, onUpdateBranchList]);

    const onDelete = useCallback(
        (name: string) =>
            onUpdateBranchList([
                ...extraBranches
            ]
                .filter(x => x !== name)
                .withoutDuplicate()
            ), [extraBranches, onUpdateBranchList]);

    const onRemoveAll = useCallback(() => onUpdateBranchList([]), [onUpdateBranchList]);

    return (
        <>
            {extraBranches.map(item =>
                <ExtraBranchListItem
                    key={item}

                    item={item}
                    onDelete={onDelete}
                    onSave={onAdd}
                />
            )}
            <EmptyExtraBranchListItem
                onSave={onAdd}
                onClear={onRemoveAll}
                clearVisible={extraBranches.length !== 0}
            />
        </>
    );
};

/** List of extra branches, which can be managed by user */
export default connect(
    ({ app }: GlobalAppState) => ({
        extraBranches: app.extraBranches,
    }),
    {
        onUpdateBranchList: updateExtraBranchesAsync,
    }
)(ExtraBranchList);

/** Props of `ExtraBranchListItem` */
type ExtraBranchListItemProps = {
    /** Branch name */
    item: string;

    /**
     * Handling extra branch saving
     * @param item Branch name
     */
    onSave: (item: string) => void;

    /**
     * Handling extra branch deleting
     * @param item Branch name
     */
    onDelete: (item: string) => void;
};

/** Extra branch list item component */
const ExtraBranchListItem: FC<ExtraBranchListItemProps> = ({
    item,
    onSave, onDelete,
}) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [name, setName] = useState(item);

    const onEditClick = useCallback(() => setIsEditMode(true), []);
    const onDeleteClick = useCallback(() => onDelete(item), [item, onDelete]);
    const onCreateClick = useCallback(() => {
        onSave(name);
        setIsEditMode(false);
    }, [name, onSave]);

    if (!isEditMode) {
        return (
            <div className="is-flex is-align-items-center">
                <Button
                    type="ghost"
                    title="Edit"
                    onClick={onEditClick}
                    icon={{ name: "pencil", size: ElementSize.Small }}
                />
                <Button
                    type="ghost"
                    title="Delete"
                    className="mx-1"
                    onClick={onDeleteClick}
                    icon={{ name: "trash", size: ElementSize.Small }}
                />
                <span>
                    {item}
                </span>
            </div>
        );
    }

    return (
        <div className="mt-1 is-flex is-align-items-center">
            <Button
                type="ghost"
                title="Save"
                icon={{ name: "floppy" }}
                onClick={onCreateClick}
                size={ElementSize.Small}
                disabled={name.length === 0}
            />

            <Text
                className="ml-1"
                placeholder="Name"
                defaultValue={name}
                onValueChange={setName}
                size={ElementSize.Small}
            />
        </div>
    );
};

/** Props of `EmptyExtraBranchListItem` */
type CreateExtraBranchListItemProps = {
    /** */
    clearVisible: boolean;

    /**
     * Handling extra branch saving
     * @param item Branch name
     */
    onSave: (item: string) => void;

    /** Handle clearing list */
    onClear: () => void;
};

/** */
const EmptyExtraBranchListItem: FC<CreateExtraBranchListItemProps> = ({
    clearVisible,
    onSave, onClear,
}) => {
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [name, setName] = useState("");

    const onCancelClick = useCallback(() => {
        setIsCreateMode(false);
        setName("");
    }, []);

    const onCreateClick = useCallback(() => {
        onSave(name);
        onCancelClick();
    }, [name, onCancelClick, onSave]);

    const onAddRecordClick = useCallback(() => setIsCreateMode(true), []);

    if (!isCreateMode) {
        return (
            <div className="mt-1">
                <Button
                    type="primary"
                    outlined
                    title="Create new"
                    icon={{ name: "plus" }}
                    onClick={onAddRecordClick}
                    size={ElementSize.Small}
                />
                {clearVisible &&
                    <Button
                        type="danger"
                        outlined
                        className="ml-1"
                        title="Delete all"
                        caption="Remove all"
                        onClick={onClear}
                        size={ElementSize.Small}
                    />
                }
            </div>
        );
    }

    const canSave = name.replaceAll(" ", "").length !== 0;

    return (
        <div className="mt-1 is-flex is-align-items-center">
            <Button
                type="ghost"
                title="Cancel"
                className="mr-2"
                icon={{ name: "x" }}
                onClick={onCancelClick}
                size={ElementSize.Small}
            />

            <Button
                type="ghost"
                title="Save"
                icon={{ name: "floppy" }}
                onClick={onCreateClick}
                size={ElementSize.Small}
                disabled={!canSave}
            />

            <Text
                className="ml-1"
                placeholder="Name"
                onValueChange={setName}
                size={ElementSize.Small}
            />
        </div>
    );
};
