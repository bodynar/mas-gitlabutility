export type CoreLocaleKeys = {
    gitlab: {
        processingStateTemplate: string;
        branchNotFoundTemplate: string;

        timeRange: {
            second: string;
            minute: string;
            hour: string;
        };

        branch: {
            checkDiff: {
                projectDoesNotHaveBranch: string;
            };
            create: {
                branchNotCreatedTemplate: string;
            };
            delete: object; // dummy, to define possibility of locales
        };

        mergeRequest: {
            requestNotFound: string;
            close: object; // dummy, to define possibility of locales
            merge: object; // dummy, to define possibility of locales
        };

        streamMerge: {
            merge: {
                processingStateTemplate: string;
                mergeConflicts: string;
                noRights: string;
                cannotMerge: string;
                noDiffs: string;
                noBranch: string;
            };
            release: {
                gatheringBranchInfoTemplate: string;
                creatingTagsTemplate: string;
            };
        };

        tag: {
            tagNotFound: string;
            errorDuringExecutionTemplate: string;
            checkNonActual: object; // dummy, to define possibility of locales
            move: {
                tagIsUpToDate: string;
            };
        };
    };
};
