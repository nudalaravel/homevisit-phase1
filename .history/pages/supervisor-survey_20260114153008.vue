<template>
  <div class="supervisor-survey">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">บันทึกการสังเกตผู้เยี่ยมบ้าน</h1>
    </div>

    <!-- Form Section -->
    <b-form @submit.prevent="handleSubmit" class="form-section">
      <!-- Selection Dropdowns -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">ผู้เยี่ยมบ้าน</label>
          <select
            v-model="form.visitor"
            class="form-select select2"
            ref="visitorSelect"
          >
            <option
              v-for="option in visitorOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.text }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">ชื่อเด็ก</label>
          <select
            v-model="form.child"
            class="form-select select2"
            ref="childSelect"
          >
            <option
              v-for="option in childOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.text }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">วันที่เข้าเยี่ยมบ้าน</label>
          <select
            v-model="form.visitDate"
            class="form-select select2"
            ref="visitDateSelect"
          >
            <option
              v-for="option in visitDateOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.text }}
            </option>
          </select>
        </div>
      </div>

      <!-- Message when selections are incomplete -->
      <div v-if="!isFormReady" class="selection-message">
        <i class="fas fa-info-circle mr-2"></i>
        <span>กรุณาเลือกข้อมูลครบถ้วน</span>
      </div>

      <!-- No Data Indicator -->
      <div v-if="isFormReady" class="no-data-indicator">
        <span>ยังไม่มีการบันทึกข้อมูล</span>
      </div>

      <!-- Activity Details -->
      <div v-if="isFormReady" class="section">
        <div class="section-title">กิจกรรมการเยี่ยมบ้าน</div>
        <div class="activity-info">เดือนที่ 45 การเยี่ยมบ้าน 2</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">กิจกรรมเริ่มเวลา</label>
            <b-form-input
              v-model="form.activityStartTime"
              type="text"
              class="form-input"
              placeholder=""
            ></b-form-input>
          </div>
          <div class="form-group">
            <label class="form-label">กิจกรรมสิ้นสุดเวลา</label>
            <b-form-input
              v-model="form.activityEndTime"
              type="text"
              class="form-input"
              placeholder=""
            ></b-form-input>
          </div>
        </div>
      </div>

      <!-- Main Caregiver Section -->
      <div v-if="isFormReady" class="section">
        <div class="section-title">ผู้ดูแลหลัก:</div>
        <div class="radio-group">
          <b-form-radio
            v-for="option in caregiverOptions"
            :key="option.value"
            v-model="form.mainCaregiver"
            :value="option.value"
            class="radio-option"
          >
            {{ option.text }}
          </b-form-radio>
        </div>
      </div>

      <!-- Home Visit Section -->
      <div v-if="isFormReady" class="section">
        <div class="section-title">การเยี่ยมบ้าน</div>

        <!-- Question 1 -->
        <div class="question-group">
          <div class="question-label">
            <strong>Question 1:</strong> ใครเป็นผู้ดำเนินจัดกิจกรรมหลัก?
          </div>
          <div class="radio-group">
            <b-form-radio
              v-for="option in caregiverOptions"
              :key="option.value"
              v-model="form.q1"
              :value="option.value"
              class="radio-option"
            >
              {{ option.text }}
            </b-form-radio>
          </div>
        </div>

        <!-- Question 2 -->
        <div class="question-group">
          <div class="question-label">
            <strong>Question 2:</strong> เด็กมีส่วนร่วมในกิจกรรมหรือไม่?
          </div>
          <div class="radio-group">
            <b-form-radio
              v-model="form.q2"
              value="yes"
              class="radio-option"
            >
              มีส่วนร่วม
            </b-form-radio>
            <b-form-radio
              v-model="form.q2"
              value="no"
              class="radio-option"
            >
              ไม่มีส่วนร่วม
            </b-form-radio>
          </div>
          <div v-if="form.q2 === 'no'" class="sub-question">
            <div class="question-label">
              หากไม่มีส่วนร่วม เพราะเหตุใด?
            </div>
            <div class="radio-group">
              <b-form-radio
                v-model="form.q2Reason"
                value="not-present"
                class="radio-option"
              >
                ไม่อยู่
              </b-form-radio>
              <b-form-radio
                v-model="form.q2Reason"
                value="unwell"
                class="radio-option"
              >
                ไม่สบาย
              </b-form-radio>
              <b-form-radio
                v-model="form.q2Reason"
                value="asleep"
                class="radio-option"
              >
                นอนหลับ
              </b-form-radio>
              <b-form-radio
                v-model="form.q2Reason"
                value="other"
                class="radio-option"
              >
                อื่นๆ ระบุ
              </b-form-radio>
              <b-form-input
                v-if="form.q2Reason === 'other'"
                v-model="form.q2Other"
                type="text"
                class="form-input"
                placeholder="ระบุ"
              ></b-form-input>
            </div>
          </div>
        </div>

        <!-- Question 3 -->
        <div class="question-group">
          <div class="question-label">
            <strong>Question 3:</strong> มีผู้อื่นร่วมทำกิจกรรมด้วยหรือไม่
            (มากกว่า 20 นาที)?
          </div>
          <div class="radio-group">
            <b-form-radio
              v-model="form.q3"
              value="no"
              class="radio-option"
            >
              ไม่มี
            </b-form-radio>
            <b-form-radio
              v-model="form.q3"
              value="yes"
              class="radio-option"
            >
              มี
            </b-form-radio>
          </div>
          <div v-if="form.q3 === 'yes'" class="sub-question">
            <div class="checkbox-group">
              <b-form-checkbox
                v-for="option in participantOptions"
                :key="option.value"
                v-model="form.q3Participants"
                :value="option.value"
                class="checkbox-option"
              >
                {{ option.text }}
              </b-form-checkbox>
            </div>
          </div>
        </div>
      </div>

      <!-- Previous Home Visit Section -->
      <div v-if="isFormReady" class="section">
        <div class="section-title">การเยี่ยมบ้านครั้งที่ผ่านมา</div>
        <!-- TODO: Add previous visit content -->
      </div>

      <!-- Submit Button -->
      <div v-if="isFormReady" class="form-actions">
        <b-button
          type="submit"
          variant="primary"
          size="lg"
          :disabled="isSubmitting"
          class="submit-button"
        >
          <span v-if="isSubmitting">
            <b-spinner small class="mr-2"></b-spinner>
            กำลังบันทึก...
          </span>
          <span v-else>
            <i class="fas fa-save mr-2"></i>
            บันทึก
          </span>
        </b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
