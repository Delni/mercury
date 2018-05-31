'use strict'

import { app, BrowserWindow, Notification, Menu, dialog, TouchBar, ipcMain } from 'electron'
import * as path from 'path'
import * as url from 'url'
import * as i18njs from 'i18njs'

const {
  TouchBarLabel,
  TouchBarButton,
  TouchBarSpacer,
  TouchBarPopover,
  TouchBarSlider,
  TouchBarSegmentedControl
} = TouchBar
const jsonfile = require('jsonfile')

let filePath = ''
let authorizeDev = true
let isDev = true

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__static, '/static').replace(/\\/g, '\\\\')
}

const globSettings = jsonfile.readFileSync(`${__static}/settings.json`)
const pjson = require('../../package.json')
const lang = jsonfile.readFileSync(`${__static}/lang/${globSettings.language}_.json`)

i18njs.add(globSettings.language, '', lang)
i18njs.setLang(globSettings.language)

let mainWindow, splash
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__static}/index.html`

const template = [{
  label: i18njs.get('.MAIN.MENU.FILE.DEFAULT'),
  submenu: [{
    label: i18njs.get('.MAIN.MENU.FILE.NEW_FILE'),
    accelerator: 'CmdOrCtrl+N',
    click () { newfile() }
  }, {
    label: i18njs.get('.MAIN.MENU.FILE.OPEN'),
    accelerator: 'CmdOrCtrl+O',
    click () { openfile(() => {}) }
  }, {
    label: i18njs.get('.MAIN.MENU.FILE.SAVE'),
    accelerator: 'CmdOrCtrl+S',
    click () {
      simpleSave()
    }
  }, {
    label: i18njs.get('.MAIN.MENU.FILE.SAVE_AS'),
    accelerator: 'CmdOrCtrl+Shift+S',
    click () { saveAs() }
  }, {
    type: 'separator'
  }, {
    label: i18njs.get('.MAIN.MENU.FILE.SETTINGS'),
    accelerator: 'CmdOrCtrl+,',
    click () {
      exports.openSettingWindow()
    }
  }, {
    type: 'separator'
  }, {
    role: 'quit'
  }]
}, {
  role: 'editMenu'
}, {
  label: i18njs.get('.MAIN.MENU.REPORTS.DEFAULT'),
  submenu: [{
    label: i18njs.get('.MAIN.MENU.REPORTS.TIME'),
    accelerator: 'Alt+T',
    icon: path.join(__static, '/assets/img/fa-area-chart_16.png'),
    click () {
      exports.openChronoWindow()
    }
  }, {
    label: i18njs.get('.MAIN.MENU.REPORTS.STATISTIC'),
    accelerator: 'Alt+S',
    icon: path.join(__static, '/assets/img/fa-pie-chart_16.png'),
    click () {
      exports.openStatisticWindow()
    }
  }, {
    label: i18njs.get('.MAIN.MENU.REPORTS.BALANCE'),
    accelerator: 'Alt+B',
    icon: path.join(__static, '/assets/img/fa-line-chart_16.png'),
    click () {
      exports.openBalanceWindow()
    }
  }]
}, {
  label: i18njs.get('.MAIN.MENU.WINDOWS.DEFAULT'),
  role: 'window',
  submenu: [{
    role: 'reload'
  }, {
    role: 'minimize'
  }, {
    role: 'togglefullscreen'
  }, {
    role: 'close'
  }]
}, {
  role: 'help',
  submenu: [
    {
      label: i18njs.get('.MAIN.MENU.HELP.LEARN'),
      click () { require('electron').shell.openExternal('https://electron.atom.io') }
    }]
}]

if (authorizeDev) {
  template.push({
    label: i18njs.get('.MAIN.MENU.ABOUT.DEFAULT'),
    submenu: [{
      label: i18njs.get('.MAIN.MENU.ABOUT.VERSION') + pjson.version,
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
      click () {
        isDev = !isDev
      }
    }]
  })
}
if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {
        label: i18njs.get('.MAIN.MENU.ABOUT.DEFAULT'),
        role: 'about'
      },
      {type: 'separator'},
      {
        label: i18njs.get('.MAIN.MENU.FILE.SETTINGS'),
        accelerator: 'CmdOrCtrl+,',
        click () {
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
  })
  template[1].submenu.pop()
  template[1].submenu.pop()
  template[1].submenu.pop()
}

const settingTBButton = new TouchBarButton({
  backgroundColor: '#3272dd',
  icon: path.join(__static, '/assets/img/fa-sliders_16.png'),
  click () {
    exports.openSettingWindow()
  }
})

const chronoTBButton = new TouchBarButton({
  backgroundColor: '#00d1b2',
  icon: path.join(__static, '/assets/img/fa-area-chart_16.png'),
  click () {
    exports.openChronoWindow()
  }
})

const statisticTBButton = new TouchBarButton({
  backgroundColor: '#ffdd57',
  icon: path.join(__static, '/assets/img/fa-pie-chart_16.png'),
  click () {
    exports.openStatisticWindow()
  }
})

const balanceTBButton = new TouchBarButton({
  backgroundColor: '#ff3860',
  icon: path.join(__static, '/assets/img/fa-line-chart_16.png'),
  click () {
    exports.openBalanceWindow()
  }
})

const openTBPopover = new TouchBarPopover({
  icon: path.join(__static, '/assets/img/fa-bars_16.png'),
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
    new TouchBarLabel({label: i18njs.get('.MAIN.TOUCHBAR.TABS.DASHBOARD')}),
    new TouchBarLabel({label: i18njs.get('.MAIN.TOUCHBAR.TABS.ACCOUNTS')}),
    new TouchBarLabel({label: i18njs.get('.MAIN.TOUCHBAR.TABS.RECURRINGS')})
  ],
  change (selectedIndex) {
    mainWindow.webContents.send('toggle', selectedIndex)
  }
})

function createWindow () {
  // Initial window options
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1270,
    icon: path.join(__static, '/icons/png/Round/64x64.png'),
    backgroundColor: '#282c34',
    titleBarStyle: 'hidden',
    show: false
  })

  splash = new BrowserWindow({
    width: 350,
    height: 400,
    transparent: true,
    backgroundColor: '#282c34',
    frame: false,
    alwaysOnTop: false
  })

  splash.loadURL(url.format({
    pathname: path.join(__static, 'html/splash.html'),
    protocol: 'file:',
    title: 'Mercury',
    slashes: true
  }))

  mainWindow.loadURL(winURL)

  const mainTBar = new TouchBar([
    openTBPopover,
    new TouchBarSpacer({size: 'flexible'}),
    tabTBButton,
    new TouchBarSpacer({size: 'flexible'})
  ])
  mainWindow.setTouchBar(mainTBar)

  ipcMain.on('tab-update', (event, args) => {
    mainTBar.items['9'].selectedIndex = args
  })

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      mainWindow.show()
      splash.destroy()
    }, 2500)
  })

  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
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
    // menu = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  app.setVersion(pjson.version)
  createWindow()
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('before-quit', (event) => {
  if (global.preventClose) {
    event.preventDefault()
  }
})

let swin = null
let chronoWin = null
let statisticWin = null
let balanceWin = null

exports.openSettingWindow = function () {
  const settingsWinURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/settings.html`
    : `file://${__static}/settings.html`
  if (swin === null) {
    swin = new BrowserWindow({
      background: true,
      frame: false,
      width: 825,
      minWidth: 300,
      height: 600,
      backgroundColor: '#282c34',
      icon: path.join(__static, '/icons/png/Round/64x64.png')
    })
    swin.loadURL(settingsWinURL)
    swin.setTouchBar(new TouchBar([
      openTBPopover
    ]))
    swin.on('closed', () => {
      swin = null
    })
  } else if (swin.isFocused()) {
    swin.close()
  } else {
    swin.focus()
  }
}

