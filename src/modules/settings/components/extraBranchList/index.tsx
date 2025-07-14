import { FC, useCallback, useState } from "react";
import { connect } from "react-redux";

import { ElementSize } from "@bodynarf/react.components";
import Text from "@bodynarf/react.components/components/primitives/text";
import Button from "@bodynarf/react.components/components/button";

import { GlobalAppState } from "@app/store";
import { updateExtraBranchesAsync } from "@app/store/app";
import { getLocalizedText } from "@app/locale";

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
                    onSave={onAdd}
                    onDelete={onDelete}
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
                    onClick={onEditClick}
                    title={getLocalizedText("common.edit")}
                    icon={{ name: "pencil", size: ElementSize.Small }}
                />
                <Button
                    type="ghost"
                    className="mx-1"
                    onClick={onDeleteClick}
                    title={getLocalizedText("common.delete")}
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
                onClick={onCreateClick}
                size={ElementSize.Small}
                icon={{ name: "floppy" }}
                disabled={name.length === 0}
                title={getLocalizedText("common.save")}
            />

            <Text
                className="ml-1"
                defaultValue={name}
                onValueChange={setName}
                size={ElementSize.Small}
                placeholder={getLocalizedText("common.save")}
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
                    icon={{ name: "plus" }}
                    size={ElementSize.Small}
                    onClick={onAddRecordClick}
                    title={getLocalizedText("settings.additionalBranches.createNew")}
                />
                {clearVisible &&
                    <Button
                        outlined
                        type="danger"
                        className="ml-1"
                        onClick={onClear}
                        size={ElementSize.Small}
                        caption={getLocalizedText("settings.additionalBranches.deleteAll")}
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
                className="mr-2"
                icon={{ name: "x" }}
                onClick={onCancelClick}
                size={ElementSize.Small}
                title={getLocalizedText("common.cancel")}
            />

            <Button
                type="ghost"
                disabled={!canSave}
                onClick={onCreateClick}
                size={ElementSize.Small}
                icon={{ name: "floppy" }}
                title={getLocalizedText("common.save")}
            />

            <Text
                className="ml-1"
                onValueChange={setName}
                size={ElementSize.Small}
                placeholder={getLocalizedText("common.name")}
            />
        </div>
    );
};
