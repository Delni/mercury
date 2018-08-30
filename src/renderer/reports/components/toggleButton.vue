<template lang="html">
  <div class="control field has-addons">
    <p class="control">
      <a class="button is-primary" :class="{'is-outlined' : !test}" @click="callback">
        <font-awesome-icon :icon="iconLeft"/>
      </a>
    </p>
    <p class="control">
      <a class="button is-primary" :class="{'is-outlined' : test}" @click="callback">
        <font-awesome-icon :icon="iconRight"/>
      </a>
    </p>
  </div>
</template>

<script>
export default {
  props: ['test', 'callback', 'iconLeft', 'iconRight']
}
</script>
