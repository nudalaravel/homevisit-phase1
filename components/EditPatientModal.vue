<template>
  <b-modal
    :value="show"
    title="แก้ไขข้อมูล"
    no-close-on-backdrop
    @ok="handleOk"
    @hidden="handleHidden"
    @input="$emit('input', $event)"
  >
    <b-form @submit.prevent="handleOk">
      <b-form-group label="ชื่อ-นามสกุล" label-for="edit-name">
        <b-form-input
          id="edit-name"
          :value="formData.name"
          disabled
          placeholder="ชื่อ-นามสกุล"
        ></b-form-input>
      </b-form-group>

      <b-form-group label="ชื่อเล่น" label-for="edit-nickname">
        <b-form-input
          id="edit-nickname"
          :value="formData.nickname"
          disabled
          placeholder="ชื่อเล่น"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label="เบอร์โทรศัพท์"
        label-for="edit-tel"
        :invalid-feedback="errors.tel"
        :state="errors.tel ? false : null"
      >
        <b-form-input
          id="edit-tel"
          :value="formData.tel"
          placeholder="เบอร์โทรศัพท์ (เช่น 0812345678)"
          :state="errors.tel ? false : null"
          @input="handleInput('tel', $event)"
          @blur="handleBlur('tel')"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label="ที่อยู่"
        label-for="edit-address"
        :invalid-feedback="errors.address"
        :state="errors.address ? false : null"
      >
        <b-form-textarea
          id="edit-address"
          :value="formData.address"
          placeholder="ที่อยู่"
          rows="3"
          :state="errors.address ? false : null"
          @input="handleInput('address', $event)"
          @blur="handleBlur('address')"
        ></b-form-textarea>
      </b-form-group>
    </b-form>

    <template #modal-footer="{ ok, cancel }">
      <b-button variant="secondary" @click="cancel()">
        ยกเลิก
      </b-button>
      <b-button variant="primary" @click="ok()">
        บันทึก
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { validatePhoneNumber, validateAddress } from '~/utils/validators'

export default {
  name: 'EditPatientModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      errors: {}
    }
  },
  methods: {
    handleInput(field, value) {
      this.$emit('update:formData', { ...this.formData, [field]: value })
      this.clearError(field)
    },
    handleBlur(field) {
      this.validateField(field)
    },
    validateField(field) {
      if (field === 'tel') {
        const result = validatePhoneNumber(this.formData.tel)
        if (!result.valid) {
          this.$set(this.errors, 'tel', result.error)
          return false
        } else {
          this.clearError('tel')
        }
      } else if (field === 'address') {
        const result = validateAddress(this.formData.address)
        if (!result.valid) {
          this.$set(this.errors, 'address', result.error)
          return false
        } else {
          this.clearError('address')
        }
      }
      return true
    },
    validateAll() {
      this.errors = {}
      const telValid = this.validateField('tel')
      const addressValid = this.validateField('address')
      return telValid && addressValid
    },
    clearError(field) {
      if (this.errors[field]) {
        this.$delete(this.errors, field)
      }
    },
    handleOk(bvModalEvt) {
      bvModalEvt.preventDefault()
      if (this.validateAll()) {
        this.$emit('save', this.formData)
      }
    },
    handleHidden() {
      this.errors = {}
      this.$emit('hidden')
    }
  }
}
</script>

