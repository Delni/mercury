const {
  BrowserWindow,
  Menu,
  app,
  dialog,
  TouchBar,
  shell,
  ipcMain
} = require('electron')
const {
  TouchBarLabel,
  TouchBarButton,
  TouchBarSpacer,
  TouchBarPopover,
  TouchBarGroup,
  TouchBarSlider,
  TouchBarSegmentedControl
} = TouchBar
const path = require('path')
const url = require('url')
const pjson = require('./package.json')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
global.__basedir = __dirname;
let filePath = "";
let win;
const template = [{
  label: 'File',
  submenu: [{
      label: 'About Mercury'
    }, {
      type: 'separator'
    }, {
      label: 'Settings',
      accelerator: 'CmdOrCtrl+,',
      click() {
        exports.openSettingWindow()
      }
    }, {
      type: 'separator'
    }, {
      label: 'New file',
      accelerator: 'CmdOrCtrl+N',
      click() { newfile() }
    }, {
      label: 'Open',
      accelerator: 'CmdOrCtrl+O',
      click() { openfile(() => {}) }
    }, {
      label: 'Save',
      accelerator: "CmdOrCtrl+S",
      click() {
        if(filePath === "") {
          saveAs();
        } else {
          console.log('Saving in '+filePath);
          win.webContents.send('saved-file', filePath)
        }
      }
    }, {
      label: 'Save As',
      accelerator: 'CmdOrCtrl+Shift+S',
      click() { saveAs()}
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      role: 'quit'
    }]
  },{
    label: 'Reports',
    submenu:[{
        label: 'Time Report',
        accelerator: 'Alt+T',
        icon: 'assets/img/fa-area-chart_16.png',
        click() {
          exports.openChronoWindow();
        }
      },{
        label: 'Statistic Report',
        accelerator: 'Alt+S',
        icon: 'assets/img/fa-pie-chart_16.png',
        click() {
          exports.openStatisticWindow();
        }
      },{
        label: 'Balance Report',
        accelerator: 'Alt+B',
        icon: 'assets/img/fa-line-chart_16.png',
        click() {
          exports.openBalanceWindow();
        }
      }
    ]
  },{
    label: 'Window',
    submenu: [{
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    }, {
      label: 'Toggle fullscreen',
      accelerator: 'CmdOrCtrl+F',
      role: 'togglefullscreen'
    }, {
      label: 'Close Window',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    }]
  }]


const settingTBButton = new TouchBarButton({
  backgroundColor: '#3272dd',
  icon: 'assets/img/fa-sliders_16.png',
  click() {
    exports.openSettingWindow();
  }
})

const chronoTBButton = new TouchBarButton({
  backgroundColor: '#00d1b2',
  icon: 'assets/img/fa-area-chart_16.png',
  click() {
    exports.openChronoWindow();
  }
})

const statisticTBButton = new TouchBarButton({
  backgroundColor: '#ffdd57',
  icon: 'assets/img/fa-pie-chart_16.png',
  click() {
    exports.openStatisticWindow();
  }
})

const balanceTBButton = new TouchBarButton({
  backgroundColor: '#ff3860',
  icon: 'assets/img/fa-line-chart_16.png',
  click() {
    exports.openBalanceWindow();
  }
})

const openTBPopover = new TouchBarPopover({
  icon: 'assets/img/fa-bars_16.png',
  iconPosition: 'left',
  items: [
    settingTBButton,
    chronoTBButton,
    statisticTBButton,
    balanceTBButton
  ]
})


const tabTBButton = new TouchBarSegmentedControl({
  segments: [
    new TouchBarLabel({label: 'Dashboard'}),
    new TouchBarLabel({label: 'Account'}),
    new TouchBarLabel({label: 'Recurring Operations'})
  ],
  change(selectedIndex){
    win.webContents.send('toggle',selectedIndex)
  }
})

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1270,
    icon: path.join(__dirname, '/icons/png/64x64.png'),
    backgroundColor: '#282c34',
    titleBarStyle: 'hidden-inset',
  })

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'html/index.html'),
    protocol: 'file:',
    title: 'Mercury',
    slashes: true
  }))
  const mainTBar = new TouchBar([
    openTBPopover,
    new TouchBarSpacer({size: 'flexible'}),
    tabTBButton,
    new TouchBarSpacer({size: 'flexible'})
  ]);
  win.setTouchBar(mainTBar);

  ipcMain.on('tab-update',(event,args) => {
    mainTBar.items['9'].selectedIndex=args
  })

  win.once('ready-to-show', () => {
    win.show();
  })
  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
    if (typeof swin !== 'undefined' && swin !== null) {
      swin.close()
      swin = null
    }
    if (typeof chronoWin !== 'undefined' && chronoWin !== null) {
      chronoWin.close()
      chronoWin = null
    }
    if (typeof statisticWin !== 'undefined' && statisticWin !== null) {
      statisticWin.close()
      statisticWin = null
    }
    if (typeof balanceWin !== 'undefined' && balanceWin !== null) {
      balanceWin.close()
      balanceWin = null
    }
    menu = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
var swin= null, chronoWin= null, statisticWin= null, balanceWin= null;

exports.openSettingWindow = function() {
  if (swin === null) {
    swin = new BrowserWindow({
      background: true,
      frame: false,
      width: 825,
      minWidth: 300,
      height: 600,
      backgroundColor: '#282c34',
      icon: path.join(__dirname, '/icons/png/64x64.png')
    })
    swin.loadURL(`file://${__dirname}/html/settings.html`)
    swin.setTouchBar(new TouchBar([
      openTBPopover
    ]));
    swin.on('closed',() => {
      swin = null;
    })
  } else if(swin.isFocused()){
    swin.close();
  } else {
    swin.focus();
  }
}

