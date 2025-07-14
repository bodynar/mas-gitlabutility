import { BrowserWindow, IpcMain, shell } from "electron";
import Store from "electron-store";
import log from "electron-log/main";

import { existsSync } from "fs";
import path from "path";

import { ErrorInfo } from "react";

import { ipcMessages } from "@app/shared/ipcMessages";

import { logFileTemplate } from "src/main";

let focusSubscribed = false;

/**
 * Subscribe to channel events
 * @param ipcMain Main channel of events
 * @param store Persistent storage
 */
export const subscribeIPC = (
    ipcMain: IpcMain,
    store: Store<Record<string, unknown>>,
): void => {
    ipcMain
        .on(ipcMessages.store.get, async (event, value) => {
            event.returnValue = store.get(value);
        })
        .on(ipcMessages.store.set, async (_, key, value) => {
            store.set(key, value);
        })
        .on(ipcMessages.store.remove, async (_, key) => {
            store.delete(key);
        })
        .on(ipcMessages.store.has, async (event, key) => {
            event.returnValue = store.has(key);
        })

        .on(ipcMessages.log.write, async (_, error: Error, { componentStack }: ErrorInfo) => {
            log.error(
                `Unhandled error "${error.message}". Stack:`,
                componentStack
            );
        })
        .on(ipcMessages.log.open, async (event, date: string) => {
            const logFolderPath = path.dirname(log.transports.file.getFile().path);

            const pathToLog = path.join(logFolderPath, logFileTemplate(date));

            if (!existsSync(pathToLog)) {
                event.returnValue = false;

                return;
            }

            shell.openPath(
                path.join(
                    logFolderPath,
                    logFileTemplate(date)
                )
            );

            event.returnValue = true;
        })

        .on(ipcMessages.app.flash, async () => {
            const [window] = BrowserWindow.getAllWindows();

            if (window.isFocused()) {
                return;
            }

            window.once("focus", () => window.flashFrame(false));
            window.flashFrame(true);
        })
        .on(ipcMessages.app.closeAfterSave, async () => {
            const [window] = BrowserWindow.getAllWindows();

            window.destroy();
        })
        .on(ipcMessages.app.updateLoadingState, async (_, state, important) => {
            const [window] = BrowserWindow.getAllWindows();

            if (!focusSubscribed) {
                focusSubscribed = true;

                window.on("focus", () => {
                    window.setProgressBar(0);
                });
            }

            if (!window.isFocused() || important) {
                window.setProgressBar(state);
            }
        })
        ;
};
