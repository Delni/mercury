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
$.getScript('../js/Mercury.class.js');

global.__basedir = path.join(__dirname, '..');
global.__accounts = new Array();
const dbPath = path.join(__dirname, '..', 'data/template.sqlite');

let globSettings = jsonfile.readFileSync(__basedir + '/settings.json');
let unsaved = false;


// ooooo              o8o      .
// `888'              `"'    .o8
//  888  ooo. .oo.   oooo  .o888oo
//  888  `888P"Y88b  `888    888
//  888   888   888   888    888
//  888   888   888   888    888 .
// o888o o888o o888o o888o   "888"

$(function init() {
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

  // let dateField = new CustomField('calendar','#op-content','op-date', { placeholder : 'Pick a Date'});
  // let amountField =  new CustomField(globSettings.defaultCurrency,'#op-content','op-amount', { placeholder : '0.00'}, 'number')
  // let accountField =  new CustomField('bank','#op-content','op-account', { placeholder : 'Select account'}, 'select')
  // let typeField =  new CustomField('credit-card','#op-content','op-type', { placeholder : 'Select account'}, 'select')
  // let benefField =  new CustomField('building-o','#op-content','op-benef', { placeholder : 'Beneficiary'})
  // let catField =  new CustomField('flag','#op-content','op-cat', { placeholder : 'Category'})
  // let labelField =  new CustomField('tag','#op-content','op-label', { placeholder : 'Label'})
  updateAccountsList();
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

let substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};

var beneficiaries = globSettings.beneficiaries;
var categories = globSettings.categories;
var labels = globSettings.labels;

$('#op-benef.typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 1
}, {
  name: 'beneficiaries',
  source: substringMatcher(beneficiaries)
});

$('#op-cat.typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 1
}, {
  name: 'categories',
  source: substringMatcher(categories)
});

$('#op-label.typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 1
}, {
  name: 'labels',
  source: substringMatcher(labels)
});

// oooooooooooo                                       .
// `888'     `8                                     .o8
//  888         oooo    ooo  .ooooo.  ooo. .oo.   .o888oo
//  888oooo8     `88.  .8'  d88' `88b `888P"Y88b    888
//  888    "      `88..8'   888ooo888  888   888    888
//  888       o    `888'    888    .o  888   888    888 .
// o888ooooood8     `8'     `Y8bod8P' o888o o888o   "888"
//
//
//
// ooooo   ooooo                             .o8  oooo
// `888'   `888'                            "888  `888
//  888     888   .oooo.   ooo. .oo.    .oooo888   888   .ooooo.  oooo d8b
//  888ooooo888  `P  )88b  `888P"Y88b  d88' `888   888  d88' `88b `888""8P
//  888     888   .oP"888   888   888  888   888   888  888ooo888  888
//  888     888  d8(  888   888   888  888   888   888  888    .o  888
// o888o   o888o `Y888""8o o888o o888o `Y8bod88P" o888o `Y8bod8P' d888b
ipc.on('add-account', () => {
  showModal($('a[data-toggle="#createAccount"]'));
})

ipc.on('selected-file', (event, arg) => {
  global.db = new Database(arg);
  globSettings.lastfile = arg;
  jsonfile.writeFile(__basedir + '/settings.json', globSettings, {
    spaces: 2
  }, function(err) {
    if (err != null) {
      console.error(err);
    }
  })
  updateAccountsList();
})

ipc.on('saved-file', (event, arg) => {
  global.db.export(arg);
  globSettings.lastfile = arg;
  jsonfile.writeFile(__basedir + '/settings.json', globSettings, {
    spaces: 2
  }, function(err) {
    if (err != null) {
      console.error(err);
    }
  })
  hideUnsavedTag();
})

ipc.on('open-new-file',() => {
  global.db = new Database(dbPath);
  updateAccountsList();
  tabToggle($('.tab.is-active').children()[0]);
  showUnsavedTag();
  delete globSettings.lastfile;
})


