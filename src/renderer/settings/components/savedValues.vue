<template lang="html">
  <div style="width: 100%">
    <div class="columns">
      <div class="column has-text-centered">
        <icon fa="fa-building fa-2x" size="is-large"/><span class="title">{{'SETTINGS.TABS.SAVED_VALUES.BENEFICIARIES' | translate}}</span>
        <br><hr>
        <div class="savedvalues">
          <table class="table is-fullwidth">
            <transition-group name="details" tag="tbody">
              <tr v-for="(beneficiary, $index) in settings.beneficiaries" :key="$index">
                <td>{{beneficiary}}</td>
                <td><a class="pull-right button is-danger is-outlined" @click="deleteEntry($index, 'beneficiaries')"><icon fa="trash"/></a></td>
              </tr>
              <tr v-if="!settings.beneficiaries.length" key="-1">
                {{'NO_DATA' | translate}}
              </tr>
            </transition-group>
          </table>
        </div>
      </div>
      <div class="column has-text-centered">
        <icon fa="fa-flag fa-2x" size="is-large"/><span class="title">{{'SETTINGS.TABS.SAVED_VALUES.CATEGORIES' | translate}}</span>
        <br><hr>
        <div class="savedvalues">
          <table class="table is-fullwidth">
            <transition-group name="details" tag="tbody">
              <tr v-for="(category, $index) in settings.categories" :key="$index">
                <td>{{category}}</td>
                <td><a class="pull-right button is-danger is-outlined" @click="deleteEntry($index, 'categories')"><icon fa="trash"/></a></td>
              </tr>
              <tr v-if="!settings.categories.length" key="-1">
                {{'NO_DATA' | translate}}
              </tr>
            </transition-group>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import icon from '@/components/common/icon.vue'
export default {
  components: {icon},
  data: function () {
    return {
      settings: this.$root.settings
    }
  },
  methods: {
    deleteEntry: function (index, entry) {
      this.settings[entry].splice(index, 1)
    }
  }
}
</script>
