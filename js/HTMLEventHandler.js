$('#select-cur').on('change', () => {
  const val = $('#select-cur').val();
  $('#selected-cur').removeClass();
  $('#selected-cur').addClass('fa')
  $('#selected-cur').addClass('fa fa-' + val)
})

$('#op-account').on('change', () => {
  const inputAccount = $('#op-account').val()
  const cur = getObjectByName(global.__accounts, inputAccount)._currency
  $('#op-amount-btn').children().children().removeClass()
  $('#op-amount-btn').children().children().addClass("fa")
  $('#op-amount-btn').children().children().addClass("fa-" + cur)
})


$('#op-date').on('change', () => {
  const inputDate = $('#op-date').val()
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
  inputDate(event);
})


$('#op-type').on('change', () => {
  const val = $('#op-type').val();
  $('#op-type-btn').children().children().removeClass();
  $('#op-type-btn').children().children().addClass('fa')
  $('#op-type-btn').children().children().addClass('fa fa-' + val)
})


$('#op-cancel-btn').on('click', () => {
  resetOp(globSettings)
})


$('#btn-state').on('click', () => {
  const icon = $('#btn-icon')
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

// $('.key-enter').on('keypress',(event) => {
//   if (event.keyCode === 13) {
//     console.log($("#"+$(event.target).lookAncestryFor('key-enter').attr('data')));
//   }
// })
//
// $.extend ($.fn,{
//   lookAncestryFor: function(CSSclass){
//     if(this.hasClass(CSSclass)){
//       return this;
//     } else if (this.parent().is('body')) {
//       return false;
//     } else {
//       return $($(this).parent()).lookAncestryFor(CSSclass);
//     }
//   }
// })

// ooooo     ooo     .    o8o  oooo   o8o      .
// `888'     `8'   .o8    `"'  `888   `"'    .o8
//  888       8  .o888oo oooo   888  oooo  .o888oo oooo    ooo
//  888       8    888   `888   888  `888    888    `88.  .8'
//  888       8    888    888   888   888    888     `88..8'
//  `88.    .8'    888 .  888   888   888    888 .    `888'
//    `YbodP'      "888" o888o o888o o888o   "888"     .8'
//                                                 .o..P'
//                                                 `Y8P'
function getOperationValues(event, target) {
  if (!$(event).attr('disabled')) {
    const date = $('#'+target+'-date').val()
    const amount = $('#'+target+'-amount').val()
    const account = $('#'+target+'-account').val()
    const type = $('#'+target+'-type').val()
    const benef = $('#'+target+'-benef').val()
    const cat = $('#'+target+'-cat').val()
    const label = $('#'+target+'-label').val()
    const state = $('#btn-icon').attr('class')
    resetOp(globSettings)
    if (!isInList(benef, globSettings.beneficiaries) && benef !== "") {
      globSettings.beneficiaries.push(benef)
    }
    if (!isInList(label, globSettings.labels) && label !== "") {
      globSettings.labels.push(label)
    }
    if (!isInList(cat, globSettings.categories) && cat !== "") {
      globSettings.categories.push(cat)
    }
    jsonfile.writeFile(__basedir + '/settings.json', globSettings, {
      spaces: 2
    }, function(err) {
      if (err != null) {
        console.error(err);
      }
    })
    return [account,date, state, benef, cat, label, amount, type];
  }
  return null;
}

function addOperation(event) {
  const formValues = getOperationValues(event, 'op');
  if (formValues != null) {
    createNewOperation(formValues)
  }
}

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
    sqlType = "#recurring";
  }
  $('#dash-body').append(visible);
  if(sqlType==="#dashboard") HTMLElements.topChart();
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
      HTMLElements.dashbody()
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
      HTMLElements.recurrings()
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
  if ($(event).attr('data-toggle') === "#rec-modal") {
    HTMLElements.generateModal($(event).attr('data-type'), global.__accounts);
  } else {
    $('input[name="a-name"]').focus()
  }
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
    const row = $('<tr>').attr('data-id', list[i][0]).attr('onclick','editOp(this)');
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
  updateSQL('#account');
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

function showFilters(){
  alert('🚧 Work in progress... Please wait update 🚧')
}

function inputDate(event) {
  if (event.keyCode === 38) {
    $(event.target).val(
      moment(
        moment($(event.target).val(), globSettings.dateFormat)
        .add(1, 'day'))
      .format(globSettings.dateFormat)
    )
  } else if (event.keyCode === 40) {
    $(event.target).val(
      moment(
        moment($(event.target).val(), globSettings.dateFormat)
        .subtract(1, 'day'))
      .format(globSettings.dateFormat)
    )
  }
}

let contextualMenu = null;
function contextMenu(id){
  let resSQL = global.db.exec(`SELECT account_name,date,offset,timespan,times FROM Recurrings WHERE id=${id}`)[0];
  contextualMenu = new Menu();
  // menu.append({type: 'separator'})
  const nextDate = moment(resSQL.date,'YYYY-MM-DD').add(resSQL.offset,resSQL.timespan).format(globSettings.dateFormat)
  contextualMenu.append(new MenuItem({label: 'Account: '+resSQL.account_name, enabled: false}))
  contextualMenu.append(new MenuItem({label: 'Next: '+nextDate, enabled: false}))
  contextualMenu.append(new MenuItem({label: 'Recurrence: every '+resSQL.offset+' '+resSQL.timespan, enabled: false}))
  if (resSQL.times !== null) {
    contextualMenu.append(new MenuItem({label: 'Left: '+resSQL.times, enabled: false}))
  }
  contextualMenu.append(new MenuItem({type: 'separator'}))
  contextualMenu.append(new MenuItem({label: 'Launch', click(){
    launchPending(id,true);
  }}))
  contextualMenu.append(new MenuItem({label: 'Edit', click(){
    $('tr').removeClass('is-selected');
    $("tr[data-id='"+id+"']").addClass('is-selected');
    showModal($("a[data-type='edit']").get(0));
  }}))
  contextualMenu.append(new MenuItem({label: 'Delete', click(){
    $('tr').removeClass('is-selected');
    $("tr[data-id='"+id+"']").addClass('is-selected');
    deleteRec(true);
  }}))
  contextualMenu.popup(remote.getCurrentWindow());
}
//
// ooooooooo.                         .oooooo.
// `888   `Y88.                      d8P'  `Y8b
//  888   .d88'  .ooooo.   .ooooo.  888      888 oo.ooooo.
//  888ooo88P'  d88' `88b d88' `"Y8 888      888  888' `88b
//  888`88b.    888ooo888 888       888      888  888   888
//  888  `88b.  888    .o 888   .o8 `88b    d88'  888   888
// o888o  o888o `Y8bod8P' `Y8bod8P'  `Y8bood8P'   888bod8P'
//                                                888
//                                               o888o

function bindRecListener() {
  $('#rec-date').keydown(function(event) {
    inputDate(event);
  });
  $('#rec-type').on('change', () => {
    const val = $('#rec-type').val();
    $('#rec-type-btn').children().children().removeClass();
    $('#rec-type-btn').children().children().addClass('fa')
    $('#rec-type-btn').children().children().addClass('fa fa-' + val)
  });
  $('#rec-account').on('change', () => {
    const inputAccount = $('#rec-account').val()
    const cur = getObjectByName(global.__accounts, inputAccount)._currency
    $('#rec-amount-btn').children().children().removeClass()
    $('#rec-amount-btn').children().children().addClass("fa")
    $('#rec-amount-btn').children().children().addClass("fa-" + cur)
  });
  $('#rec-benef').parent().parent().addClass('is-36h');
  $('#rec-cat').parent().parent().addClass('is-36h');
  $('#rec-label').parent().parent().addClass('is-36h');
  $('#rec-benef').addClass('typeahead');
  $('#rec-cat').addClass('typeahead');
  $('#rec-label').addClass('typeahead');
  $('#rec-type').change()

  $('#rec-benef.typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  }, {
    name: 'beneficiaries',
    source: substringMatcher(globSettings.beneficiaries)
  });

  $('#rec-cat.typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  }, {
    name: 'categories',
    source: substringMatcher(globSettings.categories)
  });

  $('#rec-label.typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  }, {
    name: 'labels',
    source: substringMatcher(globSettings.labels)
  });
}

