<template lang="html">
  <div style="width: 100%">
    <div class="columns">
      <div class="column">
        <div class="notification is-dark is-30h">
          <p class="title is-marginless">{{'SETTINGS.TABS.GENERAL.THEME' | translate}}</p>
          <div class="field">
            <input id="dark-theme" type="checkbox" name="dark-theme" class="switch is-rounded" v-model="settings.theme === 'dark'" @click="settings.theme = 'dark'">
            <label for="dark-theme">{{'SETTINGS.TABS.GENERAL.DARK_THEME' | translate}}</label>
          </div>
          <div class="field">
            <input id="light-theme" type="checkbox" name="light-theme" class="switch is-rounded" v-model="settings.theme === 'light'" @click="settings.theme = 'light'">
            <label for="light-theme">{{'SETTINGS.TABS.GENERAL.LIGHT_THEME' | translate}}</label>
          </div>
        </div>

      </div>
      <div class="column">

        <div class="notification is-dark is-30h">
          <p class="title is-marginless">{{'SETTINGS.TABS.GENERAL.DATEFORMAT' | translate}}</p>
          <div class="field">
            <input type="text" class="input" v-model="settings.dateFormat" :placeholder="'SETTINGS.TABS.GENERAL.SAMPLE_CALENDAR' | translate">
          </div>
          <p class="subtitle">{{'SETTINGS.TABS.GENERAL.TEST' | translate}}: {{ dateFormatTester }}</p>
        </div>

      </div>
    </div>
    <div class="columns">
      <div class="column">
        <div class="notification is-dark is-30h">
          <p class="title">{{'SETTINGS.TABS.GENERAL.LANGUAGE' | translate}}</p>
          <div class="field has-addons is-marginless">
            <div class="control">
              <a class="button is-tag is-primary">
                  <icon fa="language" />
                </a>
            </div>
            <div class="control select is-primary">
              <select v-model="settings.language">
                <option value="de">Deutsch</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="pl">Polish</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="column">
        <div class="notification is-dark is-30h">
          <p class="title">{{'SETTINGS.TABS.GENERAL.DEFAULT_CURRENCY' | translate}}</p>
          <div class="field has-addons is-marginless">
            <div class="control">
              <a class="button is-tag is-primary">
                  <icon :fa="settings.defaultCurrency" />
                </a>
            </div>
            <div class="control select is-primary">
              <select v-model="settings.defaultCurrency">
                <option value="btc">Bitcoin</option>
                <option value="usd">Dollar</option>
                <option value="eur">Euro</option>
                <option value="try">Lira</option>
                <option value="gbp">{{ "CURRENCIES.POUND" | translate }}</option>
                <option value="inr">Rupee</option>
                <option value="rub">Rouble</option>
                <option value="cny">Yen</option>
                <option value="money">{{ "CURRENCIES.OTHER" | translate }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="column">
        <div class="notification is-dark is-30h">
          <p class="title">{{'SETTINGS.TABS.GENERAL.RECURRING' | translate}}</p>
          <div class="field has-addons flex">
            <div class="control" style="width: 10vw">
              <input class="input" type="number" min="1" v-model="settings.defaultOffset">
            </div>
            <div class="control select is-primary">
              <select class="select" v-model="settings.defaultTimeSpan">
                <option value="days">{{ (settings.defaultOffset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"days"| translate}}</option>
                <option value="weeks">{{ (settings.defaultOffset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"weeks"| translate}}</option>
                <option value="months">{{ (settings.defaultOffset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"months"| translate}}</option>
                <option value="quarters">{{ (settings.defaultOffset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"quarters"| translate}}</option>
                <option value="years">{{ (settings.defaultOffset > 1 ? "TIME_SPAN.PLURAL.":"TIME_SPAN.SINGULAR.")+"years"| translate}}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import icon from '@/components/common/icon.vue'

import moment from 'moment'

export default {
  components: { icon },
  data: function () {
    return {
      settings: this.$root.settings
    }
  },
  computed: {
    dateFormatTester: function () {
      return moment().format(this.settings.dateFormat)
    }
  },
  created: function () {
    moment.locale(this.settings.language)
  }
}
</script>
