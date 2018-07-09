<template lang="html">
  <div class="control field has-addons">
    <p class="control">
      <a class="button is-primary" :class="{'is-outlined' : !test}" @click="callback">
        <icon :fa="iconLeft"/>
      </a>
    </p>
    <p class="control">
      <a class="button is-primary" :class="{'is-outlined' : test}" @click="callback">
        <icon :fa="iconRight"/>
      </a>
    </p>
  </div>
</template>

<script>
import icon from '@/components/common/icon.vue'
export default {
  components: { icon },
  props: ['test', 'callback', 'iconLeft', 'iconRight']
}
</script>
