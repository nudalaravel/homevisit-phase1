export { default as EditPatientModal } from '../../components/EditPatientModal.vue'
export { default as FailedSyncManager } from '../../components/FailedSyncManager.vue'
export { default as Loading } from '../../components/Loading.vue'
export { default as OnlineStatus } from '../../components/OnlineStatus.vue'
export { default as PatientListItem } from '../../components/PatientListItem.vue'
export { default as StorageStatus } from '../../components/StorageStatus.vue'
export { default as Toast } from '../../components/Toast.vue'
export { default as VisitRecordModal } from '../../components/VisitRecordModal.vue'
export { default as ActivityQuestionStep } from '../../components/survey/ActivityQuestionStep.vue'
export { default as ImageUploadStep } from '../../components/survey/ImageUploadStep.vue'
export { default as QuestionStep } from '../../components/survey/QuestionStep.vue'

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
