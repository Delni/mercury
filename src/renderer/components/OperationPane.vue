<template lang="html">
  <div class="tile is-parent is-paddingless is-2 hero is-fullheight" id="op-pane">
    <article class="tile is-child notification is-black">
      <p class="title" id="op-title">{{isEditing ? "OPERATION_PANE.EDITING":"OPERATION_PANE.DEFAULT" | translate }}</p>
      <p class="subtitle level" v-if="isEditing">
        <a class="level-left button is-danger is-small" @click="deleteOperation()">
          <span class="icon">
            <font-awesome-icon icon="trash" />
          </span>
          <span>{{"DELETE" | translate}}</span>
        </a>
        <a class="level-right button is-link is-small" @click="inheritOperation()">
          <span class="icon">
            <font-awesome-icon icon="link" />
          </span>
          <span>{{"OPERATION_PANE.INHERIT" | translate}}</span>
        </a>
      </p>
      <div class="content" id="op-content">
        <custom-field class="flex" fa="calendar">
          <input class="input " type="text"
            :placeholder="settings.dateFormat"
            v-model="newOperation.date"
            @keydown.up="addOneDay"
            @keydown.down="subtractOneDay"
            @keyup.enter="isEditing? confirmEdition():addOperation()">
        </custom-field>

        <custom-field class="flex" :fa="operationCurrency">
          <input class="input" :class="{'is-danger': this.errors[1]}" type="number" placeholder="0.00" v-model="newOperation.amount" @keyup.enter="isEditing? confirmEdition():addOperation()">
        </custom-field>

        <custom-field class="flex" fa="university" type="select is-primary">
          <select id="op-account" name="op-account" v-model="newOperation.selectedAccount">
            <option v-for="account in accounts" :value="account">{{account.name}}</option>
          </select>
        </custom-field>

        <div class="field has-addons flex" data='op-add-btn'>
          <div class="control">
            <a class="button is-primary is-tag" id="op-type-btn">
              <font-awesome-icon :icon="newOperation.type"/>
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

        <custom-field class="flex" fa="building">
          <input
            v-model="newOperation.beneficiary"
            type="text"
            class="input"
            :placeholder="'OPERATION_PANE.PLACEHOLDERS.BENEFICIARY' | translate"
            @keyup.enter="isEditing? confirmEdition():addOperation()"
            @focus="beneficiaryInput = true"
            @blur="beneficiaryInput = false"
            @keyup.down="newOperation.beneficiary = bfiltered[0]" />
          <transition-group name="collapse" tag="ul" class="Results" v-if="bfiltered">
            <li v-for="item, key in bfiltered" :key="key">
                <small>{{ item }}</small>
            </li>
          </transition-group>
         </custom-field>

        <custom-field class="flex" fa="flag">
          <input
            v-model="newOperation.category"
            type="text"
            class="input"
            :placeholder="'OPERATION_PANE.PLACEHOLDERS.CATEGORY' | translate"
            @keyup.enter="isEditing? confirmEdition():addOperation()"
            @focus="categoryInput = true"
            @blur="categoryInput = false"
            @keyup.down="newOperation.category = cfiltered[0]" />
          <transition-group name="collapse" tag="ul" class="Results" v-if="cfiltered">
            <li v-for="(item, key) in cfiltered" :key="key">
                <small>{{ item }}</small>
            </li>
          </transition-group>
        </custom-field>

        <custom-field class="flex" fa="tag">
          <input
            v-model="newOperation.label"
            type="text"
            class="input"
            :placeholder="'OPERATION_PANE.PLACEHOLDERS.LABEL' | translate"
            @keyup.enter="isEditing? confirmEdition():addOperation()"
            @focus="labelInput = true"
            @blur="labelInput = false"
            @keyup.down="newOperation.label = lfiltered[0]" />
          <transition-group name="collapse" tag="ul" class="Results" v-if="lfiltered">
            <li v-for="(item, key) in lfiltered" :key="key">
                <small>{{ item }}</small>
            </li>
          </transition-group>
        </custom-field>

        <div class="field is-grouped">
          <p class="control">{{"State" | translate }} :</p>
          <p class="control">
            <a class="button is-outlined is-primary is-small" @click="toggleState(newOperation.state)" v-model="newOperation.state" @keyup.enter="isEditing? confirmEdition():addOperation()">
              <font-awesome-icon size="sm" :icon="stateIcon"/>
            </a>
          </p>
          <div class="control field has-addons flex">
            <p class="control">
              <a  class="button is-outlined is-dark is-small" >
                <font-awesome-icon size="sm" :icon="['far', 'circle']"/>
              </a>
            </p>
            <p class="control">
              <a  class="button is-outlined is-dark is-small" >
                <font-awesome-icon size="sm" icon="circle"/>
              </a>
            </p>
            <p class="control">
              <a  class="button is-outlined is-dark is-small" >
                <font-awesome-icon size="sm" icon="check-circle"/>
              </a>
            </p>
            <small v-model="helper"></small>
          </div>
        </div>

        <div class="level">
            <a class="level-left button is-small is-info is-outlined" id="op-add-btn" @click="isEditing? confirmEdition():addOperation()">
              <span id='op-confirm'>{{isEditing ? "OPERATION_PANE.EDIT":"OPERATION_PANE.ADD" | translate }} </span>
              <span class="icon">
                <font-awesome-icon icon="check"/>
              </span>
            </a>
            <a class="level-right button is-small is-danger is-outlined" @click="cancelOperation()">
              <span>{{"CANCEL" | translate }} </span>
              <span class="icon">
                <font-awesome-icon icon="times"/>
              </span>
            </a>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
