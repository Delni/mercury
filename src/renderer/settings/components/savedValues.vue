<template lang="html">
  <div style="width: 100%">
    <div class="columns">
      <div class="column has-text-centered">
        <span class="icon">
          <font-awesome-icon icon="building" size="lg"/>
        </span>
        <span class="title">{{'SETTINGS.TABS.SAVED_VALUES.BENEFICIARIES' | translate}}</span>
        <br><hr>
        <div class="savedvalues">
          <table class="table is-fullwidth">
            <transition-group name="details" tag="tbody">
              <tr v-for="(beneficiary, $index) in settings.beneficiaries.filter(b => b !== null)" :key="$index">
                <td>{{beneficiary}}</td>
                <td><a class="is-pulled-right button is-danger is-outlined" @click="deleteEntry($index, 'beneficiaries')"><font-awesome-icon icon="trash"/></a></td>
              </tr>
              <tr v-if="!settings.beneficiaries.length" key="-1">
                {{'NO_DATA' | translate}}
              </tr>
            </transition-group>
          </table>
        </div>
      </div>
      <div class="column has-text-centered">
        <span class="icon">
          <font-awesome-icon icon="flag" size="lg"/>
        </span>
        <span class="title">{{'SETTINGS.TABS.SAVED_VALUES.CATEGORIES' | translate}}</span>
        <br><hr>
        <div class="savedvalues">
          <table class="table is-fullwidth">
            <transition-group name="details" tag="tbody">
              <tr v-for="(category, $index) in settings.categories.filter(c => c !== null)" :key="$index">
                <td>{{category}}</td>
                <td><a class="is-pulled-right button is-danger is-outlined" @click="deleteEntry($index, 'categories')"><font-awesome-icon icon="trash"/></a></td>
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
export default {
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
