ipc.on('add-account', () => {
  showModal($('a[data-toggle="#createAccount"]'));
})

ipc.on('selected-file', (event, arg) => {
  global.db = new Database(arg);
  globSettings.lastfile = arg;
  jsonfile.writeFile(__basedir + '/settings.json', globSettings, {
    spaces: 2
  }, function(err) {
    if (err != null) {
      console.error(err);
    }
  })
  updateAccountsList();
  try {
    global.__chronoChart= new ChronoChart($("#chronoChart"),global.__accounts);
  } catch (e) {
    console.error(e);
  }
  tabToggle($('.tab.is-active').children()[0]);
})

ipc.on('saved-file', (event, arg) => {
  global.db.export(arg);
  globSettings.lastfile = arg;
  jsonfile.writeFile(__basedir + '/settings.json', globSettings, {
    spaces: 2
  }, function(err) {
    if (err != null) {
      console.error(err);
    }
  })
  hideUnsavedTag();
})

ipc.on('open-new-file',() => {
  global.db = new Database(dbPath);
  updateAccountsList();
  tabToggle($('.tab.is-active').children()[0]);
  showUnsavedTag();
  delete globSettings.lastfile;
})

ipc.on('open-recurring',() => {
  tabToggle($('#third').get(0));
})

ipc.on('open-detail',() => {
  tabToggle($('#second').get(0));
})

ipc.on('toggle', (event, args) => {
  switch (args) {
    case 0:
      tabToggle($("#first").get(0));
      break;
    case 1:
      tabToggle($("#second").get(0));
      break;
    case 2:
      tabToggle($("#third").get(0));
      break;
    default:
    tabToggle($("#first").get(0));

  }
})

ipc.on('new-settings',(event,args) => {
  setTimeout(() => {
      if (unsaved) {
        let confirm = ipc.sendSync('warning-reload');
        if (confirm === 0) {
           let saved = ipc.sendSync('save',false);
          if(saved) {
            location.reload();
          }
        }
      } else {
        location.reload();
      }
  },1000);
})