$('#select-cur').on('change', () => {
  let val = $('#select-cur').val();
  $('#selected-cur').removeClass();
  $('#selected-cur').addClass('fa')
  $('#selected-cur').addClass('fa fa-' + val)
})

$('#op-account').on('change', () => {
  let inputAccount = $('#op-account').val()
  let cur = getObjectByName(global.__accounts, inputAccount)._currency
  $('#op-amount-btn').children().children().removeClass()
  $('#op-amount-btn').children().children().addClass("fa")
  $('#op-amount-btn').children().children().addClass("fa-" + cur)
})


$('#op-date').on('change', () => {
  let inputDate = $('#op-date').val()
  console.log('inputDate : ' + inputDate + ' is ' + moment(inputDate, globSettings.dateFormat).isValid());
  if (moment(inputDate, globSettings.dateFormat).isValid()) {
    $('#op-date').removeClass('is-danger')
    $('#op-date-btn').removeClass('is-danger')
    $('#op-date-btn').addClass('is-primary')
    $('#op-add-btn').attr('disabled', false)
  } else {
    $('#op-date').addClass('is-danger')
    $('#op-date-btn').removeClass('is-primary')
    $('#op-date-btn').addClass('is-danger')
    $('#op-add-btn').attr('disabled', true)
  }
})

$('#op-date').keydown(function(event) {
  if (event.keyCode == 38) {
    $('#op-date').val(
      moment(
        moment($('#op-date').val(), globSettings.dateFormat)
        .add(1, 'day'))
      .format(globSettings.dateFormat)
    )
  } else if (event.keyCode == 40) {
    $('#op-date').val(
      moment(
        moment($('#op-date').val(), globSettings.dateFormat)
        .subtract(1, 'day'))
      .format(globSettings.dateFormat)
    )
  }
})

$('#op-type').on('change', () => {
  let val = $('#op-type').val();
  $('#op-type-btn').children().children().removeClass();
  $('#op-type-btn').children().children().addClass('fa')
  $('#op-type-btn').children().children().addClass('fa fa-' + val)
})

function getOperationValues(event) {
  //let settings = jsonfile.readFileSync(__basedir + '/settings.json');
  if (!$(event).attr('disabled')) {
    let date = $('#op-date').val()
    let amount = $('#op-amount').val()
    let account = $('#op-account').val()
    let type = $('#op-type').val()
    let benef = $('#op-benef').val()
    let cat = $('#op-cat').val()
    let label = $('#op-label').val()
    let state = $('#btn-icon').attr('class')
    resetOp(globSettings)
    if (!isInList(benef, globSettings.beneficiaries) && benef != "") {
      globSettings.beneficiaries.push(benef)
    }
    if (!isInList(label, globSettings.labels) && label != "") {
      globSettings.labels.push(label)
    }
    if (!isInList(cat, globSettings.categories) && cat != "") {
      globSettings.categories.push(cat)
    }
    jsonfile.writeFile(__basedir + '/settings.json', globSettings, {
      spaces: 2
    }, function(err) {
      if (err != null) {
        console.error(err);
      }
    })
    return new Array(account,date, state, benef, cat, label, amount, type);
  }
  return null;
}

function addOperation(event) {
  let formValues = getOperationValues(event);
  if (formValues != null) {
    createNewOperation(formValues)
  }
}

$('#op-cancel-btn').on('click', () => {
  resetOp(globSettings)
})


$('#btn-state').on('click', () => {
  let icon = $('#btn-icon')
  if (icon.hasClass('fa-circle-o')) {
    icon.removeClass();
    icon.addClass('fa fa-circle')
  } else if (icon.hasClass('fa-circle')) {
    icon.removeClass();
    icon.addClass('fa fa-check-circle')
  } else if (icon.hasClass('fa-check-circle')) {
    icon.removeClass();
    icon.addClass('fa fa-circle-o')
  }
})


