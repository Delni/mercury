<template lang="html">
  <div>
    <p class="title is-marginless"><icon size="is-medium" class="has-text-success" fa="fa-recycle"/> {{'MAIN_PANE.RECURRINGS.TITLE' | translate}}</p>
    <!-- <recurring-bar /> -->
    <nav class="level">
      <div class="level-item">
        <a class="button is-info" @click="showRecModal('create')"><icon fa="fa-plus-circle" /> <span>{{ "MAIN_PANE.RECURRINGS.BAR.CREATE" | translate}}</span></a>
      </div>
      <div class="level-item">
        <a class="button is-large is-danger" @click="showRecModal('launch')"><icon size="is-medium" fa="fa-rocket" /> <span>{{ "MAIN_PANE.RECURRINGS.BAR.LAUNCH" | translate}}</span></a>
      </div>
      <div class="level-item">
        <a class="button is-success" @click="showRecModal('edit')"><icon fa="fa-pencil" /> <span>{{ "MAIN_PANE.RECURRINGS.BAR.EDIT" | translate}}</span></a>
      </div>
    </nav>
    <!-- <recurring-modal /> -->
    <div class="modal" :class="{'is-active': recModalActive}">
      <div class="modal-background"></div>
      <div class="modal-content" style="width: 60vw">
          <div class="notification is-dark">
            <div class="media">
              <div class="media-left">
                <icon size="is-large" :class="'has-text-'+modalConfig.color" :fa="modalConfig.icon" />
              </div>
              <div class="media-content" v-if="modalConfig.translate !== 'LAUNCH'">
                <p class="title">{{'MAIN_PANE.RECURRINGS.MODAL.TITLE.'+modalConfig.translate| translate}}</p>
                <div class="columns">
                  <div class="content column">

                  </div>
                  <div class="content column">

                  </div>
                  <div class="content column">

                  </div>
                </div>
                <div class="field">
                  <p class="control pull-left">
                    <a class="button is-info" @click="modalConfig.callback">{{'MAIN_PANE.RECURRINGS.MODAL.CONFIRM_BUTTON.'+modalConfig.translate| translate}}</a>
                  </p>
                  <p class="control pull-right">
                    <a class="button is-danger" @click="closeRecModal()">{{'CANCEL'| translate}}</a>
                  </p>
                  <p v-if="modalConfig.translate === 'EDIT'" class="level-item">
                    <a class="button is-warning" @click="deleteRec()">{{'DELETE' | translate}}</a>
                  </p>
                </div>
              </div>
              <div class="media-content" v-else>

              </div>
              <div class="media-right">
                <button class="delete" @click="closeRecModal()"></button>
              </div>
            </div>
          </div>
      </div>
    </div>
    <!-- <recurring-table /> -->
    <div class="notification is-black">
      <table class="table is-fullwidth">
        <tbody>
          <tr v-if="!recurrings.length">
            <td colspan="6" class="has-text-centered">{{'NO_DATA' | translate}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import icon from '../common/icon.vue'

export default {
  components: {
    icon
  },
  data: function () {
    return {
      recModalActive: false,
      recurrings: [],
      modalConfig: {callback: () => {}}
    }
  },
  methods: {
    showRecModal: function (type) {
      switch (type) {
        case 'create':
          this.modalConfig = {
            color: 'info',
            icon: 'fa-plus-circle',
            translate: 'CREATE',
            callback: () => {}
          }
          break
        case 'edit':
          this.modalConfig = {
            color: 'success',
            icon: 'fa-pencil',
            translate: 'EDIT',
            callback: () => {}
          }
          break
        case 'launch':
          this.modalConfig = {
            color: 'warning',
            icon: 'fa-rocket',
            translate: 'LAUNCH',
            callback: () => {}
          }
          break
        default:
          this.modalConfig = {
            callback: () => {

            }
          }
      }
      this.recModalActive = true
    },

    closeRecModal: function () {
      this.recModalActive = false
    }
  }
}
</script>

<style lang="css">
</style>
