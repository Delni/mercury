<template>
  <div id="app" :class="$root.settings.theme">
    <section id="window" class="hero is-fullheight">
      <div class="hero-body is-paddingless">
        <div class="tile is-ancestor">
            <accounts-pane />
            <main-pane />
            <operation-pane />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  import AccountsPane from '@/components/AccountsPane'
  import MainPane from '@/components/MainPane'
  import OperationPane from '@/components/OperationPane'
  import path from 'path'

  import Database from '@/assets/Database.class'
  import {ipcRenderer} from 'electron'
  import jsonfile from 'jsonfile'

  export default {
    name: 'mercury',
    components: {
      AccountsPane,
      MainPane,
      OperationPane
    },
    methods: {
      updateAccountsList: function () {
        try {
          this.$root.accounts = this.$root.db.exec('SELECT * FROM Accounts')
        } catch (e) {
          console.warn(e)
          this.$root.accounts = []
        }
        this.$root.$emit('update-accounts-list:success')
      }
    },
    created: function () {
      const dbPath = path.join(__static, 'data/template.sqlite')

      let $root = this.$root
      if (!$root.settings.lastfile) {
        $root.db = new Database(dbPath)
      } else {
        try {
          $root.db = new Database($root.settings.lastfile)
          ipcRenderer.send('file-to-save', $root.settings.lastfile)
        } catch (e) {
          console.warn(e.message)
          $root.db = new Database(dbPath)
        }
      }
      this.updateAccountsList()

      this.$root.$on('add-operation', this.updateAccountsList)
      this.$root.$on('edit-operation:confirm', this.updateAccountsList)

      let vm = this
      ipcRenderer.on('new-settings', (event, arg) => {
        vm.$root.settings = arg
      })

      ipcRenderer.on('selected-file', (event, arg) => {
        vm.$root.db = new Database(arg)
        vm.$root.settings.lastfile = arg
        jsonfile.writeFile(path.join(__static, 'settings.json'), vm.$root.settings, {
          spaces: 2
        }, (err) => {
          if (err) console.warn(err)
        })
        vm.updateAccountsList()
      })
    }
  }
</script>
