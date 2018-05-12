<template lang="html">
  <div class="field has-addons" :class="{'control': isControl}">
    <div class="control">
      <a class="button is-primary is-tag"><icon :fa="fa" /></a>
    </div>
    <div class="control" :class="type">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import icon from './icon.vue'
export default {
  components: {
    icon
  },
  props: ['fa', 'type', 'isControl']
}
</script>

<style lang="css">
</style>
