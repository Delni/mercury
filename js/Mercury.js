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
  const currency = $('select[name="a-cur"]').val()
  const amount = $('input[name="a-amount"]').val()
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
  const bAccount = new BankAccount(name, currency, amount, amount, amount);
  global.__accounts.push(bAccount);
  global.db.addAccount(name, currency, amount);
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

function selectRecOp(event){
  if ($(event).hasClass('is-selected')) {
    $('tr').removeClass('is-selected')
  } else {
    $('tr').removeClass('is-selected')
    $(event).addClass('is-selected');
  }
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
  const data = getOperationValues(event,'op');
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
    case "#recurring":
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
    generateRecTable();
  }
}
