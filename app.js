const {
  BrowserWindow,
  Notification,
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
const jsonfile = require('jsonfile')
const pjson = require('./package.json')
const i18njs = require('./assets/i18n.min.js')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
global.__basedir = __dirname;
let filePath = "";
let win;
let isDev = false;
let authorizeDev = false;
const globSettings = jsonfile.readFileSync(__basedir + '/settings.json');

const lang = jsonfile.readFileSync(__dirname+'/lang/'+globSettings.language+'.json')

i18njs.translator.add(lang);

const template = [{
  label: i18njs('File'),
  submenu: [{
      label: i18njs('New file'),
      accelerator: 'CmdOrCtrl+N',
      click() { newfile() }
    }, {
      label: i18njs('Open'),
      accelerator: 'CmdOrCtrl+O',
      click() { openfile(() => {}) }
    }, {
      label: i18njs('Save'),
      accelerator: "CmdOrCtrl+S",
      click() {
        simpleSave();
      }
    }, {
      label: i18njs('Save As'),
      accelerator: 'CmdOrCtrl+Shift+S',
      click() { saveAs()}
    }, {
      type: 'separator'
    }, {
        label: i18njs('Settings'),
        accelerator: 'CmdOrCtrl+,',
        click() {
          exports.openSettingWindow()
        }
      }, {
        type: 'separator'
      }, {
      role: 'quit'
    }]
  },{
    role: 'editMenu'
  },{
    label: i18njs('Reports'),
    submenu:[{
        label: i18njs('Time Report'),
        accelerator: 'Alt+T',
        icon: path.join(__dirname,'/assets/img/fa-area-chart_16.png'),
        click() {
          exports.openChronoWindow();
        }
      },{
        label: i18njs('Statistic Report'),
        accelerator: 'Alt+S',
        icon: path.join(__dirname,'/assets/img/fa-pie-chart_16.png'),
        click() {
          exports.openStatisticWindow();
        }
      },{
        label: i18njs('Balance Report'),
        accelerator: 'Alt+B',
        icon: path.join(__dirname,'/assets/img/fa-line-chart_16.png'),
        click() {
          exports.openBalanceWindow();
        }
      }
    ]
  },{
    label: i18njs('Windows'),
    role: 'window',
    submenu: [{
      role: 'reload'
    },{
      role: 'minimize'
    }, {
      role: 'togglefullscreen'
    }, {
      role: 'close'
    }]
  },{
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('https://electron.atom.io') }
      }],
  }]

if (authorizeDev) {
  template.push({
    label: i18njs('About'),
    submenu: [{
      label: i18njs('Version ') + pjson.version,
      type: 'checkbox',
      checked: true,
      enabled: false
    }, {
      type: 'separator'
    }, {
      label: 'Enable DevTools',
      type: 'checkbox',
      checked: isDev,
      role: 'toggledevtools',
      click() {
        isDev = !isDev
      }
    }]
  });
}
if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {
          label: i18njs('Settings'),
          accelerator: 'CmdOrCtrl+,',
          click() {
            exports.openSettingWindow()
          }
        },
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  });
  template[1].submenu.pop();
  template[1].submenu.pop();
  template[1].submenu.pop();
}


const settingTBButton = new TouchBarButton({
  backgroundColor: '#3272dd',
  icon: path.join(__dirname,'/assets/img/fa-sliders_16.png'),
  click() {
    exports.openSettingWindow();
  }
})

const chronoTBButton = new TouchBarButton({
  backgroundColor: '#00d1b2',
  icon: path.join(__dirname,'/assets/img/fa-area-chart_16.png'),
  click() {
    exports.openChronoWindow();
  }
})

const statisticTBButton = new TouchBarButton({
  backgroundColor: '#ffdd57',
  icon: path.join(__dirname,'/assets/img/fa-pie-chart_16.png'),
  click() {
    exports.openStatisticWindow();
  }
})

const balanceTBButton = new TouchBarButton({
  backgroundColor: '#ff3860',
  icon: path.join(__dirname,'/assets/img/fa-line-chart_16.png'),
  click() {
    exports.openBalanceWindow();
  }
})

