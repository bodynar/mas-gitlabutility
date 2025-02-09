import { generateGuid, isNullish } from "@bodynarf/utils";

import { Session, StorageHistoryDto, OperationResult, Notification } from "@app/models";

import storage from "@app/core/storage";
import { AppHistory } from "@app/store/app";
import { appSession } from "@app/shared/values";

/** Key to store history in persistent storage */
const historyStorageKey = "appHistory";

/**
 * Load history data from storage
 * @returns Loaded history
 */
export const getHistoryFromStorage = (): StorageHistoryDto => {
    const hasRecord = storage.has(historyStorageKey);

    if (!hasRecord) {
        return {
            sessions: [],
            notifications: [],
            results: [],
        };
    }

    const storageValue = storage.get<string>(historyStorageKey);
    return JSON.parse(storageValue) as StorageHistoryDto;
};

/**
 * Save app history to storage as appending to current value
 * @param history History data
 */
export const saveHistoryToStorage = (appHistory: AppHistory, history: StorageHistoryDto): AppHistory => {
    const updatedHistory: AppHistory = {
        notifications: [...appHistory.notifications, ...history.notifications],
        results: [...appHistory.results, ...history.results],
        sessions: [...appHistory.sessions, ...history.sessions],
    };

    const json = JSON.stringify(updatedHistory);

    storage.set(historyStorageKey, json);

    return updatedHistory;
};

/**
 * Remove whole app storage
 */
export const removeHistoryFromStorage = (): void => {
    storage.remove(historyStorageKey);
};

/**
 * Initialize session
 * @returns {Session} Instance of `Session`
 */
export const initSession = (): Session => {
    const session: Session = {
        id: generateGuid(),
        startedAt: new Date(),
    };

    return session;
};

/**
 * Get data which not presented in history
 * @param appHistory Current history
 * @param notifications App notifications
 * @param operationsResults App operation results
 * @returns Instance of history model with not saved data
 */
export const getSessionStateDiff = (
    appHistory: AppHistory,
    notifications: Array<Notification>,
    operationsResults: Array<OperationResult<any>>
): StorageHistoryDto => {
    const notificationKeys = appHistory.notifications.map(({ id }) => id);
    const operationsResultKeys = appHistory.results.map(({ id }) => id);

    return {
        notifications:
            notifications
                .filter(({ id }) => !notificationKeys.includes(id)),
        results:
            operationsResults
                .filter(({ id }) => !operationsResultKeys.includes(id)),
        sessions: [],
    };
};

/**
 * Mark current session as closed & save it to persistent storage
 */
export const closeCurrentSession = (history: StorageHistoryDto): void => {
    if (isNullish(appSession)) {
        return;
    }

    const json = JSON.stringify({
        ...history,
        sessions: history.sessions.map(session =>
            session.id !== appSession.id
                ? session
                : { ...session, canceledAt: new Date() }
        )
    });

    storage.set(historyStorageKey, json);
};
