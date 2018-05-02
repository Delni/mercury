<template lang="html">
  <div>
    <filter-bar />
    <br>

    <div class="columns is-centered">
      <div class="notification is-black column is-4">
        <div class="columns is-centered">
          <span class="column is-5 is-size-5 has-text-centered has-text-danger">{{balanceDown.toFixed(2)}}</span>
          <span class="column is-2 is-size-5 has-text-centered"><icon fa="balance-scale"/></span>
          <span class="column is-5 is-size-5 has-text-centered has-text-success">{{balanceUp.toFixed(2)}}</span>
        </div>
      </div>
    </div>

    <table class="table is-fullwidth">
      <thead>
        <tr class="has-text-centered">
          <th>{{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.STATE' | translate}}</th>
          <th>{{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.DATE' | translate}}</th>
          <th>{{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.TYPE' | translate}}</th>
          <th>{{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.BENEFICIARY' | translate}}</th>
          <th>{{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.CATEGORY' | translate}}</th>
          <th>{{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.LABEL' | translate}}</th>
          <th>{{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.DEBIT' | translate}}</th>
          <th>{{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.COLLECTION' | translate}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!data.length && !loading">
          <td colspan="8" class="has-text-grey has-text-centered">{{"NO_DATA" | translate}}</td>
        </tr>
        <tr v-if="loading">
          <td colspan="8" class="has-text-grey has-text-centered"><a class="button is-loading has-background-black" style="border: none"></a></td>
        </tr>
        <tr v-if="data.length && !loading" v-for="row in data" :class="{'is-selected': row.isClicked, 'is-future': isFuture(row)}" @click="editRow(row)">
          <td class="has-text-centered"><icon :fa="row.state"/></td>
          <td>{{row.date}}</td>
          <td class="has-text-centered"><icon :fa="row.type" /></td>
          <td>{{row.beneficiary}}</td>
          <td>{{row.category}}</td>
          <td>{{row.label}}</td>
          <td class="has-text-centered" :class="{'has-text-danger': !isFuture(row)}">{{row.amount < 0 ? row.amount: ''}}</td>
          <td class="has-text-centered" :class="{'has-text-success': !row.isClicked && !isFuture(row)}">{{row.amount >= 0 ? row.amount: ''}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import filterBar from './accountsDetails/filterBar.vue'
import icon from '../common/icon.vue'

import moment from 'moment'
import Vue from 'vue'

export default {
  components: {
    filterBar,
    icon
  },
  data: function () {
    return {
      data: [],
      loading: true,
      balanceDown: 0,
      balanceUp: 0
    }
  },
  methods: {
    isFuture: function (row) {
      return moment(row.date, this.$root.settings.dateFormat).isAfter(moment())
    },

    updateTable: function () {
      // Retrieve child states :
      this.loading = true
      this.data = []
      this.balanceUp = 0
      this.balanceDown = 0
      let filters = this.$children[0].filters
      let rows = this.$root.db.updateTable(filters.account.name, filters.date, filters.state, filters.amount)
      rows.map(r => {
        this.data.push({
          id: r[0],
          state: r[1],
          date: Vue.filter('date')(r[2]),
          type: r[3],
          beneficiary: r[4],
          category: r[5],
          label: r[6],
          amount: r[7],
          isClicked: false
        })
        if (r[7] >= 0) {
          this.balanceUp += Number(r[7])
        } else {
          this.balanceDown += Number(r[7])
        }
      })
      this.loading = false
    },

    editRow: function (row) {
      if (row.isClicked) {
        row.isClicked = false
        this.$root.$emit('edit-operation:clean')
      } else {
        this.data.map(row => { row.isClicked = false })
        row.isClicked = true
        row.selectedAccount = this.$children[0].filters.account
        this.$root.$emit('edit-operation', row)
      }
    },
    cancelEdit: function (operation) {
      this.data.map(row => { row.isClicked = false })
    },
    confirmEdit: function () {
      this.updateTable()
      this.$root.$emit('show-unsaved-tag')
    }
  },
  created: function () {
    this.loading = false
    this.$root.$on('add-operation', this.updateTable)
    this.$root.$on('update-filters', this.updateTable)
    this.$root.$on('edit-operation:cancel', this.cancelEdit)
    this.$root.$on('edit-operation:confirm', this.confirmEdit)
  },
  mounted: function () {
    this.updateTable()
  }
}
</script>

<style lang="css">
</style>