// ooooo     ooo     .    o8o  oooo   o8o      .
// `888'     `8'   .o8    `"'  `888   `"'    .o8
//  888       8  .o888oo oooo   888  oooo  .o888oo oooo    ooo
//  888       8    888   `888   888  `888    888    `88.  .8'
//  888       8    888    888   888   888    888     `88..8'
//  `88.    .8'    888 .  888   888   888    888 .    `888'
//    `YbodP'      "888" o888o o888o o888o   "888"     .8'
//                                                 .o..P'
//                                                 `Y8P'
function helper(msg) {
  $('#helper').text(msg)
}

function isInList(msg, list) {
  for (var i = 0; i < list.length; i++) {
    if (list[i] === msg) {
      return true;
    }
  }
}

function getObjectByName(obj, name) {
  for (var i = 0; i < obj.length; i++) {
    if (obj[i]._name === name) {
      return obj[i]
    }
  }
  return null
}

function resetOp(settings) {
  $('#btn-icon').removeClass();
  $('#btn-icon').addClass('fa fa-circle-o')
  $('#op-date').removeClass('is-danger')
  $('#op-date-btn').removeClass('is-danger')
  $('#op-date-btn').addClass('is-primary')
  $('#op-add-btn').attr('disabled', false)
  $('input[name="op-date"]').val(moment().format(settings.dateFormat))
  $('#op-amount').val(null).change()
  $('#op-type').val('credit-card').change()
  $('#op-benef').val(null).change()
  $('#op-cat').val(null).change()
  $('#op-label').val(null).change()
  $('tr').removeClass('is-selected')
  $('#op-title').text('Operation')
  $('#op-delete').empty()
  $('#op-confirm').text('Add operation')
  $('#op-add-btn').attr('onclick','addOperation(this)')
}

function tabToggle(event) {
  $(".tab").removeClass('is-active');
  $(event).parent().addClass('is-active');
  $('#dash-body').empty();
  let visible = null;
  let sqlType = null;
  if ($(event).attr('data-toggle') === '#dashboard') {
    visible = writeDashBoard();
    sqlType = "#dashboard";
  } else if ($(event).attr('data-toggle') === '#account') {
    visible = writeAccount();
    sqlType = "#account";
  } else if ($(event).attr('data-toggle') === '#recurring') {
    visible = writeRecurring();
    sqlType = "#reccuring";
  }
  $('#dash-body').append(visible);
  updateSQL(sqlType);

  $('#filter-account').on('change', () => {
    if (global.db) {
      updateSQL("#account")
    }
  });
  $('#filter-date').on('change', () => {
    if (global.db) {
      updateSQL("#account")
    }
  });
  $('#filter-state').on('change', () => {
    if (global.db) {
      updateSQL("#account")
    }
  });
  $('#filter-amount').on('change', () => {
    if (global.db) {
      updateSQL("#account")
    }
  });
}

function writeAccount() {
  let html = null;
  if ($('#op-account').children().length<=1) {
    html = $('<div>').addClass('hero-body').append(
      HTMLElements.noData()
    )
  } else {
    html = $('<div>').append(
      HTMLElements.acBar(global.__accounts)
    ).append(
      $('<div>').attr('style', 'max-height:90%; overflow-y: scroll').append(HTMLElements.acTable())
    )
  }
  return html;
}

function writeDashBoard() {
  let html = null;
  if ($('#op-account').children().length<=1) {
    html = $('<div>').addClass('hero-body').append(HTMLElements.noData())
  } else {
    html = $('<div>').append(
      $('<p>').addClass('title').text('DashBoard')
    ).append(
      $('<p>').addClass('subtitle').text('🚧 Work in progress... Please wait update 🚧')
    )
  }
  return html;
}

