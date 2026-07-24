<template>
  <div class="supervisor-survey">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">
        บันทึกการสังเกตผู้เยี่ยมบ้าน
        <b-badge v-if="isEditMode" variant="warning" class="ml-2">โหมดแก้ไข</b-badge>
        <b-badge v-else-if="isFormReady && !loadingObservation" variant="success" class="ml-2">สร้างใหม่</b-badge>
      </h1>
      <div v-if="loadingObservation" class="loading-observation">
        <i class="fas fa-spinner fa-spin mr-2"></i>
        <span>กำลังโหลดข้อมูลเดิม...</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loadingData" class="loading-state">
      <i class="fas fa-spinner fa-spin mr-2"></i>
      <span>กำลังโหลดข้อมูล...</span>
    </div>

    <!-- Form Section -->
    <b-form v-else @submit.prevent="handleSubmit" class="form-section">
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
          <div class="visit-date-row">
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
            <button
              v-if="childLocation"
              type="button"
              class="btn-map"
              @click="openChildMap"
              title="เปิดแผนที่นำทาง"
            >
              <i class="fas fa-map-marker-alt"></i>
              <span>แผนที่เด็ก</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Message when selections are incomplete -->
      <div v-if="!isFormReady" class="selection-message">
        <i class="fas fa-info-circle mr-2"></i>
        <span>กรุณาเลือกข้อมูลครบถ้วน</span>
      </div>

      <!-- Survey Form Content -->
      <div v-if="isFormReady" class="survey-content">
        
        <!-- Fixed Form Section -->
        <div class="fixed-form-section">
          <!-- วันที่เข้าเยี่ยมบ้าน (read-only) -->
          <div class="fixed-form-row">
            <label class="fixed-label">วันที่เข้าเยี่ยมบ้าน :</label>
            <span class="fixed-value">{{ formatThaiDateFull(selectedVisitData.date_app_curr || selectedVisitData.date_visit) }}</span>
          </div>
          
          <!-- กิจกรรมการเยี่ยมบ้าน (read-only) -->
          <div class="fixed-form-row">
            <label class="fixed-label">กิจกรรมการเยี่ยมบ้าน :</label>
            <span class="fixed-value">เดือนที่ {{ selectedVisitData.month_age || '-' }} ครั้งที่ {{ selectedVisitData.time || '-' }}</span>
          </div>
          
          <!-- กิจกรรมเริ่มเวลา (free text) -->
          <div class="fixed-form-row" :class="{ 'has-error': validationErrors.timeStart }">
            <label class="fixed-label">กิจกรรมเริ่มเวลา : <span class="required-mark">*</span></label>
            <input 
              v-model="fixForm.timeStart"
              type="text"
              class="form-control fixed-input"
              :class="{ 'is-invalid': validationErrors.timeStart }"
              placeholder="เช่น 09.00 น."
            />
            <div v-if="validationErrors.timeStart" class="error-message">
              <i class="fas fa-exclamation-circle"></i> กรุณากรอกเวลาเริ่มต้น
            </div>
          </div>
          
          <!-- กิจกรรมสิ้นสุดเวลา (free text) -->
          <div class="fixed-form-row" :class="{ 'has-error': validationErrors.timeEnd }">
            <label class="fixed-label">กิจกรรมสิ้นสุดเวลา : <span class="required-mark">*</span></label>
            <input 
              v-model="fixForm.timeEnd"
              type="text"
              class="form-control fixed-input"
              :class="{ 'is-invalid': validationErrors.timeEnd }"
              placeholder="เช่น 10.00 น."
            />
            <div v-if="validationErrors.timeEnd" class="error-message">
              <i class="fas fa-exclamation-circle"></i> กรุณากรอกเวลาสิ้นสุด
            </div>
          </div>
          
          <!-- ผู้ดูแลหลัก (q0 - styled like other questions) -->
          <div class="question-section q0-section" :class="{ 'has-error': validationErrors.q0 }">
            <h4 class="question-title">
              ผู้ดูแลหลัก
              <span class="required-mark">*</span>
            </h4>
            <div v-if="validationErrors.q0" class="error-message">
              <i class="fas fa-exclamation-circle"></i> กรุณาเลือกผู้ดูแลหลัก
            </div>
            <div class="options-container">
              <button
                v-for="opt in q0Options"
                :key="opt.value"
                type="button"
                class="option-btn"
                :class="{ 'selected': fixForm.q0 === opt.value }"
                @click="fixForm.q0 = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Dynamic Questions by Section -->
        <template v-for="(sectionQuestions, sectionName) in groupedQuestions">
          <!-- Section Header -->
          <div :key="'section-' + sectionName" class="section-header">
            <h3 class="section-title">{{ sectionName }}</h3>
          </div>
          
          <!-- Questions in Section -->
          <template v-for="(question, qIndex) in sectionQuestions">
            <!-- Skip q5 if first visit (time_visit=1) -->
            <div 
              v-if="shouldShowQuestion(question)"
              :key="question.question_code"
              class="question-section"
              :class="{ 'has-error': hasError(question.question_code) }"
            >
              <!-- Question Title -->
              <h4 class="question-title">
                {{ getQuestionNumber(question) }}. {{ question.question_text }}
                <span v-if="question.choices && question.choices.length > 0" class="required-mark">*</span>
              </h4>
              <div v-if="hasError(question.question_code)" class="error-message">
                <i class="fas fa-exclamation-circle"></i> กรุณาเลือกคำตอบ
              </div>
              
              <!-- Single Select (Radio-style buttons) -->
              <div v-if="question.qtype === 'single'" class="options-container">
                <!-- Empty choices warning -->
                <div v-if="!question.choices || question.choices.length === 0" class="no-choices-warning">
                  <i class="fas fa-exclamation-triangle"></i>
                  <span>ไม่มีตัวเลือกสำหรับคำถามนี้ (กรุณาติดต่อผู้ดูแลระบบ)</span>
                </div>
                <button
                  v-for="choice in question.choices"
                  :key="choice.value"
                  type="button"
                  class="option-btn"
                  :class="{ 'selected': answers[question.question_code] === choice.value }"
                  @click="setAnswer(question.question_code, choice.value, choice)"
                >
                  {{ choice.label }}
                </button>
              </div>
              
              <!-- Multi Select (Checkbox-style buttons) -->
              <div v-else-if="question.qtype === 'multi'" class="options-container multi-select">
                <button
                  v-for="choice in question.choices"
                  :key="choice.value"
                  type="button"
                  class="option-btn"
                  :class="{ 'selected': isMultiSelected(question.question_code, choice.value) }"
                  @click="toggleMultiAnswer(question.question_code, choice.value, choice)"
                >
                  {{ choice.label }}
                </button>
              </div>
              
              <!-- "Other" Text Input (is_other=1) -->
              <div 
                v-if="shouldShowOtherInput(question)" 
                class="sub-question-input"
              >
                <label class="form-label">โปรดระบุ:</label>
                <b-form-input
                  v-model="answers[question.question_code + '_other']"
                  placeholder="โปรดระบุ..."
                ></b-form-input>
              </div>
              
              <!-- Child Questions (Sub-questions) -->
              <template v-for="choice in question.choices">
                <template v-if="choice.children && shouldShowChildren(question.question_code, choice)">
                  <div 
                    v-for="childQ in choice.children" 
                    :key="childQ.question_code"
                    class="sub-question"
                  >
                    <h5 class="sub-question-title">{{ childQ.question_text }}</h5>
                    
                    <!-- Child Single Select -->
                    <div v-if="childQ.qtype === 'single'" class="options-container">
                      <button
                        v-for="childChoice in childQ.choices"
                        :key="childChoice.value"
                        type="button"
                        class="option-btn"
                        :class="{ 'selected': answers[childQ.question_code] === childChoice.value }"
                        @click="setAnswer(childQ.question_code, childChoice.value, childChoice)"
                      >
                        {{ childChoice.label }}
                      </button>
                    </div>
                    
                    <!-- Child Multi Select -->
                    <div v-else-if="childQ.qtype === 'multi'" class="options-container multi-select">
                      <button
                        v-for="childChoice in childQ.choices"
                        :key="childChoice.value"
                        type="button"
                        class="option-btn"
                        :class="{ 'selected': isMultiSelected(childQ.question_code, childChoice.value) }"
                        @click="toggleMultiAnswer(childQ.question_code, childChoice.value, childChoice)"
                      >
                        {{ childChoice.label }}
                      </button>
                    </div>
                    
                    <!-- Child "Other" Input -->
                    <div 
                      v-if="shouldShowOtherInputForChild(childQ)" 
                      class="sub-question-input"
                    >
                      <label class="form-label">โปรดระบุ:</label>
                      <b-form-input
                        v-model="answers[childQ.question_code + '_other']"
                        placeholder="โปรดระบุ..."
                      ></b-form-input>
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </template>
        </template>

        <!-- Notes Section -->
        <div class="question-section">
          <h4 class="question-title">บันทึกเพิ่มเติม</h4>
          <b-form-textarea
            v-model="answers.notes"
            placeholder="กรอกข้อมูลเพิ่มเติม..."
            rows="6"
            class="notes-textarea"
          ></b-form-textarea>
        </div>

        <!-- Image Upload Section -->
        <div class="question-section">
          <h4 class="question-title">รูปภาพการเยี่ยมบ้าน</h4>
          <div v-if="loadingImage" class="image-loading-overlay">
            <i class="fas fa-spinner fa-spin"></i>
            <span>กำลังประมวลผลรูปภาพ...</span>
          </div>
          
          <!-- Image 1 -->
          <div class="image-upload-block">
            <div class="image-label">รูปภาพที่ 1: รูปของเล่น สื่ออุปกรณ์ที่ใช้ในครั้งนี้</div>
            <div class="upload-container">
              <div v-if="!images.image1" class="upload-placeholder" @click="triggerFileInput(0)">
                <i class="fas fa-image"></i>
                <p>ยังไม่มีรูปภาพ</p>
                <span class="upload-hint">คลิกเพื่อเลือกรูป</span>
              </div>
              <div v-else class="image-preview">
                <img :src="images.image1" alt="รูปของเล่น สื่ออุปกรณ์" />
                <button type="button" class="remove-image-btn" @click="removeImage(0)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <input
                ref="fileInput0"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileInput($event, 0)"
              />
              <b-button
                v-if="images.image1"
                variant="outline-warning"
                size="sm"
                class="mt-2"
                @click="triggerFileInput(0)"
              >
                <i class="fas fa-camera"></i> เลือกรูปใหม่
              </b-button>
            </div>
          </div>

          <!-- Image 2 -->
          <div class="image-upload-block">
            <div class="image-label">รูปภาพที่ 2: รูปขณะที่เด็กและผู้ปกครองทำกิจกรรม</div>
            <div class="upload-container">
              <div v-if="!images.image2" class="upload-placeholder" @click="triggerFileInput(1)">
                <i class="fas fa-image"></i>
                <p>ยังไม่มีรูปภาพ</p>
                <span class="upload-hint">คลิกเพื่อเลือกรูป</span>
              </div>
              <div v-else class="image-preview">
                <img :src="images.image2" alt="รูปเด็กและผู้ปกครองทำกิจกรรม" />
                <button type="button" class="remove-image-btn" @click="removeImage(1)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <input
                ref="fileInput1"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileInput($event, 1)"
              />
              <b-button
                v-if="images.image2"
                variant="outline-warning"
                size="sm"
                class="mt-2"
                @click="triggerFileInput(1)"
              >
                <i class="fas fa-camera"></i> เลือกรูปใหม่
              </b-button>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <b-button
            type="submit"
            variant="success"
            size="lg"
            :disabled="isSubmitting"
            class="submit-button"
          >
            <span v-if="isSubmitting">
              <b-spinner small class="mr-2"></b-spinner>
              กำลังบันทึก...
            </span>
            <span v-else-if="isEditMode">
              <i class="fas fa-save mr-2"></i>
              อัปเดตข้อมูล
            </span>
            <span v-else>
              <i class="fas fa-check-circle mr-2"></i>
              บันทึกข้อมูล
            </span>
          </b-button>
        </div>
      </div>
    </b-form>
  </div>
