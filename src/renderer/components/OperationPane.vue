<template lang="html">
  <div class="tile is-parent is-paddingless is-2 hero is-fullheight" id="op-pane">
    <article class="tile is-child notification is-black">
      <p class="title" id="op-title">{{isEditing ? "OPERATION_PANE.EDITING":"OPERATION_PANE.DEFAULT" | translate }}</p>
      <p class="subtitle level" v-if="isEditing">
        <a class="level-left button is-danger is-small" @click="deleteOperation()"><icon fa="trash" /> <span>{{"DELETE" | translate}}</span></a>
        <a class="level-right button is-link is-small" @click="inheritOperation()"><icon fa="link" /> <span>{{"OPERATION_PANE.INHERIT" | translate}}</span></a>
      </p>
      <div class="content" id="op-content">

        <div class="field has-addons flex" data='op-add-btn'>
          <div class="control">
            <a class="button is-primary is-tag">
              <icon fa="fa-calendar"/>
            </a>
          </div>
          <div class="control" >
            <input class="input " type="text" :placeholder="settings.dateFormat" v-model="newOperation.date">
          </div>
        </div>
        <div class="field has-addons flex" data='op-add-btn'>
          <div class="control">
            <a class="button is-primary is-tag">
              <icon :fa="'fa-' + newOperation.selectedAccount.currency"/>
            </a>
          </div>
          <div class="control" >
            <input class="input " type="number" placeholder="0.00" v-model="newOperation.amount">
          </div>
        </div>
        <div class="field has-addons flex" data='op-add-btn'>
          <div class="control">
            <a class="button is-primary is-tag" id="op-account-btn">
              <icon fa="fa-bank"/>
            </a>
          </div>
          <div class="control select is-primary">
            <select id="op-account" name="op-account" v-model="newOperation.selectedAccount">
              <option v-for="account in accounts" :value="account">{{account.name}}</option>
            </select>
          </div>
        </div>

        <div class="field has-addons flex" data='op-add-btn'>
          <div class="control">
            <a class="button is-primary is-tag" id="op-type-btn">
              <icon :fa="'fa-' + newOperation.type"/>
            </a>
          </div>
          <div class="control select is-primary" style="margin:0; flex:1">
            <select name="op-type" id="op-type" v-model="newOperation.type">
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
            <a class="button is-primary is-tag" id="op-benef-btn">
              <icon fa="fa-building-o"/>
            </a>
          </div>
          <div class="control">
            <input class="input typeahead " id="op-benef" type="text" :placeholder="'OPERATION_PANE.PLACEHOLDERS.BENEFICIARY' | translate" v-model="newOperation.beneficiary"/>
          </div>
        </div>

        <div class="field has-addons flex" data='op-add-btn'>
          <div class="control">
            <a class="button is-primary is-tag" id="op-cat-btn">
              <icon fa="fa-flag"/>
            </a>
          </div>
          <div class="control">
            <input class="input typeahead " id="op-cat" type="text" :placeholder="'OPERATION_PANE.PLACEHOLDERS.CATEGORY' | translate" v-model="newOperation.category"/>
          </div>
        </div>
        <div class="field has-addons flex" data='op-add-btn'>
          <div class="control">
            <a class="button is-primary is-tag" id="op-label-btn">
              <icon fa="fa-tag"/>
            </a>
          </div>
          <div class="control">
            <input class="input typeahead " id="op-label" type="text" :placeholder="'OPERATION_PANE.PLACEHOLDERS.LABEL' | translate" v-model="newOperation.label"/>
          </div>
        </div>

        <div class="field is-grouped">
          <p class="control">{{"State" | translate }} :</p>
          <p class="control">
            <a class="button is-outlined is-primary is-small" @click="toggleState(newOperation.state)" v-model="newOperation.state">
              <icon size="is-small" :fa="newOperation.state"/>
            </a>
          </p>
          <div class="control field has-addons flex">
            <p class="control">
              <a  class="button is-outlined is-dark is-small" >
                <icon size="is-small" fa="fa-circle-o"/>
              </a>
            </p>
            <p class="control">
              <a  class="button is-outlined is-dark is-small" >
                <icon size="is-small" fa="fa-circle"/>
              </a>
            </p>
            <p class="control">
              <a  class="button is-outlined is-dark is-small" >
                <icon size="is-small" fa="fa-check-circle"/>
              </a>
            </p>
            <small v-model="helper"></small>
          </div>
        </div>

        <div class="level">
            <a class="level-left button is-small is-info is-outlined" id="op-add-btn" @click="isEditing? confirmEdition():addOperation()">
              <span id='op-confirm'>{{isEditing ? "OPERATION_PANE.EDIT":"OPERATION_PANE.ADD" | translate }}</span>
              <icon size="is-small" fa="fa-check-square-o"/>
            </a>
            <a class="level-right button is-small is-danger is-outlined" @click="cancelOperation()">
              <span>{{"CANCEL" | translate }}</span>
              <icon size="is-small" fa="fa-times"/>
            </a>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