exports.openChronoWindow = function () {
  const chronoWinURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/chrono-view.html`
    : `file://${__static}/chrono-view.html`
  if (chronoWin === null) {
    chronoWin = new BrowserWindow({
      background: true,
      frame: false,
      width: 1100,
      height: 650,
      backgroundColor: '#282c34',
      icon: path.join(__static, '/icons/png/Round/64x64.png')
    })
    chronoWin.loadURL(chronoWinURL)
    chronoWin.setTouchBar(new TouchBar([
      openTBPopover
    ]))
    chronoWin.on('closed', () => {
      chronoWin = null
    })
  } else if (chronoWin.isFocused()) {
    chronoWin.close()
  } else {
    chronoWin.focus()
  }
}

exports.openStatisticWindow = function () {
  const statisticTBar = new TouchBar([
    openTBPopover,
    new TouchBarSpacer({size: 'large'}),
    new TouchBarSlider({
      label: i18njs.get('.MAIN.TOUCHBAR.STATS.CATEGORIES'),
      value: 6,
      minValue: 3,
      maxValue: 12,
      change (newValue) { statisticWin.webContents.send('slider-input', newValue) }
    }),
    new TouchBarSpacer({size: 'large'}),
    new TouchBarPopover({
      label: i18njs.get('.MAIN.TOUCHBAR.STATS.TIME_SPAN'),
      items: [
        new TouchBarSegmentedControl({
          segments: [
            new TouchBarLabel({label: i18njs.get('.COMMON.TIME.TM')}),
            new TouchBarLabel({label: i18njs.get('.COMMON.TIME.LM')}),
            new TouchBarLabel({label: i18njs.get('.COMMON.TIME.TQ')}),
            new TouchBarLabel({label: i18njs.get('.COMMON.TIME.LQ')}),
            new TouchBarLabel({label: i18njs.get('.COMMON.TIME.TY')}),
            new TouchBarLabel({label: i18njs.get('.COMMON.TIME.LY')}),
            new TouchBarLabel({label: i18njs.get('.COMMON.TIME.*')})
          ],
          change (selectedIndex) {
            statisticWin.webContents.send('toggle-time-span', selectedIndex)
          }
        })
      ]
    })
  ])

  if (statisticWin === null) {
    const statisticWinURL = process.env.NODE_ENV === 'development'
      ? `http://localhost:9080/statistic-view.html`
      : `file://${__static}/statistic-view.html`
    statisticWin = new BrowserWindow({
      background: true,
      frame: false,
      width: 1015,
      height: 600,
      backgroundColor: '#282c34',
      icon: path.join(__static, '/icons/png/Round/64x64.png')
    })
    statisticWin.loadURL(statisticWinURL)
    statisticWin.setTouchBar(statisticTBar)
    statisticWin.on('closed', () => {
      statisticWin = null
    })
  } else if (statisticWin.isFocused()) {
    statisticWin.close()
  } else {
    statisticWin.focus()
  }
  ipcMain.on('slider-display', (event, args) => {
    statisticTBar.items['13'].value = Number(args)
  })
}

