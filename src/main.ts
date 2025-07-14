declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import path from "path";

import Store from "electron-store";
import log from "electron-log/main";

import moment from "moment";

import { subscribeIPC } from "./node/ipc";
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
                mainWindow.webContents.send("closeCurrentSession");
                event.preventDefault();

                return;
            }

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
                mainWindow.webContents.send("closeCurrentSession");
                event.preventDefault();
            }
        }
    );

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);

        mainWindow.webContents.openDevTools();
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

/** Log file name template */
export const logFileTemplate = (date: string) => `${date}.log`;

log.transports.file.level = "error";
log.transports.file.resolvePathFn = (
    { appData, appName }
) =>
    path.join(
        appData,
        appName,
        "logs",
        "error",
        logFileTemplate(today.format("YYYY-MM-DD"))
    );

subscribeIPC(
    ipcMain,
    store
);

ipcMain
    .on(ipcMessages.app.preventClose, (_, value: boolean) => {
        canClose = value;
    })
    ;
