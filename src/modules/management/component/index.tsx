import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";

import { isNullish, isNullOrEmpty, isNullOrUndefined, Optional } from "@bodynarf/utils";
import { ElementSize, useUnmount, SelectableItem } from "@bodynarf/react.components";
import Button from "@bodynarf/react.components/components/button/component";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox/component";
import Dropdown from "@bodynarf/react.components/components/dropdown";
import Search from "@bodynarf/react.components/components/search/component";

import { Actions, DEFAULT_BRANCHES, DefaultBranch, Group, WritableActions } from "@app/models";
import { getLocalizedText, LocaleKeys } from "@app/locale";
import { branchesSelectList, projectsViewMode } from "@app/shared/values";
import { getActionDescription, getDefaultParameters } from "@app/core/gitlab/actions";
import { GlobalAppState } from "@app/store";
import { AppSettings } from "@app/store/app";
import { changeProjectsViewMode, clearSelection, executeGitlabAction, loadGroups, selectAll, setSearchQuery, toggleItemSelect } from "@app/store/gitlab";

import "./styles.scss";

import ExpandableGroupList from "../components/expandableGroupList";
import ParametersConfigurator from "../components/parameters";

/** Props of @see ManagementList */
type ManagementListProps = {
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

    /** Branches for dropdown */
    branches: Array<SelectableItem>;

    /** Identifier of current view mode for selectable projects component */
    currentProjectViewMode: string;

    /** Select all projects */
    selectAll: () => void;

    /** Deselect all projects */
    clearSelection: () => void;

    /**
     * Execute selected gitlab action
     * @param action Selected action
     * @param parameters Action parameters
     */
    execute: (action: Actions, parameters: unknown) => Promise<void>;

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

    /**
     * Change view mode of selectable projects
     * @param mode New view mode key
     */
    changeProjectsViewMode: (mode: string) => void;
};