function writeRecurring() {
  let html = null;
  if ($('#op-account').children().length<=1) {
    html = $('<div>').addClass('hero-body').append(HTMLElements.noData())
  } else {
    html = $('<div>').append(
      $('<p>').addClass('title').text('Recurring Operations')
    ).append(
      $('<p>').addClass('subtitle').text('🚧 Work in progress... Please wait update 🚧')
    )
  }
  return html;
}

function removeDiv(event) {
  $(event).parent().fadeOut();
};

function closeModal() {
  toggleClass($('.modal'), 'is-active')
}

function showModal(event) {
  toggleClass($($(event).attr('data-toggle')), 'is-active')
  $('input[name="a-name"]').focus()
}

function toggleClass(obj, classStr) {
  if (obj.hasClass(classStr)) {
    obj.removeClass(classStr)
  } else {
    obj.addClass(classStr)
  }
};

function generateTable(list) {
  $('#table-sql').empty()
  for (var i = 0; i < list.length; i++) {
    let row = $('<tr>').attr('data-id', list[i][0]).attr('onclick','editOp(this)');
    if (moment(list[i][2], 'YYYY-MM-DD').isAfter(moment())) {
      row.addClass('is-future has-text-grey');
    }
    row.append($('<td>').attr('data', list[i][1]).addClass('has-text-centered').append($('<span>').addClass("icon is-small").append($('<i>').addClass(list[i][1]))));
    row.append($('<td>').attr('data', list[i][2]).addClass('has-text-centered').text(moment(list[i][2], 'YYYY-MM-DD').format(globSettings.dateFormat)));
    row.append($('<td>').attr('data', list[i][3]).addClass('has-text-centered').append($('<span>').addClass("icon is-small").append($('<i>').addClass("fa fa-" + list[i][3]))));
    row.append($('<td>').attr('data', list[i][4]).text(list[i][4]));
    row.append($('<td>').attr('data', list[i][5]).text(list[i][5]));
    row.append($('<td>').attr('data', list[i][6]).text(list[i][6]));
    if (list[i][7] <= 0) {
      row.append($('<td>').attr('data', list[i][7]).addClass('has-text-centered').text(list[i][7]).addClass('has-text-danger'));
      row.append($('<td>').addClass('has-text-centered'));
    } else {
      row.append($('<td>').addClass('has-text-centered'));
      row.append($('<td>').attr('data', list[i][7]).addClass('has-text-centered').text(list[i][7]).addClass('has-text-success'));
    }
    $('#table-sql').append(row)
  }
}

function resetFilters() {
  $('#filter-date').val('-30');
  $('#filter-state').val('*');
  $('#filter-amount').val('*');
  updateSQL('#amount');
}

function showUnsavedTag(){
  if(!unsaved) {
    $('#unsaved-tag').append(HTMLElements.unsavedTag());
    unsaved = true;
  }
}
function hideUnsavedTag(){
  $($('#unsaved-tag').children()[0]).fadeOut('slow');
  setTimeout(() => {
      $('#unsaved-tag').empty()
  },1000);
  unsaved = false;
}
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

function createNewAccount() {
  $('#createNewAccount').addClass('is-loading')
  //let data = jsonfile.readFileSync(__basedir + '/data/data.json');
  let name = $('input[name="a-name"]').val()
  let currency = $('select[name="a-cur"]').val()
  let amount = $('input[name="a-amount"]').val()
  amount = Number((amount === '') ? 0 : amount);
  currency = (currency === null) ? 'money' : currency;
  account = {
    "name": name,
    "currency": currency,
    "amount": [{
        "amount": amount,
        "label": "Bank"
      },
      {
        "amount": amount,
        "label": "Today"
      },
      {
        "amount": amount,
        "label": "Future"
      }
    ]
  }
  let bAccount = new BankAccount(name, currency, amount, amount, amount)
  global.__accounts.push(bAccount)
  global.db.addAccount(name, currency, amount)
  setTimeout(() => {
    updateAccountsList();
    closeModal();
    $('input[name="a-name"]').val(null)
    $('select[name="a-cur"]').change().val(null)
    $('input[name="a-amount"]').val(null)
    $('#createNewAccount').removeClass('is-loading')
  }, 1000)
  //tabToggle($('.tab.is-active').children()[0]);
  showUnsavedTag();
  // updateAccountsList(data);
};

