<template lang="html">
  <span class="icon" v-bind:class="size">
    <i class="fa" v-bind:class="((fa && fa.indexOf('fa-') === -1) ? 'fa-': '')+ fa"></i>
  </span>
</template>

<script>
export default {
  props: ['size', 'fa']
}
</script>
