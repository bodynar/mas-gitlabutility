export type StoreLocaleKeys = {
    app: {
        mergeRequestNameTemplate: string;
        releaseMergeRequestNameTemplate: string;

        appHistoryDeleting: string;
        appHistoryDeleted: string;
        emptyHistoryRecordsDeleted: string;
    };
    gitlab: {
        noProjectsSelected: string;
        actionIsNotImplemented: string;
        performingOperation: string;
        cancelOperation: string;
        operationFailed: string;
        operationCancelled: string;
        operationCompleted: string;
        gitlabIsInaccessible: string;
        errorDuringDataLoad: string;
        gitlabVersionNoteTemplate: string;
        tokenIsIncorrect: string;
        tokenIsNotSet: string;
        tokenContainsInvalidCharacters: string;
        gitlabAccessCheckUnknownError: string;
        versionWarning: {
            sendEmail: string;
            subjectTemplate: string;
            bodyTemplate: string;
        };
    };
};
