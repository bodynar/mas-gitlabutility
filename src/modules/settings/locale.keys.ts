export type SettingsModuleLocaleKeys = {
    viewMode: {
        toEdit: string;
        toView: string;
    };

    noChanges: string;

    applicationSettings: {
        caption: string;

        apiUrlPlaceholder: string;
        apiUrlLabel: string;

        gitlabTokenLabel: string;
        gitlabTokenPlaceholder: string;

        taskbarLoadingStateLabel: string;
        taskbarLoadingStateTitle: string;
    };

    templates: {
        caption: string;

        tagLabel: string;
        tagPlaceholder: string;
        tagHintTemplate: string;

        simpleExample: string;

        streamMergeRequestLabel: string;
        streamMergeRequestPlaceholder: string;

        releaseMergeRequestLabel: string;
        releaseMergeRequestPlaceholder: string;

        resetToDefaultButton: string;
    };

    favoriteGroups: {
        caption: string;
        noTokenSetError: string;
        blockHint: string;

        searchCaption: string;
        noItemsFoundBySearch: string;
    };

    additionalBranches: {
        caption: string;

        blockHint: string;
        noteCaption: string;
        blockNote: string;

        createNew: string;
        deleteAll: string;
    };
};
