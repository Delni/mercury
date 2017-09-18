class Mercury {
  constructor(file) {
    this.db = new Database(file)
  }

   createNewAccount() {
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

   deleteAccount(obj) {
    let name = $(obj).attr('data')
    let ipcr = (ipc.sendSync('delete-warning', name));
    if (ipcr === 0) {
      global.db.deleteAccount(name);
      removeDiv($(obj).parent());
      updateAccountsList();
      showUnsavedTag();
    }
  }

   updateAccountsList(obj = null) {
    console.log('----- UPDATE -----')
    $('#account-list').empty()
    $('#op-account').empty()
    $('#filter-account').empty()
    $('#op-account').append($('<option>').attr("disabled", "true").text("Select your account"))
    let accounts = global.db.exec("SELECT * FROM Accounts");
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


   createNewOperation(data) {
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
    showUnsavedTag();
  }

   editOp(event) {
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

   confirmEdit(event) {
    let data = getOperationValues(event);
    let id = $(event).attr('data-id');
    global.db.editOperation(id,data,globSettings.dateFormat);
    updateSQL('#account');
    showUnsavedTag();
  }

   deleteOp(id) {
    let confirm;
    confirm = ipc.sendSync('delete-op-warning');
    if (confirm === 0) {
      global.db.deleteOperation(id);
      updateSQL('#account');
    }
    showUnsavedTag();
  }
}