import icon from './common/icon.vue'

import {ipcRenderer} from 'electron'
import moment from 'moment'
import Vue from 'vue'

export default {
  name: 'operation-pane',
  components: {
    icon
  },
  data: function () {
    return {
      isEditing: false,
      states: ['fa-circle-o', 'fa-circle', 'fa-check-circle'],
      helper: '-',
      settings: this.$root.settings,
      accounts: this.$root.accounts,
      newOperation: {
        date: moment().format(this.$root.settings.dateFormat),
        selectedAccount: this.$root.accounts[0],
        type: 'credit-card',
        state: 'fa-circle-o'
      }
    }
  },
  methods: {
    toggleState: function (state) {
      this.newOperation.state = this.states[(this.states.indexOf(state) === 2) ? 0 : this.states.indexOf(state) + 1]
    },

    addOperation: function () {
      // Go to right tab
      this.$root.$emit('toggle-tab', 1)
      // Format data
      let data = [
        this.newOperation.date,
        this.newOperation.state,
        this.newOperation.beneficiary,
        this.newOperation.category,
        this.newOperation.label,
        this.newOperation.amount,
        this.newOperation.type
      ]
      this.$root.db.insertOperation(this.newOperation.selectedAccount.name, data, this.$root.settings.dateFormat)
      this.$root.$emit('add-operation')
      this.$root.$emit('show-unsaved-tag')
    },

    inheritOperation: function () {
      let oldOperation = Vue.util.extend({}, this.newOperation)
      this.newOperation = {
        date: moment().format(this.$root.settings.dateFormat),
        state: 'fa-circle-o',
        beneficiary: oldOperation.beneficiary,
        category: oldOperation.category,
        label: oldOperation.label,
        amount: oldOperation.amount,
        type: oldOperation.type,
        selectedAccount: oldOperation.selectedAccount
      }
      this.isEditing = false
      this.$root.$emit('edit-operation:cancel')
    },

    deleteOperation: function () {
      let confirm
      const options = {
        type: 'warning',
        title: Vue.filter('translate')('WARNING'),
        message: Vue.filter('translate')('OPERATION_PANE.CONFIRM'),
        buttons: [Vue.filter('translate')('CONTINUE'), Vue.filter('translate')('CANCEL')],
        cancelId: 1
      }
      confirm = ipcRenderer.sendSync('warning', options)
      if (confirm === 0) {
        this.$root.db.deleteOperation(this.newOperation.id)
        this.endOperation('confirm')
        this.$root.$emit('show-unsaved-tag')
      }
    },

    endOperation: function (type) {
      this.cleanOperation()
      this.$root.$emit('edit-operation:' + type)
    },

    cleanOperation: function () {
      this.isEditing = false
      this.newOperation = {
        date: moment().format(this.$root.settings.dateFormat),
        selectedAccount: this.accounts[0],
        type: 'credit-card',
        state: 'fa-circle-o'
      }
    },

    cancelOperation: function () {
      this.endOperation('cancel')
    },

    editOperation: function (op) {
      this.newOperation = op
      this.isEditing = true
    },
    confirmEdition: function () {
      if (this.newOperation.id) {
        let data = [
          this.newOperation.selectedAccount.name,
          this.newOperation.date,
          this.newOperation.state,
          this.newOperation.beneficiary,
          this.newOperation.category,
          this.newOperation.label,
          this.newOperation.amount,
          this.newOperation.type
        ]
        this.$root.db.editOperation(this.newOperation.id, data, this.$root.settings.dateFormat)
        this.endOperation('confirm')
      } else {
        console.warn('NO ID ON EDITION !')
      }
      // TODO : add typeahead categories (HTMLEventHandler.js:100)
    }
  },
  created: function () {
    this.$root.$on('update-accounts', function () { this.newOperation.selectedAccount = this.$root.accounts[0] })
    this.$root.$on('edit-operation', this.editOperation)
    this.$root.$on('edit-operation:clean', this.cleanOperation)
  }
}
</script>

<style lang="css">
  .flex{
    flex: 1;
  }
  .field.has-addons .control{
    margin-right: 0;
  }

  ::-webkit-input-placeholder{
    color: grey !important
  }
</style>
