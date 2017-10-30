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
$.getScript(path.join(global.__basedir,'js/BankAccount.class.js'));

const globSettings = jsonfile.readFileSync(__basedir + '/settings.json');


const colors = [
  {backgroundColor: 'rgba(50, 115, 221,0.2)', borderColor: '#3273dc'},
  {backgroundColor: 'rgba(50, 221, 72, 0.2)', borderColor: '#32dd61'},
  {backgroundColor: 'rgba(221, 188, 50, 0.2)', borderColor: '#d9dd32'},
  //{backgroundColor: 'rgba(221, 50, 50, 0.2)', borderColor: '#dd3232'},
  {backgroundColor: 'rgba(125, 50, 221, 0.2)', borderColor: '#5e32dd'},
];

global.opt = {
  floor: false,
  firstDate: moment().startOf('month').format('YYYY-MM-DD'),
  lastDate: moment().endOf('month').format('YYYY-MM-DD'),
  allDates: false,
};

global.config = {
  type: 'line',
  data: {datasets:[]},
  options: {
    legend: {
      position: 'bottom'
    },
    fill: 'bottom',
    scales: {
      xAxes: [{
        type: "time",
        time: {
          parser: 'DD/MM/YYYY',
          tooltipFormat: 'DD/MM/YYYY'
        },
        scaleLabel: {
          display: true,
          labelString: i18njs('Date')
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: i18njs('Value')
        }
      }],
    }
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

  {
    global.accounts = [];
    try {
      var db_accounts = global.db.exec("SELECT * FROM Accounts");
    } catch (e) {
      db_accounts = [];
    }
    for (var i = 0; i < db_accounts.length; i++) {
      accounts.push(BankAccount.clone(db_accounts[i]));
    }
  }

  $('#option-pane').append(
    $('<div>').addClass('field')
    .append(
      $('<div>').addClass('control')
      .append(
        $('<label>').attr('for','floor-check').addClass('checkbox')
        .append(
          $('<input>')
          .attr('type','checkbox')
          .attr('id','floor-check')
          .attr('onclick','throwFloor()')
        )
        .append(i18njs(' Floor data to 0 '))
      )
    )
    .append(
      $('<span>').attr('id','period-select').text(i18njs('Time span: '))
    )
    .append($('<hr>'))
    .append($('<p>').addClass('subtitle is-5').text(i18njs('Custom time span')))
    .append(
      $('<div>').addClass('field columns')
      .append(
        $('<div>').addClass('control field has-addons column')
        .append(
          $('<div>').addClass('control')
          .append(
            $('<a>').addClass('button is-primary')
            .append(
              $('<span>').addClass('icon')
              .append($('<i>').addClass('fa fa-calendar-minus-o'))
            )
          )
        )
        .append(
          $('<div>').addClass('control')
          .attr('style','width: 70%')
          .append(
            $('<input>').addClass('input')
            .attr('type','text')
            .attr('placeholder',i18njs('Pick a date'))
            .attr('id','fCustomDate')
          )
        )
      )
      .append(
        $('<div>').addClass('control field has-addons column')
        .append(
          $('<div>').addClass('control')
          .append(
            $('<a>').addClass('button is-primary')
            .append(
              $('<span>').addClass('icon')
              .append($('<i>').addClass('fa fa-calendar-plus-o'))
            )
          )
        )
        .append(
          $('<div>').addClass('control')
          .attr('style','width: 70%')
          .append(
            $('<input>').addClass('input')
            .attr('type','text')
            .attr('placeholder',i18njs('Pick a date'))
            .attr('id','lCustomDate')
          )
        )
      )
    )
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
    throwPeriod();
  })

  $('#fCustomDate').keydown(function(event) {
    if (event.keyCode === 38) {
      $('#fCustomDate').val(
        moment(
          moment($('#fCustomDate').val(), globSettings.dateFormat)
          .add(1, 'day'))
        .format(globSettings.dateFormat)
      )
      $('#fCustomDate').change();
    } else if (event.keyCode === 40) {
      $('#fCustomDate').val(
        moment(
          moment($('#fCustomDate').val(), globSettings.dateFormat)
          .subtract(1, 'day'))
        .format(globSettings.dateFormat)
      )
      $('#fCustomDate').change();
    }
  })

  $('#lCustomDate').keydown(function(event) {
    if (event.keyCode === 38) {
      $('#lCustomDate').val(
        moment(
          moment($('#lCustomDate').val(), globSettings.dateFormat)
          .add(1, 'day'))
        .format(globSettings.dateFormat)
      )
      $('#lCustomDate').change();
    } else if (event.keyCode === 40) {
      $('#lCustomDate').val(
        moment(
          moment($('#lCustomDate').val(), globSettings.dateFormat)
          .subtract(1, 'day'))
        .format(globSettings.dateFormat)
      )
      $('#lCustomDate').change();
    }
  })

  $('#fCustomDate').on('change',() => {
    throwCustom();
  });

  $('#lCustomDate').on('change',() => {
    throwCustom();
  });

  const ctx = $("#myChart");

  updateConfig();


  if(globSettings.theme === 'dark'){
    config.options.legend.labels = {fontColor: 'rgb(237, 237, 237)',}
  }

  global.myChart = new Chart(ctx, config);
})

