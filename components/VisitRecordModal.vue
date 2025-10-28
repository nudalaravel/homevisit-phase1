<template>
  <b-modal
    :value="show"
    title="แบบบันทึกข้อมูลสำหรับผู้เยี่ยมบ้าน"
    size="lg"
    no-close-on-backdrop
    @hidden="$emit('hidden')"
    @input="$emit('input', $event)"
    header-class="modal-header-visit"
  >
    <b-form>
      <div class="visit-info-grid">
        <div class="info-item">
          <label><i class="fas fa-calendar-alt"></i> วันที่เยี่ยมบ้าน</label>
          <div class="info-value">{{ formData.visitDate }}</div>
        </div>

        <div class="info-item">
          <label><i class="fas fa-user"></i> ชื่อ-นามสกุล</label>
          <div class="info-value">{{ formData.patientName }}</div>
        </div>

        <div class="info-item">
          <label><i class="fas fa-id-badge"></i> ชื่อเล่น</label>
          <div class="info-value">{{ formData.nickname }}</div>
        </div>

        <div class="info-item full-width">
          <label><i class="fas fa-clock"></i> เวลาเริ่มต้นการเยี่ยมบ้าน</label>
          <b-form-select
            :value="formData.startTime"
            :options="timeOptions"
            class="custom-select-visit"
            @input="$emit('update:formData', { ...formData, startTime: $event })"
          ></b-form-select>
        </div>
      </div>
    </b-form>

    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        <i class="fas fa-times"></i>
        ปิด
      </b-button>
      <b-button variant="primary" @click="$emit('continue')">
        <i class="fas fa-arrow-right"></i>
        เริ่มทำแบบสอบถาม
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { TIME_OPTIONS } from '~/utils/constants'

export default {
  name: 'VisitRecordModal',
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
      timeOptions: TIME_OPTIONS
    }
  }
}
</script>

<style scoped>
.visit-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-weight: 400;
  color: #2c3e50;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info-item label i {
  color: #3551a4;
  font-size: 1.3rem;
}

.info-value {
  background: #f8f9fa;
  padding: 1.1rem 1.35rem;
  border-radius: 0.5rem;
  border: 2px solid #dee2e6;
  color: #2c3e50;
  font-weight: 400;
  font-size: 1.2rem;
}

.custom-select-visit {
  font-size: 1.35rem !important;
  height: 62px !important;
  padding: 0.975rem 1.1rem !important;
  color: #2c3e50 !important;
  font-weight: 400 !important;
  background-color: white !important;
  border: 2px solid #ced4da !important;
  border-radius: 0.5rem !important;
  transition: all 0.3s ease !important;
}

.custom-select-visit:focus {
  border-color: #3551a4 !important;
  outline: 0 !important;
  box-shadow: 0 0 0 0.2rem rgba(53, 81, 164, 0.15) !important;
}
</style>

