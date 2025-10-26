<template>
  <div>
    <Loading :show="loading" :message="loadingMessage" />
    
    <!-- Step 1: ผู้ปกครองสามารถร่วมทำกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่ -->
    <div v-if="currentStep === 1" class="survey-step">
      <h4 class="question-title">1.ผู้ปกครองสามารถร่วมทำกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</h4>
      
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

      <!-- Show input when "ไม่ได้" is selected -->
      <div v-if="answers.q1 === 3" class="form-container" style="margin-top: 2rem;">
        <b-form-group label="โปรดให้เหตุผล:" label-for="q1-des-input">
          <b-form-input
            id="q1-des-input"
            v-model="answers.q1_des"
            placeholder="กรอกเหตุผล..."
          ></b-form-input>
        </b-form-group>
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

    <!-- Step 2: เด็กสามารถร่วมทำกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่ -->
    <div v-if="currentStep === 2" class="survey-step">
      <h4 class="question-title">2.เด็กสามารถร่วมทำกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</h4>
      
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

      <!-- Show input when "ไม่ได้" is selected -->
      <div v-if="answers.q2 === 3" class="form-container" style="margin-top: 2rem;">
        <b-form-group label="โปรดให้เหตุผล:" label-for="q2-des-input">
          <b-form-input
            id="q2-des-input"
            v-model="answers.q2_des"
            placeholder="กรอกเหตุผล..."
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

    <!-- Step 3: ในสัปดาห์ที่ผ่านมา ใครเป็นคนทำกิจกรรมที่ได้จากการเยี่ยมบ้านร่วมกับเด็ก -->
    <div v-if="currentStep === 3" class="survey-step">
      <h4 class="question-title">3 : ในสัปดาห์ที่ผ่านมา ใครเป็นคนทำกิจกรรมที่ได้จากการเยี่ยมบ้านร่วมกับเด็ก (ทบทวนการเยี่ยมบ้านที่ผ่านมา)</h4>
      
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
        <b-form-group label="อื่นๆ ระบุ:" label-for="q3-other-input">
          <b-form-input
            id="q3-other-input"
            v-model="answers.q3_des"
            placeholder="โปรดระบุ..."
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
<div v-if="currentStep === 4" class="survey-step">
      <h4 class="question-title">4. ในสัปดาห์ที่ผ่านมา ผู้ปกครองร่วมทำกิจกรรมกับเด็กบ่อยแค่ไหน ? (ทบทวนการเยี่ยมบ้านที่ผ่านมา)</h4>
      
      <div class="options-container">
        <button
          class="option-btn"
          :class="{ 'selected': answers.q4 === 1 }"
          @click="answers.q4 = 1"
        >
          ไม่ทำเลย
        </button>
        <button
          class="option-btn"
          :class="{ 'selected': answers.q4 === 2 }"
          @click="answers.q4 = 2"
        >
          ทำน้อย (1-2 วัน)
        </button>
        
        <button
          class="option-btn"
          :class="{ 'selected': answers.q4 === 3 }"
          @click="answers.q4 = 3"
        >
          ทำบ้างเป็นบางวัน (3-4 วัน)
        </button>
         <button
          class="option-btn"
          :class="{ 'selected': answers.q4 === 4 }"
          @click="answers.q4 = 4"
        >
          ทำเกือบทุกวัน (5-7 วัน)
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
    <!-- Step 5: ใช้ผู้เยี่ยมบ้านใส่ (Dynamic Activities like Q9) -->
    <div v-if="currentStep === 5 && shouldShowStep5" class="survey-step">
      <div v-if="activities.length === 0" class="alert alert-info">
        <i class="fas fa-info-circle"></i>
        ไม่พบกิจกรรมสำหรับเดือนที่ {{ visitorData.month_age }} ครั้งที่ {{ visitorData.time }}
      </div>

      <div v-else>
        <!-- Show current activity question for Q5 -->
        <div v-if="currentQ5Index < activities.length">
          <h4 class="question-title">
            5 : ให้ผู้เยี่ยมบ้านสังเกตหรือทบทวนกิจกรรมการเยี่ยมบ้านครั้งที่ผ่านมา โดยขอให้ผู้ปกครองสาธิตการทำกิจกรรมร่วมกับเด็ก
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

    <!-- Step 6: ใครเป็นคนทำกิจกรรมกับเด็ก -->
    <div v-if="currentStep === 6" class="survey-step">
      <h4 class="question-title">6 : ใครเป็นคนทำกิจกรรมการเยี่ยมบ้านร่วมกับเด็ก(การเยี่ยมบ้านครั้งนี้)</h4>
      
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
            placeholder="โปรดระบุ..."
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

    <!-- Step 7: มีผู้อื่นร่วมทำกิจกรรมด้วยหรือไม่ -->
    <div v-if="currentStep === 7" class="survey-step">
      <h4 class="question-title">7 : มีผู้อื่นร่วมทำกิจกรรมด้วยหรือไม่ (มากกว่า 20 นาที)</h4>
      
      <!-- Multi-select options -->
      <div class="options-container multi-select">
        <button
          v-for="option in q7Options"
          :key="option.value"
          class="option-btn"
          :class="{ 'selected': answers.q7 && answers.q7.includes(option.value) }"
          @click="toggleQ7Answer(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <!-- Show input when "อื่นๆ (13)" is selected -->
      <div v-if="answers.q7 && answers.q7.includes(13)" class="form-container" style="margin-top: 2rem;">
        <b-form-group label="อื่นๆ โปรดระบุ:" label-for="q71-input">
          <b-form-input
            id="q71-input"
            v-model="answers.q71"
            placeholder="โปรดระบุ..."
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

    <!-- Step 8: มีเด็กคนอื่นร่วมทำกิจกรรมไปพร้อมกับเด็ก -->
    <div v-if="currentStep === 8" class="survey-step">
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

    <!-- Step 9: Dynamic Activities Questions -->
    <div v-if="currentStep === 9" class="survey-step">
      <div v-if="activities.length === 0" class="alert alert-info">
        <i class="fas fa-info-circle"></i>
        ไม่พบกิจกรรมสำหรับเดือนที่ {{ visitorData.month_age }} ครั้งที่ {{ visitorData.time }}
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
    <div v-if="currentStep === 10" class="survey-step">
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
    <div v-if="currentStep === 11" class="survey-step">
      <h4 class="question-title">อัพโหลดรูปถ่ายกิจกรรมกับผู้ปกครองและเด็ก</h4>
      
      <div class="upload-container-dual">
        <!-- Image 1 -->
        <div class="upload-section">
          <h6 class="upload-section-title">รูปภาพที่ 1 <span class="required-badge">*</span></h6>
          <div v-if="!displayImage1" class="upload-placeholder">
            <i class="fas fa-image"></i>
            <p>ยังไม่มีรูปภาพ</p>
          </div>
          <div v-else class="image-preview">
            <img :src="displayImage1" alt="Image 1" />
            <button class="remove-image-btn" @click="removeImage(0)">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <input
            ref="fileInput1"
            type="file"
            accept="image/*"
            capture="environment"
            style="display: none"
            @change="handleFileSelect($event, 0)"
          />

          <b-button
            variant="warning"
            size="lg"
            class="upload-btn"
            @click="$refs.fileInput1.click()"
          >
            <i class="fas fa-camera"></i>
            {{ displayImage1 ? 'เลือกรูปใหม่' : 'อัพโหลดรูปที่ 1' }}
          </b-button>
        </div>

        <!-- Image 2 -->
        <div class="upload-section">
          <h6 class="upload-section-title">รูปภาพที่ 2 <span class="required-badge">*</span></h6>
          <div v-if="!displayImage2" class="upload-placeholder">
            <i class="fas fa-image"></i>
            <p>ยังไม่มีรูปภาพ</p>
          </div>
          <div v-else class="image-preview">
            <img :src="displayImage2" alt="Image 2" />
            <button class="remove-image-btn" @click="removeImage(1)">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <input
            ref="fileInput2"
            type="file"
            accept="image/*"
            capture="environment"
            style="display: none"
            @change="handleFileSelect($event, 1)"
          />

          <b-button
            variant="warning"
            size="lg"
            class="upload-btn"
            @click="$refs.fileInput2.click()"
          >
            <i class="fas fa-camera"></i>
            {{ displayImage2 ? 'เลือกรูปใหม่' : 'อัพโหลดรูปที่ 2' }}
          </b-button>
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

    <!-- Step 12: นัดหมายการเยี่ยมบ้านครั้งถัดไป -->
    <div v-if="currentStep === 12" class="survey-step">
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
              @change="onDayChange"
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
      
      // Flag to indicate if this is a synced survey (use existing activity IDs)
      isSyncedSurvey: false,
      
      // Image upload
      surveyImages: [],
      surveyImageKeys: [],
      
      // Activity detail modal
      activityDetailModalVisible: false,
      selectedActivity: null,
      
      // Answers object
      answers: {
        q1: null,
        q1_des: '',
        q2: null,
        q2_des: '',
        q3: [],
        q3_des: '',
        q4: null,
        q5: {}, // Changed to object like q9
        q6: [],
        q6_other: '',
        q7: [], // Multi-select array (renamed from q71)
        q71: '', // Text input for "อื่นๆ" (renamed from q71_des)
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
      
      q7Options: [
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
        time: '09:00 น.',
        monthAge: null,
        timeVisit: 1,
        activities: []
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
    },
    
    // ตรวจสอบว่าควรแสดง step 5 หรือไม่ (ไม่แสดงถ้า time = 1)
    shouldShowStep5() {
      return this.visitorData && Number(this.visitorData.time) !== 1
    },
    
    // ตรวจสอบว่า skip จาก Q1 หรือไม่
    skippedFromQ1() {
      return this.answers.q1 === 3
    },
    
    // ตรวจสอบว่า skip จาก Q2 หรือไม่
    skippedFromQ2() {
      return this.answers.q2 === 3
    },
    
    // แสดงรูปภาพที่ 1 (URL ก่อน, fallback เป็น base64)
    displayImage1() {
      const img = this.surveyImages[0]
      if (!img) {
        return null
      }
      
      // Support both new format (object) and old format (string)
      if (typeof img === 'object') {
        // Prioritize URL over base64, and normalize URL
        const rawUrl = img.url || img.base64 || null
        return this.normalizeImageUrl(rawUrl)
      }
      return this.normalizeImageUrl(img)  // Legacy: string base64 or URL
    },
    
    // แสดงรูปภาพที่ 2 (URL ก่อน, fallback เป็น base64)
    displayImage2() {
      const img = this.surveyImages[1]
      if (!img) {
        return null
      }
      
      // Support both new format (object) and old format (string)
      if (typeof img === 'object') {
        // Prioritize URL over base64, and normalize URL
        const rawUrl = img.url || img.base64 || null
        return this.normalizeImageUrl(rawUrl)
      }
      return this.normalizeImageUrl(img)  // Legacy: string base64 or URL
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
    
    convertActivityAnswersToNumber(activityAnswers) {
      // แปลง object ของคำตอบกิจกรรม (q5, q9) จาก string เป็น number
      const converted = {}
      for (const [key, value] of Object.entries(activityAnswers)) {
        converted[key] = value != null ? Number(value) : null
      }
      return converted
    },
    
    normalizeImageUrl(url) {
      // แปลง URL ให้เป็น full URL ถ้าจำเป็น
      if (!url) return null
      
      // ถ้าเป็น base64 data URL ให้ return ทันที
      if (url.startsWith('data:')) return url
      
      // ถ้าเป็น full URL แล้ว (http:// หรือ https://) ให้ return ทันที
      if (url.startsWith('http://') || url.startsWith('https://')) return url
      
      // ถ้าเป็น relative path ให้เพิ่ม base URL
      // สมมติว่า API อยู่ที่ domain เดียวกันกับ frontend
      const baseUrl = window.location.origin
      return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`
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
        // await this.fetchSurveyData()
        
        // โหลดกิจกรรมสำหรับคำถาม
        await this.loadActivities()
        
        // เตรียมตัวเลือกวันที่สำหรับนัดหมาย
        await this.initDateOptions()
        
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
      console.log(survey)
      // ตรวจสอบว่าอนุมัติแล้วหรือไม่ (approve_status == 1)
      if (survey.approve_status === 1) {
        this.$toast.error('ไม่สามารถแก้ไขได้ เนื่องจากได้รับการอนุมัติแล้ว')
        this.$router.push('/')
        return
      }
      
      // ถ้า survey ไม่มี month_age ให้ดึงจาก booking
      let monthAge = survey.month_age || editData.month_age
      if (!monthAge) {
        try {
          const booking = await this.$indexedDB.getBooking(editData.stid)
          if (booking && booking.month_age) {
            monthAge = booking.month_age
          }
        } catch (error) {
          console.warn('Failed to get month_age from booking:', error)
        }
      }
      
      // ตั้งค่าข้อมูลผู้รับบริการ
      this.visitorData = {
        stid: editData.stid,
        name: editData.name,
        nickname: editData.nickname,
        time: editData.time,
        month_age: monthAge,
        appointmentDate: survey.appointmentDate,
        appointmentTime: survey.appointmentTime
      }
      
      // โหลดข้อมูลแบบสอบถามเดิม
      await this.loadExistingSurvey(survey)
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
        this.visitorData.time
      )
      
      if (existingSurvey) {
        // โหลดแบบสอบถามที่ค้างไว้
        await this.loadExistingSurvey(existingSurvey)
        this.$toast.info('พบแบบสอบถามที่ยังไม่เสร็จสิ้น กำลังโหลดความคืบหน้า...')
      } else {
        // สร้างแบบสอบถามใหม่
        await this.createNewSurvey()
      }
    },
    
    async createNewSurvey() {
      // สร้างรหัสแบบสอบถาม (ใช้ format มาตรฐาน stid_time เพื่อป้องกันข้อมูลซ้ำ)
      this.surveyId = `${this.visitorData.stid}_${this.visitorData.time}`
      
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
    
    async loadExistingSurvey(survey) {
      this.surveyId = survey.id
      this.timeStart = survey.timeStart
      this.timeEnd = survey.timeEnd || null
      
      // ตรวจสอบว่า survey นี้ sync แล้วหรือยัง
      this.isSyncedSurvey = survey.synced === true
      
      // ⚠️ ถ้าแบบทดสอบ complete แล้ว ให้เริ่มต้นที่ข้อ 1 เสมอ
      // ถ้ายังไม่ complete ให้ดูว่าทำค้างไว้ที่ไหน
      if (survey.completed) {
        this.currentStep = 1
      } else {
        this.currentStep = survey.currentStep || 1
      }
      
      // Merge answers with defaults to ensure new fields exist
      // Handle backward compatibility for old field names
      // ⚠️ Convert string to number for q1, q2, q4, q8 (from API)
      this.answers = {
        ...this.answers,
        ...survey.answers,
        // Convert to number (handle both string and number from API/IndexedDB)
        q1: survey.answers?.q1 != null ? Number(survey.answers.q1) : null,
        q2: survey.answers?.q2 != null ? Number(survey.answers.q2) : null,
        q4: survey.answers?.q4 != null ? Number(survey.answers.q4) : null,
        q8: survey.answers?.q8 != null ? Number(survey.answers.q8) : null,
        // Ensure q3, q6, q7 are arrays with numbers
        q3: Array.isArray(survey.answers?.q3) ? survey.answers.q3.map(v => Number(v)) : [],
        q6: Array.isArray(survey.answers?.q6) ? survey.answers.q6.map(v => Number(v)) : [],
        q7: Array.isArray(survey.answers?.q7) 
          ? survey.answers.q7.map(v => Number(v)) 
          : (Array.isArray(survey.answers?.q71) ? survey.answers.q71.map(v => Number(v)) : []),
        q71: survey.answers?.q71 || survey.answers?.q71_des || survey.answers?.q71_other || '',
        // Map q6_des to q6_other (IndexedDB structure)
        q6_other: survey.answers?.q6_other || survey.answers?.q6_des || '',
        // Ensure notes field exists
        notes: survey.answers?.notes || survey.note || '',
        q1_des: survey.answers?.q1_des || '',
        q2_des: survey.answers?.q2_des || '',
        q3_des: survey.answers?.q3_des || '',
        // Convert q5 and q9 activity answers to numbers
        q5: survey.answers?.q5 ? this.convertActivityAnswersToNumber(survey.answers.q5) : {},
        q9: survey.answers?.q9 ? this.convertActivityAnswersToNumber(survey.answers.q9) : {}
      }
      
      // ⚠️ ถ้าเป็น synced survey ให้บันทึก values เดิมไว้
      if (this.isSyncedSurvey) {
        console.log('📌 Synced Survey - รักษา Activity IDs และ Values เดิม:', {
          q5_keys: Object.keys(this.answers.q5),
          q5_values: this.answers.q5,
          q9_keys: Object.keys(this.answers.q9),
          q9_values: this.answers.q9
        })
      }
      
      // ⚠️ ถ้าแบบทดสอบ complete แล้ว ให้ reset activity index ด้วย
      if (survey.completed) {
        this.currentActivityIndex = 0
        this.currentQ5Index = 0
      } else {
        this.currentActivityIndex = survey.currentActivityIndex || 0
        this.currentQ5Index = survey.currentQ5Index || 0
      }
      
      // Handle image formats: new (object with base64/url), old (string), or legacy (single image)
      // ⚠️ ใช้วิธีเดียวกับ index.vue ในการโหลดรูปภาพ
      if (survey.surveyImages && Array.isArray(survey.surveyImages)) {
        // สร้าง array สำหรับรูปภาพที่โหลดมา
        const loadedImages = []
        
        for (let i = 0; i < survey.surveyImages.length; i++) {
          const img = survey.surveyImages[i]
          
          if (typeof img === 'object' && img !== null) {
            // New format: object with { base64, url, key }
            // ใช้ url ก่อน fallback เป็น base64
            const imageData = img.url || img.base64
            if (imageData) {
              loadedImages.push({
                base64: img.base64 || null,
                url: img.url || null,
                key: img.key || `pic${i + 1}`
              })
            } else {
              loadedImages.push(null) // placeholder
            }
          } else if (typeof img === 'string') {
            // Old format: string (base64 or url)
            loadedImages.push({
              base64: img.startsWith('data:') ? img : null,
              url: img.startsWith('http') ? img : img.startsWith('/') ? img : null,
              key: `pic${i + 1}`
            })
          } else {
            loadedImages.push(null) // placeholder
          }
        }
        
        // ⚠️ ถ้ารูปใดไม่มีข้อมูล ให้ลองโหลดจาก images store (เหมือน index.vue)
        if (survey.surveyImageKeys && Array.isArray(survey.surveyImageKeys)) {
          for (let i = 0; i < survey.surveyImageKeys.length; i++) {
            if ((!loadedImages[i] || (!loadedImages[i].url && !loadedImages[i].base64)) && survey.surveyImageKeys[i]) {
              try {
                const imageObject = await this.$indexedDB.getImage(survey.surveyImageKeys[i])
                const imageData = imageObject?.data || imageObject?.image || null
                if (imageData) {
                  loadedImages[i] = {
                    base64: imageData.startsWith('data:') ? imageData : null,
                    url: imageData.startsWith('http') || imageData.startsWith('/') ? imageData : null,
                    key: `pic${i + 1}`
                  }
                }
              } catch (error) {
                // Silently handle error
              }
            }
          }
        }
        
        this.surveyImages = loadedImages.filter(Boolean)
        
      } else if (survey.surveyImage) {
        // Very old format: single image string
        this.surveyImages = [{
          base64: survey.surveyImage.startsWith('data:') ? survey.surveyImage : null,
          url: survey.surveyImage.startsWith('http') || survey.surveyImage.startsWith('/') ? survey.surveyImage : null,
          key: 'pic1'
        }]
      } else if (survey.surveyImageKeys && Array.isArray(survey.surveyImageKeys) && survey.surveyImageKeys.length > 0) {
        // ⚠️ ไม่มี surveyImages เลย แต่มี imageKeys ให้ลองโหลดจาก images store
        const loadedImages = []
        for (let i = 0; i < survey.surveyImageKeys.length; i++) {
          if (survey.surveyImageKeys[i]) {
            try {
              const imageObject = await this.$indexedDB.getImage(survey.surveyImageKeys[i])
              const imageData = imageObject?.data || imageObject?.image || null
              if (imageData) {
                loadedImages.push({
                  base64: imageData.startsWith('data:') ? imageData : null,
                  url: imageData.startsWith('http') || imageData.startsWith('/') ? imageData : null,
                  key: `pic${i + 1}`
                })
              }
            } catch (error) {
              // Silently handle error
            }
          }
        }
        this.surveyImages = loadedImages
      } else {
        this.surveyImages = []
      }
      
      if (survey.surveyImageKeys && Array.isArray(survey.surveyImageKeys)) {
        this.surveyImageKeys = survey.surveyImageKeys
      } else if (survey.surveyImageKey) {
        // Backward compatibility
        this.surveyImageKeys = [survey.surveyImageKey]
      } else {
        this.surveyImageKeys = []
      }
      
      // ถ้าอยู่ขั้นตอนที่ 12 โหลดข้อมูลนัดหมาย
      if (this.currentStep === 12 && survey.newAppointment) {
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
              time_visit: this.visitorData.time
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
        
        // ถ้าเป็น survey ที่ sync แล้ว ให้ใช้ activity IDs จากข้อมูลเดิม
        if (this.isSyncedSurvey && (this.answers.q5 || this.answers.q9)) {
          // ดึง activity IDs จาก q5 หรือ q9 (ใช้ q9 ก่อนเพราะมีข้อมูลครบกว่า)
          const activityIds = Object.keys(this.answers.q9 || this.answers.q5 || {})
          
          if (activityIds.length > 0) {
            // บันทึก values เดิมไว้ก่อนโหลด activities
            const savedQ5Values = { ...this.answers.q5 }
            const savedQ9Values = { ...this.answers.q9 }
            
            // กรองกิจกรรมที่ตรงกับ activity IDs ที่บันทึกไว้
            const matchingActivities = allActivities.filter(activity => {
              return activityIds.includes(String(activity.no))
            })
            
            // เรียงลำดับตาม activity IDs ที่บันทึกไว้
            matchingActivities.sort((a, b) => {
              return activityIds.indexOf(String(a.no)) - activityIds.indexOf(String(b.no))
            })
            
            this.activities = matchingActivities
            
            // รักษา values เดิมไว้หลังจากโหลด activities
            this.$set(this.answers, 'q5', savedQ5Values)
            this.$set(this.answers, 'q9', savedQ9Values)
            
            console.log('📌 โหลดกิจกรรมจาก Activity IDs ที่บันทึกไว้:', {
              activityIds,
              q5_values: savedQ5Values,
              q9_values: savedQ9Values
            })
            return
          }
        }
        
        // กรณีปกติ: กรองกิจกรรมที่ตรงกับอายุและครั้งที่เยี่ยม
        const matchingActivities = allActivities.filter(activity => {
          return Number(activity.month_age) === Number(this.visitorData.month_age) &&
                 Number(activity.time) === Number(this.visitorData.time)
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
        
        // ⚠️ ถ้าเป็น synced survey ให้รักษา activity IDs และ values เดิมไว้
        let answersToSave = { ...this.answers }
        if (this.isSyncedSurvey && existingSurvey?.answers) {
          // รักษา q5 และ q9 เดิมไว้ ไม่ให้เปลี่ยนแปลง activity IDs
          if (existingSurvey.answers.q5 && Object.keys(existingSurvey.answers.q5).length > 0) {
            answersToSave.q5 = { ...existingSurvey.answers.q5, ...this.answers.q5 }
          }
          if (existingSurvey.answers.q9 && Object.keys(existingSurvey.answers.q9).length > 0) {
            answersToSave.q9 = { ...existingSurvey.answers.q9, ...this.answers.q9 }
          }
        }
        
        const progressData = {
          id: this.surveyId,
          stid: this.visitorData.stid,
          time: this.visitorData.time,
          month_age: this.visitorData.month_age,
          timeStart: this.timeStart,
          timeEnd: this.timeEnd,
          appointmentDate: this.visitorData.appointmentDate,
          currentStep: this.currentStep,
          currentActivityIndex: this.currentActivityIndex,
          currentQ5Index: this.currentQ5Index,
          answers: answersToSave,
          note: answersToSave.notes || '', // เก็บ note ที่ top level เพื่อ sync ได้ตรง
          newAppointment: this.newAppointment,
          surveyImages: this.surveyImages,
          surveyImageKeys: this.surveyImageKeys,
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
    
    toggleQ7Answer(value) {
      // Ensure q7 is initialized as array
      if (!this.answers.q7) {
        this.$set(this.answers, 'q7', [])
      }
      const index = this.answers.q7.indexOf(value)
      if (index > -1) {
        this.answers.q7.splice(index, 1)
      } else {
        this.answers.q7.push(value)
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
        // กลับไปขั้นตอนก่อนหน้า (ถ้า step 5 ไม่แสดง จะไม่เข้าฟังก์ชันนี้)
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
    async handleFileSelect(event, index) {
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
        
        // Store as object with base64 and url
        this.$set(this.surveyImages, index, {
          base64: webpBase64,
          url: null,  // Will be set after sync to S3
          key: `pic${index + 1}`
        })
        
        // บันทึกลง IndexedDB
        await this.saveImageToIndexedDB(webpBase64, index)
        
        this.$toast.success(`อัพโหลดรูปภาพที่ ${index + 1} สำเร็จ`)
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
    
    async saveImageToIndexedDB(base64Image, index) {
      if (!this.$indexedDB) {
        return
      }
      
      try {
        const key = `survey_image_${index}_${Date.now()}`
        await this.$indexedDB.saveImage(key, base64Image)
        
        this.$set(this.surveyImageKeys, index, key)
      } catch (error) {
        // จัดการข้อผิดพลาด
      }
    },
    
    async removeImage(index) {
      if (this.surveyImageKeys[index] && this.$indexedDB) {
        try {
          await this.$indexedDB.deleteImage(this.surveyImageKeys[index])
        } catch (error) {
          // จัดการข้อผิดพลาด
        }
      }
      
      this.$set(this.surveyImages, index, null)
      this.$set(this.surveyImageKeys, index, null)
      
      // รีเซ็ตช่องเลือกไฟล์
      const refName = `fileInput${index + 1}`
      if (this.$refs[refName]) {
        this.$refs[refName].value = ''
      }
    },
    
    // การนำทาง
    async nextStep() {
      // ตรวจสอบความถูกต้อง
      if (!this.validateCurrentStep()) {
        return
      }
      
      // Skip logic: จาก step 1 ถ้า q1 === 3 ไปที่ step 10
      if (this.currentStep === 1 && this.skippedFromQ1) {
        this.currentStep = 10
        await this.saveProgress()
        return
      }
      
      this.currentStep++
      
      // ข้าม step 5 ถ้า time = 1 หรือ q2 === 3
      if (this.currentStep === 5 && (!this.shouldShowStep5 || this.skippedFromQ2)) {
        this.currentStep++
      }
      
      // ข้าม step 9 ถ้า q2 === 3
      if (this.currentStep === 9 && this.skippedFromQ2) {
        this.currentStep++
      }
      
      // ข้าม step 11 (อัพโหลดรูป) ถ้า q1 === 3 หรือ q2 === 3
      if (this.currentStep === 11 && (this.skippedFromQ1 || this.skippedFromQ2)) {
        this.currentStep++
      }
      
      this.currentActivityIndex = 0
      this.currentQ5Index = 0
      await this.saveProgress()
    },
    
    async prevStep() {
      if (this.currentStep > 1) {
        // Skip logic: ถ้าอยู่ที่ step 10 และ skip จาก Q1 ให้กลับไป step 1
        if (this.currentStep === 10 && this.skippedFromQ1) {
          this.currentStep = 1
          await this.saveProgress()
          return
        }
        
        // จัดการพิเศษเมื่อย้อนกลับจากขั้นตอนที่ 5 ไป 4
        if (this.currentStep === 5 && this.activities.length > 0) {
          this.currentQ5Index = this.activities.length - 1
        }
        
        // จัดการพิเศษเมื่อย้อนกลับจากขั้นตอนที่ 10 ไป 9
        if (this.currentStep === 10 && this.activities.length > 0) {
          this.currentActivityIndex = this.activities.length - 1
        }
        
        this.currentStep--
        
        // ข้าม step 11 (อัพโหลดรูป) ถ้า q1 === 3 หรือ q2 === 3 (เมื่อย้อนกลับจาก step 12)
        if (this.currentStep === 11 && (this.skippedFromQ1 || this.skippedFromQ2)) {
          this.currentStep--
        }
        
        // ข้าม step 9 ถ้า q2 === 3 (เมื่อย้อนกลับจาก step 10)
        if (this.currentStep === 9 && this.skippedFromQ2) {
          this.currentStep--
        }
        
        // ข้าม step 5 ถ้า time = 1 หรือ q2 === 3 (เมื่อย้อนกลับจาก step 6)
        if (this.currentStep === 5 && (!this.shouldShowStep5 || this.skippedFromQ2)) {
          this.currentStep--
        }
        
        await this.saveProgress()
      }
    },
    
    validateCurrentStep() {
      switch(this.currentStep) {
        case 1:
          if (this.answers.q1 == null) {
            this.$toast.warning('กรุณาเลือกคำตอบ')
            return false
          }
          if (this.answers.q1 === 3 && !this.answers.q1_des.trim()) {
            this.$toast.warning('กรุณากรอกเหตุผล')
            return false
          }
          break
        case 2:
          if (this.answers.q2 == null) {
            this.$toast.warning('กรุณาเลือกคำตอบ')
            return false
          }
          if (this.answers.q2 === 3 && !this.answers.q2_des.trim()) {
            this.$toast.warning('กรุณากรอกเหตุผล')
            return false
          }
          break
        case 3:
          if (this.answers.q3.length === 0) {
            this.$toast.warning('กรุณาเลือกคำตอบอย่างน้อย 1 ตัวเลือก')
            return false
          }
          if (this.answers.q3.includes(13) && !this.answers.q3_des.trim()) {
            this.$toast.warning('กรุณากรอกข้อมูลในช่อง "อื่นๆ ระบุ"')
            return false
          }
          break
        case 4:
          if (this.answers.q4 == null) {
            this.$toast.warning('กรุณาเลือกคำตอบ')
            return false
          }
          break
        case 6:
          if (this.answers.q6.length === 0) {
            this.$toast.warning('กรุณาเลือกคำตอบอย่างน้อย 1 ตัวเลือก')
            return false
          }
          if (this.answers.q6.includes(13) && !this.answers.q6_other.trim()) {
            this.$toast.warning('กรุณากรอกข้อมูลในช่อง "อื่นๆ ระบุ"')
            return false
          }
          break
        case 7:
          if (!this.answers.q7 || this.answers.q7.length === 0) {
            this.$toast.warning('กรุณาเลือกคำตอบอย่างน้อย 1 ตัวเลือก')
            return false
          }
          if (this.answers.q7.includes(13) && !this.answers.q71.trim()) {
            this.$toast.warning('กรุณากรอกข้อมูลในช่อง "อื่นๆ โปรดระบุ"')
            return false
          }
          break
        case 8:
          if (this.answers.q8 == null) {
            this.$toast.warning('กรุณาเลือกคำตอบ')
            return false
          }
          break
        case 10:
          if (!this.answers.endHour || !this.answers.endMinute) {
            this.$toast.warning('กรุณาเลือกเวลาสิ้นสุดการเยี่ยม')
            return false
          }
          break
        case 11:
          if (!this.skippedFromQ1 && !this.skippedFromQ2) {
            // ต้องมี 2 รูป (pic1 และ pic2)
            if (!this.displayImage1 || !this.displayImage2) {
              this.$toast.warning('กรุณาอัพโหลดรูปภาพทั้ง 2 รูป')
              return false
            }
          }
          break
        case 12:
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
          time: this.visitorData.time,
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
        
        // ใช้อายุเดือนและครั้งที่เยี่ยมที่คำนวณไว้แล้วจาก recalculateMonthAgeAndActivities()
        const newMonthAge = this.newAppointment.monthAge
        const newTimeVisit = this.newAppointment.timeVisit
        
        const bookingData = {
          stid: this.visitorData.stid,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          month_age: newMonthAge,
          time: newTimeVisit,
          last_visit_date: new Date().toISOString(),
          dataSource: 'local',
          lastSyncedAt: new Date().toISOString()
        }
        
        // บันทึกนัดหมายใหม่
        await this.$indexedDB.addBooking(bookingData)
      } catch (error) {
        throw error
      }
    },
    
    // ฟังก์ชันช่วยเหลือด้านวันที่
    async initDateOptions() {
      const now = new Date()
      const currentYear = now.getFullYear() + 543
      
      // สร้างตัวเลือกปี
      for (let i = currentYear; i <= currentYear + 2; i++) {
        this.yearOptions.push({ value: i, text: i.toString() })
      }
      
      // ตั้งค่าวันที่เริ่มต้นเป็นวันนี้บวก 1 เดือน 7 วัน
      const nextMonth = new Date(now)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      nextMonth.setDate(nextMonth.getDate() + 7)
      
      this.newAppointment.day = nextMonth.getDate()
      this.newAppointment.month = nextMonth.getMonth() + 1
      this.newAppointment.year = nextMonth.getFullYear() + 543
      
      // คำนวณอายุเดือนและกิจกรรมสำหรับวันที่เริ่มต้น
      await this.recalculateMonthAgeAndActivities()
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
    
    async onMonthChange() {
      if (this.newAppointment.day && this.newAppointment.year) {
        const daysInMonth = this.getDaysInMonth(this.newAppointment.month, this.newAppointment.year)
        
        if (this.newAppointment.day > daysInMonth) {
          this.newAppointment.day = daysInMonth
        }
      }
      
      // คำนวณอายุเดือนและกิจกรรมใหม่
      await this.recalculateMonthAgeAndActivities()
    },
    
    async onYearChange() {
      if (this.newAppointment.day && this.newAppointment.month === 2) {
        const daysInMonth = this.getDaysInMonth(2, this.newAppointment.year)
        
        if (this.newAppointment.day > daysInMonth) {
          this.newAppointment.day = daysInMonth
        }
      }
      
      // คำนวณอายุเดือนและกิจกรรมใหม่
      await this.recalculateMonthAgeAndActivities()
    },
    
    async onDayChange() {
      // คำนวณอายุเดือนและกิจกรรมใหม่
      await this.recalculateMonthAgeAndActivities()
    },
    
    async recalculateMonthAgeAndActivities() {
      if (!this.visitorData || !this.newAppointment.month || !this.newAppointment.year || !this.newAppointment.day) {
        return
      }
      
      try {
        // ดึงข้อมูล visitor เพื่อหาวันเกิด
        const visitor = await this.$indexedDB.getVisitor(this.visitorData.stid)
        
        if (!visitor || !visitor.month_birth || !visitor.year_birth) {
          return
        }
        
        // คำนวณอายุเดือนจากวันเกิดถึงวันที่เลือก
        const selectedYear = this.newAppointment.year - 543 // แปลงเป็นคริสต์ศักราช
        const selectedMonth = this.newAppointment.month
        const selectedDay = this.newAppointment.day
        
        const birthYear = parseInt(visitor.year_birth) - 543
        const birthMonth = parseInt(visitor.month_birth)
        
        let calculatedMonthAge = (selectedYear - birthYear) * 12 + (selectedMonth - birthMonth)
        
        // จำกัดอายุเดือนไว้ที่ 48
        if (calculatedMonthAge > 48) {
          calculatedMonthAge = 48
        }
        
        // อายุเดือนต้องไม่น้อยกว่า 0
        if (calculatedMonthAge < 0) {
          calculatedMonthAge = 0
        }
        
        
        // คำนวณครั้งที่เยี่ยม
        // ใช้ครั้งปัจจุบันที่เพิ่งทำในแบบทดสอบนี้ แล้ว +1 สำหรับนัดหมายครั้งถัดไป
        const currentVisitTime = parseInt(this.visitorData.time) // ครั้งปัจจุบันที่เพิ่งทำ
        let timeVisit = currentVisitTime + 1 // ครั้งถัดไปที่จะนัดหมาย
        
        const existingBooking = await this.$indexedDB.getBooking(this.visitorData.stid)
        
        // ตรวจสอบเงื่อนไขการรีเซ็ตตามระยะเวลา
        if (existingBooking && existingBooking.last_visit_date) {
          const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay)
          const lastVisitDate = new Date(existingBooking.last_visit_date)
          const daysSinceLastVisit = Math.floor((selectedDate - lastVisitDate) / (1000 * 60 * 60 * 24))
          
          if (daysSinceLastVisit > 21) {
            // เกิน 21 วัน รีเซ็ตครั้งที่เยี่ยม
            calculatedMonthAge = (selectedYear - birthYear) * 12 + (selectedMonth - birthMonth)
            if (calculatedMonthAge > 48) calculatedMonthAge = 48
            if (calculatedMonthAge < 0) calculatedMonthAge = 0
            timeVisit = 1
          }
        }
        
        // ตรวจสอบกรณีครั้งปัจจุบันเป็นครั้งที่ 4
        if (currentVisitTime === 4) {
          // ถ้าครั้งปัจจุบันเป็นครั้งที่ 4 ให้เพิ่มอายุเดือนและรีเซ็ตครั้งที่เยี่ยม
          calculatedMonthAge = (this.visitorData.month_age || 0) + 1
          timeVisit = 1
          
          if (calculatedMonthAge > 48) {
            calculatedMonthAge = 48
          }
        } else if (timeVisit > 4) {
          // จำกัดครั้งที่เยี่ยมไว้ที่ 4
          timeVisit = 4
        }
        
        // อัพเดทอายุเดือนและครั้งที่เยี่ยม
        this.newAppointment.monthAge = calculatedMonthAge
        this.newAppointment.timeVisit = timeVisit
        
        // ดึงกิจกรรมใหม่
        const activities = await this.$indexedDB.getActivityByMonthAgeAndTime(
          calculatedMonthAge,
          timeVisit
        )
        this.newAppointment.activities = activities || []
      } catch (error) {
        // Handle error silently
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

/* Dual Upload Container for 2 Images */
.upload-container-dual {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.upload-section-title {
  font-size: 1.44rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-align: center;
}

.required-badge {
  color: #dc3545;
  font-weight: bold;
  margin-left: 0.25rem;
}

.upload-placeholder {
  width: 100%;
  max-width: 600px;
  height: 300px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  border: 3px dashed rgba(255, 255, 255, 0.3);
}

.upload-section .upload-placeholder {
  max-width: 100%;
  height: 250px;
}

.upload-placeholder i {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.5);
}

.upload-placeholder p {
  font-size: 1.32rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.image-preview {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 300px;
  background: #000;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.upload-section .image-preview {
  max-width: 100%;
  height: 250px;
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
  margin-bottom: 1.5rem;
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

/* Calculated Info Cards */
.calculated-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  animation: slideIn 0.3s ease;
}

.info-card {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border: 2px solid #3551a4;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 4px 12px rgba(53, 81, 164, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(53, 81, 164, 0.25);
}

.info-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3551a4, #2c4088);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon i {
  color: white;
  font-size: 1.8rem;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 1.2rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
  font-weight: 400;
}

.info-value {
  font-size: 1.56rem;
  color: #2c3e50;
  font-weight: 600;
}

/* Activities Section */
.activities-section {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 2px solid #dee2e6;
  border-radius: 0.75rem;
  padding: 1.75rem;
  margin-bottom: 2rem;
  animation: slideIn 0.3s ease;
}

.activities-title {
  font-size: 1.44rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #dee2e6;
}

.activities-title i {
  color: #3551a4;
  font-size: 1.56rem;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.activity-item:hover {
  border-color: #3551a4;
  box-shadow: 0 2px 8px rgba(53, 81, 164, 0.1);
  transform: translateX(5px);
}

.activity-number {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.activity-name {
  font-size: 1.26rem;
  color: #2c3e50;
  font-weight: 400;
  flex: 1;
  line-height: 1.5;
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


/* Ensure proper scrolling on small screens */
@media (max-width: 768px) {
  body {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
