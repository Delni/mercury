const remote = require('electron').remote
const typeahead = require('typeahead.js')
const app = remote.require('./app.js')
const $ = require('jquery');
const jsonfile = require('jsonfile')
const fs = require('fs')
const ipc = require('electron').ipcRenderer
const moment = require('moment')
const https = require('https')
const pjson = require('../package.json')
window.$ = $;
global.__basedir = __dirname + "/..";

const globSettings = jsonfile.readFileSync(__basedir + '/settings.json');

$(window).resize(() => {
  $('#table-container').css('max-height', 0.30 * window.innerHeight);
  $('#table-container').css('height', 0.30 * window.innerHeight);
})

$(() => {
  //INIT
  $('#table-container').css('height', 0.30 * window.innerHeight)
  $('#select-cur').val(globSettings.defaultCurrency).change();
  $('#select-lang').val(globSettings.language).change();
  $('#switchTheme').get(0).checked = (globSettings.theme === 'dark');
  $('#showDatepicker').get(0).checked = globSettings.useDatepicker;
  toggleTheme($(`#${globSettings.theme}`).get(0))
  updatePresetsTable(globSettings.beneficiaries)
})

$('#select-cur').on('change', () => {
  const val = $('#select-cur').val();
  $('#selected-cur').removeClass();
  $('#selected-cur').addClass('fa')
  $('#selected-cur').addClass('fa fa-' + val)
})

$('#save-btn').on("click", () => {
  const prevdefaultCurrency = globSettings.defaultCurrency;
  const defaultCurrency = $('#select-cur').val();
  const prevlanguage = globSettings.language;
  const language = $('#select-lang').val();
  const prevTheme = globSettings.theme;
  const theme = ($('#switchTheme').get(0).checked) ? "dark":"light";
  const useDatepicker = $('#showDatepicker').get(0).checked;
  globSettings.defaultCurrency = defaultCurrency;
  globSettings.language = language;
  globSettings.theme = theme;
  globSettings.useDatepicker = useDatepicker;
  globSettings.beneficiaries.sort(function(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase())
  })
  globSettings.categories.sort(function(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase())
  })
  jsonfile.writeFile(__basedir + '/settings.json', globSettings, {
    spaces: 2
  }, function(err) {
    if (err != null) {
      console.error(err);
    }
  })
  $('#save-btn').addClass('is-loading')
  setTimeout(() => {
    window.close()
  },1000);
  if (prevdefaultCurrency !== defaultCurrency || prevlanguage !== language || prevTheme !== theme) {
    if (prevlanguage !== language) {
      const options = {
        title: i18njs('Language for the menu will be updated on restart')
      }
      ipc.send('notification',options)
    }
    ipc.send('new-settings',globSettings)
  }
});

$('#checkUpdates').on('click', () => {
  $('.fa-refresh').addClass('fa-spin');
  let options = {
    hostname: 'api.github.com',
    path: '/repos/delni/mercury/releases',
    methode: 'GET'
  }
  options.agent = new https.Agent(options);
  https.request(options,(response) => {
    console.log('statusCode:', response.statusCode);
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
      console.log(data);
    });
    response.on('end', () => {
      console.log(data)
      $('.fa-refresh').removeClass('fa-spin');
    });
  })
})

function togglePresets(obj) {
  $('.btn-state').addClass('is-outlined');
  $(obj).removeClass('is-outlined');
  if($(obj).attr('data') === 'beneficiaries'){
    updatePresetsTable(globSettings.beneficiaries);
  } else {
    updatePresetsTable(globSettings.categories);
  }
}

function toggleTheme(obj) {
  $('.btn-theme').addClass('is-outlined');
  $(obj).removeClass('is-outlined');
}

function updatePresetsTable(list) {
  $('#table-b').empty();
  for (var i = 0; i < list.length; i++) {
    addRow(list[i]);
  }
}

function addRow(obj) {
  $('#table-b').append(
    $('<tr>').append(
      $('<td>').text(obj)
    ).append(
      $('<td>').append(
        $('<a>').addClass('pull-right').addClass('btn-delete button is-danger is-outlined').append(
          $('<span>').addClass('icon is-small').append(
            $('<i>').addClass('fa fa-trash')
          )
        ).attr('data',obj).attr('onclick','eject(this)')
      )
    )
  )
}

function eject(target) {
  let dataset = null;
  if ($('a.btn-state[data="beneficiaries"]').hasClass('is-outlined')) {
      dataset = globSettings.categories;
  } else {
    dataset = globSettings.beneficiaries;
  }
  for (var i = 0; i < dataset.length; i++) {
    if(dataset[i] === $(target).attr('data')){
      dataset.splice(i,1);
      updatePresetsTable(dataset);
      $(target).parent().fadeOut("slow")
      return true;
    }
  }
  return false;
}
