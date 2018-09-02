<template lang="html">
  <div style="max-height: 60vh">
    <filter-bar />
    <br>

    <div class="columns is-centered">
      <div class="notification is-black column is-4">
        <div class="columns is-centered">
          <span class="column is-5 is-size-5 has-text-centered has-text-danger">{{balanceDown | format}}</span>
          <span class="column is-2 is-size-5 has-text-centered"><icon fa="balance-scale"/></span>
          <span class="column is-5 is-size-5 has-text-centered has-text-success">{{balanceUp | format}}</span>
        </div>
      </div>
    </div>

    <div class="is-table-overflown">
      <table class="table is-fullwidth">
        <thead>
          <tr class="has-text-centered">
            <th><a class="link" @click="changeOrder('state')">
              {{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.STATE' | translate}}
              <span v-if="orderBy === 'state'"><icon v-if="order === 'asc'" fa="chevron-up" /><icon v-else fa="chevron-down" /></span>
            </a></th>
            <th><a class="link" @click="changeOrder('date')">
              {{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.DATE' | translate}}
              <span v-if="orderBy === 'date'"><icon v-if="order === 'asc'" fa="chevron-up" /><icon v-else fa="chevron-down" /></span>
            </a></th>
            <th><a class="link" @click="changeOrder('type')">
              {{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.TYPE' | translate}}
              <span v-if="orderBy === 'type'"><icon v-if="order === 'asc'" fa="chevron-up" /><icon v-else fa="chevron-down" /></span>
            </a></th>
            <th><a class="link" @click="changeOrder('beneficiary')">
              {{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.BENEFICIARY' | translate}}
              <span v-if="orderBy === 'beneficiary'"><icon v-if="order === 'asc'" fa="chevron-up" /><icon v-else fa="chevron-down" /></span>
            </a></th>
            <th><a class="link" @click="changeOrder('category')">
              {{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.CATEGORY' | translate}}
              <span v-if="orderBy === 'category'"><icon v-if="order === 'asc'" fa="chevron-up" /><icon v-else fa="chevron-down" /></span>
            </a></th>
            <th><a class="link" @click="changeOrder('label')">
              {{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.LABEL' | translate}}
              <span v-if="orderBy === 'label'"><icon v-if="order === 'asc'" fa="chevron-up" /><icon v-else fa="chevron-down" /></span>
            </a></th>
            <th><a class="link" @click="changeOrder('debit')">
              {{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.DEBIT' | translate}}
              <span v-if="orderBy === 'debit'"><icon v-if="order === 'asc'" fa="chevron-up" /><icon v-else fa="chevron-down" /></span>
            </a></th>
            <th><a class="link" @click="changeOrder('collection')">
              {{'MAIN_PANE.ACCOUNTS.TABLE.HEAD.COLLECTION' | translate}}
              <span v-if="orderBy === 'collection'"><icon v-if="order === 'asc'" fa="chevron-up" /><icon v-else fa="chevron-down" /></span>
            </a></th>
          </tr>
        </thead>
          <transition-group name="details" tag="tbody">
            <tr v-if="!data.length && !loading" :key="-1">
              <td colspan="8" class="has-text-grey has-text-centered">{{"NO_DATA" | translate}}</td>
            </tr>
            <tr v-if="loading" :key="-2">
              <td colspan="8" class="has-text-grey has-text-centered"><a class="button is-loading has-background-black" style="border: none"></a></td>
            </tr>
            <tr v-if="data.length && !loading"
                v-for="row in orderedData"
                :key="row.id"
                :class="{'is-selected': row.isClicked, 'is-future': isFuture(row)}"
                @click="editRow(row)">
              <td class="has-text-centered"><icon :fa="row.state"/></td>
              <td>{{row.date}}</td>
              <td class="has-text-centered"><icon :fa="row.type" /></td>
              <td><div class="is-not-too-large">{{row.beneficiary}}</div></td>
              <td>{{row.category}}</td>
              <td><div class="is-not-too-large">{{row.label}}</div></td>
              <td class="has-text-centered" :class="{'has-text-danger': !isFuture(row)}">{{row.amount < 0 ? row.amount.toLocaleString($root.settings.language): ''}}</td>
              <td class="has-text-centered" :class="{'has-text-success': !row.isClicked && !isFuture(row)}">{{row.amount >= 0 ? row.amount.toLocaleString($root.settings.language): ''}}</td>
            </tr>
          </transition-group>
      </table>
    </div>
  </div>
</template>

<script>
import filterBar from '@/components/MainPane/accountsDetails/filterBar'
import icon from '@/components/common/icon'

import _ from 'lodash'
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
      balanceUp: 0,
      orderBy: 'date',
      order: 'desc'
    }
  },
  computed: {
    orderedData: function () {
      let vm = this
      switch (this.orderBy) {
        case 'debit':
          return _.orderBy(this.data, 'amount')
        case 'collection':
          return _.orderBy(this.data, 'amount', ['desc'])
        case 'date':
          return _.orderBy(this.data, function (o) { return moment(o.date, vm.$root.settings.dateFormat).format('YYYYMMDD') }, [this.order])
        default:
          return _.orderBy(this.data, this.orderBy, [this.order])
      }
    }
  },
  methods: {
    isFuture: function (row) {
      return moment(row.date, this.$root.settings.dateFormat).isAfter(moment())
    },

    changeOrder: function (filter) {
      if (filter === 'debit' || filter === 'collection') {
        if (filter === 'debit') {
          this.order = 'desc'
          this.orderBy = 'debit'
        } else {
          this.order = 'asc'
          this.orderBy = 'collection'
        }
      } else {
        if (this.orderBy === filter) {
          if (this.order === 'desc') {
            this.order = 'asc'
          } else {
            this.order = 'desc'
          }
        } else {
          this.orderBy = filter
          this.order = 'asc'
        }
      }
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
    this.$root.$on('launch-recurrings:success', this.updateTable)
    this.$root.$on('edit-operation:cancel', this.cancelEdit)
    this.$root.$on('edit-operation:confirm', this.confirmEdit)
  },
  mounted: function () {
    this.updateTable()
  }
}
</script>
