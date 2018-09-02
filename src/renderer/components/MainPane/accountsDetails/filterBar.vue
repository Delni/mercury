<template lang="html">
  <nav class="field is-grouped">
    <custom-field is-control="true" fa="university" type="select is-primary" >
      <select v-model="filters.account" @change="$root.$emit('update-filters')" style="width: 12vw">
        <option v-for="account in accounts" :value="account">{{account.name}}</option>
      </select>
    </custom-field>

    <custom-field is-control="true" fa="calendar" type="select is-primary">
      <select v-model="filters.date" @change="$root.$emit('update-filters')" style="width: 12vw">
        <option v-for="time in timesSpan" :value="time.value">{{time.label | translate}}</option>
      </select>
    </custom-field>

    <custom-field is-control="true" fa="adjust" type="select is-primary" >
      <select v-model="filters.state" @change="$root.$emit('update-filters')" style="width: 8vw">
        <option v-for="state in states" :value="state.value">{{state.label | translate}}</option>
      </select>
    </custom-field>
    <custom-field is-control="true" fa="balance-scale" type="select is-primary" >
      <select v-model="filters.amount" @change="$root.$emit('update-filters')" style="width: 8vw">
        <option v-for="amount in amounts" :value="amount.value">{{amount.label | translate}}</option>
      </select>
    </custom-field>

    <p class="control">
      <a class="button is-primary" @click="showAdvancedFilters()"><font-awesome-icon icon="filter" /></a>
    </p>
    <p class="control">
      <a class="button is-primary" @click="resetFilters()"><font-awesome-icon icon="sync" /></a>
    </p>
  </nav>
</template>

<script>
import customField from '@/components/common/customField.vue'

import {ipcRenderer} from 'electron'
import moment from 'moment'
import Vue from 'vue'

export default {
  components: {
    customField
  },
  data: function () {
    return {
      accounts: this.$root.accounts,
      timesSpan: [
        {value: moment().subtract(30, 'days').format('YYYY-MM-DD'), label: 'TIME.L30'},
        {value: moment().startOf('month').format('YYYY-MM-DD'), label: 'TIME.TM'},
        {value: moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'), label: 'TIME.LM'},
        {value: moment().startOf('quarter').format('YYYY-MM-DD'), label: 'TIME.TQ'},
        {value: moment().startOf('year').format('YYYY-MM-DD'), label: 'TIME.TY'},
        {value: moment(0).format('YYYY-MM-DD'), label: 'TIME.*'}
      ],
      states: [
        {value: '*', label: 'MAIN_PANE.ACCOUNTS.ALL'},
        {value: 'far fa-circle', label: 'MAIN_PANE.ACCOUNTS.REGISTERED'},
        {value: 'fas fa-circle', label: 'MAIN_PANE.ACCOUNTS.CHECKED'},
        {value: 'fas fa-check-circle', label: 'MAIN_PANE.ACCOUNTS.VERIFIED'}
      ],
      amounts: [
        {value: '*', label: 'MAIN_PANE.ACCOUNTS.ANY'},
        {value: 'plus', label: 'MAIN_PANE.ACCOUNTS.INCOME'},
        {value: 'minus', label: 'MAIN_PANE.ACCOUNTS.DEBIT'}
      ],
      // Default filters
      filters: {
        account: this.$root.accounts[0],
        date: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        state: '*',
        amount: '*'
      }
    }
  },
  methods: {
    showAdvancedFilters: function () {
      const options = {
        title: Vue.filter('translate')('MAIN_PANE.ACCOUNTS.FILTERS.NOTIF.TITLE'),
        body: Vue.filter('translate')('MAIN_PANE.ACCOUNTS.FILTERS.NOTIF.BODY')
      }
      ipcRenderer.send('notification', options)
    },
    resetFilters: function () {
      this.filters = {
        account: this.accounts[0],
        date: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        state: '*',
        amount: '*'
      }
      this.$root.$emit('update-filters')
    }
  },
  created: function () {
    this.$root.$on('update-accounts', function () { this.filters.account = this.$root.accounts[0] })
  }
}
</script>