/** Main repositories management panel component */
const ManagementList: FC<ManagementListProps> = ({
    settings, branches,
    favoriteGroups, groups, loadGroups,
    selectedProjects, projectsCount,
    toggleItemSelect,
    clearSelection, selectAll,
    searchQuery, setSearchQuery,
    execute,

    currentProjectViewMode, changeProjectsViewMode,
}) => {
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

    const [currentAction, setCurrentAction] = useState<Optional<SelectableItem>>(undefined);
    const [parameters, setParameters] = useState<Optional<object>>(undefined);
    const [parametersError, setParametersError] = useState<Optional<string>>(undefined);
    const [canExecute, setCanExecute] = useState(false);
    const [isExtraConfirmRequired, setShouldConfirm] = useState(false);
    const [extraConfirmValue, setExtraConfirmValue] = useState(false);
    const [saveSelection, setSaveSelection] = useState(selectedProjects.length !== 0);

    useUnmount(() => {
        setSearchQuery("");

        if (!saveSelection) {
            clearSelection();
        }
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
                setCanExecute(false);
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

    const onViewModeChanged = useCallback(
        (mode?: SelectableItem) => {
            if (isNullOrUndefined(mode)) {
                return;
            }

            changeProjectsViewMode(mode.value);
        },
        [changeProjectsViewMode]
    );

    if (groups.length === 0) {
        return <>{getLocalizedText("management.loading")}</>;
    }

    const isExecutionDisabled = selectedProjects.length === 0 || !canExecute || (isExtraConfirmRequired && !extraConfirmValue);
    const executionDisabledReason = getExecutionDisabledTitleResourceKey(selectedProjects.length, canExecute, isExtraConfirmRequired, extraConfirmValue);

    return (
        <main role="management-module">
            <section className="columns">
                <div className="column is-10">
                    <Dropdown
                        deselectable
                        hideOnOuterClick
                        data={{ "dd-identifier": "actions" }}
                        value={currentAction}
                        onSelect={onActionSelect}
                        items={getActionSelectList()}
                        placeholder={getLocalizedText("common.action")}
                        label={{
                            caption: getLocalizedText("management.action"),
                            horizontal: true,
                        }}
                    />
                </div>
                <div className="column is-2" role="action-execute">
                    {!isNullOrUndefined(currentAction) &&
                        <div className="is-flex is-flex-direction-column is-align-items-stretch">
                            <Button
                                type="success"
                                onClick={onExecuteClick}
                                disabled={isExecutionDisabled}
                                caption={getLocalizedText("management.execute")}
                                title={isNullish(executionDisabledReason) ? null : getLocalizedText(executionDisabledReason)}
                            />
                            {isExtraConfirmRequired &&
                                <CheckBox
                                    key={`${isExtraConfirmRequired}`}

                                    defaultValue={false}
                                    onValueChange={onExtraConfirmChange}
                                    label={{ caption: getLocalizedText("management.iAmSure"), horizontal: true, }}
                                />
                            }
                        </div>
                    }
                </div>
            </section>
            <hr className="my-3" />
            {!isNullOrUndefined(currentAction) &&
                <>
                    <section>
                        <h5 className="subtitle is-5 mb-4">
                            {getLocalizedText("management.parametersCaption")}
                        </h5>
                        <ParametersConfigurator
                            branches={branches}
                            parameters={parameters}
                            setParameters={setParameters}
                            setCanExecute={setCanExecute}
                            action={+currentAction.value}
                            setError={setParametersError}
                            setShouldConfirm={setShouldConfirm}
                        />
                        {!isNullOrEmpty(parametersError) &&
                            <span className="help is-danger mt-4">
                                {parametersError}
                            </span>
                        }
                    </section>
                    <hr className="my-4" />
                </>
            }
            <section>
                <h5 className="subtitle is-5">
                    {getLocalizedText("management.selectProjectsCaption")}{selectedProjects.length > 0
                        && <> ({getLocalizedText("management.selectedProjectsTemplate").format(`${selectedProjects.length}`, `${projectsCount}`)})</>
                    }
                </h5>
                <div className="mb-3">
                    <Search
                        onSearch={onSearch}
                        searchType="byTyping"
                        defaultValue={searchQuery}
                        caption={getLocalizedText("management.searchProjects")}
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
                                size={ElementSize.Small}
                                onClick={onSelectAllClick}
                                disabled={selectedProjects.length === projectsCount}
                                title={getLocalizedText("management.selectAllTitle")}
                                caption={getLocalizedText("management.selectAllCaption")}
                            />
                            <Button
                                outlined
                                type="primary"
                                className="mx-2"
                                size={ElementSize.Small}
                                onClick={onClearSelectionClick}
                                disabled={selectedProjects.length === 0}
                                caption={getLocalizedText("management.deselectAll")}
                            />
                            <Dropdown
                                compact
                                placeholder=""
                                hideOnOuterClick
                                onSelect={onViewModeChanged}
                                items={getProjectsViewModeList()}
                                value={getProjectsViewModeMap().get(currentProjectViewMode)}
                                className="projects-view-mode"
                            />
                        </div>
                        <CheckBox
                            defaultValue={saveSelection}
                            onValueChange={setSaveSelection}
                            label={{ caption: getLocalizedText("management.saveCurrentSelection"), horizontal: true }}
                        />
                    </div>
                }
                {favoriteGroups.length === 0 &&
                    <p className="is-italic has-text-grey my-2">
                        {getLocalizedText("management.noProjectsVisibleNote")}
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
        branches: getDropdownBranches(app.extraBranches),
        currentProjectViewMode: gitlab.currentProjectViewMode,
    }),
    {
        loadGroups,
        toggleItemSelect,
        clearSelection,
        selectAll,
        setSearchQuery,
        execute: executeGitlabAction,
        changeProjectsViewMode
    }
)(ManagementList);

/**
 * Get branches for dropdown
 * @param extraBranches Additional branches names
 * @returns Branches for dropdown
 */
const getDropdownBranches = (extraBranches: Array<string>): Array<SelectableItem> => {
    return extraBranches
        .withoutDuplicate()
        .filter(x => !DEFAULT_BRANCHES.includes(x as DefaultBranch))
        .map(x => ({
            displayValue: x,
            id: x,
            value: x,
        }))
        .concat(
            branchesSelectList
        );
};

/**
 * Get reason why execute action is disabled as locale key. If action can be executed - `null`
 * @param selectedProjectsLength Amount of selected projects
 * @param canExecute Is required parameters filled
 * @param isExtraConfirmRequired Is extra confirmation required
 * @param extraConfirmValue Extra confirmation value
 * @returns Locale key of reason why execution is disabled; otherwise - `null`
 */
const getExecutionDisabledTitleResourceKey = (
    selectedProjectsLength: number,
    canExecute: boolean,
    isExtraConfirmRequired: boolean,
    extraConfirmValue: boolean,
): keyof LocaleKeys | null => {
    if (selectedProjectsLength > 0 && canExecute && (!isExtraConfirmRequired || extraConfirmValue)) {
        return null;
    }

    if (selectedProjectsLength === 0) {
        return "management.noSelectedProject";
    }

    if (!canExecute) {
        return "management.requiredParametersNotSet";
    }

    return "management.extraConfirmRequired";
};

let actionSelectList: Array<SelectableItem>;

/**
 * Get dropdown list for actions
 * @returns List for selection
 */
const getActionSelectList = (): Array<SelectableItem> => {
    if (isNullish(actionSelectList)) {
        actionSelectList =
            Object
                .values(Actions)
                .filter(x => !isNaN(+x))
                .map(x => x as Actions)
                .map((value, index) => ({
                    displayValue: `${index + 1}. ${getActionDescription(value)}`,
                    id: value.toString(),
                    value: value.toString(),
                    icon: {
                        name: WritableActions.includes(value) ? "pencil" : "book",
                        className: WritableActions.includes(value) ? "has-text-link" : ""
                    },
                }))
            ;
    }

    return actionSelectList;
};

/** Get projects view mode list for dropdown */
const getProjectsViewModeList = (): Array<SelectableItem> => {
    return projectsViewMode.map(({ id, displayValue, value, title }) => ({
        id,
        value,
        displayValue: displayValue(),
        title: title(),
    }));
};

/** Map project view mode list to dictionary for easy access for list values */
const getProjectsViewModeMap = () => new Map(
    getProjectsViewModeList().map(x => [x.value, x])
);