exports.openBalanceWindow = function () {
  const balanceWinURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/balance-view.html`
    : `file://${__static}/balance-view.html`
  if (balanceWin === null) {
    balanceWin = new BrowserWindow({
      background: true,
      frame: false,
      width: 1000,
      height: 600,
      backgroundColor: '#282c34',
      icon: path.join(__static, '/icons/png/Round/64x64.png')
    })
    balanceWin.loadURL(balanceWinURL)
    balanceWin.setTouchBar(new TouchBar([
      openTBPopover
    ]))
    balanceWin.on('closed', () => {
      balanceWin = null
    })
  } else if (balanceWin.isFocused()) {
    balanceWin.close()
  } else {
    balanceWin.focus()
  }
}

ipcMain.on('open-file', (event) => {
  openfile((file) => {
    event.returnValue = file
  })
})

ipcMain.on('file-to-save', (event, args) => {
  filePath = args
})

ipcMain.on('action-trigger', (event, args) => {
  switch (args) {
    case 'open-swin':
      exports.openSettingWindow()
      break
    case 'open-chronowin':
      exports.openChronoWindow()
      break
    case 'open-piewin':
      exports.openStatisticWindow()
      break
    case 'open-balancewin':
      exports.openBalanceWindow()
      break
    default:
      mainWindow.webContents.send(args)
      break
  }
})

ipcMain.on('new-settings', (event, args) => {
  mainWindow.webContents.send('new-settings', args)
})

ipcMain.on('save', (event, arg) => {
  simpleSave()
  if (arg) {
    setTimeout(app.quit, 100)
  }
  event.returnValue = true
})

ipcMain.on('quit', (event) => {
  app.quit()
})

ipcMain.on('warning', (event, args) => {
  dialog.showMessageBox(mainWindow, args, function (index) {
    event.returnValue = index
  })
})

ipcMain.on('open-report', (event, args) => {
  if (globSettings.displayHelpers || globSettings.displayHelpers === 'undefined') {
    let displayWindow = null
    switch (args) {
      case 'balanceWin':
        displayWindow = balanceWin
        break
      case 'chronoWin':
        displayWindow = chronoWin
        break
      case 'statisticWin':
        displayWindow = statisticWin
        break
      default:
        displayWindow = mainWindow
    }
    const options = {
      type: 'info',
      title: ('Before you continue ...'),
      message: (`You should save before opening report`),
      detail: (`The info displayed are the most accurate only if all data are saved`),
      checkboxLabel: (`Don't show this again`)
    }
    dialog.showMessageBox(displayWindow, options, function (response, checkboxChecked) {
      if (checkboxChecked) {
        globSettings.displayHelpers = false
        jsonfile.writeFile(`${__static}/settings.json`, globSettings, {
          spaces: 2
        }, function (err) {
          if (err != null) {
            console.error(err)
          }
        })
      }
    })
  }
})

ipcMain.on('notification', (event, args) => {
  new Notification(args).show()
})

ipcMain.on('set-prevent-close', (event, args) => {
  global.preventClose = args
})

function newfile () {
  filePath = ''
  mainWindow.webContents.send('open-new-file')
}

function openfile (callback) {
  dialog.showOpenDialog(mainWindow, {
    filters: [{name: 'Mercury Files', extensions: ['mcy']}],
    properties: ['openFile'],
    message: ('Choose your Mercury file')
  }, function (files) {
    if (files) {
      mainWindow.webContents.send('selected-file', files[0])
      filePath = files[0]
      callback(files[0])
    }
  })
}

function simpleSave () {
  if (filePath === '') {
    saveAs()
  } else {
    console.log('Saving in ' + filePath)
    mainWindow.webContents.send('saved-file', filePath)
  }
}

function saveAs () {
  const options = {
    title: ('Save your data'),
    filters: [
      { name: 'Mercury Files', extensions: ['mcy'] }
    ]
  }
  dialog.showSaveDialog(mainWindow, options, function (filename) {
    mainWindow.webContents.send('saved-file', filename)
    filePath = filename
  })
}
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
