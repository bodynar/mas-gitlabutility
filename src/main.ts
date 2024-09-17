declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import path from "path";

import Store from "electron-store";
import log from "electron-log/main";

import { ErrorInfo } from "react";
import moment from "moment";

import { ipcMessages } from "./shared/ipcMessages";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    app.quit();
}

let canClose = true;

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
        icon: path.join(__dirname, "favicon.ico"),
        autoHideMenuBar: true,
        center: true,
    });

    mainWindow.on(
        "close",
        async event => {
            if (canClose) {
                return;
            }

            event.preventDefault();

            const { response } = await dialog.showMessageBox(
                mainWindow,
                {
                    message: "Are you sure want to exit and terminate current task?",
                    buttons: ["Yes", "No"],
                    title: "Operation in process",
                    type: "warning"
                }
            );

            if (response === 0) {
                mainWindow.destroy();
            }
        }
    );

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });

    mainWindow.maximize();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

const store = new Store();
const today = moment();

log.transports.file.resolvePathFn = ({ appData, appName }) => path.join(appData, appName, `logs/${today.format("YYYY-MM-DD")}-error.log`);

ipcMain
    .on(ipcMessages.store.get, async (event, value) => {
        event.returnValue = store.get(value);
    })
    .on(ipcMessages.store.set, async (_, key, value) => {
        store.set(key, value);
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
    .on(ipcMessages.log.open, async () => {
        shell.openPath(
            log.transports.file.getFile().path
        );
    })
    .on(ipcMessages.app.flash, () => {
        const [window] = BrowserWindow.getAllWindows();

        if (!window.isFocused()) {
            window.once("focus", () => window.flashFrame(false));
            window.flashFrame(true);
        }
    })
    .on(ipcMessages.app.preventClose, (_, value: boolean) => {
        canClose = value;
    })
    ;