function fillEditModal() {
    $('#rec-date').val(moment($($('#recTable > .is-selected').children()[0]).text(),globSettings.dateFormat).format(globSettings.dateFormat))
    $('#rec-type').val($($($($('#recTable > .is-selected').children()[1]).children()[0]).children()[0]).attr("class").substring(6))
    $('#rec-benef').val($($('#recTable > .is-selected').children()[2]).text())
    $('#rec-cat').val($($('#recTable > .is-selected').children()[3]).text())
    $('#rec-label').val($($('#recTable > .is-selected').children()[4]).text())
    $('#rec-amount').val($($('#recTable > .is-selected').children()[5]).text())
    const id = $('#recTable > .is-selected').attr('data-id');
    let resSQL = global.db.exec(`SELECT account_name,offset,timespan,times FROM Recurrings WHERE id=${id}`)[0];
    if (resSQL.times !== null) {
      $('#do-repeat').get(0).checked = true;
      $('#rec-repeat').val(resSQL.times);
    }
    $('#rec-account').val(resSQL.account_name);
    $('#rec-time-offset').val(resSQL.offset);
    $('#rec-time-span').val(resSQL.timespan)
}

function launchPending(id = null, fromContext=false){
  if (id) {
    global.db.launchPending(id);
  } else {
    let offset=$('#offset').val();
    let timespan=$('#timespan').val();
    let upperBound = moment().add(offset,timespan).format('YYYY-MM-DD');
    let operations = global.db.exec(`SELECT id FROM Recurrings WHERE date <="${upperBound}"`)
    $('#modalbody').append(
      $('<progress>').addClass('progress is-danger')
      .attr('value',0)
      .attr('max',operations.length)
      .attr('id','launching-prg')
    )
    for (var i = 0; i < operations.length; i++) {
      global.db.launchPending(operations[i].id);
      $('#launching-prg').attr('value',i+1);
    }
    const options = {
      title: 'Task complete',
      subtitle: `${operations.length} operations have been added !`,
      silent: true
    }
    ipc.send('notification',options);
  }
  if (!fromContext) {
    closeModal();
  }
  try {
    global.__chronoChart.refresh(global.__accounts);
  } catch (e) {
    console.error(e);
  }
  showUnsavedTag();
  tabToggle($('#third').get(0));
}

