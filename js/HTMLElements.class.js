let HTMLElements  = {
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
    let options = {
      options : []
    }
    for (var i = 0; i < accountList.length; i++) {
      options.options.push([accountList[i].name, accountList[i].name]);
    }
    return new CustomField('university','filter-account',options,null,'select').generate()
  },

   dateFilter: function(){
    let options =
    {
      options : [
        ['-30','30 last days'],
        ['m','This month'],
        ['-1m','Last month'],
        ['-1t','Last trimester'],
        ['-1y','Last year'],
        ['*','All dates']
      ]
    }
    return new CustomField('calendar-o','filter-date',options,null,'select').generate().attr('value','-30');
  },

   stateFilter: function(){
    let options = {
      options: [
        ['*','All'],
        ['fa fa-circle-o','Registered'],
        ['fa fa-circle','Checked'],
        ['fa fa-check-circle','Verified']
      ]
    }
    return new CustomField('adjust','filter-state',options,null,'select').generate()
  },

   amountFilter: function(){
    let options = {
      options: [
        ['*','Any'],
        ['plus','Collection'],
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
  }
}
