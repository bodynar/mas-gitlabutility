import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { connect } from "react-redux";

import { isNullOrEmpty, isNullOrUndefined } from "@bodynarf/utils";
import Button from "@bodynarf/react.components/components/button/component";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox/component";
import Dropdown, { SelectableItem } from "@bodynarf/react.components/components/dropdown";
import { ElementSize } from "@bodynarf/react.components";
import Search from "@bodynarf/react.components/components/search/component";

import { Actions, Group, WritableActions, actionToDescriptionMap } from "@app/models";
import { getDefaultParameters } from "@app/core/gitlab/actions";
import { GlobalAppState } from "@app/store";
import { AppSettings } from "@app/store/app";
import { clearSelection, executeGitlabAction, loadGroups, selectAll, setSearchQuery, toggleItemSelect } from "@app/store/gitlab";

import "./styles.scss";

import ExpandableGroupList from "../components/expandableGroupList";
import ParametersConfigurator from "../components/parameters";

const actionSelectList: Array<SelectableItem> =
    Object
        .values(Actions)
        .filter(x => !isNaN(+x))
        .map(x => x as Actions)
        .map((value) => ({
            displayValue: actionToDescriptionMap.get(value),
            id: value.toString(),
            value: value.toString(),
            icon: {
                name: WritableActions.includes(value) ? "pencil" : "book",
                className: WritableActions.includes(value) ? "has-text-link" : ""
            },
        }))
    ;

/** Props of @see ManagementList */
interface ManagementListProps {
    /** Group ids to preload nested projects */
    favoriteGroups: Array<number>;

    /** Loaded groups data */
    groups: Array<Group>;

    /** Project identifiers selected for performing action */
    selectedProjects: Array<number>;

    /** Loaded projects count */
    projectsCount: number;

    /** Current search query */
    searchQuery?: string;

    /** Application settings */
    settings: AppSettings;

    /** Select all projects */
    selectAll: () => void;

    /** Deselect all projects */
    clearSelection: () => void;

    /**
     * Execute selected gitlab action
     * @param action Selected action
     * @param parameters Action parameters
     */
    execute: (action: Actions, parameters: any) => Promise<void>;

    /** Save current search query */
    setSearchQuery: (search: string) => void;

    /**
     * Toggle element selection state
     * @param id Element identifier
     * @param type Element type
     * @param selected Is element selected
     */
    toggleItemSelect: (id: number, type: "group" | "project", selected: boolean) => void;

    /**
     * Load available groups
     * @param ids Specific groups ids to load nested projects
     */
    loadGroups: (ids?: Array<number>) => Promise<void>;
}