function throwFloor() {
  global.opt.floor = $('#floor-check').get(0).checked;
  updateConfig();
  global.myChart.update();
}

function throwPeriod(){
  const period = $('#period').val();
  opt.allDates = false;
  switch (period) {
    case 'thismonth':
      opt.firstDate = moment().startOf('month').format('YYYY-MM-DD');
      opt.lastDate = moment().endOf('month').format('YYYY-MM-DD');
      break;
    case 'lastmonth':
      opt.firstDate = moment().subtract(1,'month').startOf('month').format('YYYY-MM-DD');
      opt.lastDate = moment().subtract(1,'month').endOf('month').format('YYYY-MM-DD');
      break;
    case 'thisquarter':
      opt.firstDate = moment().startOf('quarter').format('YYYY-MM-DD');
      opt.lastDate = moment().endOf('quarter').format('YYYY-MM-DD');
      break;
    case 'lastquarter':
      opt.firstDate = moment().subtract(1,'quarter').startOf('quarter').format('YYYY-MM-DD');
      opt.lastDate = moment().subtract(1,'quarter').endOf('quarter').format('YYYY-MM-DD');
      break;
    case 'thisyear':
      opt.firstDate = moment().startOf('year').format('YYYY-MM-DD');
      opt.lastDate = moment().endOf('year').format('YYYY-MM-DD');
      break;
    case 'lastyear':
      opt.firstDate = moment().subtract(1,'year').startOf('year').format('YYYY-MM-DD');
      opt.lastDate = moment().subtract(1,'year').endOf('year').format('YYYY-MM-DD');
      break;
    default:
      opt.allDates = true;
  }
  updateConfig();
  global.myChart.update();
}


function throwCustom() {
  opt.firstDate= moment($('#fCustomDate').val(),globSettings.dateFormat).format('YYYY-MM-DD');
  opt.lastDate= moment($('#lCustomDate').val(),globSettings.dateFormat).format('YYYY-MM-DD');
  updateConfig();
  global.myChart.update();
}

