// .oooooo.                                      .
// d8P'  `Y8b                                   .o8
// 888           .ooooo.  ooo. .oo.    .oooo.o .o888oo  .oooo.o
// 888          d88' `88b `888P"Y88b  d88(  "8   888   d88(  "8
// 888          888   888  888   888  `"Y88b.    888   `"Y88b.
// `88b    ooo  888   888  888   888  o.  )88b   888 . o.  )88b
// `Y8bood8P'  `Y8bod8P' o888o o888o 8""888P'   "888" 8""888P'

const $ = require('jquery');
const fs = require('fs')
const ipc = require('electron').ipcRenderer
const SQL = require('sql.js')
const path = require('path')
const moment = require('moment')
const remote = require('electron').remote
const chartJS = require('chart.js')
const jsonfile = require('jsonfile')
const typeahead = require('typeahead.js')
const app = remote.require('./app.js')

window.$ = $;
$.getScript('../js/BankAccount.class.js');
$.getScript('../js/CustomField.class.js');
$.getScript('../js/Database.class.js');
$.getScript('../js/HTMLElements.class.js');
$.getScript('../js/ChronoChart.class.js');

global.__basedir = path.join(__dirname, '..');
global.__accounts = [];
const dbPath = path.join(global.__basedir, 'data/template.sqlite');

const globSettings = jsonfile.readFileSync(__basedir + '/settings.json');
let unsaved = false;


// ooooo              o8o      .
// `888'              `"'    .o8
//  888  ooo. .oo.   oooo  .o888oo
//  888  `888P"Y88b  `888    888
//  888   888   888   888    888
//  888   888   888   888    888 .
// o888o o888o o888o o888o   "888"

$(function() {
  if (!globSettings.lastfile) {
    global.db = new Database(dbPath);
  } else {
    try {
      global.db = new Database(globSettings.lastfile);
      ipc.send('file-to-save', globSettings.lastfile);
    } catch (e) {
      console.warn(e.message);
      global.db = new Database(dbPath);
    }
  }

  updateAccountsList();
  global.__chronoChart = new ChronoChart($("#chronoChart"), global.__accounts)
  tabToggle($('#first').get(0));
  $('#op-amount-btn').children().children().addClass('fa-' + globSettings.defaultCurrency);
  $('input[name="op-date"]').val(moment().format(globSettings.dateFormat));
  $('#op-account').change();
  // Load Settings
});


// ooooooooooooo                                  ooooo   ooooo
// 8'   888   `8                                  `888'   `888'
//      888      oooo    ooo oo.ooooo.   .ooooo.   888     888
//      888       `88.  .8'   888' `88b d88' `88b  888ooooo888
//      888        `88..8'    888   888 888ooo888  888     888
//      888         `888'     888   888 888    .o  888     888
//     o888o         .8'      888bod8P' `Y8bod8P' o888o   o888o
//               .o..P'       888
//               `Y8P'       o888o

$.getScript('../js/typeaheadHelper.js');

// oooooooooooo                                       .
// `888'     `8                                     .o8
//  888         oooo    ooo  .ooooo.  ooo. .oo.   .o888oo
//  888oooo8     `88.  .8'  d88' `88b `888P"Y88b    888
//  888    "      `88..8'   888ooo888  888   888    888
//  888       o    `888'    888    .o  888   888    888 .
// o888ooooood8     `8'     `Y8bod8P' o888o o888o   "888"
//
// ooooo   ooooo                             .o8  oooo
// `888'   `888'                            "888  `888
//  888     888   .oooo.   ooo. .oo.    .oooo888   888   .ooooo.  oooo d8b
//  888ooooo888  `P  )88b  `888P"Y88b  d88' `888   888  d88' `88b `888""8P
//  888     888   .oP"888   888   888  888   888   888  888ooo888  888
//  888     888  d8(  888   888   888  888   888   888  888    .o  888
// o888o   o888o `Y888""8o o888o o888o `Y8bod88P" o888o `Y8bod8P' d888b
$.getScript('../js/IPCRendererHandler.js');

$.getScript('../js/HTMLEventHandler.js');
//@function    getOperationValues
//@function    addOperation
//@function    helper
//@function    isInList
//@function    getObjectByName
//@function    resetOp
//@function    tabToggle
//@function    writeAccount
//@function    writeDashBoard
//@function    writeRecurring
//@function    removeDiv
//@function    closeModal
//@function    showModal
//@function    toggleClass
//@function    generateTable
//@function    generateRecTable
//@function    resetFilters
//@function    showUnsavedTag
//@function    hideUnsavedTag
//@function    showFilters
//@function    lauchPending


//
// ooo        ooooo
// `88.       .888'
//  888b     d'888   .ooooo.  oooo d8b  .ooooo.  oooo  oooo  oooo d8b oooo    ooo
//  8 Y88. .P  888  d88' `88b `888""8P d88' `"Y8 `888  `888  `888""8P  `88.  .8'
//  8  `888'   888  888ooo888  888     888        888   888   888       `88..8'
//  8    Y     888  888    .o  888     888   .o8  888   888   888        `888'
// o8o        o888o `Y8bod8P' d888b    `Y8bod8P'  `V88V"V8P' d888b        .8'
//                                                                    .o..P'
//                                                                    `Y8P'
//

$.getScript('../js/Mercury.js')
//@function    createNewAccount
//@function    deleteAccount
//@function    updateAccountsList
//@function    createNewOperation
//@function    editOp
//@function    selectRecOp
//@function    inheritOp
//@function    confirmEdit
//@function    deleteOp
//@function    updateSQL



(function() {
  $("#cover").hide();
}());

var force = false;
window.onbeforeunload = function(evt) {
  if (unsaved && !force) {
    setTimeout(() => {
      const options = {
        type: 'warning',
        title: 'Warning !',
        message: `Are you sure to quit ?`,
        detail: `There are some modifications unsaved`,
        buttons: ['Save & Quit', 'Quit', 'Cancel']
      }
      let saving = ipc.sendSync('warning',options);
      if (saving === 0) {
       ipc.send('save',true);
       window.close();
     } else if (saving === 1){
       force = true;
       window.close();
       ipc.send('quit')
     }
    },1)
    return false;
  }
}
