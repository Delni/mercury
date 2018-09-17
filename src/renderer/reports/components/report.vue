<template lang="html">
  <div :class="$root.settings.theme" id="app">
    <section id="window" class="hero is-fullheight is-dark">
        <div class="hero-head">
          <p class="title">
            <span style="margin-left:2%; -webkit-app-region: drag">
              <span class="icon">
                <font-awesome-icon :class="'has-text-' + color" :icon="icon" />
              </span>
              {{title | translate}}
            </span>
            <a onclick="window.close()" class="button is-outlined is-danger is-pulled-right">
              <font-awesome-icon icon="times"/>
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
export default {
  props: ['title', 'color', 'icon']
}
</script>
