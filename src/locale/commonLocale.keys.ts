export type CommonLocaleKeys = {
    edit: string;
    delete: string;
    save: string;
    name: string;
    cancel: string;
    loading: string;
    session: string;
    createdOn: string;
    back: string;
    error: string;
    errors: string;
    notifications: string;
    action: string;
};

export type SharedContentLocaleKeys = {
    projectsViewMode: {
        all: string;
        allTitle: string;
        selected: string;
        selectedTitle: string;
        unselected: string;
        unselectedTitle: string;
    };
    sessionSelector: {
        current: string;
    };
    actionDescriptions: {
        merge: string;
        release: string;
        moveTag: string;
        createBranch: string;
        deleteBranch: string;
        closeMergeRequest: string;
        mergeRequest: string;
        checkDiffs: string;
        checkNonActualTags: string;
    };

    logFileIsNotFound: string;

    paginator: {
        previousPageCaption: string;
        previousPageTitle: string;

        nextPageCaption: string;
        nextPageTitle: string;

        openConcretePageTitleTemplate: string;
    };
};

export type ParametersLocaleKeys = {
    requestName: string;

    from: string;
    to: string;

    branch: {
        branchName: string;

        checkDiffs: object; // dummy, to define possibility of locales
        create: {
            saveBranchAsAdditionalBranch: string;
        };
        delete: {
            deleteBranchFromAdditionalBranches: string;
        };
    };

    mergeRequest: {
        deleteBranchAfter: string;
        close: object; // dummy, to define possibility of locales
        merge: object; // dummy, to define possibility of locales
    };

    streamMerge: {
        merge: object; // dummy, to define possibility of locales
        release: {
            testBranch: string;
            productiveBranch: string;
            version: string;
            setVersionTagOnMergeCommit: string;
        };
    };

    tag: {
        branch: string;
        tagName: string;

        checkNonActual: object; // dummy, to define possibility of locales

        move: {
            createTagIfNotExist: string;
        };
    };
};