function updateConfig() {
  $('#fCustomDate').val(moment(opt.firstDate,'YYYY-MM-DD').format(globSettings.dateFormat))
  $('#lCustomDate').val(moment(opt.lastDate,'YYYY-MM-DD').format(globSettings.dateFormat))
  let lastDate, chartFirstDate, tmpColors;
  for (var i = 0; i < accounts.length; i++) {
    let data = null;
    try {
      if(opt.allDates){
        data= global.db.exec(`SELECT date, amount FROM ChronoBase WHERE account="${accounts[i].name}" GROUP BY date`)
      } else {
        data= global.db.exec(`SELECT date, amount FROM ChronoBase WHERE account="${accounts[i].name}" AND date BETWEEN "${opt.firstDate}" AND "${opt.lastDate}" GROUP BY date`)
      }
    } catch (e) {
      data= [{Date: moment().format('YYYY-MM-DD'), amount: 0}];
    }
    tmpColors = getColors();
    chartFirstDate = moment(data[0].Date,'YYYY-MM-DD').isAfter(moment(opt.firstDate,'YYYY-MM-DD')) ? data[0].Date : opt.firstDate;
    if (typeof config.data.datasets[i] === 'undefined') {
      config.data.datasets.push({
        label: accounts[i].name,
        backgroundColor: tmpColors.backgroundColor,
        borderColor: tmpColors.borderColor,
        borderWidth: 1,
        data: []
      });
    } else {
      config.data.datasets[i].data=[];
    }

    let negative = false;
    for (var j = 0; j < data.length; j++) {
          config.data.datasets[i].data.push({
          x: moment(data[j].Date,'YYYY-MM-DD').format('DD/MM/YYYY'),
          y: data[j].amount.toFixed(2)
        });
        if (data[j].amount < 0) {
          negative = true;
          opt.floor = (data[j].amount < 0) ? true : opt.floor;
          $('input[type="checkbox"]').attr('disabled',true);
          $('label[for="floor-check"]').attr('disabled',true);
        } else if(!negative){
          $('input[type="checkbox"]').attr('disabled',false);
          $('label[for="floor-check"]').attr('disabled',false);
        }
        lastDate = data[j].Date;
    }
    while (config.data.datasets[i].data.length !== data.length) {
      config.data.datasets[i].data.pop();
    }
  }

  let alreadyWarning = false
  for (var i = 0; i < config.data.datasets.length; i++) {
    if( config.data.datasets[i].label === i18njs('Warning zone')){
      alreadyWarning = true;
    }
  }

  for (var i = 0; i < config.data.datasets.length; i++) {
    for (var j = 0; j < config.data.datasets[i].data.length; j++) {
      chartFirstDate = (moment(config.data.datasets[i].data[j].x,'DD/MM/YYYY').isBefore(moment(chartFirstDate,'YYYY-MM-DD'))) ? moment(config.data.datasets[i].data[j].x,'DD/MM/YYYY').format('YYYY-MM-DD') : chartFirstDate;
      lastDate = (moment(config.data.datasets[i].data[j].x,'DD/MM/YYYY').isAfter(moment(lastDate,'YYYY-MM-DD'))) ? moment(config.data.datasets[i].data[j].x,'DD/MM/YYYY').format('YYYY-MM-DD') : lastDate;
    }
  }
  if (global.opt.floor && !alreadyWarning) {
    $('#floor-check').get(0).checked = true;
    $('#floor-check').change();
    global.config.data.datasets.push({
      label: i18njs('Warning zone'),
      backgroundColor: 'rgba(221, 50, 50, 0.2)',
      borderColor: '#dd3232',
      borderWidth: 1,
      pointRadius: 0,
      fill: 'bottom',
      data: [
        {x: moment(chartFirstDate,'YYYY-MM-DD').format('DD/MM/YYYY'),y:0},
        {x: moment(lastDate,'YYYY-MM-DD').format('DD/MM/YYYY'),y:0}
      ]
    })
  } else {
    for (var i = 0; i < config.data.datasets.length; i++) {
      if( config.data.datasets[i].label === 'Warning zone'){
        global.config.data.datasets.pop();
        $('#floor-check').get(0).checked = false;
        $('#floor-check').change();
      }
    }
  }
}

function getColors() {
  const tmp = colors.shift();
  colors.push(tmp);
  return tmp;
}

ipc.send('open-report','chronoWin');