/** Main repositories management panel component */
const ManagementList = ({
    settings,
    favoriteGroups, groups, loadGroups,
    selectedProjects, projectsCount,
    toggleItemSelect,
    clearSelection, selectAll,
    searchQuery, setSearchQuery,
    execute,
}: ManagementListProps): JSX.Element => {
    useEffect(() => {
        const loadedGroups = groups
            .filter(({ childrenLoaded }) => childrenLoaded)
            .map(({ id }) => id);

        const hasNotLoadedFavGroup = favoriteGroups.some(id => !loadedGroups.includes(id));

        if (hasNotLoadedFavGroup) {
            loadGroups(favoriteGroups);
        }
    }, [favoriteGroups, groups, loadGroups]);

    const groupsToDisplay = useMemo(
        () => favoriteGroups.length > 0 ? groups.filter(({ id }) => favoriteGroups.includes(id)) : groups,
        [favoriteGroups, groups]
    );

    const [currentAction, setCurrentAction] = useState<SelectableItem | undefined>(undefined);
    const [parameters, setParameters] = useState<object | undefined>(undefined);
    const [parametersError, setParametersError] = useState<string | undefined>(undefined);
    const [canExecute, setCanExecute] = useState(false);
    const [isExtraConfirmRequired, setShouldConfirm] = useState(false);
    const [extraConfirmValue, setExtraConfirmValue] = useState(false);
    const [saveSelection, setSaveSelection] = useState(selectedProjects.length !== 0);

    const isUnmountRef = useRef(false);

    useEffect(() => {
        return () => {
            isUnmountRef.current = true;
        };
    }, []);

    useEffect(() => {
        return () => {
            if (!isUnmountRef.current) {
                return;
            }

            setSearchQuery("");

            if (!saveSelection) {
                clearSelection();
            }
        };
    }, [clearSelection, saveSelection, setSearchQuery]);

    useEffect(() => {
        if (!isExtraConfirmRequired) {
            setExtraConfirmValue(false);
        }
    }, [isExtraConfirmRequired]);

    useEffect(() => {
        if (canExecute && !isNullOrEmpty(parametersError)) {
            setParametersError(undefined);
        }
    }, [canExecute, parametersError]);

    const onActionSelect = useCallback(
        (action?: SelectableItem) => {
            if (!isNullOrUndefined(action)) {
                setParameters(
                    getDefaultParameters(+action?.value, settings)
                );

                setParametersError(undefined);
                setShouldConfirm(false);
            }

            setCurrentAction(action);
        },
        [settings]
    );

    const onClearSelectionClick = useCallback(() => clearSelection(), [clearSelection]);
    const onSelectAllClick = useCallback(() => selectAll(), [selectAll]);
    const onSearch = useCallback(setSearchQuery, [setSearchQuery]);
    const onExtraConfirmChange = useCallback((value?: boolean) => setExtraConfirmValue(value ?? false), []);

    const onExecuteClick = useCallback(
        () =>
            execute(+currentAction.value, parameters)
                .then(() => {
                    setShouldConfirm(false);
                }),
        [currentAction?.value, execute, parameters]
    );

    const onSelectChange = useCallback(
        (id: number, type: "group" | "project", selected: boolean) =>
            toggleItemSelect(id, type, selected),
        [toggleItemSelect]
    );

    if (groups.length === 0) {
        return <>LOADING</>;
    }

    return (
        <main role="management-module">
            <section className="columns is-justify-content-space-around">
                <div className="column is-10">
                    <Dropdown
                        deselectable
                        hideOnOuterClick
                        placeholder="Action"
                        data={{ "dd-identifier": "actions"}}
                        value={currentAction}
                        items={actionSelectList}
                        onSelect={onActionSelect}
                        label={{
                            caption: "Action to perform",
                            horizontal: true,
                        }}
                    />
                </div>
                <div className="column is-1" role="action-execute">
                    {!isNullOrUndefined(currentAction) &&
                        <>
                            <Button
                                type="success"
                                caption="Execute"
                                disabled={selectedProjects.length === 0 || !canExecute || (isExtraConfirmRequired && !extraConfirmValue)}
                                onClick={onExecuteClick}
                            />
                            {isExtraConfirmRequired &&
                                <CheckBox
                                    key={`${isExtraConfirmRequired}`}
                                    defaultValue={false}
                                    onValueChange={onExtraConfirmChange}
                                    label={{ caption: "I am sure", horizontal: true, }}
                                />
                            }
                        </>
                    }
                </div>
            </section>
            <hr className="my-3" />
            {!isNullOrUndefined(currentAction) &&
                <>
                    <section className="mb-2">
                        <h5 className="subtitle is-5">
                            Parameters
                        </h5>
                        <ParametersConfigurator
                            parameters={parameters}
                            setParameters={setParameters}
                            setCanExecute={setCanExecute}
                            action={+currentAction.value}
                            setError={setParametersError}
                            setShouldConfirm={setShouldConfirm}
                        />
                        {!isNullOrEmpty(parametersError) &&
                            <span className="help is-danger">
                                {parametersError}
                            </span>
                        }
                    </section>
                    <hr className="my-5" />
                </>
            }
            <section>
                <h5 className="subtitle is-5">
                    Select projects to perform selected action {selectedProjects.length > 0
                        && <>({selectedProjects.length}/{projectsCount} selected)</>
                    }
                </h5>
                <div className="mb-3">
                    <Search
                        onSearch={onSearch}
                        searchType="byTyping"
                        defaultValue={searchQuery}
                        caption="Search projects.."
                    />
                </div>
                <ExpandableGroupList
                    items={groupsToDisplay}
                    onSelectChange={onSelectChange}
                    selectedProjects={selectedProjects}
                    canSelect={!isNullOrUndefined(currentAction)}
                />
                {!isNullOrUndefined(currentAction) &&
                    <div className="mt-4">
                        <div className="mb-2">
                            <Button
                                outlined
                                type="primary"
                                caption="Select all"
                                size={ElementSize.Small}
                                onClick={onSelectAllClick}
                                disabled={selectedProjects.length === projectsCount}
                                title="All available projects will be selected. Even those that are not visible due to the current filter."
                            />
                            <Button
                                outlined
                                type="primary"
                                className="mx-2"
                                caption="Deselect all"
                                size={ElementSize.Small}
                                onClick={onClearSelectionClick}
                                disabled={selectedProjects.length === 0}
                            />
                        </div>
                        <CheckBox
                            defaultValue={saveSelection}
                            onValueChange={setSaveSelection}
                            label={{ caption: "Save current selection", horizontal: true }}
                        />
                    </div>
                }
                {favoriteGroups.length === 0 &&
                    <p className="is-italic has-text-grey my-2">
                        If you don&apos;t see any nested projects or can&apos;t select them, make sure you mark groups as favorites in the settings
                    </p>
                }
            </section>
        </main>
    );
};

export default connect(
    ({ gitlab, app }: GlobalAppState) => ({
        favoriteGroups: app.settings.preloadGroupIds,
        groups: gitlab.groups,
        selectedProjects: gitlab.selectedProjects,
        projectsCount: gitlab.projects.length,
        searchQuery: gitlab.searchValue,
        settings: app.settings,
    }),
    {
        loadGroups,
        toggleItemSelect,
        clearSelection,
        selectAll,
        setSearchQuery,
        execute: executeGitlabAction,
    }
)(ManagementList);

