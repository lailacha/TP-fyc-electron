const { app, BrowserWindow, dialog, ipcMain, Menu, MenuItem, Tray } = require('electron');
const fs = require('fs');

const path = require('node:path');
let mainWindow;
let editorWindow;
let tray = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    mainWindow.webContents.openDevTools();

    const menu = new Menu();

    menu.append(
        new MenuItem({
            label: 'Fichier',
            submenu: [{
                label: 'Sauvegarder',
                accelerator: process.platform === 'darwin' ? 'Alt+Cmd+s' : 'Alt+Shift+s',
                click: () => {
                    console.log('save file');
                },
            }, ],
        }),
    );

    Menu.setApplicationMenu(menu);

    // const template = [{
    //     label: 'File',
    //     submenu: [{
    //             label: 'Open',
    //             accelerator: 'CmdOrCtrl+O',
    //             click() {
    //                 openFile();
    //             },
    //         },
    //         {
    //             label: 'Save',
    //             accelerator: 'CmdOrCtrl+S',
    //             click() {
    //                 saveFile();
    //             },
    //         },
    //         {
    //             label: 'Save As',
    //             accelerator: 'CmdOrCtrl+Shift+S',
    //             click() {
    //                 saveFileAs();
    //             },
    //         },
    //         {
    //             label: 'Quit',
    //             accelerator: 'CmdOrCtrl+Q',
    //             click() {
    //                 app.quit();
    //             },
    //         },
    //     ],
    // }, ];

    // const menu = Menu.buildFromTemplate(template);
    // Menu.setApplicationMenu(menu);
}

function createEditorWindow() {
    editorWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
        frame: false,
        parent: mainWindow,
    });

    editorWindow.loadFile('fileEditor.html');

    editorWindow.on('closed', function() {
        editorWindow = null;
    });
}

function openFile() {
    dialog
        .showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'Text Files', extensions: ['txt'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        })
        .then((result) => {
            if (!result.canceled) {
                const filePath = result.filePaths[0];
                const content = fs.readFileSync(filePath, 'utf-8');
                mainWindow.webContents.send('file-opened', filePath, content);
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

function saveFile() {
    mainWindow.webContents.send('save-file');
}

function saveFileAs() {
    dialog
        .showSaveDialog(mainWindow, {
            filters: [
                { name: 'Text Files', extensions: ['txt'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        })
        .then((result) => {
            if (!result.canceled) {
                const filePath = result.filePath;
                mainWindow.webContents.send('save-file-as', filePath);
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

function createTray() {
    tray = new Tray('./icon-code.png');

    const contextMenu = Menu.buildFromTemplate([{
            label: 'Nouveau Fichier',
            click: () => {
                console.log('Nouveau Fichier...');
            },
        },
        {
            label: 'Sauvegarder',
            click: () => {
                console.log('Sauvegarde...');
            },
        },
        {
            label: 'Paramètres',
            click: () => {
                console.log('Ouverture des Paramètres...');
            },
        },
        { type: 'separator' },
        {
            label: 'Quitter',
            click: () => {
                app.quit();
            },
        },
    ]);

    tray.setToolTip('Éditeur de Code');
    tray.setContextMenu(contextMenu);
}

app.whenReady().then(createWindow).then(createTray);
// .then(createEditorWindow);

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('create-editor-window', () => {
    createEditorWindow();
});