</template>

<script>
import { convertToWebP } from '~/utils/imageHelpers'

export default {
  layout: 'supervisor',
  middleware: 'auth',
  data() {
    return {
      isSubmitting: false,
      loadingData: true,
      form: {
        visitor: null,
        child: null,
        visitDate: null
      },
      // Fixed form fields (at top)
      fixForm: {
        timeStart: '',
        timeEnd: '',
        q0: null  // ผู้ดูแลหลัก
      },
      // q0 options
      q0Options: [
        { value: '1', label: 'แม่' },
        { value: '2', label: 'พ่อ' },
        { value: '3', label: 'ย่า/ยาย' },
        { value: '4', label: 'ปู่/ตา' },
        { value: '5', label: 'พี่น้อง' },
        { value: '6', label: 'ลุง/ป้า/น้า/อา' },
        { value: '7', label: 'ญาติคนอื่น' },
        { value: '8', label: 'ไม่ใช่ญาติ' }
      ],
      answers: {
        notes: ''
      },
      validationErrors: {}, // Track validation errors
      showValidationAlert: false,
      images: {
        image1: null,
        image2: null
      },
      loadingImage: false,
      loadingMap: false,
      childLocation: null, // { lat, lon }
      // API Data
      visitorOptions: [
        { value: null, text: '--เลือก--' }
      ],
      allVisitResults: [],
      surveyQuestions: [], // Questions from API
      selectedVisitData: null, // To track time_visit
      // Edit Mode
      isEditMode: false,
      existingData: null,
      loadingObservation: false
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
    },
    // Filter children by selected visitor (recby = username)
    childOptions() {
      const options = [{ value: null, text: '--เลือก--' }]
      
      if (!this.form.visitor) {
        return options
      }
      
      const filteredResults = this.allVisitResults.filter(
        item => item.recby === this.form.visitor
      )
      
      const uniqueChildren = new Map()
      filteredResults.forEach(item => {
        if (!uniqueChildren.has(item.stid)) {
          uniqueChildren.set(item.stid, {
            value: item.stid,
            text: item.fname_ch || '-',
            data: item
          })
        }
      })
      
      return [...options, ...Array.from(uniqueChildren.values())]
    },
    // Filter visit dates by selected child
    visitDateOptions() {
      const options = [{ value: null, text: '--เลือก--' }]
      
      if (!this.form.visitor || !this.form.child) {
        return options
      }
      
      const filteredResults = this.allVisitResults.filter(
        item => item.stid === this.form.child && item.recby === this.form.visitor
      )
      
      filteredResults.forEach(item => {
        // Use date_app_curr instead of date_visit
        const dateToUse = item.date_app_curr || item.date_visit
        if (dateToUse) {
          const formattedDate = this.formatThaiDateOption(dateToUse)
          options.push({
            value: `${item.stid}_${item.time_visit}`,
            text: `${formattedDate} (ครั้งที่ ${item.time_visit || 1})`,
            data: item
          })
        }
      })
      
      return options
    },
    // Get current time_visit from selected visit
    currentTimeVisit() {
      if (!this.form.visitDate || !this.selectedVisitData) {
        return null
      }
      return parseInt(this.selectedVisitData.time_visit) || null
    },
    // Group questions by section
    groupedQuestions() {
      const groups = {}
      
      // Only include top-level questions (no parent_code)
      const mainQuestions = this.surveyQuestions.filter(q => !q.parent_code)
      
      mainQuestions.forEach(q => {
        const section = q.section || 'อื่นๆ'
        if (!groups[section]) {
          groups[section] = []
        }
        groups[section].push(q)
      })
      
      return groups
    }
  },
  beforeMount() {
    // แหล่งที่ 1: store
    let userLevel = this.$store.state.auth?.user?.level

    // แหล่งที่ 2: offlineAuth
    if (userLevel === undefined && this.$offlineAuth) {
      userLevel = this.$offlineAuth.getUser()?.level
    }

    // แหล่งที่ 3: localStorage
    if (userLevel === undefined) {
      try {
        const raw = localStorage.getItem('offline_auth_data')
        if (raw) {
          userLevel = JSON.parse(raw)?.user?.level
        }
      } catch (e) {}
    }

    // console.log('userLevel:', userLevel)

    if (userLevel === 3) {
      this.$router.replace('/')
    }
    // level 1 → อยู่หน้านี้ได้เลย
  },
  methods: {
    // Set single answer
    setAnswer(questionCode, value, choice) {
      this.$set(this.answers, questionCode, value)
      
      // Clear child answers when parent changes (if needed)
      if (choice && choice.children) {
        // Keep child answers
      }
    },
    
    // Check if multi-select option is selected
    isMultiSelected(questionCode, value) {
      const current = this.answers[questionCode]
      return Array.isArray(current) && current.includes(value)
    },
    
    // Toggle multi-select answer
    toggleMultiAnswer(questionCode, value, choice) {
      if (!this.answers[questionCode]) {
        this.$set(this.answers, questionCode, [])
      }
      
      const current = this.answers[questionCode]
      const index = current.indexOf(value)
      
      if (index === -1) {
        current.push(value)
      } else {
        current.splice(index, 1)
      }
    },
    
    // Check if question should be shown (skip q5 if time_visit=1)
    shouldShowQuestion(question) {
      if (question.question_code === 'q5' && this.currentTimeVisit === 1) {
        return false
      }
      return true
    },
    
    // Get display question number
    getQuestionNumber(question) {
      // Extract number from question_code (e.g., q1 -> 1)
      const match = question.question_code.match(/q(\d+)/)
      return match ? match[1] : question.sort_order
    },
    
    // Check if "other" input should be shown
    shouldShowOtherInput(question) {
      const answer = this.answers[question.question_code]
      
      // For single select
      if (question.qtype === 'single') {
        const selectedChoice = question.choices.find(c => c.value === answer)
        return selectedChoice && selectedChoice.is_other === 1
      }
      
      // For multi select
      if (question.qtype === 'multi' && Array.isArray(answer)) {
        return answer.some(val => {
          const choice = question.choices.find(c => c.value === val)
          return choice && choice.is_other === 1
        })
      }
      
      return false
    },
    
    // Check if "other" input for child question should be shown
    shouldShowOtherInputForChild(childQ) {
      const answer = this.answers[childQ.question_code]
      
      if (childQ.qtype === 'single') {
        const selectedChoice = childQ.choices.find(c => c.value === answer)
        return selectedChoice && selectedChoice.is_other === 1
      }
      
      if (childQ.qtype === 'multi' && Array.isArray(answer)) {
        return answer.some(val => {
          const choice = childQ.choices.find(c => c.value === val)
          return choice && choice.is_other === 1
        })
      }
      
      return false
    },
    
    // Check if children sub-questions should be shown
    shouldShowChildren(parentCode, choice) {
      const parentAnswer = this.answers[parentCode]
      
      // Check if this choice is selected and has show_when condition
      if (choice.children && choice.children.length > 0) {
        const childQ = choice.children[0]
        if (childQ.show_when && childQ.show_when.choice_value) {
          return parentAnswer === childQ.show_when.choice_value
        }
        // Default: show if parent choice is selected
        return parentAnswer === choice.value
      }
      
      return false
    },
    
    // Check if a question has validation error
    hasError(questionCode) {
      return this.showValidationAlert && this.validationErrors[questionCode]
    },
    
    // Check if a question is required (all main questions are required)
    isQuestionRequired(question) {
      // Skip if no choices available (can't answer)
      if (!question.choices || question.choices.length === 0) {
        return false
      }
      // All main questions without parent_code are required
      return !question.parent_code
    },
    
    // Validate entire form
    validateForm() {
      this.validationErrors = {}
      let missingCount = 0
      
      // Get all visible main questions
      const mainQuestions = this.surveyQuestions.filter(q => !q.parent_code)
      
      for (const question of mainQuestions) {
        // Skip if question is not shown (e.g., q5 on first visit)
        if (!this.shouldShowQuestion(question)) {
          continue
        }
        
        // Skip if question has no choices (can't answer, e.g., q14)
        if (!question.choices || question.choices.length === 0) {
          continue
        }
        
        const answer = this.answers[question.question_code]
        let isAnswered = false
        
        if (question.qtype === 'single') {
          isAnswered = answer !== null && answer !== undefined && answer !== ''
        } else if (question.qtype === 'multi') {
          isAnswered = Array.isArray(answer) && answer.length > 0
        }
        
        if (!isAnswered) {
          this.$set(this.validationErrors, question.question_code, true)
          missingCount++
        }
        
        // Check "other" input if required
        if (isAnswered && this.shouldShowOtherInput(question)) {
          const otherAnswer = this.answers[question.question_code + '_other']
          if (!otherAnswer || otherAnswer.trim() === '') {
            this.$set(this.validationErrors, question.question_code + '_other', true)
            missingCount++
          }
        }
        
        // Check child questions if visible
        if (question.choices) {
          for (const choice of question.choices) {
            if (choice.children && this.shouldShowChildren(question.question_code, choice)) {
              for (const childQ of choice.children) {
                const childAnswer = this.answers[childQ.question_code]
                let isChildAnswered = false
                
                if (childQ.qtype === 'single') {
                  isChildAnswered = childAnswer !== null && childAnswer !== undefined && childAnswer !== ''
                } else if (childQ.qtype === 'multi') {
                  isChildAnswered = Array.isArray(childAnswer) && childAnswer.length > 0
                }
                
                if (!isChildAnswered) {
                  this.$set(this.validationErrors, childQ.question_code, true)
                  missingCount++
                }
                
                // Check child "other" input
                if (isChildAnswered && this.shouldShowOtherInputForChild(childQ)) {
                  const childOtherAnswer = this.answers[childQ.question_code + '_other']
                  if (!childOtherAnswer || childOtherAnswer.trim() === '') {
                    this.$set(this.validationErrors, childQ.question_code + '_other', true)
                    missingCount++
                  }
                }
              }
            }
          }
        }
      }
      
      // Validate q0 (ผู้ดูแลหลัก - required)
      if (!this.fixForm.q0) {
        this.$set(this.validationErrors, 'q0', true)
        missingCount++
      }
      
      // Validate timeStart (required)
      if (!this.fixForm.timeStart || this.fixForm.timeStart.trim() === '') {
        this.$set(this.validationErrors, 'timeStart', true)
        missingCount++
      }
      
      // Validate timeEnd (required)
      if (!this.fixForm.timeEnd || this.fixForm.timeEnd.trim() === '') {
        this.$set(this.validationErrors, 'timeEnd', true)
        missingCount++
      }
      
      return {
        isValid: missingCount === 0,
        missingCount
      }
    },
    
    // Fetch visitors from API
    async fetchVisitors() {
      try {
        const url = '/api/parenting2025_census/get/homevisit/getuser.php'
        const response = await this.$axios.$get(url)
        
        const isSuccess = response.message === 'success' || response.statusCode === 200
        
        if (isSuccess && response.results) {
          this.visitorOptions = [
            { value: null, text: '--เลือก--' },
            ...response.results.map(user => ({
              value: user.username,
              text: `${user.fname || ''} ${user.lname || ''}`.trim() || user.username,
              data: user
            }))
          ]
        }
      } catch (error) {
        console.error('Error fetching visitors:', error)
        this.$toast.error('ไม่สามารถดึงข้อมูลผู้เยี่ยมบ้านได้')
      }
    },
    
    // Fetch visit results from API
    async fetchVisitResults() {
      try {
        const url = '/api/parenting2025_census/get/homevisit/sup/gethomevisit_resultlist.php'
        const response = await this.$axios.$get(url)
        
        const isSuccess = response.message === 'success' || response.statusCode === 200
        
        if (isSuccess && response.results) {
          this.allVisitResults = response.results
        }
      } catch (error) {
        console.error('Error fetching visit results:', error)
        this.$toast.error('ไม่สามารถดึงข้อมูลผลการเยี่ยมบ้านได้')
      }
    },
    
    // Fetch survey questions from API
    async fetchSurveyQuestions() {
      try {
        const url = '/api/parenting2025_census/get/homevisit/sup/gethomevisit_observations_question.php'
        const response = await this.$axios.$get(url)
        
        const isSuccess = response.message === 'success' || response.statusCode === 200
        
        if (isSuccess && response.results) {
          this.surveyQuestions = response.results
          
          // Initialize answers for each question
          this.surveyQuestions.forEach(q => {
            // Fallback choices for q14 if empty
            // if (q.question_code === 'q14' && (!q.choices || q.choices.length === 0)) {
            //   q.choices = [
            //     { value: '1', label: 'ส่วนใหญ่', order: 1, is_other: 0 },
            //     { value: '2', label: 'บางครั้ง', order: 2, is_other: 0 },
            //     { value: '3', label: 'เล็กน้อย', order: 3, is_other: 0 },
            //     { value: '4', label: 'ไม่เลย', order: 4, is_other: 0 }
            //   ]
            // }
            
            if (q.qtype === 'multi') {
              this.$set(this.answers, q.question_code, [])
            } else {
              this.$set(this.answers, q.question_code, null)
            }
            
            // Also initialize child questions
            if (q.choices) {
              q.choices.forEach(choice => {
                if (choice.children) {
                  choice.children.forEach(childQ => {
                    if (childQ.qtype === 'multi') {
                      this.$set(this.answers, childQ.question_code, [])
                    } else {
                      this.$set(this.answers, childQ.question_code, null)
                    }
                  })
                }
              })
            }
          })
        }
      } catch (error) {
        console.error('Error fetching survey questions:', error)
        this.$toast.error('ไม่สามารถดึงข้อมูลคำถามได้')
      }
    },
    
    // Fetch existing observation data (for edit mode)
    async fetchObservationData() {
      if (!this.selectedVisitData) return
      
      const { recby, stid, time_visit } = this.selectedVisitData
      if (!recby || !stid || !time_visit) return
      
      this.loadingObservation = true
      
      try {
        const url = `/api/parenting2025_census/get/homevisit/sup/gethomevisit_observation_data.php?homevisitor=${encodeURIComponent(recby)}&stid=${encodeURIComponent(stid)}&time_visit=${encodeURIComponent(time_visit)}`
        const response = await this.$axios.$get(url)
        
        const isSuccess = response.message === 'success' || response.statusCode === 200
        
        if (isSuccess && response.results && response.results.length > 0) {
          // มีข้อมูลเดิม → Edit mode
          this.existingData = response.results[0]
          this.isEditMode = true
          this.populateFormFromData(this.existingData)
          this.$toast.info('กำลังแก้ไขแบบสังเกตผู้เยี่ยมบ้าน')
        } else {
          // ไม่มีข้อมูล → Create mode
          this.existingData = null
          this.isEditMode = false
          this.resetFormAnswers()
        }
      } catch (error) {
        console.error('Error fetching observation data:', error)
        // ถ้า API error ให้เป็น create mode
        this.existingData = null
        this.isEditMode = false
        this.resetFormAnswers()
      } finally {
        this.loadingObservation = false
      }
    },
    
    // Populate form from existing data
    populateFormFromData(data) {
      // Map fixForm fields
      if (data.timeStart) {
        this.fixForm.timeStart = data.timeStart
      }
      if (data.timeEnd) {
        this.fixForm.timeEnd = data.timeEnd
      }
      if (data.q0) {
        this.fixForm.q0 = String(data.q0)
      }
      
      // Map q1-q30
      for (let i = 1; i <= 30; i++) {
        const key = `q${i}`
        if (data[key] !== null && data[key] !== undefined) {
          this.$set(this.answers, key, data[key])
        }
      }
      
      // Map q2a → q2_reason
      if (data.q2a) {
        this.$set(this.answers, 'q2_reason', data.q2a)
      }
      
      // Map q2a_des → q2_reason_other
      if (data.q2a_des) {
        this.$set(this.answers, 'q2_reason_other', data.q2a_des)
      }
      
      // Map q3a → q3_who (comma-separated to array)
      if (data.q3a) {
        const whoArray = data.q3a.split(',').filter(v => v.trim())
        this.$set(this.answers, 'q3_who', whoArray)
      }
      
      // Map note → notes
      if (data.note) {
        this.$set(this.answers, 'notes', data.note)
      }
      
      // Map pictures
      if (data.pic1) {
        this.images.image1 = data.pic1
      }
      if (data.pic2) {
        this.images.image2 = data.pic2
      }
    },
    
    // Reset form answers (for create mode)
    resetFormAnswers() {
      // Reset all q1-q30 answers
      this.surveyQuestions.forEach(q => {
        if (q.qtype === 'multi') {
          this.$set(this.answers, q.question_code, [])
        } else {
          this.$set(this.answers, q.question_code, null)
        }
        
        // Reset child questions too
        if (q.choices) {
          q.choices.forEach(choice => {
            if (choice.children) {
              choice.children.forEach(childQ => {
                if (childQ.qtype === 'multi') {
                  this.$set(this.answers, childQ.question_code, [])
                } else {
                  this.$set(this.answers, childQ.question_code, null)
                }
                // Reset _other fields
                this.$set(this.answers, childQ.question_code + '_other', '')
              })
            }
          })
        }
      })
      
      // Reset notes and images
      this.answers.notes = ''
      this.images.image1 = null
      this.images.image2 = null
      
      // Reset fixForm fields
      this.fixForm.timeStart = ''
      this.fixForm.timeEnd = ''
      this.fixForm.q0 = null
    },
    
    // Format date to Thai
    formatThaiDateOption(dateStr) {
      if (!dateStr) return '-'
      try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return dateStr
        
        const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
        const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                           'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
        
        const dayName = thaiDays[date.getDay()]
        const day = date.getDate().toString().padStart(2, '0')
        const month = thaiMonths[date.getMonth()]
        const year = date.getFullYear() + 543
        
        return `${dayName} ${day} ${month} ${year}`
      } catch (e) {
        return dateStr
      }
    },
    
    // Format date to full Thai format (พฤ. 22 ธันวาคม 2565)
    formatThaiDateFull(dateStr) {
      if (!dateStr) return '-'
      try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return dateStr
        
        const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
        const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                           'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
        
        const dayName = thaiDays[date.getDay()]
        const day = date.getDate()
        const month = thaiMonths[date.getMonth()]
        const year = date.getFullYear() + 543
        
        return `${dayName} ${day} ${month} ${year}`
      } catch (e) {
        return dateStr
      }
    },
    
    // Reset child and visitDate when visitor changes
    resetChildSelection() {
      this.form.child = null
      this.form.visitDate = null
      this.selectedVisitData = null
      
      this.$nextTick(() => {
        if (this.$select2 && this.$refs.childSelect && window.$) {
          window.$(this.$refs.childSelect).val(null).trigger('change')
        }
        if (this.$select2 && this.$refs.visitDateSelect && window.$) {
          window.$(this.$refs.visitDateSelect).val(null).trigger('change')
        }
      })
    },
    
    // Reset visitDate when child changes
    resetVisitDateSelection() {
      this.form.visitDate = null
      this.selectedVisitData = null
      
      this.$nextTick(() => {
        if (this.$select2 && this.$refs.visitDateSelect && window.$) {
          window.$(this.$refs.visitDateSelect).val(null).trigger('change')
        }
      })
    },
    
    // Update selectedVisitData when visitDate changes
    updateSelectedVisitData() {
      if (this.form.visitDate) {
        const option = this.visitDateOptions.find(o => o.value === this.form.visitDate)
        this.selectedVisitData = option ? option.data : null
      } else {
        this.selectedVisitData = null
      }
    },
    
    // Image handling
    triggerFileInput(index) {
      const refName = `fileInput${index}`
      if (this.$refs[refName]) {
        this.$refs[refName].click()
      }
    },
    async openChildMap() {
      if (!this.childLocation) return
      const { lat, lon } = this.childLocation
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
      window.open(mapsUrl, '_blank')
    },
    async fetchChildLocation(stid) {
      if (!stid) {
        this.childLocation = null
        return
      }

      this.loadingMap = true
      try {
        const response = await this.$axios.$get(
          '/api/parenting2025_census/get/homevisit/getchildsample.php',
          { params: { stid } }
        )

        const result = response?.results?.[0]
        const lat = result?.latitude
        const lon = result?.longitude

        if (lat && lon && lat !== '0' && lon !== '0') {
          this.childLocation = { lat, lon }
        } else {
          this.childLocation = null
        }
      } catch (error) {
        console.error('Error fetching child location:', error)
        this.childLocation = null
      } finally {
        this.loadingMap = false
      }
    },
    async handleFileInput(event, index) {
      const file = event.target.files[0]
      if (!file) return

      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        this.$toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        return
      }

      // ตรวจสอบขนาดไฟล์ สูงสุด 10MB
      if (file.size > 10 * 1024 * 1024) {
        this.$toast.error('ไฟล์รูปภาพมีขนาดใหญ่เกินไป (สูงสุด 10MB)')
        return
      }

      this.loadingImage = true
      try {
        // แปลงเป็น WebP และปรับขนาด
        const webpImage = await convertToWebP(file, 1000, 1000, 0.90)

        if (index === 0) {
          this.images.image1 = webpImage
        } else {
          this.images.image2 = webpImage
        }
        this.$toast.success(`อัพโหลดรูปภาพที่ ${index + 1} สำเร็จ`)
      } catch (error) {
        console.error('Error processing image:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ')
      } finally {
        this.loadingImage = false
        // Reset file input
        const refName = `fileInput${index}`
        if (this.$refs[refName]) {
          this.$refs[refName].value = ''
        }
      }
    },
    removeImage(index) {
      if (index === 0) {
        this.images.image1 = null
        if (this.$refs.fileInput0) {
          this.$refs.fileInput0.value = ''
        }
      } else {
        this.images.image2 = null
        if (this.$refs.fileInput1) {
          this.$refs.fileInput1.value = ''
        }
      }
    },
    
    // Submit form
    async handleSubmit() {
      if (!this.isFormReady) {
        this.$toast.error('กรุณาเลือกข้อมูลครบถ้วน', 'ข้อมูลไม่ครบถ้วน')
        return
      }
      
      // Validate all required questions
      const validationResult = this.validateForm()
      if (!validationResult.isValid) {
        this.showValidationAlert = true
        this.$toast.error(`กรุณาตอบคำถามให้ครบถ้วน (ยังขาด ${validationResult.missingCount} ข้อ)`, 'ข้อมูลไม่ครบถ้วน')
        
        // Scroll to first error
        this.$nextTick(() => {
          const firstError = document.querySelector('.question-section.has-error')
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        })
        return
      }
      
      this.showValidationAlert = false
      this.isSubmitting = true

      try {
        // Upload images to S3 first
        let pic1Url = ''
        let pic2Url = ''
        const stid = this.selectedVisitData.stid
        const timeVisit = this.selectedVisitData.time_visit
        const isNewImage = (img) => !!img && img.startsWith('data:image')

        // Upload pic1 if it's a newly selected image; keep existing URL if unchanged
        if (isNewImage(this.images.image1)) {
          this.$toast.info('กำลังอัพโหลดรูปภาพที่ 1...', 'กำลังอัพโหลด')
          pic1Url = await this.uploadImageToS3(this.images.image1, 'observation1', stid, timeVisit)
          if (!pic1Url) {
            throw new Error('ไม่สามารถอัพโหลดรูปภาพที่ 1 ได้')
          }
        } else if (this.images.image1) {
          pic1Url = this.images.image1
        }

        // Upload pic2 if it's a newly selected image; keep existing URL if unchanged
        if (isNewImage(this.images.image2)) {
          this.$toast.info('กำลังอัพโหลดรูปภาพที่ 2...', 'กำลังอัพโหลด')
          pic2Url = await this.uploadImageToS3(this.images.image2, 'observation2', stid, timeVisit)
          if (!pic2Url) {
            throw new Error('ไม่สามารถอัพโหลดรูปภาพที่ 2 ได้')
          }
        } else if (this.images.image2) {
          pic2Url = this.images.image2
        }
        
        // Build payload with uploaded image URLs
        const payload = this.buildPayload(pic1Url, pic2Url)
        
        if (this.isEditMode) {
          // UPDATE existing record
          await this.$axios.$put(
            '/api/parenting2025_census/put/homevisit/putdata.php',
            {
              variable: payload.variable,
              value: payload.value,
              pk: ['stid', 'time_visit','homevisitor'],
              pkval: [this.selectedVisitData.stid, String(this.selectedVisitData.time_visit),this.selectedVisitData.recby],
              tb: 'homevisitor_observation'
            }
          )
          this.$toast.success('อัปเดตข้อมูลสำเร็จ', 'สำเร็จ')
        } else {
          // CREATE new record
          await this.$axios.$post(
            '/api/parenting2025_census/post/homevisit/datarecord1row.php',
            {
              variable: payload.variable,
              value: payload.value,
              tb: 'homevisitor_observation'
            }
          )
          this.$toast.success('บันทึกข้อมูลสำเร็จ', 'สำเร็จ')
        }
        
        // Refresh data after save
        await this.fetchObservationData()
        
      } catch (error) {
        console.error('Error saving survey:', error)
        this.$toast.error(
          error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
          'ข้อผิดพลาด'
        )
      } finally {
        this.isSubmitting = false
      }
    },
    
    // Build payload for API
    buildPayload(pic1Url = '', pic2Url = '') {
      const data = this.selectedVisitData
      
      // Generate recStart for new records
      const now = new Date()
      const recStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      
      const variable = [
        'recby',
        'project',
        'homevisitor',
        'stid',
        'date_visit',
        'time_visit',
        'month_age',
        'time',
        // Fixed form fields
        'recStart',
        'timeStart',
        'timeEnd',
        'q0',
        // q1-q30
        'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10',
        'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q20',
        'q21', 'q22', 'q23', 'q24', 'q25', 'q26', 'q27', 'q28', 'q29', 'q30',
        // Special fields
        'q2a',
        'q2a_des',
        'q3a',
        'note',
        'pic1',
        'pic2'
      ]
      
      // Get supervisor username
      const supervisorUsername = this.$offlineAuth?.getUser?.()?.username || ''
      
      // Use date_app_curr for date_visit if available
      const dateVisit = data.date_app_curr || data.date_visit || ''
      
      // For update mode, use existing recStart if available
      const recStartValue = this.isEditMode && this.existingData?.recStart 
        ? this.existingData.recStart 
        : recStart
      
      const value = [
        supervisorUsername, // recby = supervisor username
        '15', // project fixed
        this.form.visitor || '',
        data.stid || '',
        dateVisit,
        String(data.time_visit || ''),
        String(data.month_age || ''),
        String(data.time || ''),
        // Fixed form fields
        recStartValue,
        this.fixForm.timeStart || '',
        this.fixForm.timeEnd || '',
        String(this.fixForm.q0 || ''),
        // q1-q30 values
        String(this.answers.q1 || ''),
        String(this.answers.q2 || ''),
        String(this.answers.q3 || ''),
        String(this.answers.q4 || ''),
        String(this.answers.q5 || ''),
        String(this.answers.q6 || ''),
        String(this.answers.q7 || ''),
        String(this.answers.q8 || ''),
        String(this.answers.q9 || ''),
        String(this.answers.q10 || ''),
        String(this.answers.q11 || ''),
        String(this.answers.q12 || ''),
        String(this.answers.q13 || ''),
        String(this.answers.q14 || ''),
        String(this.answers.q15 || ''),
        String(this.answers.q16 || ''),
        String(this.answers.q17 || ''),
        String(this.answers.q18 || ''),
        String(this.answers.q19 || ''),
        String(this.answers.q20 || ''),
        String(this.answers.q21 || ''),
        String(this.answers.q22 || ''),
        String(this.answers.q23 || ''),
        String(this.answers.q24 || ''),
        String(this.answers.q25 || ''),
        String(this.answers.q26 || ''),
        String(this.answers.q27 || ''),
        String(this.answers.q28 || ''),
        String(this.answers.q29 || ''),
        String(this.answers.q30 || ''),
        // Special fields
        String(this.answers.q2_reason || ''),
        String(this.answers.q2_reason_other || ''),
        Array.isArray(this.answers.q3_who) ? this.answers.q3_who.join(',') : String(this.answers.q3_who || ''),
        this.answers.notes || '',
        pic1Url,
        pic2Url
      ]
      
      return { variable, value }
    },
    
    // Upload image to S3 and get URL
    async uploadImageToS3(base64Image, picname, stid, timeVisit) {
      try {
        if (!base64Image || !base64Image.startsWith('data:image')) {
          return ''
        }
        
        const response = await this.$axios.$post(
          '/api/parenting2025_census/post/homevisit/s3upload.php',
          {
            image: base64Image,
            picname: picname,
            stid: stid,
            time_visit: String(timeVisit)
          }
        )
        
        if (response && response.url) {
          return response.url
        }
        
        return ''
      } catch (error) {
        console.error('Failed to upload image to S3:', error)
        throw error
      }
    }
  },
  async mounted() {
    this.loadingData = true
    try {
      await Promise.all([
        this.fetchVisitors(),
        this.fetchVisitResults(),
        this.fetchSurveyQuestions()
      ])
    } finally {
      this.loadingData = false
    }
    
    // Initialize Select2
    this.$nextTick(() => {
      if (this.$select2) {
        if (this.$refs.visitorSelect) {
          this.$select2.init(this.$refs.visitorSelect)
          window.$(this.$refs.visitorSelect).on('change', () => {
            const newVal = window.$(this.$refs.visitorSelect).val()
            if (this.form.visitor !== newVal) {
              this.form.visitor = newVal
              this.resetChildSelection()
            }
          })
        }
        if (this.$refs.childSelect) {
          this.$select2.init(this.$refs.childSelect)
          window.$(this.$refs.childSelect).on('change', () => {
            const newVal = window.$(this.$refs.childSelect).val()
            if (this.form.child !== newVal) {
              this.form.child = newVal
              this.resetVisitDateSelection()
            }
          })
        }
        if (this.$refs.visitDateSelect) {
          this.$select2.init(this.$refs.visitDateSelect)
          window.$(this.$refs.visitDateSelect).on('change', () => {
            this.form.visitDate = window.$(this.$refs.visitDateSelect).val()
            this.updateSelectedVisitData()
          })
        }
      }
    })
  },
  watch: {
    'form.visitor'(newVal, oldVal) {
      if (this.$refs.visitorSelect && window.$) {
        window.$(this.$refs.visitorSelect).val(newVal).trigger('change.select2')
      }
    },
    'form.child'(newVal, oldVal) {
      if (this.$refs.childSelect && window.$) {
        window.$(this.$refs.childSelect).val(newVal).trigger('change.select2')
      }
      // ดึงพิกัดเด็กเมื่อเลือกเด็กใหม่
      this.fetchChildLocation(newVal)
    },
    'form.visitDate'(newVal) {
      if (this.$refs.visitDateSelect && window.$) {
        window.$(this.$refs.visitDateSelect).val(newVal).trigger('change.select2')
      }
      this.updateSelectedVisitData()
    },
    childOptions: {
      handler() {
        this.$nextTick(() => {
          if (this.$select2 && this.$refs.childSelect && window.$) {
            this.$select2.destroy(this.$refs.childSelect)
            this.$select2.init(this.$refs.childSelect)
            window.$(this.$refs.childSelect).on('change', () => {
              const newVal = window.$(this.$refs.childSelect).val()
              if (this.form.child !== newVal) {
                this.form.child = newVal
                this.resetVisitDateSelection()
              }
            })
          }
        })
      },
      deep: true
    },
    visitDateOptions: {
      handler() {
        this.$nextTick(() => {
          if (this.$select2 && this.$refs.visitDateSelect && window.$) {
            this.$select2.destroy(this.$refs.visitDateSelect)
            this.$select2.init(this.$refs.visitDateSelect)
            window.$(this.$refs.visitDateSelect).on('change', () => {
              this.form.visitDate = window.$(this.$refs.visitDateSelect).val()
              this.updateSelectedVisitData()
            })
          }
        })
      },
      deep: true
    },
    // Fetch observation data when visit is selected
    selectedVisitData: {
      handler(newVal) {
        if (newVal && newVal.recby && newVal.stid && newVal.time_visit) {
          this.fetchObservationData()
        } else {
          this.isEditMode = false
          this.existingData = null
        }
      },
      deep: true
    }
  },
  beforeDestroy() {
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
/* Fixed Form Section */
.fixed-form-section {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.fixed-form-row {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.fixed-form-row:last-child {
  margin-bottom: 0;
}

.fixed-label {
  font-weight: 500;
  color: #495057;
  min-width: 160px;
}

.fixed-value {
  color: #212529;
}

.fixed-input {
  max-width: 250px;
  height: 38px;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
}

.q0-row {
  flex-wrap: wrap;
  align-items: flex-start;
}

.q0-options {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.q0-options .radio-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  font-weight: normal;
}

.q0-options .radio-inline input[type="radio"] {
  margin: 0;
}

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

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6c757d;
  font-size: 1.1rem;
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

.visit-date-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.visit-date-row .form-select {
  flex: 1;
}

.btn-map {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.75rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s;
}

.btn-map:hover:not(:disabled) {
  background-color: #218838;
}

.btn-map:disabled {
  background-color: #94d3a2;
  cursor: not-allowed;
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

.loading-observation {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #fff3cd;
  border-radius: 0.375rem;
  color: #856404;
  font-size: 0.9rem;
  margin-top: 0.5rem;
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

.survey-content {
  margin-top: 1.5rem;
}

.section-header {
  margin-top: 2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #3551a4;
}

.section-header:first-child {
  margin-top: 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #3551a4;
  margin: 0;
}

.question-section {
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.question-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.options-container.multi-select {
  gap: 0.5rem;
}

.option-btn {
  padding: 0.75rem 1.25rem;
  border: 2px solid #ced4da;
  border-radius: 0.5rem;
  background-color: #fff;
  color: #495057;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn:hover {
  border-color: #3551a4;
  background-color: #f0f4ff;
}

.option-btn.selected {
  border-color: #3551a4;
  background-color: #3551a4;
  color: #fff;
}

.no-choices-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 0.375rem;
  color: #856404;
  font-size: 0.9rem;
  width: 100%;
}

/* Validation Error Styles */
.question-section.has-error {
  border: 2px solid #dc3545;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.required-mark {
  color: #dc3545;
  font-weight: bold;
  margin-left: 2px;
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message i {
  font-size: 0.85rem;
}

.question-section.has-error .option-btn {
  border-color: #f5c6cb;
}

.sub-question {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #fff;
  border-radius: 0.375rem;
}

.sub-question-title {
  font-size: 1rem;
  font-weight: 500;
  color: #495057;
  margin-bottom: 1rem;
}

.sub-question-input {
  margin-top: 1rem;
}

.sub-question-input .form-label {
  display: block;
  margin-bottom: 0.5rem;
}

.notes-textarea {
  width: 100%;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
}

.form-actions {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
  margin-top: 2rem;
  border-top: 2px solid #e9ecef;
}

.submit-button {
  min-width: 200px;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
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

  .options-container {
    flex-direction: column;
  }

  .option-btn {
    width: 100%;
    text-align: center;
  }
}

/* Image Upload Styles */
.image-upload-block {
  margin-bottom: 1.5rem;
}

.image-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.75rem;
}

.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-placeholder {
  width: 100%;
  max-width: 400px;
  height: 200px;
  border: 2px dashed #ced4da;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fff;
}

.upload-placeholder:hover {
  border-color: #3551a4;
  background-color: #f0f4ff;
}

.upload-placeholder i {
  font-size: 3rem;
  color: #ced4da;
  margin-bottom: 0.5rem;
}

.upload-placeholder p {
  color: #6c757d;
  margin: 0;
}

.upload-hint {
  font-size: 0.85rem;
  color: #adb5bd;
  margin-top: 0.5rem;
}

.image-preview {
  position: relative;
  max-width: 400px;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-preview img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: rgba(220, 53, 69, 0.9);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-image-btn:hover {
  background-color: #dc3545;
  transform: scale(1.1);
}

.image-loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  color: #4a5568;
  font-size: 0.95rem;
}

.image-loading-overlay i {
  font-size: 1.25rem;
  color: #3551a4;
}
</style>
