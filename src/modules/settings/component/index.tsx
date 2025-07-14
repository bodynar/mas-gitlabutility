import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { connect } from "react-redux";

import { isNullOrEmpty } from "@bodynarf/utils";
import { ElementColor, ElementSize } from "@bodynarf/react.components";
import Button from "@bodynarf/react.components/components/button/component";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox";
import Search from "@bodynarf/react.components/components/search/component";
import Text from "@bodynarf/react.components/components/primitives/text";

import { Group } from "@app/models";
import { checkHasTemplateDiff, getSettingsDiff } from "@app/core";
import { getLocalizedText } from "@app/locale";
import { GlobalAppState } from "@app/store";
import { AppSettings, SettingsUpdatePair, favoriteGroup, resetTemplates, saveSettings } from "@app/store/app";
import { checkVersion, loadGroups } from "@app/store/gitlab";

import "./style.scss";

import PreloadGroupItem from "../components/preloadGroupItem";
import ExtraBranchList from "../components/extraBranchList";

/** Current date to use in template */
const today = new Date();

/** Settings module component props */
type SettingsModuleProps = {
    /** Current app settings */
    settings: AppSettings;

    /** All available groups */
    groups: Array<Group>;

    /** Load all available groups */
    loadGroups: () => void;

    /** Save current settings values */
    saveSettings: (settings: Array<SettingsUpdatePair>) => void;

    /**
     * Change group "is favorite" flag
     * @param id Group identifier
     * @param isFavorite Is favorite currently
     */
    favoriteGroup: (value: [id: number, isFavorite: boolean]) => void;

    /**
     * Check gitlab site version and compare with supported by app
     */
    checkVersion: () => Promise<boolean>;

    /** Reset current templates values to default */
    resetTemplates: () => void;
};

