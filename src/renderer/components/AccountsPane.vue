<template lang="html">
  <div class="tile is-parent  is-2 is-paddingless" id="account-pane">
    <article class="tile is-child notification hero is-fullheight is-black" style="padding-right: 24px">
      <div class="content">
        <p class="title">
          {{'ACCOUNTS_PANE.DEFAULT'| translate}}
          <transition name="slide-fade">
            <icon fa="exclamation-circle" class="is-size-4 has-text-warning" v-if="unsaved"/>
          </transition>
        </p>
        <p class="control">
          <a class="button is-primary is-small is-outlined" @click="showCreateModal()">
            <span class="icon is-small">
              <i class="fa fa-plus-square"></i>
            </span>
            <span>{{'ACCOUNTS_PANE.ADD' | translate }}</span>
          </a>
        </p>
        <!-- createAccount modal -->
        <modal :active="createModalShown" icon="bank" :close="closeModal">
          <p class="title">{{'ACCOUNTS_PANE.MODAL.TITLE' | translate }}</p>
          <form>
            <div class="field">
              <p class="control has-icons-left">
                <input class="input" type="text" :class="{'is-danger': errorName}"
                  :placeholder="'ACCOUNTS_PANE.MODAL.PLACEHOLDER' | translate"
                  v-model="newAccount.name"
                  autofocus>
                <icon size="is-small is-left" fa="tag"/>
              </p>
            </div>
            <div class="columns">
              <div class="column is-4 field has-addons">
                <div class="control">
                  <a class="button is-tag is-primary">
                    <icon :fa="newCurSymbol"/>
                  </a>
                </div>
                <div class="control select">
                  <select id="select-cur" name="a-cur" v-model="newAccount.currency">
                    <option value="" disabled selected>{{'CURRENCIES.DEFAULT' | translate}}</option>
                    <option value="btc">Bitcoin</option>
                    <option value="usd">Dollar</option>
                    <option value="eur">Euro</option>
                    <option value="try">Lira</option>
                    <option value="gbp">{{'CURRENCIES.POUND' | translate }}</option>
                    <option value="inr">Rupee</option>
                    <option value="rub">Rouble</option>
                    <option value="cny">Yen</option>
                    <option value="money">{{'CURRENCIES.OTHER' | translate }}</option>
                  </select>
                </div>
              </div>
              <div class="column is-8 field has-addons">
                <div class="control">
                  <p class="button is-tag is-primary">{{'ACCOUNTS_PANE.MODAL.CURRENT_AMOUNT' | translate }}</p>
                </div>
                <p class="control">
                  <input class="input" type="number" :placeholder="'0.00' | format" v-model="newAccount.amount">
                </p>
              </div>
            </div>
            <div class="field">
              <p class="control pull-left">
                <a class="button is-info is-outlined" :class="{'loading': loading}" @click="createNewAccount()">{{'CREATE' | translate }}</a>
              </p>
              <p class="control pull-right">
                <a class="button is-danger is-outlined" :class="{'loading': loading}" @click="closeModal()">{{"CANCEL" | translate }}</a>
              </p>
            </div>
          </form>
        </modal>

        <div id="account-list">
          <article class="card notification is-dark is-paddingless"
                   v-model="accounts" v-for="account in accounts" :key="account.name">
            <div class="card-header">
              <div class="card-header-icon">
                <icon fa="bank"/>
              </div>
              <div class="card-header-title" style="flex: 1">
                {{account.name}}
              </div>
              <button class="delete" @click="deleteAccount(account)"></button>
            </div>
            <div class="card-content">
              <div class="content is-paddingless is-marginless">
                <small>
                  <p>
                    {{ 'ACCOUNTS_PANE.CARDS.BANK'   | translate }}
                    <span class="amount" :class="{ 'has-text-danger': account.inBank <= 0 }">
                      {{account.inBank | format}} <icon size="is-small" :fa="account.currency"/>
                    </span>
                  </p>
                  <p>
                    {{ 'ACCOUNTS_PANE.CARDS.TODAY'  | translate }}
                    <span class="amount" :class="{ 'has-text-danger': account.today <= 0 }">
                      {{account.today | format}} <icon size="is-small" :fa="account.currency"/>
                    </span>
                  </p>
                  <p>
                    {{ 'ACCOUNTS_PANE.CARDS.FUTURE' | translate }}
                    <span class="amount" :class="{ 'has-text-danger': account.future <= 0 }">
                      {{account.future | format}} <icon size="is-small" :fa="account.currency"/>
                    </span>
                  </p>
                </small>
              </div>
            </div>
          </article>

        </div>
      </div>
    </article>
  </div>
</template>

<script>
import icon from '@/components/common/icon'
import modal from '@/components/common/modal'

import Database from '@/assets/Database.class'
import {ipcRenderer, remote} from 'electron'
import jsonfile from 'jsonfile'
import path from 'path'
import Vue from 'vue'

