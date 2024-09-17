import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { connect } from "react-redux";

import { isNullOrEmpty } from "@bodynarf/utils";
import { ElementSize } from "@bodynarf/react.components";
import Button from "@bodynarf/react.components/components/button/component";
import Text from "@bodynarf/react.components/components/primitives/text";
import Search from "@bodynarf/react.components/components/search/component";

import { Group } from "@app/models";
import { checkHasTemplateDiff, getDiff } from "@app/core";
import { GlobalAppState } from "@app/store";
import { AppSettings, SettingsUpdatePair, favoriteGroup, resetTemplates, saveSettings } from "@app/store/app";
import { checkVersion, loadGroups } from "@app/store/gitlab";

import "./style.scss";
import PreloadGroupItem from "../components/preloadGroupItem";

/** Current date to use in template */
const today = new Date();

/** Settings module component props */
interface SettingsModuleProps {
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
}

const SettingsModule = ({
    settings,
    saveSettings,
    groups, loadGroups, favoriteGroup,
    checkVersion, resetTemplates,
}: SettingsModuleProps): JSX.Element => {
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
        const diff = getDiff(newSettings, settings);

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
        (settingName: keyof AppSettings, value: string) => setNewSettings(s => ({
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

    // #endregion

    const hasTemplateChange = checkHasTemplateDiff(newSettings);
    const filteredGroups = useMemo(() => groups.filter(({ fullName }) => fullName.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())), [groups, searchQuery]);

    return (
        <section>
            <div>
                <Button
                    type="info"
                    icon={{ name: isViewMode ? "pencil-fill" : "eye-fill" }}
                    title={isViewMode ? "Switch to edit mode" : "Switch to view mode"}
                    onClick={onChangeModeBtnClick}
                />
                {!isViewMode &&
                    <Button
                        type="success"
                        caption="Save"
                        className="ml-2"
                        disabled={!hasChanges}
                        onClick={onSaveBtnClick}
                        title={!hasChanges ? "No changes were made" : undefined}
                    />
                }
            </div>
            <section
                className="mt-4"
                role="settings"
            >
                <section role="settings-connection">
                    <h5 className="subtitle is-5">
                        Connection settings
                    </h5>
                    <div className="columns">
                        <div className="column">
                            <Text
                                key={`${isViewMode}-${settings.apiUrl}`}
                                disabled={isViewMode}
                                onValueChange={onApiChange}
                                defaultValue={settings.apiUrl}
                                label={{ caption: "Gitlab api URL", horizontal: true }}
                                placeholder={isViewMode ? undefined : "Gitlab site URL, like https://git.yoursite.com"}
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <Text
                                key={`${isViewMode}`}
                                disabled={isViewMode}
                                onValueChange={onTokenChange}
                                defaultValue={settings.gitlabAuthToken}
                                label={{ caption: "Gitlab auth token", horizontal: true }}
                                placeholder={isViewMode ? undefined : "Personal auth token"}
                            />
                        </div>
                    </div>
                </section>
                <hr />
                <section role="action settings">
                    <h5 className="subtitle is-5">
                        Actions configuration (templates)
                    </h5>
                    <div className="columns">
                        <div className="column">
                            <Text
                                key={`${isViewMode}-tag-name-${resetCount}`}
                                disabled={isViewMode}
                                onValueChange={onTagTemplateChange}
                                defaultValue={settings.releaseTagNameTemplate}
                                placeholder={isViewMode ? undefined : "Template name for release tag"}
                                label={{ caption: "Tag", horizontal: true }}
                                hint={isNullOrEmpty(newSettings.releaseTagNameTemplate)
                                    ? undefined
                                    : {
                                        content: `Example: ${newSettings.releaseTagNameTemplate}${today.getFullYear()}.1.0`,
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
                                placeholder={isViewMode ? undefined : "Template name for stream merge"}
                                label={{ caption: "Stream merge", horizontal: true }}
                                hint={isNullOrEmpty(newSettings.mergeRequestNameTemplate)
                                    ? undefined
                                    : {
                                        content: `Example: ${newSettings.mergeRequestNameTemplate.format("test", "develop")}`,
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
                                placeholder={isViewMode ? undefined : "Template name for release merge"}
                                label={{ caption: "Release merge", horizontal: true }}
                                hint={isNullOrEmpty(newSettings.releaseMergeRequestNameTemplate)
                                    ? undefined
                                    : {
                                        content: `Example: ${newSettings.releaseMergeRequestNameTemplate.format(`v${today.getFullYear()}.1.0`)}`,
                                        italic: true,
                                    }
                                }
                            />
                        </div>
                    </div>

                    {isViewMode &&
                        <Button
                            type="white"
                            caption="Reset to default"
                            onClick={onResetTemplatesClick}
                            disabled={!hasTemplateChange}
                        />
                    }
                </section>
            </section>
            <hr />
            <section>
                <h5 className="subtitle is-5">
                    Favorite groups {settings.preloadGroupIds.length > 0 && groups.length > 0
                        && `(${settings.preloadGroupIds.length}/${groups.length})`
                    }
                </h5>
                {(isNullOrEmpty(settings.gitlabAuthToken) || isNullOrEmpty(settings.apiUrl)) &&
                    <article className="message is-warning">
                        <div className="message-body has-text-weight-bold">
                            Please, configure connection settings first
                        </div>
                    </article>
                }
                {!isNullOrEmpty(settings.gitlabAuthToken) && !isNullOrEmpty(settings.apiUrl) &&
                    <>
                        <p className="is-italic mb-4">
                            Choose groups to preload.
                            <br />
                            Selected groups will be loaded (with nested projects) on application start and used in main page
                        </p>
                        <div className="mb-4">
                            <Search
                                searchType="byTyping"
                                size={ElementSize.Small}
                                caption="Search by name"
                                onSearch={setSearchQuery}
                            />
                        </div>
                        <ul
                            key={`${settings.apiUrl}-${settings.gitlabAuthToken}`}
                            role="preload-group-list"
                        >
                            {filteredGroups.length === 0 && groups.length !== 0 &&
                                <p className="has-text-grey has-text-wrapped is-italic">
                                    No groups found with that name
                                    {`\n`}
                                    {`¯\\_(ツ)_/¯`}
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
