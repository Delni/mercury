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
import icon from '@/components/common/icon'
export default {
  components: {
    icon
  },
  props: ['fa', 'type', 'isControl']
}
</script>
