<template lang="html">
  <div class="field has-addons" :class="{'control': isControl}">
    <div class="control">
      <a class="button is-primary is-tag"><font-awesome-icon :icon="fa" fixed-width /></a>
    </div>
    <div class="control" :class="type">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: ['fa', 'type', 'isControl']
}
</script>