import customField from '@/components/common/customField'

import {ipcRenderer} from 'electron'
import jsonfile from 'jsonfile'
import moment from 'moment'
import path from 'path'
import Vue from 'vue'
import { stateIcon, currencyIcon } from '../util/icons'

export default {
  name: 'operation-pane',
  components: {
    customField
  },
  data: function () {
    return {
      beneficiaryInput: false,
      categoryInput: false,
      labelInput: false,
      isEditing: false,
      states: ['fa-circle-o', 'fa-circle', 'fa-check-circle'],
      helper: '-',
      settings: this.$root.settings,
      newOperation: {
        date: moment().format(this.$root.settings.dateFormat),
        selectedAccount: this.$root.accounts[0] || {currency: this.$root.settings.defaultCurrency},
        type: 'credit-card',
        state: 'fa-circle-o'
      },
      errors: [false, false, false]
    }
  },
  computed: {
    operationCurrency: function () {
      if (this.newOperation.selectedAccount) {
        return currencyIcon(this.newOperation.selectedAccount.currency)
      }
    },
    accounts: function () {
      return this.$root.accounts || null
    },
    stateIcon () {
      return stateIcon(this.newOperation.state)
    },
    bfiltered: function () {
      if (this.beneficiaryInput && this.newOperation.beneficiary && this.newOperation.beneficiary.length >= 1) {
        return this.$root.settings.beneficiaries.filter(item => {
          if (item !== null && item !== undefined && item.toString().indexOf(this.newOperation.beneficiary) !== -1) {
            return item.toLowerCase()
          }
        }).slice(0, 5)
      }
    },
    cfiltered: function () {
      if (this.categoryInput && this.newOperation.category && this.newOperation.category.length >= 1) {
        return this.$root.settings.categories.filter(item => {
          if (item !== null && item !== undefined && item.toString().indexOf(this.newOperation.category) !== -1) {
            return item.toLowerCase()
          }
        }).slice(0, 5)
      }
    },

    lfiltered: function () {
      if (this.labelInput && this.newOperation.label && this.newOperation.label.length >= 1) {
        return this.$root.settings.labels.filter(item => {
          if (item !== null && item !== undefined && item.toString().indexOf(this.newOperation.label) !== -1) {
            return item.toLowerCase()
          }
        }).slice(0, 5)
      }
    }
  },
  methods: {
    toggleState: function (state) {
      this.newOperation.state = this.states[(this.states.indexOf(state) === 2) ? 0 : this.states.indexOf(state) + 1]
    },

    addOneDay: function () {
      this.newOperation.date = moment(this.newOperation.date, this.$root.settings.dateFormat).add(1, 'days').format(this.$root.settings.dateFormat)
    },

    subtractOneDay: function () {
      this.newOperation.date = moment(this.newOperation.date, this.$root.settings.dateFormat).subtract(1, 'days').format(this.$root.settings.dateFormat)
    },

    isValid: function () {
      this.errors = [false, false, false]

      // if (!moment(this.newOperation.date).isValid()) {
      //   console.log(moment(this.newOperation.date).invalidAt())
      //   this.errors[0] = true
      // }
      if (!this.newOperation.amount) {
        this.errors[1] = true
      }
      if (!this.newOperation.selectedAccount.name) {
        this.errors[2] = true
      }

      return (!this.errors[0] && !this.errors[1] && !this.errors[2])
    },

    addOperation: function () {
      if (this.isValid()) {
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

        if (!this.settings.beneficiaries.find(b => b === this.newOperation.beneficiary) && this.newOperation.beneficiary !== '' && this.newOperation.beneficiary !== null && this.newOperation.beneficiary !== undefined) {
          this.settings.beneficiaries.push(this.newOperation.beneficiary)
        }
        if (!this.settings.labels.find(b => b === this.newOperation.label) && this.newOperation.label !== '' && this.newOperation.label !== null && this.newOperation.label !== undefined) {
          this.settings.labels.push(this.newOperation.label)
        }
        if (!this.settings.categories.find(b => b === this.newOperation.category) && this.newOperation.category !== '' && this.newOperation.category !== null && this.newOperation.category !== undefined) {
          this.settings.categories.push(this.newOperation.category)
        }
        jsonfile.writeFile(path.join(__static, 'settings.json'), this.settings, {
          spaces: 2
        }, function (err) {
          if (err != null) {
            console.error(err)
          }
        })
        this.$root.db.insertOperation(this.newOperation.selectedAccount.name, data, this.$root.settings.dateFormat)
        this.cleanOperation()
        this.$root.$emit('add-operation')
        this.$root.$emit('show-unsaved-tag')
      }
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
      let previousAccount = this.newOperation.selectedAccount
      this.newOperation = {
        date: moment().format(this.$root.settings.dateFormat),
        selectedAccount: previousAccount,
        type: 'credit-card',
        state: 'fa-circle-o'
      }
    },

    cancelOperation: function () {
      this.endOperation('cancel')
    },

    editOperation: function (op) {
      this.newOperation = op
      this.newOperation.selectedAccount = this.accounts.find(a => a.name === op.selectedAccount.name)
      this.isEditing = true
    },

    confirmEdition: function () {
      if (this.isValid()) {
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
          if (!this.settings.beneficiaries.find(b => b === this.newOperation.beneficiary) && this.newOperation.beneficiary !== '') {
            this.settings.beneficiaries.push(this.newOperation.beneficiary)
          }
          if (!this.settings.labels.find(b => b === this.newOperation.label) && this.newOperation.label !== '') {
            this.settings.labels.push(this.newOperation.label)
          }
          if (!this.settings.categories.find(b => b === this.newOperation.category) && this.newOperation.category !== '') {
            this.settings.categories.push(this.newOperation.category)
          }
          jsonfile.writeFile(path.join(__static, 'settings.json'), this.settings, {
            spaces: 2
          }, function (err) {
            if (err != null) {
              console.error(err)
            }
          })
          this.$root.db.editOperation(this.newOperation.id, data, this.$root.settings.dateFormat)
          this.endOperation('confirm')
        } else {
          console.warn('NO ID ON EDITION !')
        }
        // TODO : add typeahead categories (HTMLEventHandler.js:100)
      }
    }
  },
  created: function () {
    this.$root.$on('update-accounts', function () { this.newOperation.selectedAccount = this.$root.accounts[0] })
    this.$root.$on('edit-operation', this.editOperation)
    this.$root.$on('edit-operation:clean', this.cleanOperation)

    this.$root.$on('update-accounts-list:success', this.$forceUpdate)
    // Typeahead
    // const typeahead = require('typeahead') // eslint-disable-line
    // const beneficiaryInput = document.getElementById('op-benef')
    // beneficiaryInput.typeahead({
    //   hint: true,
    //   highlight: true,
    //   minLenght: 1
    // }, {
    //   name: 'beneficiaries',
    //   source: substringMatcher(this.settings.beneficiaries)
    // })
  }
}
</script>

<style>
  .Results {
    margin-top: 0.25rem !important;
    margin-left: .6rem !important;
  }
  .collapse-enter-active, .collapse-leave-active {
    transition: all 500ms;
    height: 1em;
  }

  .collapse-enter, .collapse-leave-to /* .list-leave-active below version 2.1.8 */ {
    height: 0;
  }
</style>
