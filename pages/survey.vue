<template>
  <div>
    <Loading :show="loading" :message="loadingMessage" />
    
    <!-- Step 1: ผู้ปกครองสามารถควบคุมหากิจกรรม -->
    <div v-if="currentStep === 1" class="survey-step">
      <h4 class="question-title">1.ผู้ปกครองสามารถควบคุมหากิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</h4>
      
      <div class="options-container">
        <button
          class="option-btn"
          :class="{ 'selected': answers.q1 === 1 }"
          @click="answers.q1 = 1"
        >
          ได้ (1)
        </button>
        
        <button
          class="option-btn"
          :class="{ 'selected': answers.q1 === 3 }"
          @click="answers.q1 = 3"
        >
          ไม่ได้ (3)
        </button>
      </div>

      <div class="navigation-buttons">
        <b-button variant="primary" size="lg" @click="goBack">
          ย้อนกลับ
        </b-button>
        <b-button variant="info" size="lg" @click="nextStep">
          ถัดไป
        </b-button>
      </div>
    </div>

    <!-- Step 2: เด็กสามารถควบคุมหากิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่ -->
    <div v-if="currentStep === 2" class="survey-step">
      <h4 class="question-title">2.เด็กสามารถควบคุมหากิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</h4>
      
      <div class="options-container">
        <button
          class="option-btn"
          :class="{ 'selected': answers.q2 === 1 }"
          @click="answers.q2 = 1"
        >
          ได้ (1)
        </button>
        
        <button
          class="option-btn"
          :class="{ 'selected': answers.q2 === 3 }"
          @click="answers.q2 = 3"
        >
          ไม่ได้ (3)
        </button>
      </div>

      <div class="navigation-buttons">
        <b-button variant="primary" size="lg" @click="prevStep">
          ย้อนกลับ
        </b-button>
        <b-button variant="info" size="lg" @click="nextStep">
          ถัดไป
        </b-button>
      </div>
    </div>

    <!-- Step 3: ไม่มีใครที่สำคัญ -->
    <div v-if="currentStep === 3" class="survey-step">
      <h4 class="question-title">3 : ไม่มีใครที่สำคัญ ใครเป็นคนทำกิจกรรมที่ได้รากการเยี่ยมบ้านร่วมกับเด็ก (ทบทวนการเยี่ยมบ้านที่ผ่านมา)</h4>
      
      <div class="options-container multi-select">
        <button
          v-for="option in q3Options"
          :key="option.value"
          class="option-btn"
          :class="{ 'selected': answers.q3.includes(option.value) }"
          @click="toggleQ3Answer(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <!-- Show input when "อื่นๆ (13)" is selected -->
      <div v-if="answers.q3.includes(13)" class="form-container" style="margin-top: 2rem;">
        <b-form-group label="อื่นๆ ระบุ:" label-for="q4-input">
          <b-form-input
            id="q4-input"
            v-model="answers.q4"
            placeholder="กรอกคำอธิบาย..."
          ></b-form-input>
        </b-form-group>
      </div>

      <div class="navigation-buttons">
        <b-button variant="primary" size="lg" @click="prevStep">
          ย้อนกลับ
        </b-button>
        <b-button variant="info" size="lg" @click="nextStep">
          ถัดไป
        </b-button>
      </div>
    </div>

    <!-- Step 4: ใช้ผู้เยี่ยมบ้านใส่ (Dynamic Activities like Q9) -->
    <div v-if="currentStep === 4" class="survey-step">
      <div v-if="activities.length === 0" class="alert alert-info">
        <i class="fas fa-info-circle"></i>
        ไม่พบกิจกรรมสำหรับเดือนที่ {{ visitorData.month_age }} ครั้งที่ {{ visitorData.time_visit }}
      </div>

      <div v-else>
        <!-- Show current activity question for Q5 -->
        <div v-if="currentQ5Index < activities.length">
          <h4 class="question-title">
            5 : ใช้ผู้เยี่ยมบ้านใส่ลงบันทุกทองแบบทดสองการเยี่ยมบ้านครั้งนี้ที่ผ่านมา
          </h4>
          <p class="question-subtitle">
            กิจกรรมที่ {{ currentQ5Index + 1 }} / {{ activities.length }}
          </p>
          <div class="activity-description">
            {{ activities[currentQ5Index].title || 'ไม่มีรายละเอียด' }}
            <i 
              class="fas fa-info-circle activity-info-icon" 
              @click="showActivityDetailModal(activities[currentQ5Index])"
              title="ดูรายละเอียด"
            ></i>
          </div>

          <div class="options-container">
            <button
              class="option-btn"
              :class="{ 'selected': answers.q5[activities[currentQ5Index].no] === 1 }"
              @click="setQ5Answer(activities[currentQ5Index].no, 1)"
            >
              ทำได้ (1)
            </button>
            
            <button
              class="option-btn"
              :class="{ 'selected': answers.q5[activities[currentQ5Index].no] === 2 }"
              @click="setQ5Answer(activities[currentQ5Index].no, 2)"
            >
              ทำได้บ้าง (2)
            </button>

            <button
              class="option-btn"
              :class="{ 'selected': answers.q5[activities[currentQ5Index].no] === 3 }"
              @click="setQ5Answer(activities[currentQ5Index].no, 3)"
            >
              ทำไม่ได้ (3)
            </button>
          </div>

          <div class="navigation-buttons">
            <b-button 
              variant="primary" 
              size="lg" 
              @click="prevQ5Activity"
            >
              ย้อนกลับ
            </b-button>
            <b-button 
              variant="info" 
              size="lg" 
              @click="nextQ5Activity"
            >
              ถัดไป
            </b-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 5: ใครเป็นคนทำกิจกรรมกับเด็ก -->
    <div v-if="currentStep === 5" class="survey-step">
      <h4 class="question-title">6 : ใครเป็นคนทำกิจกรรมกับเด็ก(การเยี่ยมบ้านครั้งนี้กับเด็ก)</h4>
      
      <div class="options-container multi-select">
        <button
          v-for="option in q6Options"
          :key="option.value"
          class="option-btn"
          :class="{ 'selected': answers.q6.includes(option.value) }"
          @click="toggleQ6Answer(option.value)"
        >
          {{ option.label }}
          </button>
        </div>

      <!-- Show input when "อื่นๆ (13)" is selected -->
      <div v-if="answers.q6.includes(13)" class="form-container" style="margin-top: 2rem;">
        <b-form-group label="อื่นๆ ระบุ:" label-for="q6-other-input">
          <b-form-input
            id="q6-other-input"
            v-model="answers.q6_other"
            placeholder="กรอกคำอธิบาย..."
          ></b-form-input>
        </b-form-group>
      </div>

      <div class="navigation-buttons">
        <b-button variant="primary" size="lg" @click="prevStep">
          ย้อนกลับ
        </b-button>
        <b-button variant="info" size="lg" @click="nextStep">
          ถัดไป
        </b-button>
      </div>
    </div>

    <!-- Step 6: มีผู้อื่นร่วมทำกิจกรรมด้วยหรือไม่ -->
    <div v-if="currentStep === 6" class="survey-step">
      <h4 class="question-title">การเยี่ยมบ้านครั้งนี้</h4>
      <p class="question-subtitle">7 : มีผู้อื่นร่วมทำกิจกรรมด้วยหรือไม่ (มากกว่า 20 นาที)</p>
      
      <div class="options-container">
        <button
          class="option-btn"
          :class="{ 'selected': answers.q7 === 1 }"
          @click="answers.q7 = 1"
        >
          มี (1)
        </button>
        
        <button
          class="option-btn"
          :class="{ 'selected': answers.q7 === 3 }"
          @click="answers.q7 = 3"
        >
          ไม่มี (3)
        </button>
      </div>

      <div class="navigation-buttons">
        <b-button variant="primary" size="lg" @click="prevStep">
          ย้อนกลับ
        </b-button>
        <b-button variant="info" size="lg" @click="nextStep">
          ถัดไป
        </b-button>
      </div>
    </div>

    <!-- Step 7: มีเด็กคนอื่นร่วมทำกิจกรรมไปพร้อมกับเด็ก -->
    <div v-if="currentStep === 7" class="survey-step">
      <h4 class="question-title">8 : มีเด็กคนอื่นร่วมทำกิจกรรมไปพร้อมกับเด็กกลุ่มตัวอย่างหรือไม่ (เด็กอายุไม่เกิน 5 ขวบ) (การเยี่ยมบ้านครั้งนี้)</h4>
      
      <div class="options-container">
        <button
          class="option-btn"
          :class="{ 'selected': answers.q8 === 1 }"
          @click="answers.q8 = 1"
        >
          มี (1)
        </button>
        
        <button
          class="option-btn"
          :class="{ 'selected': answers.q8 === 3 }"
          @click="answers.q8 = 3"
        >
          ไม่มี (3)
        </button>
      </div>

      <div class="navigation-buttons">
        <b-button variant="primary" size="lg" @click="prevStep">
          ย้อนกลับ
        </b-button>
        <b-button variant="info" size="lg" @click="nextStep">
          ถัดไป
        </b-button>
      </div>
    </div>

    <!-- Step 8: Dynamic Activities Questions -->
    <div v-if="currentStep === 8" class="survey-step">
      <div v-if="activities.length === 0" class="alert alert-info">
        <i class="fas fa-info-circle"></i>
        ไม่พบกิจกรรมสำหรับเดือนที่ {{ visitorData.month_age }} ครั้งที่ {{ visitorData.time_visit }}
      </div>

      <div v-else>
        <!-- Show current activity question -->
        <div v-if="currentActivityIndex < activities.length">
          <h4 class="question-title">
            9 : ใช้ผู้เยี่ยมบ้านใส่ลงบันทุกทองแบบทดสองการเยี่ยมบ้านครั้งนี้กับเด็ก โดยจะใช้ผู้ปกครองลงบันทุกทองแบบทดสองการเยี่ยมบ้านครั้งนี้กับเด็ก
          </h4>
          <p class="question-subtitle">
            กิจกรรมที่ {{ currentActivityIndex + 1 }} / {{ activities.length }}
          </p>
          <div class="activity-description">
            {{ activities[currentActivityIndex].title || 'ไม่มีรายละเอียด' }}
            <i 
              class="fas fa-info-circle activity-info-icon" 
              @click="showActivityDetailModal(activities[currentActivityIndex])"
              title="ดูรายละเอียด"
            ></i>
          </div>

          <div class="options-container">
            <button
              class="option-btn"
              :class="{ 'selected': answers.q9[activities[currentActivityIndex].no] === 1 }"
              @click="setActivityAnswer(activities[currentActivityIndex].no, 1)"
            >
              ทำได้ (1)
            </button>
            
            <button
              class="option-btn"
              :class="{ 'selected': answers.q9[activities[currentActivityIndex].no] === 2 }"
              @click="setActivityAnswer(activities[currentActivityIndex].no, 2)"
            >
              ทำได้บ้าง (2)
            </button>

            <button
              class="option-btn"
              :class="{ 'selected': answers.q9[activities[currentActivityIndex].no] === 3 }"
              @click="setActivityAnswer(activities[currentActivityIndex].no, 3)"
            >
              ทำไม่ได้ (3)
            </button>
          </div>

          <div class="navigation-buttons">
            <b-button 
              variant="primary" 
              size="lg" 
              @click="prevActivity"
            >
              ย้อนกลับ
            </b-button>
            <b-button 
              variant="info" 
              size="lg" 
              @click="nextActivity"
            >
             ถัดไป
            </b-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Special Step 1: บันทึกผู้เยี่ยมบ้าน -->
    <div v-if="currentStep === 9" class="survey-step">
      <h4 class="question-title">บันทึกผู้เยี่ยมบ้าน</h4>
      
      <div class="form-container">
        <b-form-textarea
          v-model="answers.notes"
          placeholder="กรอกข้อมูล..."
          rows="8"
          class="notes-textarea"
        ></b-form-textarea>

        <div class="time-end-section">
          <label class="time-end-label">เวลาสิ้นสุดการเยี่ยม</label>
        <div class="dropdown-row">
          <b-form-select
              v-model="answers.endHour"
              :options="hourOptions"
            class="select-field"
          ></b-form-select>
          <span class="colon">:</span>
          <b-form-select
              v-model="answers.endMinute"
              :options="minuteOptions"
            class="select-field"
          ></b-form-select>
          </div>
        </div>
      </div>

      <div class="navigation-buttons">
        <b-button variant="primary" size="lg" @click="prevStep">
          ย้อนกลับ
        </b-button>
        <b-button variant="info" size="lg" @click="nextStep">
          ถัดไป
        </b-button>
      </div>
    </div>

    <!-- Special Step 2: รูปผู้เยี่ยมบ้าน -->
    <div v-if="currentStep === 10" class="survey-step">
      <h4 class="question-title">อัพโหลดรูปถ่ายกิจกรรมกับผู้ปกครองและเด็ก</h4>
      
      <div class="upload-container">
        <div v-if="!surveyImage" class="upload-placeholder">
          <i class="fas fa-image"></i>
          <p>ยังไม่มีรูปภาพ</p>
        </div>
        <div v-else class="image-preview">
          <img :src="surveyImage" alt="Uploaded image" />
          <button class="remove-image-btn" @click="removeImage">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          capture="environment"
          style="display: none"
          @change="handleFileSelect"
        />

        <b-button
          variant="warning"
          size="lg"
          class="upload-btn"
          @click="$refs.fileInput.click()"
        >
          <i class="fas fa-camera"></i>
          {{ surveyImage ? 'เลือกรูปใหม่' : 'กดเพื่ออัพโหลดไฟล์ใหม่' }}
        </b-button>
      </div>

      <div class="navigation-buttons">
        <b-button variant="primary" size="lg" @click="prevStep">
          ย้อนกลับ
        </b-button>
        <b-button variant="info" size="lg" @click="nextStep">
          ถัดไป
        </b-button>
      </div>
    </div>

    <!-- Step 11: นัดหมายการเยี่ยมบ้านครั้งถัดไป -->
    <div v-if="currentStep === 11" class="survey-step">
      <h4 class="question-title">10.นัดหมายการเยี่ยมบ้านครั้งต่อไป</h4>
      
      <div class="appointment-form-wrapper">
        <div class="appointment-form-grid">
          <div class="appointment-field">
            <label class="appointment-label">
              <i class="fas fa-calendar-day"></i>
              วัน
            </label>
          <b-form-select
              v-model="newAppointment.day"
            :options="currentDayOptions"
              class="appointment-select"
          ></b-form-select>
          </div>

          <div class="appointment-field">
            <label class="appointment-label">
              <i class="fas fa-calendar-alt"></i>
              เดือน
            </label>
          <b-form-select
              v-model="newAppointment.month"
            :options="monthOptions"
            @change="onMonthChange"
              class="appointment-select"
          ></b-form-select>
          </div>

          <div class="appointment-field">
            <label class="appointment-label">
              <i class="fas fa-calendar"></i>
              ปี
            </label>
          <b-form-select
              v-model="newAppointment.year"
            :options="yearOptions"
            @change="onYearChange"
              class="appointment-select"
          ></b-form-select>
          </div>

          <div class="appointment-field">
            <label class="appointment-label">
              <i class="fas fa-clock"></i>
              เวลา
            </label>
          <b-form-select
              v-model="newAppointment.time"
            :options="timeOptions"
              class="appointment-select"
          ></b-form-select>
          </div>
        </div>

        <div v-if="newAppointment.day && newAppointment.month && newAppointment.year && newAppointment.time" class="appointment-preview">
          <i class="fas fa-info-circle"></i>
          <span>นัดหมาย: วันที่ {{ newAppointment.day }} {{ getMonthName(newAppointment.month) }} {{ newAppointment.year }} เวลา {{ newAppointment.time }}</span>
        </div>
      </div>

      <div class="navigation-buttons">
        <b-button variant="primary" size="lg" @click="prevStep">
          <i class="fas fa-arrow-left"></i> ย้อนกลับ
        </b-button>
        <b-button variant="success" size="lg" @click="submitSurvey">
          <i class="fas fa-check-circle"></i> บันทึกและสิ้นสุด
        </b-button>
      </div>
    </div>

    <!-- Processing overlay -->
    <div v-if="processing" class="processing-overlay">
      <div class="spinner-container">
        <b-spinner variant="primary"></b-spinner>
        <p>กำลังบันทึกข้อมูล...</p>
      </div>
    </div>

    <!-- Activity Detail Modal -->
    <b-modal
      v-model="activityDetailModalVisible"
      title="รายละเอียดกิจกรรม"
      size="lg"
      ok-only
      ok-title="ปิด"
      ok-variant="primary"
    >
      <div v-if="selectedActivity" class="activity-detail-content">
        <h5 v-if="selectedActivity.title" class="activity-detail-title">
          {{ selectedActivity.title }}
        </h5>
        <div class="activity-detail-text">
          {{ selectedActivity.objective || 'ไม่มีรายละเอียด' }}
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  layout: 'admin',
  middleware: 'auth',
  data() {
    return {
      loading: false,
      loadingMessage: '',
      processing: false,
      currentStep: 1,
      currentActivityIndex: 0,
      currentQ5Index: 0,
      
      // Visitor and survey metadata
      visitorData: null,
      surveyId: null,
      timeStart: null,
      timeEnd: null,
      
      // Activities from database
      activities: [],
      
      // Image upload
      surveyImage: null,
      surveyImageKey: null,
      
      // Activity detail modal
      activityDetailModalVisible: false,
      selectedActivity: null,
      
      // Answers object
      answers: {
        q1: null,
        q2: null,
        q3: [],
        q4: '',
        q5: {}, // Changed to object like q9
        q6: [],
        q6_other: '',
        q7: null,
        q8: null,
        q9: {}, // { activityId: answer }
        notes: '',
        endHour: null,
        endMinute: null
      },
      
      // Options for multi-select questions
      q3Options: [
        { value: 1, label: 'แม่ (1)' },
        { value: 3, label: 'พ่อ (3)' },
        { value: 5, label: 'ย่า/ยาย (5)' },
        { value: 7, label: 'ปู่/ตา (7)' },
        { value: 9, label: 'พี่/น้อง (9)' },
        { value: 11, label: 'ลุง/ป้า/น้า/อา (11)' },
        { value: 13, label: 'อื่นๆ (13)' }
      ],
      
      q6Options: [
        { value: 1, label: 'แม่ (1)' },
        { value: 3, label: 'พ่อ (3)' },
        { value: 5, label: 'ย่า/ยาย (5)' },
        { value: 7, label: 'ปู่/ตา (7)' },
        { value: 9, label: 'พี่/น้อง (9)' },
        { value: 11, label: 'ลุง/ป้า/น้า/อา (11)' },
        { value: 13, label: 'อื่นๆ (13)' }
      ],
      
      // Time options for end time
      hourOptions: [],
      minuteOptions: [],
      
      // New appointment data
      newAppointment: {
        day: null,
        month: null,
        year: null,
        time: '09:00 น.'
      },
      
      monthOptions: [
        { value: 1, text: 'มกราคม' },
        { value: 2, text: 'กุมภาพันธ์' },
        { value: 3, text: 'มีนาคม' },
        { value: 4, text: 'เมษายน' },
        { value: 5, text: 'พฤษภาคม' },
        { value: 6, text: 'มิถุนายน' },
        { value: 7, text: 'กรกฎาคม' },
        { value: 8, text: 'สิงหาคม' },
        { value: 9, text: 'กันยายน' },
        { value: 10, text: 'ตุลาคม' },
        { value: 11, text: 'พฤศจิกายน' },
        { value: 12, text: 'ธันวาคม' }
      ],
      yearOptions: [],
      timeOptions: [
        { value: '08:00 น.', text: '08:00 น.' },
        { value: '09:00 น.', text: '09:00 น.' },
        { value: '10:00 น.', text: '10:00 น.' },
        { value: '11:00 น.', text: '11:00 น.' },
        { value: '12:00 น.', text: '12:00 น.' },
        { value: '13:00 น.', text: '13:00 น.' },
        { value: '14:00 น.', text: '14:00 น.' },
        { value: '15:00 น.', text: '15:00 น.' },
        { value: '16:00 น.', text: '16:00 น.' },
        { value: '17:00 น.', text: '17:00 น.' },
        { value: '18:00 น.', text: '18:00 น.' }
      ]
    }
  },
  computed: {
    currentDayOptions() {
      const month = this.newAppointment.month
      const year = this.newAppointment.year
      
      if (!month || !year) {
        return this.generateDayOptions(31)
      }
      
      const daysInMonth = this.getDaysInMonth(month, year)
      return this.generateDayOptions(daysInMonth)
    }
  },
  async mounted() {
    this.initTimeOptions()
    await this.initializeSurvey()
  },
  methods: {
    initTimeOptions() {
      // Generate hour options (00-23)
      this.hourOptions = [{ value: null, text: '-ชั่วโมง-' }]
      for (let i = 0; i < 24; i++) {
        const hour = String(i).padStart(2, '0')
        this.hourOptions.push({ value: hour, text: hour })
      }
      
      // Generate minute options (00-59)
      this.minuteOptions = [{ value: null, text: '-นาที-' }]
      for (let i = 0; i < 60; i++) {
        const minute = String(i).padStart(2, '0')
        this.minuteOptions.push({ value: minute, text: minute })
      }
      
      // Set default to current time
      const now = new Date()
      this.answers.endHour = String(now.getHours()).padStart(2, '0')
      this.answers.endMinute = String(now.getMinutes()).padStart(2, '0')
    },
    
    showActivityDetailModal(activity) {
      this.selectedActivity = activity
      this.activityDetailModalVisible = true
    },
    
    async loadPatientsCount() {
      try {
        // Get current user's username
        const username = this.$offlineAuth?.getUser?.()?.username
        
        if (!username) {
          return
        }
        
        // Load visitors from IndexedDB to get count
        const visitors = await this.$indexedDB.getVisitorsByHomevisitor(username)
        
        // อัพเดทจำนวนในระบบ
        this.$store.commit('setPatientsCount', visitors.length)
      } catch (error) {
        // จัดการข้อผิดพลาด
      }
    },
    
    async initializeSurvey() {
      try {
        this.loading = true
        this.loadingMessage = 'กำลังโหลดข้อมูล...'
        
        // โหลดจำนวนผู้รับบริการและอัพเดทข้อมูลในระบบ
        await this.loadPatientsCount()
        
        // ตรวจสอบว่าเป็นโหมดแก้ไขหรือไม่
        const editDataStr = localStorage.getItem('surveyEdit')
        if (editDataStr) {
          // โหมดแก้ไข
          await this.loadEditMode(JSON.parse(editDataStr))
          localStorage.removeItem('surveyEdit')
        } else {
          // โหมดสร้างใหม่
          await this.loadNewSurveyMode()
        }
        
        // ดึงข้อมูลจาก API
        await this.fetchSurveyData()
        
        // โหลดกิจกรรมสำหรับคำถาม
        await this.loadActivities()
        
        // เตรียมตัวเลือกวันที่สำหรับนัดหมาย
        this.initDateOptions()
        
        this.loading = false
      } catch (error) {
        this.loading = false
        this.$toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      }
    },
    
    async loadEditMode(editData) {
      // โหลดข้อมูลสำหรับแก้ไข
      const survey = await this.$indexedDB.getSurveyProgressById(editData.surveyId)
      if (!survey) {
        this.$toast.error('ไม่พบข้อมูลการเยี่ยมบ้านที่ต้องการแก้ไข')
        this.$router.push('/')
        return
      }
      
      // ตั้งค่าข้อมูลผู้รับบริการ
      this.visitorData = {
        stid: editData.stid,
        name: editData.name,
        nickname: editData.nickname,
        time_visit: editData.time_visit,
        month_age: survey.month_age,
        appointmentDate: survey.appointmentDate,
        appointmentTime: survey.appointmentTime
      }
      
      // โหลดข้อมูลแบบสอบถามเดิม
      this.loadExistingSurvey(survey)
      this.$toast.info('กำลังแก้ไขบันทึกการเยี่ยมบ้าน')
    },
    
    async loadNewSurveyMode() {
      // ดึงข้อมูลผู้รับบริการจาก localStorage
      const visitorDataStr = localStorage.getItem('surveyPatient')
      if (!visitorDataStr) {
        this.$toast.error('ไม่พบข้อมูลผู้รับบริการ')
        this.$router.push('/')
        return
      }
      
      this.visitorData = JSON.parse(visitorDataStr)
      
      // ตรวจสอบแบบสอบถามที่ยังไม่เสร็จ
      const existingSurvey = await this.$indexedDB.getSurveyProgress(
        this.visitorData.stid,
        this.visitorData.time_visit
      )
      
      if (existingSurvey) {
        // โหลดแบบสอบถามที่ค้างไว้
        this.loadExistingSurvey(existingSurvey)
        this.$toast.info('พบแบบสอบถามที่ยังไม่เสร็จสิ้น กำลังโหลดความคืบหน้า...')
      } else {
        // สร้างแบบสอบถามใหม่
        await this.createNewSurvey()
      }
    },
    
    async createNewSurvey() {
      // สร้างรหัสแบบสอบถาม
      this.surveyId = `survey_${this.visitorData.stid}_${this.visitorData.time_visit}_${Date.now()}`
      
      // ตั้งค่าเวลาเริ่มต้นจากวันที่นัดหมาย
      if (this.visitorData.appointmentDate && this.visitorData.appointmentTime) {
        const date = this.visitorData.appointmentDate
        const time = this.visitorData.appointmentTime.replace(' น.', '')
        this.timeStart = `${date} ${time}:00`
      } else {
        // ใช้เวลาปัจจุบัน
        this.timeStart = new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      
      // บันทึกความคืบหน้าเริ่มต้น
      await this.saveProgress()
    },
    
    loadExistingSurvey(survey) {
      this.surveyId = survey.id
      this.timeStart = survey.timeStart
      this.timeEnd = survey.timeEnd || null
      this.currentStep = survey.currentStep || 1
      this.answers = survey.answers || this.answers
      this.currentActivityIndex = survey.currentActivityIndex || 0
      this.currentQ5Index = survey.currentQ5Index || 0
      this.surveyImage = survey.surveyImage || null
      this.surveyImageKey = survey.surveyImageKey || null
      
      // ถ้าอยู่ขั้นตอนที่ 11 โหลดข้อมูลนัดหมาย
      if (this.currentStep === 11 && survey.newAppointment) {
        this.newAppointment = survey.newAppointment
      }
      
      // โหลดข้อมูลสถานะสำหรับแบบสอบถามที่เสร็จแล้ว
      if (survey.completed) {
        // ดึงชั่วโมงและนาทีจากเวลาสิ้นสุด
        if (survey.timeEnd) {
          const timeEndDate = new Date(survey.timeEnd)
          this.answers.endHour = String(timeEndDate.getHours()).padStart(2, '0')
          this.answers.endMinute = String(timeEndDate.getMinutes()).padStart(2, '0')
        }
      }
    },
    
    async fetchSurveyData() {
      try {
        const username = this.$offlineAuth?.getUser?.()?.username
        if (!username) {
        return
      }
      
        const response = await this.$axios.$get(
          '/api/parenting2025_census/get/homevisit/getchildsample_result.php',
          {
            params: {
              homevisitor: username,
              stid: this.visitorData.stid,
              time_visit: this.visitorData.time_visit
            }
          }
        )
        
        if (response && response.results && response.results.length > 0) {
          // มีข้อมูลจาก API
        } else {
          // ไม่มีข้อมูลจาก API สร้างใหม่
        }
      } catch (error) {
        // ดำเนินการต่อ ข้อมูลจะถูกบันทึกในเครื่อง
      }
    },
    
    async loadActivities() {
      try {
        // ดึงกิจกรรมทั้งหมดจาก IndexedDB
        const allActivities = await this.$indexedDB.getActivities()
        
        // กรองกิจกรรมที่ตรงกับอายุและครั้งที่เยี่ยม
        const matchingActivities = allActivities.filter(activity => {
          return Number(activity.month_age) === Number(this.visitorData.month_age) &&
                 Number(activity.time) === Number(this.visitorData.time_visit)
        })
        
        this.activities = matchingActivities
      } catch (error) {
        this.activities = []
      }
    },
    
    async saveProgress() {
      try {
        // ตรวจสอบว่าแบบสอบถามเสร็จแล้วหรือยัง
        const existingSurvey = await this.$indexedDB.getSurveyProgressById(this.surveyId)
        const isCompleted = existingSurvey?.completed || false
        
        const progressData = {
          id: this.surveyId,
          stid: this.visitorData.stid,
          time_visit: this.visitorData.time_visit,
          month_age: this.visitorData.month_age,
          timeStart: this.timeStart,
          timeEnd: this.timeEnd,
          appointmentDate: this.visitorData.appointmentDate,
          currentStep: this.currentStep,
          currentActivityIndex: this.currentActivityIndex,
          currentQ5Index: this.currentQ5Index,
          answers: this.answers,
          newAppointment: this.newAppointment,
          surveyImage: this.surveyImage,
          surveyImageKey: this.surveyImageKey,
          completed: isCompleted, // เก็บสถานะเดิม
          synced: existingSurvey?.synced || false, // เก็บสถานะซิงค์
          approve_status: existingSurvey?.approve_status || 0 // เก็บสถานะการอนุมัติ
        }
        
        await this.$indexedDB.saveSurveyProgress(progressData)
      } catch (error) {
        // จัดการข้อผิดพลาด
      }
    },
    
    // สลับคำตอบแบบหลายตัวเลือก
    toggleQ3Answer(value) {
      const index = this.answers.q3.indexOf(value)
      if (index > -1) {
        this.answers.q3.splice(index, 1)
      } else {
        this.answers.q3.push(value)
      }
    },
    
    toggleQ6Answer(value) {
      const index = this.answers.q6.indexOf(value)
      if (index > -1) {
        this.answers.q6.splice(index, 1)
      } else {
        this.answers.q6.push(value)
      }
    },
    
    // จัดการคำตอบกิจกรรมคำถามที่ 5
    setQ5Answer(activityId, answer) {
      this.$set(this.answers.q5, activityId, answer)
    },
    
    async nextQ5Activity() {
      // ตรวจสอบคำตอบกิจกรรมปัจจุบัน
      if (!this.answers.q5[this.activities[this.currentQ5Index].no]) {
        this.$toast.warning('กรุณาเลือกคำตอบ')
        return
      }
      
      if (this.currentQ5Index < this.activities.length - 1) {
        this.currentQ5Index++
        await this.saveProgress()
      } else {
        // ตอบครบทุกกิจกรรมแล้ว ไปขั้นตอนถัดไป
        await this.nextStep()
      }
    },
    
    async prevQ5Activity() {
      if (this.currentQ5Index > 0) {
        this.currentQ5Index--
        await this.saveProgress()
      } else {
        // กลับไปขั้นตอนก่อนหน้า
        await this.prevStep()
      }
    },
    
    // จัดการคำตอบกิจกรรมคำถามที่ 9
    setActivityAnswer(activityId, answer) {
      this.$set(this.answers.q9, activityId, answer)
    },
    
    async nextActivity() {
      // ตรวจสอบคำตอบกิจกรรมปัจจุบัน
      if (!this.answers.q9[this.activities[this.currentActivityIndex].no]) {
        this.$toast.warning('กรุณาเลือกคำตอบ')
        return
      }
      
      if (this.currentActivityIndex < this.activities.length - 1) {
        this.currentActivityIndex++
        await this.saveProgress()
      } else {
        // ตอบครบทุกกิจกรรมแล้ว ไปขั้นตอนถัดไป
        await this.nextStep()
      }
    },
    
    async prevActivity() {
      if (this.currentActivityIndex > 0) {
        this.currentActivityIndex--
        await this.saveProgress()
      } else {
        // กลับไปขั้นตอนก่อนหน้า
        await this.prevStep()
      }
    },
    
    // จัดการอัพโหลดรูปภาพ
    async handleFileSelect(event) {
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
      
      this.processing = true
      
      try {
        // แปลงเป็น WebP และปรับขนาด
        const webpBase64 = await this.convertToWebP(file)
        this.surveyImage = webpBase64
        
        // บันทึกลง IndexedDB
        await this.saveImageToIndexedDB(webpBase64)
        
        this.$toast.success('อัพโหลดรูปภาพสำเร็จ')
      } catch (error) {
        this.$toast.error('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ')
      } finally {
        this.processing = false
      }
    },
    
    async convertToWebP(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        
        reader.onload = (e) => {
          const img = new Image()
          
          img.onload = () => {
            // คำนวณขนาดใหม่ ความกว้างสูงสุด 1000px
            let width = img.width
            let height = img.height
            const maxWidth = 1000
            
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            }
            
            // สร้าง canvas
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            
            // แปลงเป็น WebP
            try {
              const webpDataUrl = canvas.toBlob ? 
                canvas.toDataURL('image/webp', 0.90) :
                canvas.toDataURL('image/jpeg', 0.90)
              
              resolve(webpDataUrl)
            } catch (error) {
              reject(error)
            }
          }
          
          img.onerror = reject
          img.src = e.target.result
        }
        
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    },
    
    async saveImageToIndexedDB(base64Image) {
      if (!this.$indexedDB) {
        return
      }
      
      try {
        const key = `survey_image_${Date.now()}`
        await this.$indexedDB.saveImage(key, base64Image)
        
        this.surveyImageKey = key
      } catch (error) {
        // จัดการข้อผิดพลาด
      }
    },
    
    async removeImage() {
      if (this.surveyImageKey && this.$indexedDB) {
        try {
          await this.$indexedDB.deleteImage(this.surveyImageKey)
        } catch (error) {
          // จัดการข้อผิดพลาด
        }
      }
      
      this.surveyImage = null
      this.surveyImageKey = null
      
      // รีเซ็ตช่องเลือกไฟล์
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    
    // การนำทาง
    async nextStep() {
      // ตรวจสอบความถูกต้อง
      if (!this.validateCurrentStep()) {
        return
      }
      
      // จัดการพิเศษสำหรับขั้นตอนที่ 4 กิจกรรมคำถามที่ 5
      if (this.currentStep === 4) {
        // ตรวจสอบว่าตอบครบทุกกิจกรรมแล้ว
        const allAnswered = this.activities.every(activity => 
          this.answers.q5[activity.no] !== undefined && this.answers.q5[activity.no] !== null
        )
        
        if (!allAnswered) {
          this.$toast.warning('กรุณาตอบคำถามกิจกรรมทั้งหมด')
        return
        }
      }
      
      // จัดการพิเศษสำหรับขั้นตอนที่ 8 กิจกรรมคำถามที่ 9
      if (this.currentStep === 8) {
        // ตรวจสอบว่าตอบครบทุกกิจกรรมแล้ว
        const allAnswered = this.activities.every(activity => 
          this.answers.q9[activity.no] !== undefined && this.answers.q9[activity.no] !== null
        )
        
        if (!allAnswered) {
          this.$toast.warning('กรุณาตอบคำถามกิจกรรมทั้งหมด')
        return
        }
      }
      
      this.currentStep++
      this.currentActivityIndex = 0
      this.currentQ5Index = 0
      await this.saveProgress()
    },
    
    async prevStep() {
      if (this.currentStep > 1) {
        // จัดการพิเศษเมื่อย้อนกลับจากขั้นตอนที่ 5 ไป 4
        if (this.currentStep === 5 && this.activities.length > 0) {
          this.currentQ5Index = this.activities.length - 1
        }
        
        // จัดการพิเศษเมื่อย้อนกลับจากขั้นตอนที่ 9 ไป 8
        if (this.currentStep === 9 && this.activities.length > 0) {
          this.currentActivityIndex = this.activities.length - 1
        }
        
        this.currentStep--
        await this.saveProgress()
      }
    },
    
    validateCurrentStep() {
      switch(this.currentStep) {
        case 1:
          if (this.answers.q1 === null) {
            this.$toast.warning('กรุณาเลือกคำตอบ')
            return false
          }
          break
        case 2:
          if (this.answers.q2 === null) {
            this.$toast.warning('กรุณาเลือกคำตอบ')
            return false
          }
          break
        case 3:
          if (this.answers.q3.length === 0) {
            this.$toast.warning('กรุณาเลือกคำตอบอย่างน้อย 1 ตัวเลือก')
            return false
          }
          break
        case 5:
          if (this.answers.q6.length === 0) {
            this.$toast.warning('กรุณาเลือกคำตอบอย่างน้อย 1 ตัวเลือก')
            return false
          }
          break
        case 6:
          if (this.answers.q7 === null) {
            this.$toast.warning('กรุณาเลือกคำตอบ')
            return false
          }
          break
        case 7:
          if (this.answers.q8 === null) {
            this.$toast.warning('กรุณาเลือกคำตอบ')
            return false
          }
          break
        case 9:
          if (!this.answers.endHour || !this.answers.endMinute) {
            this.$toast.warning('กรุณาเลือกเวลาสิ้นสุดการเยี่ยม')
            return false
          }
          break
        case 11:
          if (!this.newAppointment.day || !this.newAppointment.month || !this.newAppointment.year || !this.newAppointment.time) {
            this.$toast.warning('กรุณากรอกข้อมูลนัดหมายให้ครบถ้วน')
            return false
          }
          break
      }
      return true
    },
    
    goBack() {
      this.$router.push('/')
    },
    
    async submitSurvey() {
      try {
        if (!this.validateCurrentStep()) {
        return
      }
      
        this.processing = true
        
        // ตรวจสอบว่าเป็นการแก้ไขแบบสอบถามที่เสร็จแล้วหรือไม่
        const existingSurvey = await this.$indexedDB.getSurveyProgressById(this.surveyId)
        const wasCompleted = existingSurvey?.completed || false
        
        // ตั้งค่าเวลาสิ้นสุดจากเวลาที่เลือก
      const today = new Date()
        const dateStr = today.toISOString().slice(0, 10)
        this.timeEnd = `${dateStr} ${this.answers.endHour}:${this.answers.endMinute}:00`
        
        if (wasCompleted) {
          // แก้ไขแบบสอบถามที่เสร็จแล้ว
          await this.saveProgress()
          this.$toast.success('บันทึกการแก้ไขสำเร็จ')
          
          // เพิ่มเข้าคิวซิงค์
          await this.addSurveyToSyncQueue()
        } else {
          // เสร็จสิ้นแบบสอบถามใหม่
          // ทำเครื่องหมายว่าเสร็จสิ้น
          await this.$indexedDB.markSurveyCompleted(this.surveyId, this.timeEnd)
          
          // สร้างนัดหมายใหม่
          await this.createNewAppointment()
          
          // เพิ่มเข้าคิวซิงค์
          await this.addSurveyToSyncQueue()
          
          this.$toast.success('บันทึกแบบสอบถามสำเร็จ รอการซิงค์ขึ้นเซิร์ฟเวอร์')
        }
        
        // ลบข้อมูล localStorage
        localStorage.removeItem('surveyPatient')
        
        // กลับไปหน้าแรก
        setTimeout(() => {
          this.$router.push('/')
        }, 1500)
      } catch (error) {
        this.$toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
        this.processing = false
      }
    },
    
    async addSurveyToSyncQueue() {
      try {
        const username = this.$offlineAuth?.getUser?.()?.username
        if (!username) {
        return
      }
      
        // ดึงข้อมูลแบบสอบถามที่เสร็จแล้ว
        const survey = await this.$indexedDB.getSurveyProgressById(this.surveyId)
        if (!survey) {
          return
        }
        
        // เตรียมข้อมูลสำหรับ API
      const surveyData = {
          type: 'SUBMIT_SURVEY',
          surveyId: this.surveyId,
          stid: this.visitorData.stid,
          time_visit: this.visitorData.time_visit,
          month_age: this.visitorData.month_age,
          data: survey,
          timestamp: new Date().toISOString()
        }
        
        // เพิ่มเข้าคิวซิงค์
        await this.$indexedDB.addToSyncQueue(surveyData)
      } catch (error) {
        // จัดการข้อผิดพลาด
      }
    },
    
    async createNewAppointment() {
      try {
        // แปลงปีพุทธศักราชเป็นคริสต์ศักราช
        const christianYear = this.newAppointment.year - 543
        const appointmentDate = `${christianYear}-${String(this.newAppointment.month).padStart(2, '0')}-${String(this.newAppointment.day).padStart(2, '0')}`
        const appointmentTime = this.newAppointment.time
        
        // คำนวณอายุเดือนและครั้งที่เยี่ยมใหม่
        const visitor = await this.$indexedDB.getVisitor(this.visitorData.stid)
        const existingBooking = await this.$indexedDB.getBooking(this.visitorData.stid)
        
        // คำนวณอายุเดือนจากวันเกิดถึงวันนี้
      const today = new Date()
        const birthYear = parseInt(visitor.year_birth) - 543
        const birthMonth = parseInt(visitor.month_birth)
        let calculatedMonthAge = (today.getFullYear() - birthYear) * 12 + (today.getMonth() + 1 - birthMonth)
        
        // จำกัดไว้ที่ 48 เดือน
        if (calculatedMonthAge > 48) calculatedMonthAge = 48
        if (calculatedMonthAge < 0) calculatedMonthAge = 0
        
        // คำนวณครั้งที่เยี่ยม
        let newMonthAge = calculatedMonthAge
        let newTimeVisit = 1
        
        if (existingBooking && existingBooking.last_visit_date) {
          const lastVisitDate = new Date(existingBooking.last_visit_date)
          const daysSinceLastVisit = Math.floor((today - lastVisitDate) / (1000 * 60 * 60 * 24))
          
          if (daysSinceLastVisit > 21) {
            newMonthAge = calculatedMonthAge
            newTimeVisit = (existingBooking.time_visit || 0) + 1
            
            if (existingBooking.time_visit === 4) {
              newTimeVisit = 1
            } else if (newTimeVisit > 4) {
              newTimeVisit = 4
            }
          } else {
            newMonthAge = existingBooking.month_age || calculatedMonthAge
            newTimeVisit = (existingBooking.time_visit || 0) + 1
            
            if (existingBooking.time_visit === 4) {
              newMonthAge = (existingBooking.month_age || 0) + 1
              newTimeVisit = 1
            } else if (newTimeVisit > 4) {
              newTimeVisit = 4
            }
          }
          
          if (newMonthAge > 48) newMonthAge = 48
        }
        
        // บันทึกนัดหมายใหม่
        await this.$indexedDB.addBooking({
          stid: this.visitorData.stid,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          month_age: newMonthAge,
          time_visit: newTimeVisit,
          last_visit_date: new Date().toISOString(),
          dataSource: 'local',
          lastSyncedAt: new Date().toISOString()
        })
        } catch (error) {
        throw error
      }
    },
    
    // ฟังก์ชันช่วยเหลือด้านวันที่
    initDateOptions() {
      const now = new Date()
      const currentYear = now.getFullYear() + 543
      
      // สร้างตัวเลือกปี
      for (let i = currentYear; i <= currentYear + 2; i++) {
        this.yearOptions.push({ value: i, text: i.toString() })
      }
      
      // ตั้งค่าวันที่เริ่มต้นเป็นวันนี้บวก 1 เดือน
      const nextMonth = new Date(now)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      
      this.newAppointment.day = nextMonth.getDate()
      this.newAppointment.month = nextMonth.getMonth() + 1
      this.newAppointment.year = nextMonth.getFullYear() + 543
    },
    
    isLeapYear(year) {
      const gregorianYear = year - 543
      return (gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) || (gregorianYear % 400 === 0)
    },
    
    getDaysInMonth(month, year) {
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      
      if (month === 2 && this.isLeapYear(year)) {
        return 29
      }
      
      return daysInMonth[month - 1]
    },
    
    generateDayOptions(maxDays) {
      const options = []
      for (let i = 1; i <= maxDays; i++) {
        options.push({ value: i, text: i.toString() })
      }
      return options
    },
    
    onMonthChange() {
      if (this.newAppointment.day && this.newAppointment.year) {
        const daysInMonth = this.getDaysInMonth(this.newAppointment.month, this.newAppointment.year)
        
        if (this.newAppointment.day > daysInMonth) {
          this.newAppointment.day = daysInMonth
        }
      }
    },
    
    onYearChange() {
      if (this.newAppointment.day && this.newAppointment.month === 2) {
        const daysInMonth = this.getDaysInMonth(2, this.newAppointment.year)
        
        if (this.newAppointment.day > daysInMonth) {
          this.newAppointment.day = daysInMonth
        }
      }
    },
    
    getMonthName(monthValue) {
      const month = this.monthOptions.find(m => m.value === monthValue)
      return month ? month.text : ''
    }
  }
}
</script>