export default {
  layout: 'supervisor',
  middleware: 'auth',
  data() {
    return {
      isSubmitting: false,
      form: {
        visitor: null,
        child: null,
        visitDate: null,
        activityStartTime: '',
        activityEndTime: '',
        mainCaregiver: null,
        q1: null,
        q2: null,
        q2Reason: null,
        q2Other: '',
        q3: null,
        q3Participants: []
      },
      visitorOptions: [
        { value: null, text: '--เลือก--' },
        { value: '1', text: 'นายอุทิศ เนื่องแก้ว' }
      ],
      childOptions: [
        { value: null, text: '--เลือก--' },
        { value: '1', text: 'ณัฐบดินทร์ สมฆ้อง' }
      ],
      visitDateOptions: [
        { value: null, text: '--เลือก--' },
        { value: '1', text: 'อ. 03 ตุลาคม 2566' }
      ],
      caregiverOptions: [
        { value: 'mother', text: 'แม่' },
        { value: 'father', text: 'พ่อ' },
        { value: 'grandmother', text: 'ย่า/ยาย' },
        { value: 'grandfather', text: 'ปู่/ตา' },
        { value: 'sibling', text: 'พี่น้อง' },
        { value: 'aunt-uncle', text: 'ลุง/ป้า/น้า/อา' },
        { value: 'other-relative', text: 'ญาติคนอื่น' },
        { value: 'non-relative', text: 'ไม่ใช่ญาติ' }
      ],
      participantOptions: [
        { value: 'mother', text: 'แม่' },
        { value: 'father', text: 'พ่อ' },
        { value: 'grandmother', text: 'ย่า/ยาย' },
        { value: 'grandfather', text: 'ปู่/ตา' },
        { value: 'sibling', text: 'พี่น้อง' },
        { value: 'aunt-uncle', text: 'ลุง/ป้า/น้า/อา' },
        { value: 'other-relative', text: 'ญาติคนอื่น' },
        { value: 'non-relative', text: 'ไม่ใช่ญาติ' },
        { value: 'child-under-5', text: 'เด็กอายุต่ำกว่า 5 ปี' },
        { value: 'child-over-5', text: 'เด็กอายุมากกว่า 5 ปี' }
      ]
    }
  },
  computed: {
    isFormReady() {
      return (
        this.form.visitor !== null &&
        this.form.visitor !== undefined &&
        this.form.visitor !== '' &&
        this.form.child !== null &&
        this.form.child !== undefined &&
        this.form.child !== '' &&
        this.form.visitDate !== null &&
        this.form.visitDate !== undefined &&
        this.form.visitDate !== ''
      )
    }
  },
  methods: {
    async handleSubmit() {
      // Basic validation
      if (!this.form.visitor) {
        this.$toast.error('กรุณาเลือกผู้เยี่ยมบ้าน', 'ข้อมูลไม่ครบถ้วน')
        return
      }
      if (!this.form.child) {
        this.$toast.error('กรุณาเลือกชื่อเด็ก', 'ข้อมูลไม่ครบถ้วน')
        return
      }
      if (!this.form.visitDate) {
        this.$toast.error('กรุณาเลือกวันที่เข้าเยี่ยมบ้าน', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      this.isSubmitting = true

      try {
        // TODO: Implement API call to save survey data
        // Example:
        // await this.$axios.post('/api/supervisor/survey', this.form)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.$toast.success('บันทึกข้อมูลสำเร็จ', 'สำเร็จ')
        
        // Optionally reset form or redirect
        // this.resetForm()
      } catch (error) {
        console.error('Error saving survey:', error)
        this.$toast.error(
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
          'ข้อผิดพลาด'
        )
      } finally {
        this.isSubmitting = false
      }
    },
    resetForm() {
      this.form = {
        visitor: null,
        child: null,
        visitDate: null,
        activityStartTime: '',
        activityEndTime: '',
        mainCaregiver: null,
        q1: null,
        q2: null,
        q2Reason: null,
        q2Other: '',
        q3: null,
        q3Participants: []
      }
      
      // Reset Select2 dropdowns
      this.$nextTick(() => {
        if (this.$refs.visitorSelect && window.$) {
          window.$(this.$refs.visitorSelect).val(null).trigger('change')
        }
        if (this.$refs.childSelect && window.$) {
          window.$(this.$refs.childSelect).val(null).trigger('change')
        }
        if (this.$refs.visitDateSelect && window.$) {
          window.$(this.$refs.visitDateSelect).val(null).trigger('change')
        }
      })
    }
  },
  mounted() {
    // Initialize Select2 for dropdowns
    this.$nextTick(() => {
      if (this.$select2) {
        if (this.$refs.visitorSelect) {
          this.$select2.init(this.$refs.visitorSelect)
          window.$(this.$refs.visitorSelect).on('change', () => {
            this.form.visitor = window.$(this.$refs.visitorSelect).val()
          })
        }
        if (this.$refs.childSelect) {
          this.$select2.init(this.$refs.childSelect)
          window.$(this.$refs.childSelect).on('change', () => {
            this.form.child = window.$(this.$refs.childSelect).val()
          })
        }
        if (this.$refs.visitDateSelect) {
          this.$select2.init(this.$refs.visitDateSelect)
          window.$(this.$refs.visitDateSelect).on('change', () => {
            this.form.visitDate = window.$(this.$refs.visitDateSelect).val()
          })
        }
      }
    })
  },
  watch: {
    'form.visitor'(newVal) {
      if (this.$refs.visitorSelect && window.$) {
        window.$(this.$refs.visitorSelect).val(newVal).trigger('change')
      }
    },
    'form.child'(newVal) {
      if (this.$refs.childSelect && window.$) {
        window.$(this.$refs.childSelect).val(newVal).trigger('change')
      }
    },
    'form.visitDate'(newVal) {
      if (this.$refs.visitDateSelect && window.$) {
        window.$(this.$refs.visitDateSelect).val(newVal).trigger('change')
      }
    }
  },
  beforeDestroy() {
    // Destroy Select2 instances
    if (this.$select2) {
      if (this.$refs.visitorSelect && window.$) {
        window.$(this.$refs.visitorSelect).off('change')
        this.$select2.destroy(this.$refs.visitorSelect)
      }
      if (this.$refs.childSelect && window.$) {
        window.$(this.$refs.childSelect).off('change')
        this.$select2.destroy(this.$refs.childSelect)
      }
      if (this.$refs.visitDateSelect && window.$) {
        window.$(this.$refs.visitDateSelect).off('change')
        this.$select2.destroy(this.$refs.visitDateSelect)
      }
    }
  }
}
</script>

<style scoped>
.supervisor-survey {
  padding: 2rem;
  min-height: 100vh;
  background-color: #ffffff;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 500;
  color: #2c3e50;
  margin: 0;
}

.form-section {
  max-width: 1200px;
}

.form-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #495057;
  font-size: 0.95rem;
}

.form-select,
.form-input {
  height: 40px;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
}

.form-select {
  width: 100%;
}

::v-deep .select2-container {
  width: 100% !important;
}

::v-deep .select2-container--default .select2-selection--single {
  height: 40px;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
}

::v-deep .select2-container--default .select2-selection--single .select2-selection__rendered {
  line-height: 40px;
  padding-left: 12px;
  padding-right: 20px;
}

::v-deep .select2-container--default .select2-selection--single .select2-selection__arrow {
  height: 38px;
  right: 8px;
}

.no-data-indicator {
  background-color: #dc3545;
  color: white;
  padding: 1rem;
  border-radius: 0.375rem;
  text-align: center;
  font-weight: 500;
  margin-bottom: 2rem;
}

.selection-message {
  background-color: #fff3cd;
  color: #856404;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #ffc107;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.selection-message i {
  font-size: 1.1rem;
  margin-right: 0.5rem;
}

.section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.activity-info {
  color: #6c757d;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.question-group {
  margin-bottom: 1.5rem;
}

.question-label {
  font-size: 1rem;
  color: #495057;
  margin-bottom: 0.75rem;
}

.sub-question {
  margin-top: 1rem;
  margin-left: 1.5rem;
  padding-left: 1rem;
  border-left: 3px solid #3551a4;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.radio-option {
  margin-right: 0.5rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

  .checkbox-option {
  margin-bottom: 0.25rem;
}

::v-deep .custom-radio,
::v-deep .custom-checkbox {
  margin-right: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
  margin-top: 2rem;
  border-top: 2px solid #e9ecef;
}

.submit-button {
  min-width: 150px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .supervisor-survey {
    padding: 1rem;
  }

  .form-row {
    flex-direction: column;
  }

  .form-group {
    width: 100%;
  }

  .radio-group {
    flex-direction: column;
  }
}
</style>

