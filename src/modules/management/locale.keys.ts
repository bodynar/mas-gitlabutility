export type ManagementModuleLocaleKeys = {
    loading: string;
    action: string;
    execute: string;
    requiredParametersNotSet: string;
    extraConfirmRequired: string;
    noSelectedProject: string;
    iAmSure: string;
    parametersCaption: string;
    selectProjectsCaption: string;
    selectedProjectsTemplate: string;
    searchProjects: string;
    actionIsNotSelected: string;
    groupIsEmpty: string;
    selectAllCaption: string;
    selectAllTitle: string;
    deselectAll: string;
    saveCurrentSelection: string;
    noProjectsVisibleNote: string;
    expandableGroupListItemSelectedTemplate: string;
    componentNotFound: string;

    parameters: {
        sourceBranchSameAsTarget: string;
        switchBranches: string;
        parameterIsNotSet: string;
        branchNameCannotBeEmpty: string;
        branch: {
            checkDiffs: object; // dummy, to define possibility of locales
            create: {
                sourceBranchNameSameAsTarget: string;
                branchIsAlreadyPresentedInExtraBranchListTemplate: string;
            };
            delete: {
                defaultBranchCannotBeDeleted: string;
                branchIsNotPresentedInExtraBranchListTemplate: string;
            };
        };

        mergeRequest: {
            requestNameCannotBeEmpty: string;
            close: object; // dummy, to define possibility of locales;
            merge: object; // dummy, to define possibility of locales;
        };

        streamMerge: {
            templateWouldNotBeApplied: string;
            useTemplate: string;
            merge: {
                nameMustBeSet: string;
                releaseNoteTemplate: string;
            };
            release: {
                versionCannotBeEmpty: string;
                versionNumberIsNotSet: string;
                requestNameIsNotSet: string;
                branchWithTestedCode: string;
                branchWithProductiveCode: string;
            };
        };

        tag: {
            nameIsEmpty: string;
            checkNonActual: object; // dummy, to define possibility of locales
            move: object; // dummy, to define possibility of locales
        };
    };
};