function deleteAccount(obj) {
  let name = $(obj).attr('data')
  let ipcr = (ipc.sendSync('delete-warning', name));
  if (ipcr === 0) {
    global.db.deleteAccount(name);
    removeDiv($(obj).parent());
    updateAccountsList();
    showUnsavedTag();
  }
}

function updateAccountsList(obj = null) {
  console.log('----- UPDATE -----')
  $('#account-list').empty()
  $('#op-account').empty()
  $('#filter-account').empty()
  $('#op-account').append($('<option>').attr("disabled", "true").text("Select your account"))
  let accounts;
  try {
    accounts = global.db.exec("SELECT * FROM Accounts");
  } catch (e) {
    accounts = [];
  }
  console.log(accounts);
  let tmp = null;
  for (var i = 0; i < accounts.length; i++) {
    console.log('Creating account named ' + accounts[i].name);
    tmp = BankAccount.clone(accounts[i]);
    tmp.render('#account-list');
    global.__accounts.push(tmp)
    $('#op-account').append(
      $('<option>').attr("value", accounts[i].name).text(accounts[i].name)
    );
    $('#filter-account').append(
      $('<option>').attr("value", accounts[i].name).text(accounts[i].name)
    );
  }
  console.log('------------------')
}


function createNewOperation(data) {
  if (!$('#second').parent().hasClass('is-active')) {
    tabToggle($('#second').get(0));
  }
  let account = data.shift();
  global.db.insertOperation(account, data, globSettings.dateFormat);
  console.log("Creating an Operation on " + account + ": \n" +
    "\t" + data[0] + "\n" +
    "\t" + data[1] + "\n" +
    "\t" + data[2] + "\n" +
    "\t" + data[3] + "\n" +
    "\t" + data[4] + "\n" +
    "\t" + data[5] + "\n" +
    "\t" + data[6] + "\n"
  )
  updateSQL("#account");
  updateAccountsList();
  showUnsavedTag();
}

function editOp(event) {
  let id = $(event).attr('data-id');
  let data = new Array()
  let fields = ['#op-state','#op-date','#op-type','#op-benef','#op-cat','#op-label','#op-amount']
  $('#op-account').val($('#filter-account').val())
  $('tr').removeClass('is-selected')
  $('#op-title').text('Edit operation')
  $('#op-confirm').text('Edit operation')
  $('#op-add-btn').attr('onclick','confirmEdit(this)').attr('data-id',id)
  $('#op-delete').empty().append(
    $('<a>').addClass('button is-danger is-small')
      .append($('<span>').addClass('icon is-small').append($('<i>').addClass('fa fa-trash')))
      .append($('<span>').text('Delete'))
      .attr('onclick',`deleteOp(${id})`)
  )
  for (var i = 0; i < $(event).children().length; i++) {
    data.push($($(event).children()[i]).attr('data'))
    if (i==0) {
      $('#btn-icon').removeClass().addClass($($(event).children()[i]).attr('data'))
    } else if (i==1){
      $(fields[i]).val(moment($($(event).children()[i]).attr('data'),"YYYY-MM-DD").format(globSettings.dateFormat));
    } else if ((i === $(event).children().length-2 || i === ($(event).children().length)-1) && $($(event).children()[i]).attr('data') !== undefined) {
      $(fields[fields.length-1]).val($($(event).children()[i]).attr('data'));
    } else {
      $(fields[i]).val($($(event).children()[i]).attr('data'));
    }
  }
  $(event).addClass('is-selected');
}

