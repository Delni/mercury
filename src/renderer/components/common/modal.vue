<template lang="html">
  <div class="modal" :class="{'is-active' : active}">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="notification is-dark ">
        <div class="media">
          <div class="media-left">
            <icon size="is-large" :fa="'fa-' + icon + ' fa-2x'"/>
          </div>
          <div class="media-content">
            <slot></slot>
          </div>
          <div class="media-right">
            <button class="delete" @click="close()"></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import icon from './icon.vue'

export default {
  components: {icon},
  props: ['icon', 'active', 'close']
}
</script>

<style lang="css">
</style>
