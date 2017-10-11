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