exports.openChronoWindow = function() {
  if (chronoWin === null) {
    chronoWin = new BrowserWindow({
      background: true,
      frame: false,
      width: 1000,
      height: 600,
      backgroundColor: '#282c34',
      icon: path.join(__dirname, '/icons/png/64x64.png')
    })
    chronoWin.loadURL(`file://${__dirname}/html/chronoView.html`)
    chronoWin.setTouchBar(new TouchBar([
      openTBPopover
    ]));
    chronoWin.on('closed',() => {
      chronoWin = null;
    })
  } else if(chronoWin.isFocused()){
    chronoWin.close();
  } else {
    chronoWin.focus();
  }

}


exports.openStatisticWindow = function() {
  const statisticTBar = new TouchBar([
    openTBPopover,
    new TouchBarSpacer({size:'large'}),
    new TouchBarSlider({
      label: 'Category',
      value: 6,
      minValue: 3,
      maxValue: 12,
      change(newValue){ statisticWin.webContents.send('slider-input',newValue)}
    }),
    new TouchBarSpacer({size:'large'}),
    new TouchBarPopover({
      label: 'Time span',
      items: [
        new TouchBarSegmentedControl({
          segments: [
            new TouchBarLabel({label: 'This month'}),
            new TouchBarLabel({label: 'Last month'}),
            new TouchBarLabel({label: 'This quarter'}),
            new TouchBarLabel({label: 'Last quarter'}),
            new TouchBarLabel({label: 'This year'}),
            new TouchBarLabel({label: 'Last year'}),
            new TouchBarLabel({label: 'All Dates'}),
          ],
          change(selectedIndex){
            statisticWin.webContents.send('toggle-time-span',selectedIndex)
          }
        })
      ]
    }),
  ])

  if (statisticWin === null) {
    statisticWin = new BrowserWindow({
      background: true,
      frame: false,
      width: 1000,
      height: 600,
      backgroundColor: '#282c34',
      icon: path.join(__dirname, '/icons/png/64x64.png')
    })
    statisticWin.loadURL(`file://${__dirname}/html/statisticView.html`)
    statisticWin.setTouchBar(statisticTBar);
    statisticWin.on('closed',() => {
      statisticWin = null;
    })
  } else if(statisticWin.isFocused()){
    statisticWin.close();
  } else {
    statisticWin.focus();
  }
  // ipcMain.on('slider-display',(event,args) => {
  //   //statisticTBar.items['13'].value = args
  // })
}

exports.openBalanceWindow = function() {
  if (balanceWin === null) {
    balanceWin = new BrowserWindow({
      background: true,
      frame: false,
      width: 1000,
      height: 600,
      backgroundColor: '#282c34',
      icon: path.join(__dirname, '/icons/png/64x64.png')
    })
    balanceWin.loadURL(`file://${__dirname}/html/balanceView.html`)
    balanceWin.setTouchBar(new TouchBar([
      openTBPopover
    ]));
    balanceWin.on('closed',() => {
      balanceWin = null;
    })
  } else if(balanceWin.isFocused()){
    balanceWin.close();
  } else {
    balanceWin.focus();
  }
}

ipcMain.on('open-file', (event) => {
  openfile((file) => {
    event.returnValue = file;
  });
})

ipcMain.on('delete-warning', (event,args) => {
  const options = {
    type: 'warning',
    title: 'Warning !',
    message: `You are about to delete the account \"${args}\" \n\nAre you sure?`,
    buttons: ['Continue', 'Cancel']
  }
  dialog.showMessageBox(win, options, function (index) {
    event.returnValue = index;
  })
})

ipcMain.on('file-to-save', (event, args) => {
  filePath = args;
})

ipcMain.on('delete-op-warning',(event)=> {
  const options = {
    type: 'warning',
    title: 'Warning !',
    message: `You are about to delete an operation.\n\nAre you sure?`,
    buttons: ['Continue', 'Cancel']
  }
  dialog.showMessageBox(win, options, function (index) {
    event.returnValue = index;
  })
})

ipcMain.on('action-trigger',(event,args) => {
  switch (args) {
    case 'open-swin':
      exports.openSettingWindow();
      break;
    case 'open-chronowin':
      exports.openChronoWindow();
      break;
    case 'open-piewin':
      exports.openStatisticWindow();
      break;
    case 'open-balancewin':
      exports.openBalanceWindow();
      break;
    default:
      win.webContents.send(args);
      break;
  }
})

function newfile() {
  filePath = "";
  win.webContents.send('open-new-file');
}

function openfile(callback) {
  dialog.showOpenDialog(win, {
    filters: [{name : 'Mercury Files', extensions: ['mcy']}],
    properties: ['openFile'],
    message : 'Choose your Mercury file'
  }, function(files) {
    if (files) {
      win.webContents.send('selected-file', files[0]);
      filePath = files[0];
      callback(files[0]);
    }
  })
}

function saveAs() {
  const options = {
    title: 'Save your data',
    filters: [
      { name: 'Mercury Files', extensions: ['mcy'] }
    ]
  };
  dialog.showSaveDialog(win, options, function (filename) {
    win.webContents.send('saved-file', filename)
    filePath = filename;
  })
}
