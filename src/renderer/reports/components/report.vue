<template lang="html">
  <div :class="$root.settings.theme" id="app">
    <section id="window" class="hero is-fullheight is-dark">
        <div class="hero-head">
          <p class="title">
            <span style="margin-left:2%; -webkit-app-region: drag">
              <icon :size="'is-large has-text-' + color" :fa="icon" />
              <span>{{title | translate}}</span>
            </span>
            <a onclick="window.close()" class="button is-outlined is-danger pull-right">
              <icon fa="fa-times"/>
            </a>
          </p>
        </div>
        <div class="hero-body is-paddingless">
          <article class="is-main-pane">
            <div class="columns">
              <div class="column is-two-thirds">
                <canvas id="myChart"height="225%"></canvas>
              </div>
              <div class="column" style="border-left: 1px grey solid">
                <p class="title is-marginless">{{'OPTIONS' | translate}}</p>
                <slot></slot>
              </div>
            </div>
          </article>
        </div>
    </section>
  </div>
</template>

<script>
import icon from '../../components/common/icon.vue'
export default {
  components: { icon },
  props: ['title', 'color', 'icon']
}
</script>

<style lang="css">
</style>