function getRecurringValues(){
  const date = $('#rec-date').val()
  const amount = $('#rec-amount').val()
  const account = $('#filter-account').val()
  const type = $('#rec-type').val()
  const benef = $('#rec-benef').val()
  const cat = $('#rec-cat').val()
  const label = $('#rec-label').val()
  const isChecked = $('#do-repeat').get(0).checked;
  let times;
  const offset = $('#rec-time-offset').val();
  const timespan = $('#rec-time-span').val();
  if(isChecked){
    times = $('#rec-repeat').val();
  } else {
    times = null;
  }
  return [account,amount,type,benef,cat,label,date,offset,timespan,times]
}

function createNewRecurringOperation() {
  const data = getRecurringValues();
  const account = data.shift();
  global.db.insertRecurringOperation(account,data,globSettings.dateFormat)
  showUnsavedTag();
  closeModal();
  tabToggle($('#third').get(0));
}

function editRecurringOperation() {
  const data = getRecurringValues();
  const account = data.shift();
  const id = $('#recTable > .is-selected').attr('data-id');
  global.db.editRecurringOperation(id,account,data,globSettings.dateFormat)
  showUnsavedTag();
  closeModal();
  tabToggle($('#third').get(0));
}

function deleteRec(fromContext = false) {
  const options = {
    type: 'warning',
    title: 'Warning !',
    message: `You are about to delete an operation.\n\nAre you sure?`,
    buttons: ['Continue', 'Cancel']
  }
  let confirm = ipc.sendSync('warning',options);
  if (confirm === 0) {
    const id = Number($('#recTable > .is-selected').attr('data-id'));
    console.log(id);
    global.db.deleteRec(id)
    removeDiv($('#recTable > .is-selected').children()[0]);
    if (!fromContext) {
      closeModal();
    }
    showUnsavedTag();
  } else {
    tabToggle($('#third').get(0));
  }
}

function generateRecTable() {
  $('#recTable').empty();
  let resSQL = global.db.exec('SELECT id,date,type,beneficiary,category,label,amount FROM Recurrings ORDER BY date ASC');
  for (var i = 0; i < resSQL.length; i++) {
    const row = $('<tr>').attr('data-id', resSQL[i].id).attr('onclick','selectRecOp(this)').attr('oncontextmenu',`contextMenu(${resSQL[i].id})`);
    row.append($('<td>').attr('data',null).addClass('has-text-centered').text(moment(resSQL[i].date,'YYYY-MM-DD').format('DD/MM/YYYY')))
    row.append($('<td>').attr('data',null).addClass('has-text-centered').append(
      $('<span>').addClass('icon').append($('<i>').addClass('fa fa-'+resSQL[i].type))
    ))
    row.append($('<td>').attr('data',null).addClass('has-text-centered').text(resSQL[i].beneficiary))
    row.append($('<td>').attr('data',null).addClass('has-text-centered').text(resSQL[i].category))
    row.append($('<td>').attr('data',null).addClass('has-text-centered').text(resSQL[i].label))
    row.append($('<td>').attr('data',null).addClass('has-text-centered '+(resSQL[i].amount < 0 ? 'has-text-danger':'has-text-success')).text(resSQL[i].amount))
    // row.append($('<td>').attr('data',null).addClass('has-text-centered')
    // .append($('<a>').addClass('button is-info is-outlined').attr('onmouseenter',`contextMenu(${resSQL[i].id})`)
    // .append($('<span>').addClass('icon is-small').append($('<i>').addClass('fa fa-info-circle')))
    // ))
    $('#recTable').append(row)
  }
}