function confirmEdit(event) {
  let data = getOperationValues(event);
  let id = $(event).attr('data-id');
  global.db.editOperation(id,data,globSettings.dateFormat);
  updateSQL('#account');
  updateAccountsList()
  showUnsavedTag();
}

function deleteOp(id) {
  let confirm;
  confirm = ipc.sendSync('delete-op-warning');
  if (confirm === 0) {
    global.db.deleteOperation(id);
    updateSQL('#account');
  }
  resetOp(globSettings);
  updateAccountsList();
  showUnsavedTag();
}

function updateSQL(sqlType) {
  if (sqlType === "#dashboard") {
    //TODO
  } else if (sqlType === "#account") {

    let account = $('#filter-account').val();
    let date = moment($('#filter-date').val(), globSettings.dateFormat).format('YYYY-MM-DD');
    let state = $('#filter-state').val();
    let amount = $('#filter-amount').val();
    let resSQL = global.db.updateTable(account, date, state, amount);
    generateTable(resSQL);
  } else if (sqlType === "Filter") {
    //TODO
  } else if (sqlType === "#recurring") {
    //TODO
  }
}

/******************************************************************************/
/******************************************************************************/
/****************************** GARBAGE ***************************************/
/******************************************************************************/
/******************************************************************************/


let myData = {
  labels: [
    01, 02, 03, 04, 05, 06, 07, 08, 09, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    20, 21, 22, 23, 24, 25, 26, 27, 28, 29
  ],
  datasets: [{
    label: '€',
    fill: "bottom",
    data: [
      {x: 1,y: 1}, {x: 2,y: 1}, {x: 3,y: 3}, {x: 4,y: 5}, {x: 5,y: 2}, {x: 6,y: 3}, {x: 7,y: 0}, {x: 8,y: 0}, {x: 9,y: 0}, {x: 10,y: 0},
      {x: 11,y: 0}, {x: 12,y: 0}, {x: 13,y: 0}, {x: 14,y: 0}, {x: 15,y: 0}, {x: 16,y: 0}, {x: 17,y: 5}, {x: 18,y: 0}, {x: 19,y: 0}, {x: 20,y: 0},
      {x: 21,y: 0}, {x: 22,y: 0}, {x: 23,y: 0}, {x: 24,y: 0}, {x: 25,y: 0}, {x: 26,y: 0}, {x: 27,y: 0}, {x: 28,y: 0}, {x: 29,y: 0}
    ],
    backgroundColor: 'rgba(50, 115, 221,0.2)',
    borderColor: '#3273dc',
    borderWidth: 1
  }, {
    label: "Negative area",
    fill: "bottom",
    pointRadius: 0,
    data: [{
        x: 01,
        y: 0
      },
      {
        x: 29,
        y: 0
      }
    ],
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderColor: 'rgba(255, 0, 0, 1)',
    borderWidth: 1
  }, {
    label: "Account 1",
    fill: "bottom",
    data: [{
        x: 8,
        y: 333
      },
      {
        x: 15,
        y: 500
      },
      {
        x: 29,
        y: 0
      }
    ],
    backgroundColor: 'rgba(50, 221, 72, 0.2)',
    borderColor: '#32dd61',
    borderWidth: 1
  }]
};
let ctx = $("#chronoChart")
let myChart = new Chart(ctx, {
  type: 'line',
  data: myData,
  options: {
    scales: {
      xAxes: [{
        time: {
          unit: 'day'
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  }
});
myChart.render()

function rand() {
  myData.datasets.forEach((dataset) => {
    for (var i = 0; i < dataset.data.length; i++) {
      if (dataset.label === '€')
        dataset.data[i].y = Math.floor((Math.random() * (1000 + 400 + 1)) - 400)
    }
  })
  myChart.update();
}

window.setInterval(function() {
  rand();
}, 10000);
