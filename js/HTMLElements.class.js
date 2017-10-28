const HTMLElements  = {

   noData: function(){
    return $('<div>')
    .append($('<p>').addClass("title").text('No data found !'))
    .append(
      $('<p>').addClass("subtitle").text('Add an ')
      .append(
        $('<span>')
          .addClass('has-text-primary link')
          .attr('data-toggle','#createAccount')
          .attr('onclick','showModal(this)')
          .text('account')
      ).append(' to start or ')
      .append(
        $('<span>').addClass('has-text-info link')
          .attr('onclick',"ipc.send('open-file')")
          .text('open a file')
      ).append(' :)')
    )
  },


   unsavedTag: function(){
    return $('<abbr>').attr('title','You have unsaved modification(s)')
      .append(
        $('<span>').addClass('tag is-warning is-small icon is-rounded').text('!')
      )
  },
//       .o.                 oooooooooo.
//      .888.                `888'   `Y8b
//     .8"888.      .ooooo.   888     888  .oooo.   oooo d8b
//    .8' `888.    d88' `"Y8  888oooo888' `P  )88b  `888""8P
//   .88ooo8888.   888        888    `88b  .oP"888   888
//  .8'     `888.  888   .o8  888    .88P d8(  888   888
// o88o     o8888o `Y8bod8P' o888bood8P'  `Y888""8o d888b
   acBar: function(accountList) {
    return $('<nav>')
      .addClass('field is-grouped')
      .attr('id','acBar')
      .append(HTMLElements.accountFilter(accountList))
      .append(HTMLElements.dateFilter())
      .append(HTMLElements.stateFilter())
      .append(HTMLElements.amountFilter())
      .append(HTMLElements.moreFilter())
      .append(HTMLElements.resetFilter())
  },

   accountFilter: function(accountList){
    const options = {
      options : []
    }
    for (var i = 0; i < accountList.length; i++) {
      options.options.push([accountList[i].name, accountList[i].name]);
    }
    return new CustomField('university','filter-account',options,null,'select').generate()
  },

   dateFilter: function(){
    const options =
    {
      options : [
        ['-30','30 last days'],
        ['m','This month'],
        ['-1m','Last month'],
        ['-1q','This quarter'],
        ['-1y','This year'],
        ['*','All dates']
      ]
    }
    return new CustomField('calendar-o','filter-date',options,null,'select').generate().attr('value','-30');
  },

   stateFilter: function(){
    const options = {
      options: [
        ['*','All'],
        ['fa fa-circle-o','Regist.'],
        ['fa fa-circle','Checked'],
        ['fa fa-check-circle','Verified']
      ]
    }
    return new CustomField('adjust','filter-state',options,null,'select').generate()
  },

   amountFilter: function(){
    const options = {
      options: [
        ['*','Any'],
        ['plus','Income'],
        ['minus','Debit']
      ]
    }
    return new CustomField('balance-scale','filter-amount',options,null,'select').generate()
  },

   moreFilter: function(){
    return $('<p>')
      .addClass('control')
      .append(
        $('<a>')
          .addClass('button is-primary')
          .attr('onclick','showFilters()')
          .append(
            $('<span>').addClass("icon")
              .append(
                $('<i>').addClass('fa fa-filter')
              )
          )
      )
  },

   resetFilter: function(){
    return $('<p>')
      .addClass('control')
      .append(
        $('<a>')
          .addClass('button is-primary')
          .attr('onclick','resetFilters()')
          .append(
            $('<span>').addClass("icon")
              .append(
                $('<i>').addClass('fa fa-refresh')
              )
          )
      )
  },


//       .o.                 ooooooooooooo            .o8       oooo
//      .888.                8'   888   `8           "888       `888
//     .8"888.      .ooooo.       888       .oooo.    888oooo.   888   .ooooo.
//    .8' `888.    d88' `"Y8      888      `P  )88b   d88' `88b  888  d88' `88b
//   .88ooo8888.   888            888       .oP"888   888   888  888  888ooo888
//  .8'     `888.  888   .o8      888      d8(  888   888   888  888  888    .o
// o88o     o8888o `Y8bod8P'     o888o     `Y888""8o  `Y8bod8P' o888o `Y8bod8P'

   acTable: function(){
    return $('<table>').addClass('table')
    .append(
      $('<thead>').append(
        $('<tr>')
          .append($('<th>').text('State').addClass('has-text-centered'))
          .append($('<th>').text('Date').addClass('has-text-centered'))
          .append($('<th>').text('Type').addClass('has-text-centered'))
          .append($('<th>').text('Beneficiary'))
          .append($('<th>').text('Category'))
          .append($('<th>').text('Label'))
          .append($('<th>').text('Debit').addClass('has-text-centered'))
          .append($('<th>').text('Collection').addClass('has-text-centered'))
      )
    )
    .append(
      $('<tbody>').attr('id','table-sql')
    )
  },

// //
// oooooooooo.                      oooo         .o8                                          .o8
// `888'   `Y8b                     `888        "888                                         "888
//  888      888  .oooo.    .oooo.o  888 .oo.    888oooo.   .ooooo.   .oooo.   oooo d8b  .oooo888
//  888      888 `P  )88b  d88(  "8  888P"Y88b   d88' `88b d88' `88b `P  )88b  `888""8P d88' `888
//  888      888  .oP"888  `"Y88b.   888   888   888   888 888   888  .oP"888   888     888   888
//  888     d88' d8(  888  o.  )88b  888   888   888   888 888   888 d8(  888   888     888   888
// o888bood8P'   `Y888""8o 8""888P' o888o o888o  `Y8bod8P' `Y8bod8P' `Y888""8o d888b    `Y8bod88P"
// //


  dashbody: function() {
    return $('<div>').addClass('tile ancestor notification is-dark is-paddingless')
    .append(
      $('<div>').addClass('tile is-parent is-vertical').attr('style','padding-bottom:0')
      .append(
        $('<div>').addClass('tile is-child is-vertical notification is-black')
        .append(
          $('<div>').addClass('level is-marginless')
          .append($('<p>').addClass('level-left title is-marginless').text('Top outcome'))
          .append(
            $('<p>').addClass('level-right subtitle is-6 is-marginless')
            .text(moment().subtract(1,'months').format('MMMM YYYY'))
            .attr('style','position: relative; top: 0.35em')
          )
        )
        .append(
          $('<canvas>')
            .attr('id','doughnut')
            .attr('height','340%')
            .attr('style','position:relative; top:-2em')
        )
      )
    )
    .append(
      $('<div>').addClass('tile is-parent is-vertical').attr('style','padding-bottom:0')
      .append(
        $('<div>').addClass('tile is-child is-vertical hero notification is-black')
        .append($('<div>').addClass('level is-marginless')
          .append($('<p>').addClass('title level-item').text('Quick Access'))
        )
        .append(
          $('<div>').addClass('hero-body').attr('style','padding-right: 0;').append(
          $('<ul>')
          .append(HTMLElements.addCustomAction('settings','info','sliders','open-swin'))
          .append(HTMLElements.addCustomAction('chrono Chart','primary','area-chart','open-chronowin'))
          .append(HTMLElements.addCustomAction('recurring operations','success','recycle','open-recurring'))
          .append(HTMLElements.addCustomAction('statistic report','warning','pie-chart','open-piewin'))
          .append(HTMLElements.addCustomAction('balance report','danger','line-chart','open-balancewin'))
          .append(HTMLElements.addCustomAction('account detail','purple','th-list','open-detail'))
        ))
      )
    )
  },

  addCustomAction: function(text,color,icon,ipcmsg){
    return $('<li>').addClass('subtitle is-5')
    .append($('<span>').text("• Open the "))
    .append($('<span>').addClass('has-text-'+color+' link')
      .attr('onclick',"ipc.send('action-trigger','"+ipcmsg+"')")
      .text(text+' ')
    )
    .append($('<span>').addClass('icon has-text-'+color).append($('<i>').addClass('fa fa-'+icon)))
  },

  topChart: function(){
    const ctx = $("#doughnut");
    const firstDateofMonth = moment().subtract(1,'months').startOf('month').format('YYYY-MM-DD');
    const lastDateofMonth = moment().subtract(1,'months').endOf('month').format('YYYY-MM-DD');
    let data_db;
    try {
      data_db = global.db.exec(`SELECT category, SUM(amount) as s FROM OPERATION WHERE amount<=0 AND date BETWEEN "${firstDateofMonth}" AND "${lastDateofMonth}" GROUP BY category ORDER BY s ASC LIMIT 6`)
    } catch (e) {
      console.warn(e);
      data_db = {s: 1, category:'No data to display'}
    }
    const data = [], labels = [];
    let max = 0;
    for (var i = 0; i < data_db.length; i++) {
      max+= -data_db[i].s.toFixed(2);
    }
    for (var i = 0; i < data_db.length; i++) {
      data.push(-data_db[i].s.toFixed(2));
      labels.push(((data_db[i].category === "") ? "Other" : data_db[i].category)+` (${(-data_db[i].s.toFixed(2)/max*100).toFixed(2)}%)`)
    }

    var config = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: data,
                backgroundColor: [
                  'rgba(50, 114, 221, 0.60)',
                  'rgba(0, 209, 178, 0.60)',
                  'rgba(35, 209, 96, 0.60)',
                  'rgba(255, 221, 87, 0.60)',
                  'rgba(255, 56, 96, 0.60)',
                  'rgba(132, 69, 214, 0.60)',
                ],
                borderWidth : 0,
                label: 'Dataset 1'
            }],
            labels: labels
        },
        options: {
          rotation: Math.PI,
          circumference: Math.PI,
          responsive: true,
          legend: {
              position: 'bottom',
          },
          title: {
              display: false
          },
          animation: {
              animateScale: true,
              animateRotate: true
          }
        }
    };

    if(globSettings.theme === 'dark'){
      config.options.legend.labels = {fontColor: 'rgb(237, 237, 237)',}
    }

    let doughnut = new Chart(ctx, config);
  },

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

  recurrings: function(){
    return $('<div>')
    .append(
      $('<p>').addClass('title is-marginless')
      .append(
        $('<span>').addClass('icon is-medium has-text-success')
        .append($('<i>').addClass('fa fa-recycle'))
      )
      .append(' Recurring Operations')
    )
    .append( HTMLElements.recBar())
    .append( HTMLElements.recTable())
  },

  recTable: function(){
    return $('<div>').addClass('notification is-black').attr('style','height: 42vh; max-height:42vh; overflow-y:scroll')
    .append($('<table>').addClass('table')
      // .append(
      //   $('<thead>').append(
      //     $('<tr>')
      //       .append($('<th>').text('Due Date').addClass('has-text-centered'))
      //       .append($('<th>').text('Type').addClass('has-text-centered'))
      //       .append($('<th>').text('Beneficiary').addClass('has-text-centered'))
      //       .append($('<th>').text('Category').addClass('has-text-centered'))
      //       .append($('<th>').text('Label').addClass('has-text-centered'))
      //       .append($('<th>').text('Amount').addClass('has-text-centered'))
      //   )
      // )
      .append(
        $('<tbody>').attr('id','recTable')
      )
    )
  },

  recBar: function() {
    return $('<nav>')
      .addClass('level')
      .append( HTMLElements.createRec())
      .append( HTMLElements.lauchRec())
      .append( HTMLElements.editRec())
      .append( HTMLElements.addModal())
  },

  createRec: function(){
    return $('<div>').addClass('level-item')
    .append(
      $('<a>').addClass('button is-info')
      .attr('data-toggle','#rec-modal')
      .attr('data-type','create')
      .attr('onclick',"showModal(this)")
      .append(
        $('<span>').addClass('icon')
          .append($('<i>').addClass('fa fa-plus-circle'))
      )
      .append($('<span>').text('Create'))
    )
  },

  lauchRec: function(){
    return $('<div>').addClass('level-item')
    .append(
      $('<a>').addClass('button is-large is-danger')
      .attr('data-toggle','#rec-modal')
      .attr('data-type','launch')
      .attr('onclick',"showModal(this)")
      .append(
        $('<span>').addClass('icon is-medium')
          .append($('<i>').addClass('fa fa-rocket'))
      )
      .append($('<span>').text('Launch'))
    )
  },

  editRec: function(){
    return $('<div>').addClass('level-item')
    .append(
      $('<a>').addClass('button is-success')
      .attr('data-toggle','#rec-modal')
      .attr('data-type','edit')
      .attr('onclick',"showModal(this)")
      .append(
        $('<span>').addClass('icon')
          .append($('<i>').addClass('fa fa-pencil'))
      )
      .append($('<span>').text('Edit'))
    )
  },

  addModal: function() {
    return $('<div>').addClass('modal').attr('id','rec-modal')
    .append($('<div>').addClass('modal-background'))
    .append(
      $('<div>').addClass('modal-content').attr('style','width: 60vw')
      .append(
        $('<div>').addClass('notification is-dark')
        .append(
          $('<div>').addClass('media')
          .append($('<div>').addClass('media-left').attr('id','modalicon'))
          .append($('<div>').addClass('media-content').attr('id','modalbody'))
          .append($('<div>').addClass('media-right').append($('<button>').addClass('delete').attr('onclick','closeModal()')))
        )
      )
    )
  },

  generateModal: function(type,accountList = null){
    switch (type) {
      case 'create':
        HTMLElements.createModal(accountList);
        break;
      case 'edit':
        HTMLElements.editModal(accountList);
        break;
      case 'launch':
        HTMLElements.launchModal();
        break;
      default:
    }
    bindRecListener();
  },

  createModal: function(accountList){
    $('#modalicon').empty().append(
      $('<span>').addClass('icon is-large has-text-info').append($('<i>').addClass('fa fa-plus-circle'))
    )
    $('#modalbody').empty();
    $('#modalbody').append(
      $('<p>').addClass('title').text('Create new recurring operation')
    )
    .append(
      $('<div>').addClass('columns')
      .append(
        $('<div>').addClass('content column')
        .append(HTMLElements.datePicker())
        .append(HTMLElements.timeSpanPicker())
        .append(HTMLElements.repeatPicker())
      )
      .append(
        $('<div>').addClass('content column')
        .append(HTMLElements.accountFilter(accountList))
        .append(HTMLElements.typePicker())
        .append(HTMLElements.amountPicker())
      )
      .append(
        $('<div>').addClass('content column')
        .append(HTMLElements.beneficiaryPicker())
        .append(HTMLElements.categoryPicker())
        .append(HTMLElements.labelPicker())
      )
    )
    .append(
      $('<div>').addClass('field')
      .append(
        $('<p>').addClass('control pull-left')
        .append($('<a>').addClass('button is-info').attr('id','rec-create').attr('onclick','createNewRecurringOperation()').text('Create'))
      ).append(
        $('<p>').addClass('control pull-right')
        .append($('<a>').addClass('button is-danger').attr('onclick','closeModal()').text('Cancel'))
      )
    )
    $('#rec-date').val(moment().format(globSettings.dateFormat))
  },

  datePicker: function() {
    return new CustomField('calendar','rec-date',{placeholder: 'Pick a date'},null,'text').generate();
  },

  amountPicker: function() {
    return new CustomField(globSettings.defaultCurrency,'rec-amount',{placeholder: '0.00'},null,'number').generate();
  },

  typePicker: function() {
    let options = {
        options: [
          ['credit-card','Credit Card'],
          ['pencil-square-o','Check'],
          ['money','Cash'],
          ['exchange','Transfer'],
          ['refresh','Internal transfer'],
          ['share','Permanent transfer'],
          ['desktop','Electronic Paiement'],
          ['paypal','PayPal'],
          ['inbox','Deposit'],
          ['bank','Bank charge'],
          ['stop-circle-o','Direct levy'],
        ],
    };
    return new CustomField('credit-card','rec-type',options,null,'select').generate();
  },

  beneficiaryPicker: function(){
    return new CustomField('building-o','rec-benef',{placeholder:'Beneficiary'},null,'text').generate();
  },

  categoryPicker: function(){
    return new CustomField('flag','rec-cat',{placeholder:'Category'},null,'text').generate();
  },

  labelPicker: function(){
    return new CustomField('tag','rec-label',{placeholder:'Label'},null,'text').generate();
  },

  timeSpanPicker: function(){
    return $('<div>').addClass('field has-addons')
    .append(
      $('<div>').addClass('control')
      .append($('<a>').addClass('button is-tag is-primary').append(
        $('<span>').addClass('icon')
        .append($('<i>').addClass('fa fa-retweet'))
      ))
    )
    // .append($('<p>').addClass('help is-marginless').text('Repeat every'))
    .append(
      $('<div>').addClass('control').attr('style','width: 5vw')
      .append(
        $('<input>').addClass('input')
        .attr('id','rec-time-offset')
        .attr('type','number')
        .attr('value',2)
        .attr('min',1)
      )
    )
    .append(
      $('<div>').addClass('control select')
      .append(
        $('<select>').attr('id','rec-time-span')
        .append(
          $('<option>').attr('value','days').text('days')
        )
        .append(
          $('<option>').attr('value','weeks').text('weeks')
        )
        .append(
          $('<option>').attr('value','months').text('months')
        )
        .append(
          $('<option>').attr('value','quarters').text('quarters')
        )
        .append(
          $('<option>').attr('value','years').text('years')
        )
      )
    )
  },

  repeatPicker: function(){
    return $('<div>').addClass('field has-addons')
    .append(
      $('<div>').addClass('control')
      .append(
        $('<a>').addClass('button is-info').append($('<input>').attr('type','checkbox').attr('id','do-repeat'))
      )
    )
    .append(
      $('<div>').addClass('control')
      .append($('<a>').addClass('button is-tag is-black').text('Repeat').attr('style','padding-left: 0.5em'))
    )
    .append(
      $('<div>').addClass('control')
      .append(
        $('<input>').addClass('input')
        .attr('style','width: 4vw')
        .attr('id','rec-repeat')
        .attr('type','number')
        .attr('value',2)
        .attr('min',1)
      )
    )
    .append(
      $('<div>').addClass('control')
      .append('<a>').addClass('button is-tag is-black').text('times')
    )
  },

  editModal: function(accountList){
    $('#modalicon').empty().append(
      $('<span>').addClass('icon is-large has-text-success').append($('<i>').addClass('fa fa-pencil'))
    )
    $('#modalbody').empty();
    if ($('#recTable > .is-selected').get(0) === undefined) {
      $('#modalbody').append(
        $('<p>').addClass('title').text('Edit operation')
      ).append(
        $('<p>').addClass('title is-4').text('No operation selected !')
      )
    } else {
      $('#modalbody').append(
        $('<p>').addClass('title').text('Edit operation')
      ).append(
        $('<div>').addClass('columns')
        .append(
          $('<div>').addClass('content column')
          .append(HTMLElements.datePicker())
          .append(HTMLElements.timeSpanPicker())
          .append(HTMLElements.repeatPicker())
        )
        .append(
          $('<div>').addClass('content column')
          .append(HTMLElements.accountFilter(accountList))
          .append(HTMLElements.typePicker())
          .append(HTMLElements.amountPicker())
        )
        .append(
          $('<div>').addClass('content column')
          .append(HTMLElements.beneficiaryPicker())
          .append(HTMLElements.categoryPicker())
          .append(HTMLElements.labelPicker())
        )
      ).append(
        $('<div>').addClass('field')
        .append(
          $('<p>').addClass('control pull-left')
          .append($('<a>').addClass('button is-success').attr('id','rec-create').attr('onclick','editRecurringOperation()').text('Edit'))
        ).append(
          $('<p>').addClass('control pull-right')
          .append($('<a>').addClass('button is-danger').attr('onclick','closeModal()').text('Cancel'))
        )
        .append(
          $('<p>').addClass('level-item')
          .append($('<a>').addClass('button is-warning').attr('onclick','deleteRec()').text('Delete'))
        )
      )
      fillEditModal();
    }
  },

  launchModal: function(){
    $('#modalicon').empty().append(
      $('<span>').addClass('icon is-large has-text-danger').append($('<i>').addClass('fa fa-rocket'))
    )
    $('#modalbody').empty();
    $('#modalbody').append(
      $('<p>').addClass('title').text('Launch pending operations')
    ).append(
      $('<form>').addClass('field has-addons').attr('style','padding-left:3em').append(
        $('<a>').addClass('button is-warning is-tag control '+ (globSettings.theme === 'dark' ? 'is-outlined':'')).text('Launch pending operations for the next')
      ).append(
        $('<div>').addClass('control').append(
          $('<input>').addClass('input is-warning')
          .attr('id','offset')
          .attr('type','number')
          .attr('value',globSettings.defaultOffset)
          .attr('style','width: 5em')
        )
      ).append(
        $('<div>').addClass('control select is-warning').append(
          $('<select>').attr('id','timespan').append(
            $('<option>').attr('value','day').text('days')
          ).append(
            $('<option>').attr('value','month').text('months')
          ).append(
            $('<option>').attr('value','quarter').text('quarter')
          ).val(globSettings.defaultTimeSpan)
        )
      ).append(
        $('<a>').addClass('control button is-warning '+ (globSettings.theme === 'dark' ? 'is-outlined':'')).append(
          $('<span>').addClass('icon').append($('<i>').addClass('fa fa-rocket'))
        ).attr('onclick','launchPending()')
      )
    ).append(
      $('<hr>')
    )
  }

}
