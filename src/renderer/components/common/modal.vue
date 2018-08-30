<template lang="html">
  <div class="modal" :class="{'is-active' : active}">
    <div class="modal-background"></div>
    <div class="modal-content" :style="'width:' + width">
      <div class="notification is-dark ">
        <div class="media">
          <div class="media-left">
            <font-awesome-icon size="lg" :icon="icon"/>
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
export default {
  props: ['icon', 'active', 'close', 'width']
}
</script>