const SettingsModule: FC<SettingsModuleProps> = ({
    settings,
    saveSettings,
    groups, loadGroups, favoriteGroup,
    checkVersion, resetTemplates,
}) => {
    const isFirstRun = useRef(true);
    const [newSettings, setNewSettings] = useState(settings);
    const [resetCount, setResetCount] = useState(0);
    const [isViewMode, setIsViewMode] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const resetValues = useCallback(() => {
        setNewSettings(settings);

        setResetCount(c => c + 1);
    }, [settings]);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const checkVersionAsync = async () => await checkVersion();

        if (!isNullOrEmpty(settings.gitlabAuthToken) && !isNullOrEmpty(settings.apiUrl)) {
            checkVersionAsync()
                .then(success => success ? loadGroups() : undefined);
        }
    }, [checkVersion, loadGroups, settings.apiUrl, settings.gitlabAuthToken]);

    useEffect(() => {
        setHasChanges(false);

        resetValues();
    }, [isViewMode, resetValues]);

    useEffect(() => {
        const diff = getSettingsDiff(newSettings, settings);

        setHasChanges(diff.length > 0);
    }, [newSettings, settings]);

    const onChangeModeBtnClick = useCallback(() => setIsViewMode(value => !value), []);
    const onResetTemplatesClick = useCallback(() => {
        resetTemplates();
        resetValues();
    }, [resetTemplates, resetValues]);

    const onSaveBtnClick = useCallback(async () => {
        if (!hasChanges) {
            return;
        }

        saveSettings(
            Object.entries(newSettings)
                .map(([key, value]) => ({
                    key, value
                }) as SettingsUpdatePair)
        );

        setIsViewMode(true);
    }, [hasChanges, saveSettings, newSettings]);

    const onGroupFavoriteChange = useCallback(
        (groupId: number, isFavorite: boolean) => favoriteGroup([groupId, isFavorite]),
        [favoriteGroup]
    );

    // #region Change handlers

    const onSettingChange = useCallback(
        (settingName: keyof AppSettings, value: string | boolean) => setNewSettings(s => ({
            ...s,
            [settingName]: value
        })),
        []
    );

    const onApiChange = useCallback((value?: string) => onSettingChange("apiUrl", value), [onSettingChange]);
    const onTokenChange = useCallback((value?: string) => onSettingChange("gitlabAuthToken", value), [onSettingChange]);
    const onTagTemplateChange = useCallback((value?: string) => onSettingChange("releaseTagNameTemplate", value), [onSettingChange]);
    const onMrNameChange = useCallback((value?: string) => onSettingChange("mergeRequestNameTemplate", value), [onSettingChange]);
    const onReleaseMrNameChange = useCallback((value?: string) => onSettingChange("releaseMergeRequestNameTemplate", value), [onSettingChange]);
    const onShowLoadingStateAtTaskbarChange = useCallback((value = false) => onSettingChange("showLoadingStateAtTaskbar", value), [onSettingChange]);

    // #endregion

    const hasTemplateChange = checkHasTemplateDiff(newSettings);
    const filteredGroups = useMemo(() => groups.filter(({ fullName }) => fullName.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())), [groups, searchQuery]);

    return (
        <section>
            <div>
                <Button
                    type="info"
                    onClick={onChangeModeBtnClick}
                    icon={{ name: isViewMode ? "pencil-fill" : "eye-fill" }}
                    title={getLocalizedText(isViewMode ? "settings.viewMode.toEdit" : "settings.viewMode.toView")}
                />
                {!isViewMode &&
                    <Button
                        type="success"
                        className="ml-2"
                        disabled={!hasChanges}
                        onClick={onSaveBtnClick}
                        caption={getLocalizedText("common.save")}
                        title={!hasChanges ? getLocalizedText("settings.noChanges") : undefined}
                    />
                }
            </div>
            <section
                className="mt-4"
                role="settings"
            >
                <section role="settings-connection">
                    <h5 className="subtitle is-5">
                        {getLocalizedText("settings.applicationSettings.caption")}
                    </h5>
                    <div className="columns">
                        <div className="column">
                            <Text
                                key={`${isViewMode}-${settings.apiUrl}`}
                                disabled={isViewMode}
                                onValueChange={onApiChange}
                                defaultValue={settings.apiUrl}
                                placeholder={getLocalizedText("settings.applicationSettings.apiUrlPlaceholder")}
                                label={{ caption: getLocalizedText("settings.applicationSettings.apiUrlLabel"), horizontal: true }}
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <Text
                                key={`${isViewMode}-${settings.gitlabAuthToken}`}
                                disabled={isViewMode}
                                onValueChange={onTokenChange}
                                defaultValue={settings.gitlabAuthToken}
                                placeholder={getLocalizedText("settings.applicationSettings.gitlabTokenPlaceholder")}
                                label={{ caption: getLocalizedText("settings.applicationSettings.gitlabTokenLabel"), horizontal: true }}
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <CheckBox
                                key={`${isViewMode}`}

                                isFormLabel
                                hasBackgroundColor
                                fixBackgroundColor
                                disabled={isViewMode}
                                style={ElementColor.Link}
                                onValueChange={onShowLoadingStateAtTaskbarChange}
                                defaultValue={settings.showLoadingStateAtTaskbar}
                                label={{
                                    caption: getLocalizedText("settings.applicationSettings.taskbarLoadingStateLabel"),
                                    horizontal: true,
                                    title: getLocalizedText("settings.applicationSettings.taskbarLoadingStateTitle"),
                                }}
                            />
                        </div>
                    </div>
                </section>
                <hr />
                <section role="action settings">
                    <h5 className="subtitle is-5">
                        {getLocalizedText("settings.templates.caption")}
                    </h5>
                    <div className="columns">
                        <div className="column">
                            <Text
                                key={`${isViewMode}-tag-name-${resetCount}`}

                                disabled={isViewMode}
                                onValueChange={onTagTemplateChange}
                                defaultValue={settings.releaseTagNameTemplate}
                                label={{ caption: getLocalizedText("settings.templates.tagLabel"), horizontal: true }}
                                placeholder={isViewMode ? undefined : getLocalizedText("settings.templates.tagPlaceholder")}
                                hint={isNullOrEmpty(newSettings.releaseTagNameTemplate)
                                    ? undefined
                                    : {
                                        content: getLocalizedText("settings.templates.tagHintTemplate").format(newSettings.releaseTagNameTemplate, `${today.getFullYear()}`),
                                        italic: true,
                                    }
                                }
                            />
                        </div>
                    </div>

                    <div className="columns">
                        <div className="column">
                            <Text
                                key={`${isViewMode}-mr-name-${resetCount}`}
                                disabled={isViewMode}
                                onValueChange={onMrNameChange}
                                defaultValue={settings.mergeRequestNameTemplate}
                                label={{ caption: getLocalizedText("settings.templates.streamMergeRequestLabel"), horizontal: true }}
                                placeholder={isViewMode ? undefined : getLocalizedText("settings.templates.streamMergeRequestPlaceholder")}
                                hint={isNullOrEmpty(newSettings.mergeRequestNameTemplate)
                                    ? undefined
                                    : {
                                        content: getLocalizedText("settings.templates.simpleExample").format(`${newSettings.mergeRequestNameTemplate.format("test", "develop")}`),
                                        italic: true,
                                    }
                                }
                            />
                        </div>
                    </div>

                    <div className="columns">
                        <div className="column">
                            <Text
                                key={`${isViewMode}-release-mr-name-${resetCount}`}

                                disabled={isViewMode}
                                onValueChange={onReleaseMrNameChange}
                                defaultValue={settings.releaseMergeRequestNameTemplate}
                                label={{ caption: getLocalizedText("settings.templates.releaseMergeRequestLabel"), horizontal: true }}
                                placeholder={isViewMode ? undefined : getLocalizedText("settings.templates.releaseMergeRequestPlaceholder")}
                                hint={isNullOrEmpty(newSettings.releaseMergeRequestNameTemplate)
                                    ? undefined
                                    : {
                                        content: getLocalizedText("settings.templates.simpleExample").format(`${newSettings.releaseMergeRequestNameTemplate.format(`v${today.getFullYear()}.1.0`)}`),
                                        italic: true,
                                    }
                                }
                            />
                        </div>
                    </div>

                    {isViewMode && hasTemplateChange &&
                        <Button
                            type="white"
                            onClick={onResetTemplatesClick}
                            caption={getLocalizedText("settings.templates.resetToDefaultButton")}
                        />
                    }
                </section>
            </section>
            <hr />
            <section>
                <h5 className="subtitle is-5">
                    {getLocalizedText("settings.favoriteGroups.caption")} {settings.preloadGroupIds.length > 0 && groups.length > 0
                        && `(${settings.preloadGroupIds.length}/${groups.length})`
                    }
                </h5>
                {isNullOrEmpty(settings.gitlabAuthToken) &&
                    <article className="message is-warning">
                        <div className="message-body has-text-weight-bold">
                            {getLocalizedText("settings.favoriteGroups.noTokenSetError")}
                        </div>
                    </article>
                }
                {!isNullOrEmpty(settings.gitlabAuthToken) &&
                    <>
                        <p className="is-italic mb-4 has-text-wrapped">
                            {getLocalizedText("settings.favoriteGroups.blockHint")}
                        </p>
                        <div className="mb-4">
                            <Search
                                searchType="byTyping"
                                size={ElementSize.Small}
                                onSearch={setSearchQuery}
                                caption={getLocalizedText("settings.favoriteGroups.searchCaption")}
                            />
                        </div>
                        <ul
                            key={`${settings.gitlabAuthToken}`}
                            role="preload-group-list"
                        >
                            {filteredGroups.length === 0 && groups.length !== 0 &&
                                <p className="has-text-grey has-text-wrapped is-italic">
                                    {getLocalizedText("settings.favoriteGroups.noItemsFoundBySearch")}
                                </p>
                            }
                            {filteredGroups.length > 0 &&
                                filteredGroups.map(group =>
                                    <li key={isViewMode ? group.id : group.id + 1000}>
                                        <PreloadGroupItem
                                            group={group}
                                            onFavoriteChange={onGroupFavoriteChange}
                                            isPreloading={settings.preloadGroupIds.includes(group.id)}
                                        />
                                    </li>
                                )
                            }
                        </ul>
                    </>
                }
            </section>
            <hr />
            <section>
                <h5 className="subtitle is-5">
                    {getLocalizedText("settings.additionalBranches.caption")}
                </h5>

                <p className="is-italic mb-4 has-text-wrapped">
                    {getLocalizedText("settings.additionalBranches.blockHint")}
                    <br />
                    <span className="has-text-weight-bold">
                        {getLocalizedText("settings.additionalBranches.noteCaption")}
                    </span>: {getLocalizedText("settings.additionalBranches.blockNote")}
                </p>

                <ExtraBranchList />
            </section>
        </section>
    );
};

export default connect(
    ({ app, gitlab }: GlobalAppState) => ({
        settings: app.settings,
        groups: gitlab.groups,
    }),
    {
        saveSettings: (settings: Array<SettingsUpdatePair>) => saveSettings([settings, false]),
        loadGroups,
        favoriteGroup,
        checkVersion: () => checkVersion(true, true),
        resetTemplates,
    }
)(SettingsModule);
