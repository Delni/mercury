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


   unsavedTag: function(){
    return $('<abbr>').attr('title','You have unsaved modification(s)')
      .append(
        $('<span>').addClass('tag is-warning is-small icon is-rounded').text('!')
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
          $('<div>').addClass('hero-body').append(
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
  }
}
