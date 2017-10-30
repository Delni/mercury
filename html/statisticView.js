const $ = require('jquery');
const fs = require('fs')
const ipc = require('electron').ipcRenderer
const SQL = require('sql.js')
const path = require('path')
const moment = require('moment')
const chartJS = require('chart.js')
const jsonfile = require('jsonfile')
window.$ = $;
global.__basedir = __dirname + "/..";

$.getScript(path.join(global.__basedir,'js/CustomField.class.js'));
$.getScript(path.join(global.__basedir,'js/Database.class.js'));

const globSettings = jsonfile.readFileSync(__basedir + '/settings.json');
global.opt = {
  nbCat: 6,
  period: 'month',
  periodOffset: 0,
  firstDate: moment().startOf('month').format('YYYY-MM-DD'),
  lastDate: moment().endOf('month').format('YYYY-MM-DD'),
  allDates: false,
  order: 's',
  percent: true,
  previous: false,
};

global.config = {
    type: 'doughnut',
    data: {
        datasets: [{
            data: null,
            backgroundColor: [
              'rgba(20, 91, 213, 0.8)',
              'rgba(0, 209, 178, 0.8)',
              'rgba(41, 235, 0, 0.8)',
              'rgba(177, 249, 0, 0.8)',
              'rgba(255, 248, 0, 0.8)',
              'rgba(255, 206, 0, 0.8)',
              'rgba(255, 164, 0, 0.8)',
              'rgba(255, 106, 0, 0.8)',
              'rgba(241, 0, 77, 0.8)',
              'rgba(205, 1, 212, 0.8)',
              'rgba(101, 19, 215, 0.8)',
              'rgba(62, 27, 217, 0.8)',
            ],
            borderWidth : 0,
            label: 'Dataset 1'
        }],
        labels: null
    },
    options: {
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
        },
    }
};

$(document).ready(() => {
  if (!globSettings.lastfile) {
    global.db = new Database(dbPath);
  } else {
    try {
      global.db = new Database(globSettings.lastfile);
    } catch (e) {
      console.warn(e.message);
      global.db = new Database(dbPath);
    }
  }

  $('#option-pane').append(
    $('<div>')
    .append(
      $('<div>').addClass('columns')
      .append(
        $('<span>').addClass('column').text(i18njs('Display: '))
        .append(
          toggleButtons('pie','bar',[['pie-chart',null],['bar-chart',null]],()=>{ change('doughnut')},()=>{change('bar')})
        )
      )
      .append(
        $('<span>').addClass('column').text(i18njs('Order by: '))
        .append(
          toggleButtons('num','alpha',[['sort-numeric-asc',null], ['sort-alpha-asc',null]],() => {
            throwOrderby();
          })
        )
      )
      .append(
        $('<span>').addClass('column').text(i18njs('Legend: '))
        .append(
          toggleButtons('percent','number',[['percent',null],['hashtag',null]],() => {
            throwDisplay();
          })
        )
      )
    )
    .append(
      $('<label>').attr('for','nb-cat').text(i18njs("Category",2)+' (').append($('<span>').attr('id','nb-cat-display').text('6'))
      .append(') :')
    )
    .append(
      $('<input>')
        .attr('type','range')
        .attr('id','nb-cat')
        .attr('value','6')
        .attr('min','3')
        .attr('max','12')
        .attr('oninput','throwVal(this)')
        .addClass('progress')
    )
    .append(
      $('<span>').attr('id','period-select').text(i18njs('Time span: '))
    )
    .append(
      $('<label>').attr('for','append-data').addClass('checkbox')
      .append(
        $('<input>')
        .attr('type','checkbox')
        .attr('id','append-data')
        .attr('onclick','throwPrevious()')
      )
      .append(i18njs('statHelp'))
    )
    .append($('<br>'))
  )
  new CustomField('calendar-check-o','period',
  { options:[
    ['thismonth',i18njs('This Month')],
    ['lastmonth',i18njs('Last Month')],
    ['thisquarter',i18njs('This Quarter')],
    ['lastquarter',i18njs('Last Quarter')],
    ['thisyear',i18njs('This Year')],
    ['lastyear',i18njs('Last Year')],
    ['*',i18njs('All dates')]
  ]
  },'#period-select','select').render()

  $('#period').on('change',() => {
    global.opt.allDates = false;
    const previousVal = $('#append-data').get(0).checked;
    $('#append-data').get(0).checked = false;
    $('input[type="checkbox"]').attr('disabled',false);
    $('label[for="append-data"]').attr('disabled',false);
    switch ($('#period').val()){
      case 'thismonth':
        global.opt.period = 'month';
        global.opt.periodOffset =0;
        $('#append-data').get(0).checked = previousVal;
        break;
      case 'lastmonth':
        global.opt.period = 'month';
        global.opt.periodOffset =1;
        $('#append-data').get(0).checked = previousVal;
        break;
      case 'thisquarter':
        global.opt.period = 'quarter';
        global.opt.periodOffset =0;
        $('#append-data').get(0).checked = previousVal;
        break;
      case 'lastquarter':
        global.opt.period = 'quarter';
        global.opt.periodOffset =1;
        $('#append-data').get(0).checked = previousVal;
        break;
      case 'thisyear':
        global.opt.period = 'year';
        global.opt.periodOffset =0;
        $('#append-data').get(0).checked = previousVal;
        break;
      case 'lastyear':
        global.opt.period = 'year';
        global.opt.periodOffset =1;
        $('#append-data').get(0).checked = previousVal;
        break;
      default:
        global.opt.allDates = true;
        $('input[type="checkbox"]').attr('disabled',true)
        $('label[for="append-data"]').attr('disabled',true)
        break;
    }
    global.opt.firstDate = moment().startOf(global.opt.period).format('YYYY-MM-DD');
    global.opt.lastDate = moment().endOf(global.opt.period).format('YYYY-MM-DD');
    throwPrevious();
  })


  const ctx = $("#myChart");

  updateConfig();


  if(globSettings.theme === 'dark'){
    config.options.legend.labels = {fontColor: 'rgb(237, 237, 237)',}
  }

  global.myChart = new Chart(ctx, config);


  $('#chart-type').on('change', () => {
    const val = $('#chart-type').val();
    $('#chart-type-btn').children().children().removeClass();
    $('#chart-type-btn').children().children().addClass('fa')
    $('#chart-type-btn').children().children().addClass('fa fa-' + val)
    if (val === 'pie-chart') {
      change('doughnut');
    } else {
      change('bar');
    }
  })

  function change(newType) {
    var ctx = $('#myChart');

    // Remove the old chart and all its event handles
    if (myChart) {
      myChart.destroy();
    }

    // Chart.js modifies the object you pass in. Pass a copy of the object so we can use the original object later
    var temp = $.extend(true, {}, config);
    temp.type = newType;
    if (newType==='doughnut') {
      delete temp.options.scales;
    } else {
      temp.options.scales= {
        xAxes: [{display: false}],
      }
    }
    global.config = temp;
    myChart = new Chart(ctx, temp);
  };
})