export default {
  name: 'accounts-pane',
  components: {
    icon,
    modal
  },
  data: function () {
    return {
      // Variables
      unsaved: false,
      loading: false,
      errorName: false,
      accounts: this.$root.accounts,
      createModalShown: false,
      newAccount: {
        currency: this.$root.settings.defaultCurrency
      }
    }
  },
  computed: {
    newCurSymbol: function () {
      return this.newAccount.currency ? this.newAccount.currency : 'money'
    }
  },
  methods: {
    createNewAccount: function () {
      this.loading = true
      this.newAccount.amount = Number((this.newAccount.amount) ? this.newAccount.amount : 0) || 0
      const account = {
        name: this.newAccount.name,
        inBank: this.newAccount.amount,
        today: this.newAccount.amount,
        future: this.newAccount.amount,
        currency: this.newAccount.currency
      }
      try {
        this.$root.db.addAccount(this.newAccount.name, this.newAccount.currency, this.newAccount.amount)
        this.accounts.push(account)
        this.$root.$emit('update-accounts')
        this.$root.$emit('toggle-tab', 0)
        this.showUnsavedTag()
        this.loading = false
        this.closeModal()
      } catch (e) {
        this.errorName = (e.toString().indexOf('Accounts.name') !== -1)
      }
    },

    deleteAccount: function (account) {
      const options = {
        type: 'warning',
        title: Vue.filter('translate')('WARNING'),
        message: Vue.filter('translate')('ACCOUNTS_PANE.CONFIRM.DELETE_ACCOUNT', {'name': account.name}), // (`You are about to delete the account "%{name}" \n\nAre you sure?`,{name: name}),
        buttons: [Vue.filter('translate')('CONTINUE'), Vue.filter('translate')('CANCEL')],
        cancelId: 1
      }
      const ipcr = (ipcRenderer.sendSync('warning', options))
      if (ipcr === 0) {
        const index = this.accounts.indexOf(this.accounts.find(a => a.name === account.name))
        this.accounts.splice(index, 1)
        this.$root.db.deleteAccount(account.name)
        this.$root.$emit('update-accounts')
        this.$root.$emit('toggle-tab', 0)
        this.showUnsavedTag()
      }
    },

    showUnsavedTag: function () {
      this.unsaved = true
      ipcRenderer.send('set-prevent-close', true)
    },

    hideUnsavedTag: function () {
      this.unsaved = false
      ipcRenderer.send('set-prevent-close', false)
    },

    showCreateModal: function () {
      this.createModalShown = true
    },

    closeModal: function () {
      this.newAccount = {}
      this.newAccount.currency = this.$root.settings.defaultCurrency
      this.createModalShown = false
    },

    updateAccountsList: function () {
      try {
        this.$root.accounts = this.$root.db.exec('SELECT * FROM Accounts')
      } catch (e) {
        console.warn(e)
        this.$root.accounts = []
      }
      this.accounts = this.$root.accounts
      this.$root.$emit('update-accounts', this.$root.accounts)
    },

    softUpdate: function () {
      this.accounts = this.$root.accounts
    }
  },
  created: function () {
    const vm = this
    ipcRenderer.on('saved-file', (event, arg) => {
      vm.$root.db.export(arg)
      vm.$root.settings.lastfile = arg
      jsonfile.writeFile(path.join(__static, 'settings.json'), vm.$root.settings, {
        spaces: 2
      }, function (err) {
        if (err != null) {
          console.error(err)
        }
      })
      vm.hideUnsavedTag()
    })

    ipcRenderer.on('open-new-file', () => {
      const dbPath = path.join(__static, 'data/template.sqlite')
      vm.$root.db = new Database(dbPath)
      vm.updateAccountsList()
      vm.$root.$emit('toggle-tab', 0)
      vm.showUnsavedTag()
      delete vm.$root.settings.lastfile
    })

    let force = false
    remote.app.on('before-quit', function (evt) {
      console.log('before')
      if (vm.unsaved && !force) {
        setTimeout(() => {
          const options = {
            type: 'warning',
            title: Vue.filter('translate')('Warning !'),
            message: Vue.filter('translate')(`Are you sure to quit?`),
            detail: Vue.filter('translate')(`There are some unsaved modifications`),
            buttons: [Vue.filter('translate')('Save & Quit'), Vue.filter('translate')('Quit'), Vue.filter('translate')('Cancel')],
            cancelId: 2
          }
          let saving = ipcRenderer.sendSync('warning', options)
          if (saving === 0) {
            ipcRenderer.sendSync('save', true)
          } else if (saving === 1) {
            force = true
            ipcRenderer.send('set-prevent-close', false)
            ipcRenderer.send('quit')
          }
        }, 1)
        return false
      }
    })

    this.$root.$on('update-accounts-list:success', this.softUpdate) // TODO better reload !
    this.$root.$on('launch-recurrings:success', this.showUnsavedTag)
    this.$root.$on('recurrings:delete:success', this.showUnsavedTag)
    this.$root.$on('show-unsaved-tag', this.showUnsavedTag)
  }
}
</script>
