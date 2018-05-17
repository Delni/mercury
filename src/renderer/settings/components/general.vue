<template lang="html">
  <div class="columns" style="width: 100%">
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

      <div class="notification is-dark is-30h">
        <p class="title is-marginless">{{'SETTINGS.TABS.GENERAL.LANGUAGE' | translate}}</p>
        <div class="field has-addons is-marginless">
          <div class="control">
            <a class="button is-tag is-primary">
                <icon fa="language" />
              </a>
          </div>
          <div class="control select is-primary">
            <select v-model="settings.language">
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </div>

    </div>
    <div class="column">

      <div class="notification is-dark is-30h">
        <p class="title is-marginless">{{'SETTINGS.TABS.GENERAL.CALENDAR_HELPER' | translate}}</p>
        <div class="field">
          <input id="calendar" type="checkbox" name="calendar" class="switch is-rounded" v-model="settings.useDatepicker">
          <label for="calendar">{{'SETTINGS.TABS.GENERAL.USE_CALENDAR' | translate}}</label>
        </div>
        <div class="field">
          <input type="text" class="input" :placeholder="'SETTINGS.TABS.GENERAL.SAMPLE_CALENDAR' | translate">
        </div>
      </div>

      <div class="notification is-dark is-30h">
        <p class="title is-marginless">{{'SETTINGS.TABS.GENERAL.DEFAULT_CURRENCY' | translate}}</p>
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
  </div>
</template>

<script>
import icon from '../../components/common/icon.vue'

export default {
  components: { icon },
  data: function () {
    return {
      settings: this.$root.settings
    }
  }
}
</script>

<style lang="css">
.is-30h {
  height: 30vh
}
.field {
  padding-top: 1px;
}
</style>
