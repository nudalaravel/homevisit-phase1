export const EditPatientModal = () => import('../..\\components\\EditPatientModal.vue' /* webpackChunkName: "components/edit-patient-modal" */).then(c => wrapFunctional(c.default || c))
export const FailedSyncManager = () => import('../..\\components\\FailedSyncManager.vue' /* webpackChunkName: "components/failed-sync-manager" */).then(c => wrapFunctional(c.default || c))
export const Loading = () => import('../..\\components\\Loading.vue' /* webpackChunkName: "components/loading" */).then(c => wrapFunctional(c.default || c))
export const OnlineStatus = () => import('../..\\components\\OnlineStatus.vue' /* webpackChunkName: "components/online-status" */).then(c => wrapFunctional(c.default || c))
export const PatientListItem = () => import('../..\\components\\PatientListItem.vue' /* webpackChunkName: "components/patient-list-item" */).then(c => wrapFunctional(c.default || c))
export const StorageStatus = () => import('../..\\components\\StorageStatus.vue' /* webpackChunkName: "components/storage-status" */).then(c => wrapFunctional(c.default || c))
export const Toast = () => import('../..\\components\\Toast.vue' /* webpackChunkName: "components/toast" */).then(c => wrapFunctional(c.default || c))
export const VisitRecordModal = () => import('../..\\components\\VisitRecordModal.vue' /* webpackChunkName: "components/visit-record-modal" */).then(c => wrapFunctional(c.default || c))
export const ActivityQuestionStep = () => import('../..\\components\\survey\\ActivityQuestionStep.vue' /* webpackChunkName: "components/activity-question-step" */).then(c => wrapFunctional(c.default || c))
export const ImageUploadStep = () => import('../..\\components\\survey\\ImageUploadStep.vue' /* webpackChunkName: "components/image-upload-step" */).then(c => wrapFunctional(c.default || c))
export const QuestionStep = () => import('../..\\components\\survey\\QuestionStep.vue' /* webpackChunkName: "components/question-step" */).then(c => wrapFunctional(c.default || c))

// nuxt/nuxt.js#8607
function wrapFunctional(options) {
  if (!options || !options.functional) {
    return options
  }

  const propKeys = Array.isArray(options.props) ? options.props : Object.keys(options.props || {})

  return {
    render(h) {
      const attrs = {}
      const props = {}

      for (const key in this.$attrs) {
        if (propKeys.includes(key)) {
          props[key] = this.$attrs[key]
        } else {
          attrs[key] = this.$attrs[key]
        }
      }

      return h(options, {
        on: this.$listeners,
        attrs,
        props,
        scopedSlots: this.$scopedSlots,
      }, this.$slots.default)
    }
  }
}
