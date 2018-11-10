<template lang="html">
  <div>
    <p class="title is-marginless">
      <icon size="is-medium" class="has-text-success" fa="fa-recycle"/>
      {{'MAIN_PANE.RECURRINGS.TITLE' | translate}}
    </p>
    <!-- <recurring-bar /> -->
    <nav class="level">
      <div class="level-item">
        <a class="button is-info" @click="showRecModal('create')">
          <icon fa="fa-plus-circle" /> <span>{{ "MAIN_PANE.RECURRINGS.BAR.CREATE" | translate}}</span>
        </a>
      </div>
      <div class="level-item">
        <a class="button is-large is-danger" @click="showRecModal('launch')">
          <icon size="is-medium" fa="fa-rocket" /> <span>{{ "MAIN_PANE.RECURRINGS.BAR.LAUNCH" | translate}}</span>
        </a>
      </div>
      <div class="level-item">
        <a class="button is-success" @click="showRecModal('edit')">
          <icon fa="fa-pencil" /> <span>{{ "MAIN_PANE.RECURRINGS.BAR.EDIT" | translate}}</span>
        </a>
      </div>
    </nav>
    <!-- <recurring-modal /> -->
    <modal :active="recModalActive"
           :icon="modalConfig.icon"
           :close="closeRecModal" width="60vw">
      <div v-if="modalConfig.translate !== 'LAUNCH'">
        <p class="title">{{'MAIN_PANE.RECURRINGS.MODAL.TITLE.'+modalConfig.translate| translate}}</p>
        <div class="columns">
          <div class="content column">

            <custom-field class="flex" fa="calendar">
              <input class="input" type="text" :placeholder="settings.dateFormat" v-model="newRecurringOperation.date">
            </custom-field>

            <div class="field has-addons flex">
              <div class="control">
                <a class="button is-tag is-primary"><icon fa="retweet"/></a>
              </div>
              <div class="control" style="width: 4vw">
                <input class="input" type="number" min="1" v-model="newRecurringOperation.offset">
              </div>
              <div class="control select is-primary">
                <select class="select" v-model="newRecurringOperation.timespan">
                  <option value="day">{{ (newRecurringOperation.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"days"| translate}}</option>
                  <option value="week">{{ (newRecurringOperation.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"weeks"| translate}}</option>
                  <option value="month">{{ (newRecurringOperation.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"months"| translate}}</option>
                  <option value="quarter">{{ (newRecurringOperation.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"quarters"| translate}}</option>
                  <option value="year">{{ (newRecurringOperation.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"years"| translate}}</option>
                </select>
              </div>
            </div>

            <div class="field has-addons flex">
              <div class="control">
                <a class="button is-primary" @click="newRecurringOperation.hasRepeat = !newRecurringOperation.hasRepeat; $forceUpdate()">
                  <icon fa="check" v-if="newRecurringOperation.hasRepeat"/>
                  <icon fa="times" v-else/>
                </a>
              </div>
              <div class="control flex">
                <input class="input is-paddingless" type="text" name="" :value="'OPERATION_PANE.PLACEHOLDERS.RECURRING' | translate" readonly :disabled="!newRecurringOperation.hasRepeat">
              </div>
              <div class="control" style="width: 3vw">
                <input class="input" type="number" min="1" value="2" :disabled="!newRecurringOperation.hasRepeat">
              </div>
              <div class="control flex">
                <input class="input" type="text" :value="'TIME.TIME' | translate" style="padding-right: 0" readonly :disabled="!newRecurringOperation.hasRepeat">
              </div>
            </div>

          </div>
          <div class="content column">

            <custom-field class="flex" fa="bank" type="select is-primary">
              <select id="op-account" name="op-account" v-model="newRecurringOperation.selectedAccount">
                <option v-for="account in accounts" :value="account">{{account.name}}</option>
              </select>
            </custom-field>

            <div class="field has-addons flex" data='op-add-btn'>
              <div class="control">
                <a class="button is-primary is-tag" id="op-type-btn">
                  <icon :fa="'fa-' + newRecurringOperation.type"/>
                </a>
              </div>
              <div class="control select is-primary" style="margin:0; flex:1">
                <select name="op-type" id="op-type" v-model="newRecurringOperation.type">
                    <option value="" disabled>{{"OPERATION_TYPE.DEFAULT" | translate }}</option>
                    <option value="credit-card">{{"OPERATION_TYPE.CREDIT_CARD" | translate }}</option>
                    <option value="pencil-square-o">{{"OPERATION_TYPE.CHECK" | translate }}</option>
                    <option value="money">{{"OPERATION_TYPE.CASH" | translate }}</option>
                    <option value="exchange">{{"OPERATION_TYPE.TRANSFER" | translate }}</option>
                    <option value="refresh">{{"OPERATION_TYPE.INTERNAL_TRANSFER" | translate }}</option>
                    <option value="share">{{"OPERATION_TYPE.PERMANENT_TRANSFER" | translate }}</option>
                    <option value="desktop">{{"OPERATION_TYPE.ELECTRONIC" | translate }}</option>
                    <option value="paypal">PayPal</option>
                    <option value="inbox">{{"OPERATION_TYPE.DEPOSIT" | translate }}</option>
                    <option value="bank">{{"OPERATION_TYPE.BANK_CHARGE" | translate }}</option>
                    <option value="stop-circle-o">{{"OPERATION_TYPE.DIRECT_LEVY" | translate }}</option>
                  </select>
              </div>
            </div>

            <custom-field class="flex" :fa="newRecurringOperation.selectedAccount.currency">
              <input class="input" type="number" :placeholder="'0.00' | format" v-model="newRecurringOperation.amount">
            </custom-field>

          </div>
          <div class="content column">

            <custom-field class="flex" fa="building-o">
              <input class="input typeahead " id="op-benef" type="text" :placeholder="'OPERATION_PANE.PLACEHOLDERS.BENEFICIARY' | translate" v-model="newRecurringOperation.beneficiary"/>
            </custom-field>

            <custom-field class="flex" fa="flag">
              <input class="input typeahead " id="op-cat" type="text" :placeholder="'OPERATION_PANE.PLACEHOLDERS.CATEGORY' | translate" v-model="newRecurringOperation.category"/>
            </custom-field>

            <custom-field class="flex" fa="tag">
              <input class="input typeahead " id="op-label" type="text" :placeholder="'OPERATION_PANE.PLACEHOLDERS.LABEL' | translate" v-model="newRecurringOperation.label"/>
            </custom-field>

          </div>
        </div>
        <div class="level">
          <p class="control level-left">
            <a class="button is-info" @click="modalConfig.callback">{{'MAIN_PANE.RECURRINGS.MODAL.CONFIRM_BUTTON.'+modalConfig.translate| translate}}</a>
          </p>
          <p v-if="modalConfig.translate === 'EDIT'" class="level-item">
            <a class="button is-warning" @click="deleteRecuring(newRecurringOperation.id)">{{'DELETE' | translate}}</a>
          </p>
          <p class="control level-right">
            <a class="button is-danger" @click="closeRecModal()">{{'CANCEL'| translate}}</a>
          </p>
        </div>
      </div>
      <div v-else>
        <p class="title">{{'MAIN_PANE.RECURRINGS.MODAL.TITLE.'+modalConfig.translate| translate}}</p>
        <form class="field has-addons">
          <div class="control flex">
            <input class="input is-warning has-text-warning" type="text" :value="'MAIN_PANE.RECURRINGS.MODAL.LAUNCH_FOR' | translate" readonly>
          </div>
          <div class="control">
            <input class="input is-warning" type="number" v-model="launch.offset" style="width: 5em"/>
          </div>
          <div class="control select is-warning">
            <select v-model="launch.timeSpan">
              <option value="days">{{ (launch.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"days"| translate}}</option>
              <option value="weeks">{{ (launch.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"weeks"| translate}}</option>
              <option value="months">{{ (launch.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"months"| translate}}</option>
              <option value="quarters">{{ (launch.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"quarters"| translate}}</option>
              <option value="years">{{ (launch.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"years"| translate}}</option>
            </select>
          </div>
          <div class="control">
            <a class="button is-warning" :class="{'is-outlined': this.$root.settings.theme === 'dark', 'is-loading': launching}" @click="launchPending()"><icon fa="rocket" /></a>
          </div>
        </form>
        <hr>
      </div>
    </modal>
    <!-- <recurring-table /> -->
    <div class="notification is-black">
      <div class="is-table-overflown-2">
        <table class="table is-fullwidth">
          <transition-group name="details" tag="tbody">
            <tr v-if="!recurrings.length" :key="-1">
              <td colspan="6" class="has-text-centered">{{'NO_DATA' | translate}}</td>
            </tr>
            <tr v-else
                v-for="recurring in recurrings"
                @click="toggleSelect(recurring)"
                @contextmenu="contextMenu(recurring)"
                :key="recurring.id"
                :class="{'is-selected': recurring.isSelected}">
              <td class="has-text-centered">{{recurring.date | date}}</td>
              <td class="has-text-centered"><icon :fa="recurring.type" /></td>
              <td class="has-text-centered">{{recurring.beneficiary}}</td>
              <td class="has-text-centered">{{recurring.category}}</td>
              <td class="has-text-centered">{{recurring.label}}</td>
              <td class="has-text-centered" :class="{'has-text-danger': recurring.amount < 0, 'has-text-success': recurring.amount >= 0}">{{recurring.amount}}</td>
            </tr>
          </transition-group>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import icon from '@/components/common/icon'
import modal from '@/components/common/modal'
import customField from '@/components/common/customField'

import { ipcRenderer, remote } from 'electron'
import moment from 'moment'
import Vue from 'vue'

export default {
  components: {
    icon,
    modal,
    customField
  },
  data: function () {
    return {
      recModalActive: false,
      recurrings: [],
      accounts: this.$root.accounts,
      modalConfig: {callback: () => {}},
      settings: this.$root.settings,
      launching: false,
      launch: {
        offset: this.$root.settings.defaultOffset,
        timeSpan: this.$root.settings.defaultTimeSpan
      },
      newRecurringOperation: {
        date: moment().format(this.$root.settings.dateFormat),
        selectedAccount: this.$root.accounts[0],
        type: 'credit-card',
        offset: 1,
        timespan: this.$root.settings.defaultTimeSpan
      }
    }
  },

  methods: {
    getData: function () {
      this.recurrings = this.$root.db.exec('SELECT id,date,type,beneficiary,category,label,amount, account_name FROM Recurrings ORDER BY date ASC')
      this.recurrings.map(r => { r.isSelected = false; r.selectedAccount = this.$root.accounts.find(a => a.name === r.account_name) })
    },

    contextMenu: function (recurring) {
      let vm = this
      let contextualMenu = new remote.Menu()
      let contextualContent = this.$root.db.exec(`SELECT account_name,date,offset,timespan,times FROM Recurrings WHERE id=${recurring.id}`)[0]
      const nextDate = moment(contextualContent.date, 'YYYY-MM-DD').add(contextualContent.offset, contextualContent.timespan).format(this.$root.settings.dateFormat)
      contextualMenu.append(new remote.MenuItem({label: Vue.filter('translate')('MAIN_PANE.RECURRINGS.CONTEXTUAL.ACCOUNT') + ' : ' + contextualContent.account_name, enabled: false}))
      contextualMenu.append(new remote.MenuItem({label: Vue.filter('translate')('MAIN_PANE.RECURRINGS.CONTEXTUAL.NEXT') + ' : ' + nextDate, enabled: false}))
      contextualMenu.append(new remote.MenuItem({
        label: Vue.filter('translate')(
          (contextualContent.offset > 1)
            ? 'MAIN_PANE.RECURRINGS.CONTEXTUAL.RECURRENCES'
            : 'MAIN_PANE.RECURRINGS.CONTEXTUAL.RECURRENCE'
        ) + Vue.filter('translate')(
          (contextualContent.offset > 1)
            ? 'TIME_SPAN.PLURAL.'
            : 'TIME_SPAN.SINGULAR.' +
            contextualContent.timespan
        ),
        enabled: false
      }))
      if (contextualContent.times && contextualContent.times > 0) {
        contextualMenu.append(new remote.MenuItem({
          label: Vue.filter('translate')(
            contextualContent.times > 1
              ? 'MAIN_PANE.RECURRINGS.CONTEXTUAL.LEFT_PLURAL'
              : 'MAIN_PANE.RECURRINGS.CONTEXTUAL.LEFT',
            {'left': contextualContent.times}
          ),
          enabled: false
        }))
      }
      contextualMenu.append(new remote.MenuItem({type: 'separator'}))
      contextualMenu.append(new remote.MenuItem({
        label: Vue.filter('translate')('MAIN_PANE.RECURRINGS.BAR.LAUNCH'),
        click () { vm.launchPending(recurring.id, true) }
      }))
      contextualMenu.append(new remote.MenuItem({
        label: Vue.filter('translate')('MAIN_PANE.RECURRINGS.BAR.EDIT'),
        click () { vm.toggleSelect(recurring); vm.showRecModal('edit') }
      }))
      contextualMenu.append(new remote.MenuItem({
        label: Vue.filter('translate')('MAIN_PANE.RECURRINGS.BAR.DELETE'),
        click () { vm.deleteRecuring(recurring.id, true) }
      }))
      contextualMenu.popup(remote.getCurrentWindow())
    },

    launchPending: function (id = null, fromContext = false) {
      let operations = []
      if (id) {
        this.$root.db.launchPending(id)
      } else {
        this.launching = true
        let upperBound = moment().add(this.launch.offset, this.launch.timeSpan).format('YYYY-MM-DD')
        try {
          operations = this.$root.db.exec(`SELECT id FROM Recurrings WHERE date <="${upperBound}"`)
        } catch (e) {
          console.warn(e)
          operations.length = 0
        } finally {
          // IDEA: Progress bar of how many operations are running
          for (var i = 0; i < operations.length; i++) {
            this.$root.db.launchPending(operations[i].id)
          }
          const options = {
            title: Vue.filter('translate')('MAIN_PANE.RECURRINGS.POPUP.TITLE'),
            subtitle: Vue.filter('translate')(operations.length > 1 ? 'MAIN_PANE.RECURRINGS.POPUP.BODY_PLURAL' : 'MAIN_PANE.RECURRINGS.POPUP.BODY', {length: operations.length}),
            silent: true
          }
          ipcRenderer.send('notification', options)
          this.launching = false
        }
      }
      if (!fromContext) {
        this.closeRecModal()
      }
      this.getData()
      this.$root.$emit('launch-recurrings:success')
    },

    deleteRecuring: function (id = null, fromContext = false) {
      const options = {
        type: 'warning',
        title: Vue.filter('translate')('WARNING'),
        message: Vue.filter('translate')('MAIN_PANE.RECURRINGS.POPUP.CONFIRM_DELETE'),
        buttons: [Vue.filter('translate')('CONTINUE'), Vue.filter('translate')('CANCEL')],
        cancelId: 1
      }
      let confirm = ipcRenderer.sendSync('warning', options)
      if (confirm === 0) {
        id = Number(id)
        this.$root.db.deleteRec(id)
        if (!fromContext) {
          this.closeRecModal()
        }
        this.getData()
        this.$root.$emit('recurrings:delete:success')
      }
    },

    showRecModal: function (type) {
      let vm = this
      switch (type) {
        case 'create':
          this.modalConfig = {
            color: 'info',
            icon: 'plus-circle',
            translate: 'CREATE',
            callback: function () {
              console.log(vm.newRecurringOperation)
              vm.$root.db.insertRecurringOperation(
                vm.newRecurringOperation.selectedAccount.name,
                [
                  vm.newRecurringOperation.amount,
                  vm.newRecurringOperation.type,
                  vm.newRecurringOperation.beneficiary,
                  vm.newRecurringOperation.category,
                  vm.newRecurringOperation.label,
                  vm.newRecurringOperation.date,
                  vm.newRecurringOperation.offset,
                  vm.newRecurringOperation.timespan,
                  vm.newRecurringOperation.times
                ],
                vm.$root.settings.dateFormat
              )
              vm.$root.$emit('show-unsaved-tag')
              vm.closeRecModal()
              vm.getData()
              vm.newRecurringOperation = {
                date: moment().format(this.$root.settings.dateFormat),
                selectedAccount: this.$root.accounts[0],
                type: 'credit-card',
                offset: 1,
                timespan: 'days'
              }
            }
          }
          break
        case 'edit':
          if (!this.newRecurringOperation.id) {
            const options = {
              title: Vue.filter('translate')('MAIN_PANE.RECURRINGS.NO_DATA.TITLE'),
              subtitle: Vue.filter('translate')('MAIN_PANE.RECURRINGS.NO_DATA.BODY'),
              silent: false
            }
            ipcRenderer.send('notification', options)
          }
          let resSQL = this.$root.db.exec(`SELECT offset, timespan, times FROM Recurrings WHERE id=${this.newRecurringOperation.id}`)[0]
          if (resSQL.times !== null && resSQL.times > 0) {
            this.newRecurringOperation.hasRepeat = true
            this.newRecurringOperation.times = resSQL.times
          }
          this.newRecurringOperation.date = moment(this.newRecurringOperation.date).format(this.$root.settings.dateFormat)
          this.newRecurringOperation.offset = resSQL.offset
          this.newRecurringOperation.timespan = resSQL.timespan
          this.modalConfig = {
            color: 'success',
            icon: 'pencil',
            translate: 'EDIT',
            callback: function () {
              vm.$root.db.editRecurringOperation(
                vm.newRecurringOperation.id,
                vm.newRecurringOperation.selectedAccount.name,
                [
                  vm.newRecurringOperation.amount,
                  vm.newRecurringOperation.type,
                  vm.newRecurringOperation.beneficiary,
                  vm.newRecurringOperation.category,
                  vm.newRecurringOperation.label,
                  vm.newRecurringOperation.date,
                  vm.newRecurringOperation.offset,
                  vm.newRecurringOperation.timespan,
                  vm.newRecurringOperation.times
                ],
                vm.$root.settings.dateFormat
              )
              vm.$root.$emit('show-unsaved-tag')
              vm.closeRecModal()
              vm.getData()
              vm.newRecurringOperation = {
                date: moment().format(this.$root.settings.dateFormat),
                selectedAccount: this.$root.accounts[0],
                type: 'credit-card',
                offset: 1,
                timespan: 'days'
              }
            }
          }
          break
        case 'launch':
          this.modalConfig = {
            color: 'warning',
            icon: 'rocket',
            translate: 'LAUNCH',
            callback: function () {}
          }
          break
        default:
          this.modalConfig = {
            callback: function () {}
          }
      }
      this.recModalActive = true
    },

    closeRecModal: function () {
      this.recModalActive = false
    },

    toggleSelect: function (recurring) {
      if (recurring.isSelected) {
        recurring.isSelected = false
        this.newRecurringOperation = {
          date: moment().format(this.$root.settings.dateFormat),
          selectedAccount: this.$root.accounts[0],
          type: 'credit-card',
          offset: 1,
          timespan: 'days'
        }
      } else {
        this.recurrings.map(recurring => { recurring.isSelected = false })
        recurring.isSelected = true
        this.newRecurringOperation = recurring
      }
      this.$root.$emit('edit-operation:clean')
      this.$forceUpdate()
    }
  },
  created: function () {
    this.getData()
    console.log(this.newRecurringOperation)
  }
}
</script>
