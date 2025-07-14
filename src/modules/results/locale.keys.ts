export type ResultsModuleLocaleKeys = {
    noItemsToDisplayError: string;
    operation: string;
    startedOn: string;
    completedOn: string;
    youHaveAbortedExecution: string;

    openDetails: string;

    resultTitleError: string;
    resultTitleSuccess: string;
    resultTitleWarn: string;

    resultIdIsEmpty: string;
    resultNotFoundTemplate: string;
    resultCaptionTemplate: string;

    operationDidNotStarted: string;

    componentNotFound: string;

    projectNotFoundTemplate: string;

    copyToClipboard: string;

    errors: string;
    results: string;

    noErrorsCaption: string;

    branch: {
        checkDiffs: {
            caption: string;

            hasDiffs: string;
            noDiffs: string;

            successCaption: string;
            noSuccessCaption: string;
        };
        create: {
            captionTemplate: string;

            successCaption: string;
            noSuccessCaption: string;
            branchCreatedMessage: string;
        };
        delete: {
            successCaption: string;
            noSuccessCaption: string;
            branchDeletedMessage: string;
            ambiguityCaption: string;
            noAmbiguityCaption: string;
            ambiguityItemTemplate: string;
        };
    };

    mergeRequest: {
        ambiguityCaption: string;
        noAmbiguityMessage: string;
        ambiguityItemTemplate: string;
        mergedRequests: string;
        noMergedRequests: string;

        close: {
            successCaption: string;
            noSuccessMessage: string;
            requestClosed: string;
        };
        merge: {
            requestMerged: string;
        };
        list: {
            copySuccessCaptionItemTemplate: string;

            copyNotSuccessCaptionItemTemplate: string;
            copyNotCreatedMergeRequestItemTemplate: string;

            notSuccessCaption: string;
            notSuccessEmpty: string;
            notSuccessError: string;

            mergeRequest: string;
            notMerged: string;
            mergeRequestNotCreated: string;
            mergeRequestMergedTemplate: string;
        };
    };

    copyToClipboardButton: {
        copiedToClipboard: string;
        buttonIsOnCoolDown: string;
        copyToClipboard: string;
    };

    streamMerge: {
        merge: object;
        release: {
            createdTags: string;
            createdTagItemTemplate: string;
            noCreatedTags: string;
            tag: string;
            withoutMr: string;
        };
    };

    tag: {
        checkNonActual: {
            copyNonActualTagItemTemplate: string;
            copyActualTagItemTemplate: string;

            copyErrorsCaption: string;
            copyErrorItemTemplate: string;

            nonActualTagsCaption: string;
            actualTagsCaption: string;

            nonActualTagsEmpty: string;
            actualTagsEmpty: string;

            tagIsOnLatestCommit: string;

            isNotOn: string;
        };
        move: {
            copyNotMovedTagsItemTemplate: string;
            copyMovedTagsItemTemplate: string;

            notMovedTags: string;
            notMovedTagsEmpty: string;
            notMovedTagsNote: string;

            movedTags: string;
            movedTagsEmpty: string;

            tagWasNotMoved: string;
            tagWasMovedToLatestCommitTemplate: string;
        };
    };
};
