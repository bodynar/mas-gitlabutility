// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { ErrorInfo } from "react";

import { ipcMessages } from "./shared/ipcMessages";

contextBridge.exposeInMainWorld("electron", {
    store: {
        get<TValue>(key: string): TValue {
            return ipcRenderer.sendSync(ipcMessages.store.get, key);
        },
        set<TValue>(key: string, value: TValue): void {
            ipcRenderer.send(ipcMessages.store.set, key, value);
        },
        has(key: string): boolean {
            return ipcRenderer.sendSync(ipcMessages.store.has, key);
        },
        remove(key: string): void {
            ipcRenderer.send(ipcMessages.store.remove, key);
        },
    },
    log: {
        error(error: Error, errorInfo: ErrorInfo): void {
            ipcRenderer.send(ipcMessages.log.write, error, errorInfo);
        },
        open(date: string): boolean {
            return ipcRenderer.sendSync(ipcMessages.log.open, date);
        },
    },
    app: {
        flash(): void {
            ipcRenderer.send(ipcMessages.app.flash);
        },
        preventClose(prevent: boolean): void {
            ipcRenderer.send(ipcMessages.app.preventClose, prevent);
        },
        onBeforeAppClose(callback: () => Promise<void>): void {
            ipcRenderer?.on("closeCurrentSession", async function () {
                await callback();
                ipcRenderer.send(ipcMessages.app.closeAfterSave);
            });
        },
        updateLoadingState(state: number, important = false): void {
            ipcRenderer.send(ipcMessages.app.updateLoadingState, state, important);
        }
    }
});