const openTBPopover = new TouchBarPopover({
  icon: path.join(__dirname,'/assets/img/fa-bars_16.png'),
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
    new TouchBarLabel({label: i18njs('Dashboard')}),
    new TouchBarLabel({label: i18njs('Account')}),
    new TouchBarLabel({label: i18njs('Recurring operations')})
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
    icon: path.join(__dirname, '/icons/png/Round/64x64.png'),
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
      icon: path.join(__dirname, '/icons/png/Round/64x64.png')
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
      icon: path.join(__dirname, '/icons/png/Round/64x64.png')
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
      label: i18njs('Category',2),
      value: 6,
      minValue: 3,
      maxValue: 12,
      change(newValue){ statisticWin.webContents.send('slider-input',newValue)}
    }),
    new TouchBarSpacer({size:'large'}),
    new TouchBarPopover({
      label: i18njs('Time span'),
      items: [
        new TouchBarSegmentedControl({
          segments: [
            new TouchBarLabel({label: i18njs('This Month')}),
            new TouchBarLabel({label: i18njs('Last Month')}),
            new TouchBarLabel({label: i18njs('This Quarter')}),
            new TouchBarLabel({label: i18njs('Last Quarter')}),
            new TouchBarLabel({label: i18njs('This Year')}),
            new TouchBarLabel({label: i18njs('Last Year')}),
            new TouchBarLabel({label: i18njs('All dates')}),
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
      icon: path.join(__dirname, '/icons/png/Round/64x64.png')
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
      icon: path.join(__dirname, '/icons/png/Round/64x64.png')
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

ipcMain.on('file-to-save', (event, args) => {
  filePath = args;
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

ipcMain.on('new-settings',(event,args) => {
  win.webContents.send('new-settings',args);
})

ipcMain.on('save',(event,arg) => {
  simpleSave();
  if (arg) {
    app.quit();
  }
  event.returnValue = true;
})

ipcMain.on('quit',(event) => {
  app.quit();
})

ipcMain.on('warning',(event,args) => {
  dialog.showMessageBox(win, args, function (index) {
    event.returnValue = index;
  })
})

ipcMain.on('open-report',(event,args) => {
  if (globSettings.displayHelpers === false || globSettings.displayHelpers === 'undefined') {
    let displayWindow = null
    switch (args) {
      case 'balanceWin':
      displayWindow = balanceWin;
      break;
      case 'chronoWin':
      displayWindow = chronoWin;
      break;
      case 'statisticWin':
      displayWindow = statisticWin;
      break;
      default:
      displayWindow = win;
    }
    const options = {
      type: 'info',
      title: i18njs('Before you continue ...'),
      message: i18njs(`You should save before opening report`),
      detail: i18njs(`The info displayed are the most accurate only if all data are saved`),
      checkboxLabel: i18njs(`Don't show this again`)
    }
    dialog.showMessageBox(displayWindow, options, function (response,checkboxChecked) {
      if (checkboxChecked) {
        globSettings.displayHelpers = true;
        jsonfile.writeFile(__basedir + '/settings.json', globSettings, {
          spaces: 2
        }, function(err) {
          if (err != null) {
            console.error(err);
          }
        })
      }
    })
  }
})

ipcMain.on('notification', (event,args) => {
  new Notification(args).show();
})

function newfile() {
  filePath = "";
  win.webContents.send('open-new-file');
}

function openfile(callback) {
  dialog.showOpenDialog(win, {
    filters: [{name : 'Mercury Files', extensions: ['mcy']}],
    properties: ['openFile'],
    message : i18njs('Choose your Mercury file')
  }, function(files) {
    if (files) {
      win.webContents.send('selected-file', files[0]);
      filePath = files[0];
      callback(files[0]);
    }
  })
}

function simpleSave(){
  if(filePath === "") {
    saveAs();
  } else {
    console.log('Saving in '+filePath);
    win.webContents.send('saved-file', filePath)
  }
}

function saveAs() {
  const options = {
    title: i18njs('Save your data'),
    filters: [
      { name: 'Mercury Files', extensions: ['mcy'] }
    ]
  };
  dialog.showSaveDialog(win, options, function (filename) {
    win.webContents.send('saved-file', filename)
    filePath = filename;
  })
}
