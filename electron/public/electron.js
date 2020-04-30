const electron = require("electron");
const { ipcMain: ipc } = require("electron-better-ipc");
const { app, BrowserWindow } = electron;
const path = require("path");
const isDev = require("electron-is-dev");
const zmq = require("zeromq");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: { nodeIntegration: true },
  });
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

const sock = zmq.socket("sub");
sock.connect("tcp://192.168.0.107:5555");
sock.subscribe(""); // python zeromq has no topic option
console.log("Subscriber connected to port 5555");

let data;

sock.on("message", (zeromqData) => {
  data = JSON.parse(zeromqData.toString());
  console.log(data);
});

// todo: move
setInterval(() => {
  ipc.callRenderer(mainWindow, "data", data);
}, 1000);