function throwVal(event) {
  global.opt.nbCat = $(event).val();
  $('#nb-cat-display').text(global.opt.nbCat);
  updateConfig();
  global.myChart.update();
  ipc.send('slider-display',global.opt.nbCat)
}

function throwOrderby(){
  if ($('#alpha').hasClass('is-outlined')) {
    global.opt.order = 's';
  } else {
    global.opt.order = 'category';
  }
  updateConfig();
  global.myChart.update();
}

function throwDisplay(){
  if ($('#number').hasClass('is-outlined')) {
    global.opt.percent = true;
  } else {
    global.opt.percent = false;
  }
  updateConfig();
  global.myChart.update();
}

function throwPrevious(){
  global.opt.previous = $('#append-data').get(0).checked;
  updateConfig();
  global.myChart.update();
}

function updateConfig(){
  let data_db;
  const lowDate  = moment(global.opt.firstDate,'YYYY-MM-DD').subtract(global.opt.periodOffset,global.opt.period).format('YYYY-MM-DD');
  const highDate = moment(global.opt.lastDate,'YYYY-MM-DD').subtract(global.opt.periodOffset,global.opt.period).format('YYYY-MM-DD');
  try {
    if (global.opt.allDates) {
      data_db = global.db.exec(`SELECT * FROM (SELECT category, SUM(amount) as s FROM OPERATION WHERE amount<=0 GROUP BY category ORDER BY s LIMIT ${global.opt.nbCat}) ORDER BY ${global.opt.order} ASC`)
    } else {
      data_db = global.db.exec(`SELECT * FROM (SELECT category, SUM(amount) as s FROM OPERATION WHERE amount<=0 AND date BETWEEN "${lowDate}" AND "${highDate}" GROUP BY category ORDER BY s LIMIT ${global.opt.nbCat}) ORDER BY ${global.opt.order} ASC`)
    }
  } catch (e) {
    console.warn(e);
    data_db = {s: 1, category:'No data to display'}
  }
  const data = [], labels = [];
  let max = 0;
  if(global.opt.percent){
    for (var i = 0; i < data_db.length; i++) {
      max+= -data_db[i].s.toFixed(2);
    }
  }
  for (var i = 0; i < data_db.length; i++) {
    data.push(-data_db[i].s.toFixed(2));
    const legend = global.opt.percent ? (-data_db[i].s.toFixed(2)/max*100).toFixed(2)+'%' : -data_db[i].s.toFixed(2)
    labels.push(((data_db[i].category === "") ? i18njs("Other") : data_db[i].category)+` (${legend})`)
  }
  global.config.data.labels = labels;
  global.config.data.datasets[0].data= data;

  if(global.opt.previous){
    const data_db2=[], data2 = [];
    const lowDate  = moment(global.opt.firstDate,'YYYY-MM-DD').subtract(1+global.opt.periodOffset,global.opt.period).format('YYYY-MM-DD');
    const highDate = moment(global.opt.lastDate,'YYYY-MM-DD').subtract(1+global.opt.periodOffset,global.opt.period).format('YYYY-MM-DD');
    for (var i = 0; i < data_db.length; i++) {
      try {
        data_db2.push(global.db.exec(`SELECT category, SUM(amount) as s FROM OPERATION WHERE amount<=0 AND category="${data_db[i].category}" AND date BETWEEN "${lowDate}" AND "${highDate}" GROUP BY category ORDER BY ${global.opt.order} ASC LIMIT ${global.opt.nbCat}`)[0]);
      } catch (e) {
        console.warn(e);
        data_db2.push({s: 0, category:'data_db[i].category}'});
      }
    }
    for (var i = 0; i < data_db2.length; i++) {
      data2.push(-data_db2[i].s.toFixed(2));
    }
    const dataset2 = {
      data: data2,
      backgroundColor: [
        'rgba(20, 91, 213, 0.5)',
        'rgba(0, 209, 178, 0.5)',
        'rgba(41, 235, 0, 0.5)',
        'rgba(177, 249, 0, 0.5)',
        'rgba(255, 248, 0, 0.5)',
        'rgba(255, 206, 0, 0.5)',
        'rgba(255, 164, 0, 0.5)',
        'rgba(255, 106, 0, 0.5)',
        'rgba(241, 0, 77, 0.5)',
        'rgba(205, 1, 212, 0.5)',
        'rgba(101, 19, 215, 0.5)',
        'rgba(62, 27, 217, 0.5)',
      ],
      borderWidth : 0,
      hoverBorderColor: 'rgba(0,0,0,0)',
      hoverBorderWidth: 10,
      label: 'Dataset 2'
    }
    global.config.data.datasets[1] = dataset2;
  } else {
    if(typeof global.config.data.datasets[1] !== 'undefined'){
       global.config.data.datasets.pop();
    }
  }
}


