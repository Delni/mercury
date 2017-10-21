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

const substringMatcher = function(strs) {
  return function(q, cb) {
    var matches, substrRegex;

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
  try {
    global.__chronoChart= new ChronoChart($("#chronoChart"),global.__accounts);
  } catch (e) {
    console.error(e);
  }
  tabToggle($('.tab.is-active').children()[0]);
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

ipc.on('open-recurring',() => {
  tabToggle($('#third').get(0));
})

ipc.on('open-detail',() => {
  tabToggle($('#second').get(0));
})

ipc.on('toggle', (event, args) => {
  switch (args) {
    case 0:
      tabToggle($("#first").get(0));
      break;
    case 1:
      tabToggle($("#second").get(0));
      break;
    case 2:
      tabToggle($("#third").get(0));
      break;
    default:
    tabToggle($("#first").get(0));

  }
})

ipc.on('new-settings',(event,args) => {
  setTimeout(() => {
      if (unsaved) {
          let confirm = ipc.sendSync('warning-reload');
          if (confirm === 0) {
            let saved = ipc.sendSync('save');
            if(saved) location.reload();
          }
      } else {
        location.reload();
      }
  },1000);
})

$.getScript('../js/HTMLEventHandler.js')
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
  const name = $('input[name="a-name"]').val()
  let currency = $('select[name="a-cur"]').val()
  let amount = $('input[name="a-amount"]').val()
  amount = Number((amount === '') ? 0 : amount);
  currency = (currency === null) ? 'money' : currency;
  const account = {
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
  const bAccount = new BankAccount(name, currency, amount, amount, amount)
  global.__accounts.push(bAccount)
  global.db.addAccount(name, currency, amount)
  setTimeout(() => {
    updateAccountsList();
    tabToggle($("#first").get(0));
    try {
      global.__chronoChart= new ChronoChart($("#chronoChart"),global.__accounts);
    } catch (e) {
      console.error(e);
    }
    closeModal();
    $('input[name="a-name"]').val(null)
    $('select[name="a-cur"]').change().val(null)
    $('input[name="a-amount"]').val(null)
    $('#createNewAccount').removeClass('is-loading')
  }, 1000)
  showUnsavedTag();
};

function deleteAccount(obj) {
  const name = $(obj).attr('data')
  const ipcr = (ipc.sendSync('delete-warning', name));
  if (ipcr === 0) {
    global.db.deleteAccount(name);
    removeDiv($(obj).parent());
    updateAccountsList();
    try {
      global.__chronoChart= new ChronoChart($("#chronoChart"),global.__accounts);
    } catch (e) {
      console.error(e);
    }
    tabToggle($("#first").get(0));
    showUnsavedTag();
  }
}

function updateAccountsList(obj = null) {
  $('#account-list').empty()
  $('#op-account').empty()
  $('#filter-account').empty()
  $('#op-account').append($('<option>').attr("disabled", "true").text("Select your account"))
  let accounts;
  global.__accounts = [];
  try {
    accounts = global.db.exec("SELECT * FROM Accounts");
  } catch (e) {
    accounts = [];
  }
  console.log(accounts);
  let tmp = null;
  for (var i = 0; i < accounts.length; i++) {
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
}


function createNewOperation(data) {
  if (!$('#second').parent().hasClass('is-active')) {
    tabToggle($('#second').get(0));
  }
  const account = data.shift();
  global.db.insertOperation(account, data, globSettings.dateFormat);
  updateSQL("#account");
  updateAccountsList();
  try {
    global.__chronoChart.refresh(global.__accounts);
  } catch (e) {
    console.error(e);
  }
  showUnsavedTag();
}

function editOp(event) {
  const id = $(event).attr('data-id');
  const data = [];
  const fields = ['#op-state','#op-date','#op-type','#op-benef','#op-cat','#op-label','#op-amount']
  $('#op-account').val($('#filter-account').val())
  $('tr').removeClass('is-selected')
  $('#op-title').text('Edit operation')
  $('#op-confirm').text('Edit operation')
  $('#op-add-btn').attr('onclick','confirmEdit(this)').attr('data-id',id)
  $('#op-delete').empty().append(
    $('<div>').addClass('level').append(
      $('<a>').addClass('level-left button is-danger is-small')
      .append($('<span>').addClass('icon is-small').append($('<i>').addClass('fa fa-trash')))
      .append($('<span>').text('Delete'))
      .attr('onclick',`deleteOp(${id})`)
    ).append(
      $('<a>').addClass('level-right button is-info is-small')
      .append($('<span>').addClass('icon is-small').append($('<i>').addClass('fa fa-link')))
      .append($('<span>').text('Inherit'))
      .attr('onclick',`inheritOp()`)
    )
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

function inheritOp() {
  const amount = $('#op-amount').val();
  const account = $('#op-account').val();
  const type = $('#op-type').val();
  const benef = $('#op-benef').val();
  const cat = $('#op-cat').val();
  const label = $('#op-label').val();
  const state = $('#btn-icon').attr('class');
  resetOp(globSettings);
  $('#op-amount').val(amount);
  $('#op-account').val(account);
  $('#op-type').val(type);
  $('#op-benef').val(benef);
  $('#op-cat').val(cat);
  $('#op-label').val(label);
  $('#btn-icon').attr('class',state);
}

function confirmEdit(event) {
  const data = getOperationValues(event);
  const id = $(event).attr('data-id');
  global.db.editOperation(id,data,globSettings.dateFormat);
  updateSQL('#account');
  updateAccountsList()
  try {
    global.__chronoChart.refresh(global.__accounts);
  } catch (e) {
    console.error(e);
  }
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
  try {
    global.__chronoChart.refresh(global.__accounts);
  } catch (e) {
    console.error(e);
  }
  showUnsavedTag();
}

function updateSQL(sqlType) {
  switch (sqlType) {
    case "#dashboard":
      ipc.send('tab-update',0);
      break;
    case "#account":
      ipc.send('tab-update',1);
      break;
    case "#reccuring":
      ipc.send('tab-update',2);
      break;
    default:
      ipc.send('tab-update',0)

  }
  if (sqlType === "#dashboard") {
    //TODO
  } else if (sqlType === "#account") {

    const account = $('#filter-account').val();
    let date;
    switch ($('#filter-date').val()) {
      case '-30':
        date = moment().subtract(30,'days');
        break;
      case 'm':
        date = moment().startOf('month');
        break;
      case '-1m':
        date = moment().subtract(1,'month').startOf('month');
        break;
      case '-1q':
        date = moment().startOf('quarter');
        break;
      case '-1y':
        date = moment().startOf('year');
        break;
      default:
        date = moment().subtract(30,'days');

    }
    date = date.format('YYYY-MM-DD');
    const state = $('#filter-state').val();
    const amount = $('#filter-amount').val();
    const resSQL = global.db.updateTable(account, date, state, amount);
    generateTable(resSQL);

  } else if (sqlType === "Filter") {
    //TODO
  } else if (sqlType === "#recurring") {
    //TODO
  }
}




(function() {
  $("#cover").hide();
}());

var force = false;
window.onbeforeunload = function(evt) {
  if (unsaved && !force) {
    setTimeout(() => {
      let saving = ipc.sendSync('warning-onclose')
      if (saving === 0) {
       ipc.send('save');
       window.close();
     } else if (saving === 1){
       force = true;
       window.close();
       ipc.send('quit')
     }
    },1)
    return false
  }
}
