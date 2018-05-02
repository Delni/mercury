<template lang="html">
  <div class="control field has-addons">
    <div class="control">
      <a class="button is-primary is-tag"><icon :fa="fa" /></a>
    </div>
    <div class="control select">
      <select v-model="vModel">
        <option v-for="item in data" :value="item.value">{{item.label}}</option>
      </select>
    </div>
  </div>
</template>

<script>
import icon from './icon.vue'
export default {
  components: {
    icon
  },
  props: ['vModel', 'fa', 'data']
}
</script>

<style lang="css">
</style>
