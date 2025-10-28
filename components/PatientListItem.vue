<template>
  <div class="patient-card-row">
    <!-- Name Column -->
    <div
      class="card-col card-col-name"
      @click="$emit('edit-patient', visitor)"
    >
      <div class="card-name">{{ visitor.name }}</div>
      <div class="card-nickname">({{ visitor.nickname }})</div>
    </div>

    <!-- Appointment Column -->
    <div
      class="card-col card-col-appointment"
      :class="{
        'has-appointment': visitor.appointmentDate,
        'no-appointment': !visitor.appointmentDate,
        'disabled-appointment': !visitor.canEditAppointment
      }"
      :style="{ cursor: visitor.canEditAppointment ? 'pointer' : 'not-allowed' }"
      @click="handleAppointmentClick"
    >
      <template v-if="visitor.appointmentDate">
        <div class="appointment-date">{{ formattedDate }}</div>
        <div class="appointment-time">
          {{ visitor.appointmentTime }}
          <template v-if="visitor.month_age && visitor.time">
            ({{ visitor.month_age }}/{{ visitor.time }})
          </template>
        </div>
      </template>
      <div v-else class="appointment-placeholder">
        ยังไม่ได้กำหนดวันนัดหมาย
      </div>
    </div>

    <!-- Visit Record Column -->
    <div
      class="card-col card-col-visit"
      :class="visitStatusClass"
      :style="{ cursor: canRecord ? 'pointer' : 'not-allowed' }"
      @click="handleRecordClick"
    >
      <div :class="visitTextClass">{{ visitStatusText }}</div>
    </div>

    <!-- Edit Column -->
    <div
      class="card-col card-col-edit"
      :class="{ 'card-col-disabled': !visitor.hasCompletedSurveys }"
      :style="{ cursor: visitor.hasCompletedSurveys ? 'pointer' : 'not-allowed' }"
      @click="handleHistoryClick"
    >
      <div class="edit-text">แก้ไขการเยี่ยมบ้าน</div>
    </div>
  </div>
</template>

<script>
import { formatAppointmentDateShort } from '~/utils/dateHelpers'
import { canRecordVisit } from '~/utils/visitHelpers'

export default {
  name: 'PatientListItem',
  props: {
    visitor: {
      type: Object,
      required: true
    }
  },
  computed: {
    formattedDate() {
      return formatAppointmentDateShort(this.visitor.appointmentDate)
    },
    canRecord() {
      return this.visitor.appointmentDate && canRecordVisit(this.visitor)
    },
    visitStatusClass() {
      return {
        'visit-ready': this.visitor.appointmentDate && canRecordVisit(this.visitor),
        'visit-disabled': !this.visitor.appointmentDate || !canRecordVisit(this.visitor),
        'visit-completed': this.visitor.currentSurveyCompleted && this.visitor.currentSurveySynced,
        'visit-pending-upload': this.visitor.currentSurveyCompleted && !this.visitor.currentSurveySynced
      }
    },
    visitTextClass() {
      if (this.canRecord) {
        return 'visit-text'
      }
      return 'visit-text-disabled'
    },
    visitStatusText() {
      if (this.visitor.currentSurveyCompleted && !this.visitor.currentSurveySynced) {
        return 'รอการอัพโหลด\nขึ้นระบบ'
      }
      if (this.visitor.currentSurveyCompleted && this.visitor.currentSurveySynced && !this.visitor.currentSurveyApproved && !this.visitor.currentSurveyNote) {
        return 'บันทึกเรียบร้อย'
      }
      if (this.visitor.appointmentDate && canRecordVisit(this.visitor)) {
        return 'บันทึกเยี่ยมบ้าน'
      }
      return 'ยังไม่ได้บันทึก\nการเยี่ยมบ้าน'
    }
  },
  methods: {
    handleAppointmentClick() {
      if (this.visitor.canEditAppointment) {
        this.$emit('schedule-appointment', this.visitor)
      }
    },
    handleRecordClick() {
      if (this.canRecord) {
        this.$emit('record-visit', this.visitor)
      }
    },
    handleHistoryClick() {
      if (this.visitor.hasCompletedSurveys) {
        this.$emit('show-history', this.visitor)
      }
    }
  }
}
</script>