function toggleButtons(id1,id2,opt, callback1,callback2 = null, color = 'primary'){
  // opt = [[icon1, text1],[icon2,text2]]
  return $('<div>').addClass('control field has-addons')
  .append(
    $('<p>').addClass('control')
    .append(
      $('<a>').addClass('button is-'+color+' btn-type').attr('id',id1)
      .click(() => {
        $('#'+id2).addClass('is-outlined')
        $('#'+id1).removeClass('is-outlined')
        callback1();
      })
      .append(
        $('<span>').addClass((opt[0][0] === null )?'':'icon')
        .append($('<i>').addClass((opt[0][0] === null )? '':'fa fa-'+opt[0][0])
      )
      .append(opt[0][1]))
    )
  )
  .append(
    $('<p>').addClass('control')
    .append(
      $('<a>').addClass('button is-outlined is-'+color+' btn-type').attr('id',id2)
      .click(() => {
        $('#'+id1).addClass('is-outlined')
        $('#'+id2).removeClass('is-outlined')
        if (callback2 === null) {
          callback1();
        } else {
          callback2();
        }
      })
      .append(
        $('<span>').addClass((opt[1][0] === null )?'':'icon')
        .append($('<i>').addClass((opt[1][0] === null )? '':'fa fa-'+opt[1][0])
      )
      .append(opt[1][1]))
    )
  )
}


ipc.on('slider-input',(event,arg) => {
  $('#nb-cat').val(arg).trigger('input');
})

ipc.on('toggle-time-span',(event,args) => {
  const options = document.getElementById('period').options;
  $('#period').val(options[args].value).change();
})


ipc.send('open-report','statisticWin');
