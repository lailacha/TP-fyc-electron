const { app, BrowserWindow, screen } = require('electron');

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
}
