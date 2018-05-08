<template lang="html">
  <div>
    <p class="title is-marginless"><icon size="is-medium" class="has-text-success" fa="fa-recycle"/> {{'MAIN_PANE.RECURRINGS.TITLE' | translate}}</p>
    <!-- <recurring-bar /> -->
    <nav class="level">
      <div class="level-item">
        <a class="button is-info" @click="showRecModal('create')"><icon fa="fa-plus-circle" /> <span>{{ "MAIN_PANE.RECURRINGS.BAR.CREATE" | translate}}</span></a>
      </div>
      <div class="level-item">
        <a class="button is-large is-danger" @click="showRecModal('launch')"><icon size="is-medium" fa="fa-rocket" /> <span>{{ "MAIN_PANE.RECURRINGS.BAR.LAUNCH" | translate}}</span></a>
      </div>
      <div class="level-item">
        <a class="button is-success" @click="showRecModal('edit')"><icon fa="fa-pencil" /> <span>{{ "MAIN_PANE.RECURRINGS.BAR.EDIT" | translate}}</span></a>
      </div>
    </nav>
    <!-- <recurring-modal /> -->
    <modal :active="recModalActive" :icon="modalConfig.icon + ' has-text-'+ modalConfig.color" :close="closeRecModal" width="60vw">
      <div v-if="modalConfig.translate !== 'LAUNCH'">
        <p class="title">{{'MAIN_PANE.RECURRINGS.MODAL.TITLE.'+modalConfig.translate| translate}}</p>
        <div class="columns">
          <div class="content column">

            <div class="field has-addons flex">
              <div class="control">
                <a class="button is-primary is-tag">
                  <icon fa="fa-calendar"/>
                </a>
              </div>
              <div class="control" >
                <input class="input " type="text" :placeholder="settings.dateFormat" v-model="newRecurringOperation.date">
              </div>
            </div>
            <div class="field has-addons flex">
              <div class="control">
                <a class="button is-tag is-primary"><icon fa="retweet"/></a>
              </div>
              <div class="control" style="width: 4vw">
                <input class="input" type="number" min="1" v-model="newRecurringOperation.offset">
              </div>
              <div class="control select is-primary">
                <select class="select" v-model="newRecurringOperation.timespan">
                  <option value="days">{{ (newRecurringOperation.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"days"| translate}}</option>
                  <option value="weeks">{{ (newRecurringOperation.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"weeks"| translate}}</option>
                  <option value="months">{{ (newRecurringOperation.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"months"| translate}}</option>
                  <option value="quarters">{{ (newRecurringOperation.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"quarters"| translate}}</option>
                  <option value="years">{{ (newRecurringOperation.offset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"years"| translate}}</option>
                </select>
              </div>
            </div>
            <div class="field has-addons flex">
              <div class="control">
                <a class="button is-primary" @click="newRecurringOperation.hasRepeat = false" v-if="newRecurringOperation.hasRepeat"><icon fa="check" /></a>
                <a class="button is-primary" @click="newRecurringOperation.hasRepeat = true" v-if="!newRecurringOperation.hasRepeat"><icon fa="times" /></a>
              </div>
              <div class="control flex">
                <input class="input is-paddingless" type="text" name="" value="Répéter" readonly :disabled="newRecurringOperation.hasRepeat ? '': 'disabled'">
              </div>
              <div class="control" style="width: 3vw">
                <input class="input" type="number" min="1" value="2" :disabled="newRecurringOperation.hasRepeat ? '': 'disabled'">
              </div>
              <div class="control flex">
                <input class="input" type="text" value="time" style="padding-right: 0" readonly :disabled="newRecurringOperation.hasRepeat ? '': 'disabled'">
              </div>
            </div>


          </div>
          <div class="content column">

            <div class="field has-addons flex" data='op-add-btn'>
              <div class="control">
                <a class="button is-primary is-tag" id="op-account-btn">
                  <icon fa="fa-bank"/>
                </a>
              </div>
              <div class="control select is-primary">
                <select id="op-account" name="op-account" v-model="newRecurringOperation.selectedAccount">
                  <option v-for="account in accounts" :value="account">{{account.name}}</option>
                </select>
              </div>
            </div>
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
            <div class="field has-addons flex" data='op-add-btn'>
              <div class="control">
                <a class="button is-primary is-tag">
                  <icon :fa="'fa-' + newRecurringOperation.selectedAccount.currency"/>
                </a>
              </div>
              <div class="control" >
                <input class="input " type="number" placeholder="0.00" v-model="newRecurringOperation.amount">
              </div>
            </div>

          </div>
          <div class="content column">

            <div class="field has-addons flex" data='op-add-btn'>
              <div class="control">
                <a class="button is-primary is-tag" id="op-benef-btn">
                  <icon fa="fa-building-o"/>
                </a>
              </div>
              <div class="control">
                <input class="input typeahead " id="op-benef" type="text" :placeholder="'OPERATION_PANE.PLACEHOLDERS.BENEFICIARY' | translate" v-model="newRecurringOperation.beneficiary"/>
              </div>
            </div>

            <div class="field has-addons flex" data='op-add-btn'>
              <div class="control">
                <a class="button is-primary is-tag" id="op-cat-btn">
                  <icon fa="fa-flag"/>
                </a>
              </div>
              <div class="control">
                <input class="input typeahead " id="op-cat" type="text" :placeholder="'OPERATION_PANE.PLACEHOLDERS.CATEGORY' | translate" v-model="newRecurringOperation.category"/>
              </div>
            </div>
            <div class="field has-addons flex" data='op-add-btn'>
              <div class="control">
                <a class="button is-primary is-tag" id="op-label-btn">
                  <icon fa="fa-tag"/>
                </a>
              </div>
              <div class="control">
                <input class="input typeahead " id="op-label" type="text" :placeholder="'OPERATION_PANE.PLACEHOLDERS.LABEL' | translate" v-model="newRecurringOperation.label"/>
              </div>
            </div>

          </div>
        </div>
        <div class="field">
          <p class="control pull-left">
            <a class="button is-info" @click="modalConfig.callback">{{'MAIN_PANE.RECURRINGS.MODAL.CONFIRM_BUTTON.'+modalConfig.translate| translate}}</a>
          </p>
          <p class="control pull-right">
            <a class="button is-danger" @click="closeRecModal()">{{'CANCEL'| translate}}</a>
          </p>
          <p v-if="modalConfig.translate === 'EDIT'" class="level-item">
            <a class="button is-warning" @click="deleteRec()">{{'DELETE' | translate}}</a>
          </p>
        </div>
      </div>
      <div v-else>

      </div>
    </modal>
    <!-- <recurring-table /> -->
    <div class="notification is-black">
      <table class="table is-fullwidth">
        <tbody>
          <tr v-if="!recurrings.length">
            <td colspan="6" class="has-text-centered">{{'NO_DATA' | translate}}</td>
          </tr>
          <tr v-else
              v-for="recurring in recurrings"
              @click="toggleSelect(recurring)"
              @contextmenu="contextMenu(recurring)"
              :class="{'is-selected': recurring.isSelected}">
            <td class="has-text-centered">{{recurring.date | date}}</td>
            <td class="has-text-centered"><icon :fa="recurring.type" /></td>
            <td class="has-text-centered">{{recurring.beneficiary}}</td>
            <td class="has-text-centered">{{recurring.category}}</td>
            <td class="has-text-centered">{{recurring.label}}</td>
            <td class="has-text-centered" :class="{'has-text-danger': recurring.amount < 0, 'has-text-success': recurring.amount >= 0}">{{recurring.amount}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import icon from '../common/icon.vue'
import modal from '../common/modal.vue'
import customField from '../common/customField.vue'

import { remote } from 'electron'
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
      newRecurringOperation: {
        date: moment().format(this.$root.settings.dateFormat),
        selectedAccount: this.$root.accounts[0],
        type: 'credit-card',
        offset: 1,
        timespan: 'days'
      }
    }
  },
  methods: {
    getData: function () {
      this.recurrings = this.$root.db.exec('SELECT id,date,type,beneficiary,category,label,amount FROM Recurrings ORDER BY date ASC')
      this.recurrings.map(r => { r.isSelected = false })
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
        click () { vm.showRecModal('edit') }
      }))
      contextualMenu.append(new remote.MenuItem({
        label: Vue.filter('translate')('MAIN_PANE.RECURRINGS.BAR.DELETE'),
        click () { vm.deleteRecuring(recurring.id, true) }
      }))
      contextualMenu.popup(remote.getCurrentWindow())
    },

    launchPending: function () {

    },

    deleteRecuring: function () {

    },

    showRecModal: function (type) {
      switch (type) {
        case 'create':
          this.modalConfig = {
            color: 'info',
            icon: 'plus-circle',
            translate: 'CREATE',
            callback: () => {}
          }
          break
        case 'edit':
          this.modalConfig = {
            color: 'success',
            icon: 'pencil',
            translate: 'EDIT',
            callback: () => {}
          }
          break
        case 'launch':
          this.modalConfig = {
            color: 'warning',
            icon: 'rocket',
            translate: 'LAUNCH',
            callback: () => {}
          }
          break
        default:
          this.modalConfig = {
            callback: () => {

            }
          }
      }
      this.recModalActive = true
    },

    closeRecModal: function () {
      this.recModalActive = false
    },

    toggleSelect: function (recurring) {
      console.log('From :', recurring.isSelected)
      if (recurring.isSelected) {
        recurring.isSelected = false
        this.$root.$emit('edit-operation:clean')
      } else {
        this.recurrings.map(recurring => { recurring.isSelected = false })
        recurring.isSelected = true
        this.$root.$emit('edit-operation:clean')
      }
      console.log('To :', recurring.isSelected)
    }
  },
  created: function () {
    this.getData()
  }
}
</script>

<style lang="css">
</style>
