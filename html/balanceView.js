const remote = require('electron').remote
const typeahead = require('typeahead.js')
const app = remote.require('./app.js')
const $ = require('jquery');
const jsonfile = require('jsonfile')
const fs = require('fs')
const ipc = require('electron').ipcRenderer
const moment = require('moment')
window.$ = $;
global.__basedir = __dirname + "/..";

let globSettings = jsonfile.readFileSync(__basedir + '/settings.json');
