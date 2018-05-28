const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const { ipcMain } = require('electron');
const Menu = electron.Menu
const Tray = electron.Tray

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let appTray = null
let willQuitApp = false

function createTray() {
  const iconName = 'leaf.ico'
  const iconPath = path.join(__dirname, iconName)
  appTray = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([{
    label: '退出',
    click: function () {
      willQuitApp = true
      mainWindow.close()
    }
  }])
  appTray.setToolTip('在托盘中的 Electron 示例.')
  appTray.setContextMenu(contextMenu)

  appTray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600, autoHideMenuBar: true})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('close', (e) => {
    if (willQuitApp) {
      mainWindow = null;
    } else {
      console.log("will hide");
      e.preventDefault();
      mainWindow.hide();
    }
  })
}

// 应用程序准备完成
app.on('ready', () => {
  createTray();
  createWindow();
})


// app.on('before-quit', () => willQuitApp = false);


/**
 * 最小化
 */
ipcMain.on('window-min', function(){
  mainWindow.minimize();
})

/**
 * 最大化
 */
ipcMain.on('window-max', function(){
  if(mainWindow.isMaximized()){
      mainWindow.restore();  
  }else{
      mainWindow.maximize(); 
  }
})

/**
 * 退出程序
 */
ipcMain.on('window-close',function(){
  willQuitApp = true;
  mainWindow.close();
  app.quit();
})

/**
 * 关闭程序到托盘
 */
ipcMain.on('put-in-tray', function (event) {
  mainWindow.hide();
})

/**
 * 消息闪动
 */
var count = 0, flashing=null;
ipcMain.on('start-flashing', function (event) {
  flashing=setInterval(function() {  
    count++;  
    if (count % 2 == 0) {  
      appTray.setImage(path.join(__dirname, 'leaf.ico'));
    } else {  
      appTray.setImage(path.join(__dirname, 'none.ico'));
    }  
  }, 500);
})

/**
 * 取消闪动
 */
ipcMain.on('stop-flashing', function (event) {
  clearInterval(flashing);
  appTray.setImage(path.join(__dirname, 'leaf.ico'));
})