<style scoped>
.survey-step {
  max-width: 900px;
  margin: 2rem auto;
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(53, 81, 164, 0.15);
}

.question-title {
  color: #2c3e50;
  font-size: 1.62rem;
  font-weight: 500;
  margin-bottom: 2rem;
  text-align: left;
  padding-bottom: 1rem;
  border-bottom: 3px solid #3551a4;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.question-title::before {
  content: '';
  width: 6px;
  height: 30px;
  background: linear-gradient(135deg, #3551a4, #2c4088);
  border-radius: 3px;
}

.question-subtitle {
  color: #495057;
  font-size: 1.26rem;
  margin-bottom: 2rem;
  text-align: left;
  padding-left: 0.75rem;
  border-left: 3px solid #17a2b8;
}

.activity-description {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  font-size: 1.32rem;
  line-height: 1.6;
  color: #2c3e50;
  border: 2px solid #dee2e6;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.activity-info-icon {
  color: #17a2b8;
  font-size: 1.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.activity-info-icon:hover {
  color: #138496;
  transform: scale(1.15);
}

.activity-detail-content {
  padding: 1rem 0;
}

.activity-detail-title {
  color: #3551a4;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.activity-detail-text {
  color: #495057;
  font-size: 1.26rem;
  line-height: 1.8;
  white-space: pre-wrap;
}

/* Options Container */
.options-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.options-container.multi-select {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.option-btn {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border: 2px solid #dee2e6;
  color: #495057;
  padding: 1.25rem 1.75rem;
  border-radius: 0.75rem;
  font-size: 1.26rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.option-btn:hover {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
  border-color: #3551a4;
  box-shadow: 0 4px 12px rgba(53, 81, 164, 0.15);
}

.option-btn.selected {
  background: linear-gradient(135deg, #3551a4, #2c4088);
  border-color: #3551a4;
  color: white;
  box-shadow: 0 4px 16px rgba(53, 81, 164, 0.3);
}

/* Form Container */
.form-container {
  margin-bottom: 2.5rem;
}

/* Form Groups and Controls (matching index.vue) */
::v-deep .form-group {
  margin-bottom: 1.75rem;
}

::v-deep .form-group label {
  font-size: 1.44rem;
  font-weight: 400;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

::v-deep .form-control,
::v-deep .custom-select {
  font-size: 1.44rem;
  padding: 0.975rem 1.1rem;
  border: 2px solid #ced4da;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  font-weight: 300;
}

::v-deep .form-control:focus,
::v-deep .custom-select:focus {
  border-color: #3551a4;
  box-shadow: 0 0 0 0.2rem rgba(53, 81, 164, 0.15);
}

::v-deep .form-control:disabled {
  background-color: #f8f9fa;
  font-weight: 400;
}

::v-deep textarea.form-control {
  min-height: 120px;
}

::v-deep .invalid-feedback {
  font-size: 1.32rem;
  font-weight: 400;
  margin-top: 0.5rem;
}

/* Notes Section */
.notes-textarea {
  width: 100%;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  padding: 1.25rem;
  border: 2px solid #dee2e6;
  border-radius: 0.75rem;
  resize: vertical;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.notes-textarea:focus {
  border-color: #3551a4;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(53, 81, 164, 0.15);
}

.time-end-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 0.75rem;
  border: 2px solid #dee2e6;
}

.time-end-label {
  display: block;
  font-size: 1.44rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-left: 0.5rem;
}

.dropdown-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  justify-content: center;
}

.select-field {
  flex: 1;
  max-width: 220px;
  font-size: 1.44rem;
  padding: 0.975rem 1.1rem;
  border: 2px solid #dee2e6;
  border-radius: 0.5rem;
  background: white;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  height: 50px;
  color: #495057;
  font-weight: 300;
}

.select-field:focus {
  border-color: #3551a4;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(53, 81, 164, 0.15);
}

.colon {
  font-size: 2.1rem;
  font-weight: 500;
  color: #3551a4;
}

/* Upload Container */
.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.upload-placeholder {
  width: 100%;
  max-width: 600px;
  height: 350px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  border: 3px dashed rgba(255, 255, 255, 0.3);
}

.upload-placeholder i {
  font-size: 6rem;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.5);
}

.upload-placeholder p {
  font-size: 1.44rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.image-preview {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 350px;
  background: #000;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.remove-image-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 45px;
  height: 45px;
  background: rgba(220, 53, 69, 0.95);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.56rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.remove-image-btn:hover {
  background: rgba(220, 53, 69, 1);
  transform: scale(1.1);
}

.upload-btn {
  font-size: 1.26rem;
  font-weight: 500;
  padding: 1rem 2.5rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
  transition: all 0.3s ease;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 193, 7, 0.4);
}

.upload-btn i {
  font-size: 1.56rem;
}

/* Appointment Form */
.appointment-form-wrapper {
  margin-bottom: 2.5rem;
}

.appointment-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.appointment-field {
  display: flex;
  flex-direction: column;
}

.appointment-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.32rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 0.5rem;
}

.appointment-label i {
  color: #3551a4;
  font-size: 1.44rem;
  width: 24px;
  text-align: center;
}

.appointment-select {
  width: 100%;
  font-size: 1.44rem;
  padding: 1rem 1.2rem;
  height: 60px;
  border: 2px solid #dee2e6;
  border-radius: 0.75rem;
  background: white;
  color: #495057;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.appointment-select:hover {
  border-color: #3551a4;
  box-shadow: 0 2px 8px rgba(53, 81, 164, 0.1);
}

.appointment-select:focus {
  border-color: #3551a4;
  outline: none;
  box-shadow: 0 0 0 0.3rem rgba(53, 81, 164, 0.2);
  transform: translateY(-2px);
}

.appointment-preview {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  padding: 1.5rem 2rem;
  border-radius: 0.75rem;
  border: 2px solid #2196f3;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.32rem;
  color: #1565c0;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.appointment-preview i {
  font-size: 1.56rem;
  color: #1976d2;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Navigation Buttons */
.navigation-buttons {
  display: flex;
  gap: 1.25rem;
  justify-content: space-between;
  padding-top: 1.5rem;
  border-top: 2px solid #e9ecef;
}

.navigation-buttons .btn {
  min-width: 160px;
  font-weight: 500;
  padding: 1rem 2.25rem;
  font-size: 1.26rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.navigation-buttons .btn i {
  font-size: 1.32rem;
}

.navigation-buttons .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.navigation-buttons .btn-primary {
  background: linear-gradient(135deg, #3551a4, #2c4088);
  border: none;
}

.navigation-buttons .btn-primary:hover {
  background: linear-gradient(135deg, #2c4088, #1f2f5f);
}

.navigation-buttons .btn-info {
  background: linear-gradient(135deg, #17a2b8, #138496);
  border: none;
}

.navigation-buttons .btn-info:hover {
  background: linear-gradient(135deg, #138496, #0f6674);
}

.navigation-buttons .btn-success {
  background: linear-gradient(135deg, #28a745, #1e7e34);
  border: none;
}

.navigation-buttons .btn-success:hover {
  background: linear-gradient(135deg, #1e7e34, #155724);
}

/* Processing Overlay */
.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner-container {
  text-align: center;
  color: white;
}

.spinner-container p {
  margin-top: 1rem;
  font-size: 1.32rem;
}

/* Responsive */
@media (max-width: 768px) {
  .survey-step {
    padding: 1.75rem;
    margin: 1rem;
  }
  
  .question-title {
    font-size: 1.38rem;
  }
  
  .question-subtitle {
    font-size: 1.14rem;
  }
  
  .options-container.multi-select {
    grid-template-columns: 1fr;
  }
  
  .option-btn {
    padding: 1rem 1.25rem;
  }
  
  .appointment-form-grid {
    grid-template-columns: 1fr;
  }
  
  .appointment-preview {
    font-size: 1.14rem;
    padding: 1.25rem 1.5rem;
  }
  
  .navigation-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .navigation-buttons .btn {
    width: 100%;
  }
}
</style>
