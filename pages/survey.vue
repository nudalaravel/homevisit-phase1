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
      <div v-if="q5Activities.length === 0" class="alert alert-info">
        <i class="fas fa-info-circle"></i>
        [ระบบเกิดข้อผิดพลาด] ไม่พบกิจกรรมจากการเยี่ยมบ้านครั้งที่แล้ว
      </div>

      <div v-else>
        <!-- Show current activity question for Q5 -->
        <div v-if="currentQ5Index < q5Activities.length">
          <h4 class="question-title">
            5 : ให้ผู้เยี่ยมบ้าน <strong>สังเกต</strong> หรือ <strong>ทบทวน</strong> กิจกรรมการเยี่ยมบ้านครั้งที่ผ่านมา โดยขอให้ผู้ปกครองสาธิตการทำ
กิจกรรมร่วมกับเด็ก
          </h4>
          <p class="question-subtitle">
            กิจกรรมที่ {{ currentQ5Index + 1 }} / {{ q5Activities.length }}
          </p>
          <div class="activity-description">
            {{ q5Activities[currentQ5Index].title || 'ไม่มีรายละเอียด' }}
            <i 
              class="fas fa-info-circle activity-info-icon" 
              @click="showActivityDetailModal(q5Activities[currentQ5Index])"
              title="ดูรายละเอียด"
            ></i>
          </div>

          <div class="options-container">
            <button
              class="option-btn"
              :class="{ 'selected': answers.q5[q5Activities[currentQ5Index].no] === 1 }"
              @click="setQ5Answer(q5Activities[currentQ5Index].no, 1)"
            >
              ทำได้เอง (1)
            </button>
            
            <button
              class="option-btn"
              :class="{ 'selected': answers.q5[q5Activities[currentQ5Index].no] === 2 }"
              @click="setQ5Answer(q5Activities[currentQ5Index].no, 2)"
            >
              ทำได้โดยได้รับการช่วยเหลือ (2)
            </button>

            <button
              class="option-btn"
              :class="{ 'selected': answers.q5[q5Activities[currentQ5Index].no] === 3 }"
              @click="setQ5Answer(q5Activities[currentQ5Index].no, 3)"
            >
              ทำไม่ได้เลย (3)
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
      <h4 class="question-title">6 : ใครเป็นคนทำกิจกรรมการเยี่ยมบ้านร่วมกับเด็กเป็นหลัก(การเยี่ยมบ้านครั้งนี้)</h4>
      
      <div class="options-container three-columns">
        <button
          v-for="option in q6Options"
          :key="option.value"
          class="option-btn"
          :class="{ 'selected': answers.q6 === option.value }"
          @click="answers.q6 = option.value"
        >
          {{ option.label }}
          </button>
        </div>

      <!-- Show input when "อื่นๆ (13)" is selected -->
      <div v-if="answers.q6 === 13" class="form-container" style="margin-top: 2rem;">
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
      
      <!-- Parent question: มี/ไม่มี -->
      <div class="options-container">
         
        <button
          class="option-btn"
          :class="{ 'selected': answers.q7 === 3 }"
          @click="answers.q7 = 3"
        >
          ไม่มี (3)
        </button>
        
        <button
          class="option-btn"
          :class="{ 'selected': answers.q7 === 1 }"
          @click="answers.q7 = 1"
        >
          มี (1)
        </button>
       
      </div>

      <!-- Conditional multi-select: Show when "มี" is selected -->
      <div v-if="answers.q7 === 1" style="margin-top: 2rem;">
        <h5 class="question-subtitle">ใครเป็นผู้ร่วมทำกิจกรรม</h5>
        
        <div class="options-container multi-select">
          <button
            v-for="option in q71Options"
            :key="option.value"
            class="option-btn"
            :class="{ 'selected': answers.q71 && answers.q71.includes(option.value) }"
            @click="toggleQ71Answer(option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <!-- Show input when "อื่นๆ (13)" is selected -->
        <div v-if="answers.q71 && answers.q71.includes(13)" class="form-container" style="margin-top: 2rem;">
          <b-form-group label="อื่นๆ โปรดระบุ:" label-for="q71-des-input">
            <b-form-input
              id="q71-des-input"
              v-model="answers.q71_des"
              placeholder="โปรดระบุ..."
            ></b-form-input>
          </b-form-group>
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
        [ระบบเกิดข้อผิดพลาด] ไม่พบกิจกรรมสำหรับเดือนที่ {{ visitorData.month_age }} ครั้งที่ {{ visitorData.time }}
      </div>

      <div v-else>
        <!-- Show current activity question -->
        <div v-if="currentActivityIndex < activities.length">
          <h4 class="question-title">
            9 : ให้ผู้เยี่ยมบ้าน <strong>สังเกต</strong> หรือ <strong>ทบทวน</strong> กิจกรรมการเยี่ยมบ้านครั้งนี้ โดยขอให้ผู้ปกครองสาธิตการทำ
กิจกรรมร่วมกับเด็ก
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
              ทำได้เอง (1)
            </button>
            
            <button
              class="option-btn"
              :class="{ 'selected': answers.q9[activities[currentActivityIndex].no] === 2 }"
              @click="setActivityAnswer(activities[currentActivityIndex].no, 2)"
            >
              ทำได้โดยได้รับการช่วยเหลือ (2)
            </button>

            <button
              class="option-btn"
              :class="{ 'selected': answers.q9[activities[currentActivityIndex].no] === 3 }"
              @click="setActivityAnswer(activities[currentActivityIndex].no, 3)"
            >
              ทำไม่ได้เลย (3)
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
          <label class="time-end-label">เวลาสิ้นสุดการเยี่ยม <span v-if="requiredEndTime" class="text-danger">*</span></label>
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
          <small v-if="requiredEndTime" class="text-danger">
            กรุณากรอกเวลาสิ้นสุดการเยี่ยม
          </small>
        </div>
      </div>

      <div class="navigation-buttons">
        <b-button variant="primary" size="lg" @click="prevStep">
          ย้อนกลับ
        </b-button>
        <b-button variant="info" size="lg" @click="nextStep" :disabled="requiredEndTime">
          ถัดไป
        </b-button>
      </div>
    </div>

    <!-- Special Step 2: รูปผู้เยี่ยมบ้าน (Split into 2 sub-steps) -->
    <div v-if="currentStep === 11" class="survey-step">
      <!-- Sub-Step 1: Image 1 -->
      <div v-if="currentImageSubStep === 1">
        <h4 class="question-title">รูปภาพที่ 1: รูปของเล่น สื่ออุปกรณ์ที่ใช้ในครั้งนี้</h4>
        
        <div class="upload-container">
          <div v-if="!displayImage1" class="upload-placeholder">
            <i class="fas fa-image"></i>
            <p>ยังไม่มีรูปภาพ</p>
          </div>
          <div v-else class="image-preview">
            <img :src="displayImage1" alt="รูปของเล่น สื่ออุปกรณ์" />
            <button class="remove-image-btn" @click="removeImage(0)">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <b-button
            variant="warning"
            size="lg"
            class="upload-btn"
            @click="openCameraModal(0)"
          >
            <i class="fas fa-camera"></i>
            {{ displayImage1 ? 'เลือกรูปใหม่' : 'ถ่ายรูปภาพที่ 1' }}
          </b-button>
        </div>

        <div class="navigation-buttons">
          <b-button variant="primary" size="lg" @click="prevStep">
            ย้อนกลับ
          </b-button>
          <b-button variant="info" size="lg" @click="nextImageSubStep">
            ถัดไป
          </b-button>
        </div>
      </div>

      <!-- Sub-Step 2: Image 2 -->
      <div v-if="currentImageSubStep === 2">
        <h4 class="question-title">รูปภาพที่ 2: รูปขณะที่เด็กและผู้ปกครองทำกิจกรรม</h4>
        
        <div class="upload-container">
          <div v-if="!displayImage2" class="upload-placeholder">
            <i class="fas fa-image"></i>
            <p>ยังไม่มีรูปภาพ</p>
          </div>
          <div v-else class="image-preview">
            <img :src="displayImage2" alt="รูปเด็กและผู้ปกครองทำกิจกรรม" />
            <button class="remove-image-btn" @click="removeImage(1)">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <b-button
            variant="warning"
            size="lg"
            class="upload-btn"
            @click="openCameraModal(1)"
          >
            <i class="fas fa-camera"></i>
            {{ displayImage2 ? 'เลือกรูปใหม่' : 'ถ่ายรูปภาพที่ 2' }}
          </b-button>
        </div>

        <div class="navigation-buttons">
          <b-button variant="primary" size="lg" @click="prevImageSubStep">
            ย้อนกลับ
          </b-button>
          <b-button variant="info" size="lg" @click="nextStep">
            ถัดไป
          </b-button>
        </div>
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
              v-model="newAppointment.appointmentDay"
            :options="currentDayOptions"
              class="appointment-select"
              :disabled="shouldDisableStep12"
              @change="onDayChange"
          ></b-form-select>
          </div>

          <div class="appointment-field">
            <label class="appointment-label">
              <i class="fas fa-calendar-alt"></i>
              เดือน
            </label>
          <b-form-select
              v-model="newAppointment.appointmentMonth"
            :options="monthOptions"
              :disabled="shouldDisableStep12"
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
              v-model="newAppointment.appointmentYear"
            :options="yearOptions"
              :disabled="shouldDisableStep12"
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
              v-model="newAppointment.appointmentTime"
            :options="timeOptions"
              class="appointment-select"
              :disabled="shouldDisableStep12"
              @change="onTimeChange"
          ></b-form-select>
          </div>
        </div>

        <div v-if="newAppointment.appointmentDay && newAppointment.appointmentMonth && newAppointment.appointmentYear && newAppointment.appointmentTime" class="appointment-preview">
          <i class="fas fa-info-circle"></i>
          <span>นัดหมาย: วันที่ {{ newAppointment.appointmentDay }} {{ getMonthName(newAppointment.appointmentMonth) }} {{ newAppointment.appointmentYear }} เวลา {{ newAppointment.appointmentTime }}</span>
        </div>
      </div>

      <!-- Error banner for appointment creation failure -->
      <div v-if="appointmentCreationFailed" class="appointment-error-banner">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="error-content">
          <h5>การสร้างนัดหมายล้มเหลว</h5>
          <p>แบบทดสอบถูกบันทึกเรียบร้อยแล้ว แต่ไม่สามารถสร้างนัดหมายครั้งถัดไปได้</p>
        </div>
        <div class="error-actions">
          <b-button variant="warning" @click="retryCreateAppointment" :disabled="processing">
            <i class="fas fa-redo"></i> ลองสร้างอีกครั้ง
          </b-button>
          <b-button variant="secondary" @click="skipAndReturn" :disabled="processing">
            <i class="fas fa-times"></i> ข้ามและกลับหน้าแรก
          </b-button>
        </div>
      </div>

      <div v-if="!appointmentCreationFailed" class="navigation-buttons">
        <b-button variant="primary" size="lg" @click="prevStep">
          <i class="fas fa-arrow-left"></i> ย้อนกลับ
        </b-button>
        <b-button v-if="shouldDisableStep12" variant="success" size="lg" @click="submitSurveyWithoutAppointment">
          <i class="fas fa-check-circle"></i> บันทึกและสิ้นสุด
        </b-button>
        <b-button v-else variant="success" size="lg" @click="submitSurvey">
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

    <!-- Camera Modal -->
    <b-modal
      v-model="cameraModalVisible"
      :title="`อัพโหลดรูปภาพที่ ${currentImageIndex + 1}`"
      size="lg"
      hide-footer
      @hide="closeCameraModal"
      class="camera-modal"
    >
      <div class="camera-container">
        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileInput"
          style="display: none"
        />

        <!-- Choice Mode: เลือกวิธีการอัพโหลด -->
        <div v-if="!uploadMode && !useFileInput" class="upload-choice-container">
          <div class="upload-choice-content">
            <h5 class="mb-4">เลือกวิธีการอัพโหลดรูปภาพ</h5>
            <div class="upload-choice-buttons">
              <b-button
                variant="primary"
                size="lg"
                @click="handleSelectFile"
                class="choice-btn"
              >
                <i class="fas fa-folder-open fa-2x mb-2"></i>
                <span>เลือกรูป</span>
              </b-button>
              <b-button
                variant="warning"
                size="lg"
                @click="selectUploadMode('camera')"
                class="choice-btn"
              >
                <i class="fas fa-camera fa-2x mb-2"></i>
                <span>ถ่ายภาพ</span>
              </b-button>
            </div>
            <b-button
              variant="secondary"
              size="lg"
              @click="closeCameraModal"
              class="choice-btn-cancel mt-3"
            >
              <i class="fas fa-times"></i> ยกเลิก
            </b-button>
          </div>
        </div>
        
        <!-- Camera Mode -->
        <template v-else-if="uploadMode === 'camera'">
          <!-- Video Preview -->
          <div v-if="!capturedImage" class="camera-preview">
            <video
              ref="videoElement"
              autoplay
              playsinline
              muted
              class="camera-video"
            ></video>
            <div v-if="!videoStream" class="camera-loading">
              <b-spinner variant="primary"></b-spinner>
              <p>กำลังเปิดกล้อง...</p>
            </div>
          </div>
          
          <!-- Captured Image Preview -->
          <div v-else class="captured-preview">
            <img :src="capturedImage" alt="ภาพที่ถ่าย" class="captured-image" />
          </div>

          <!-- Camera Controls -->
          <div class="camera-controls">
            <template v-if="!capturedImage">
              <b-button
                variant="danger"
                size="lg"
                @click="closeCameraModal"
                class="control-btn"
              >
                <i class="fas fa-times"></i> ยกเลิก
              </b-button>
              <b-button
                variant="warning"
                size="lg"
                @click="capturePhoto"
                :disabled="!videoStream"
                class="control-btn capture-btn"
              >
                <i class="fas fa-camera"></i> ถ่ายภาพ
              </b-button>
            </template>
            
            <template v-else>
              <b-button
                variant="secondary"
                size="lg"
                @click="retakePhoto"
                class="control-btn"
              >
                <i class="fas fa-redo"></i> ถ่ายใหม่
              </b-button>
              <b-button
                variant="success"
                size="lg"
                @click="usePhoto"
                class="control-btn"
              >
                <i class="fas fa-check"></i> ใช้รูปนี้
              </b-button>
            </template>
          </div>
        </template>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { MONTH_OPTIONS, TIME_OPTIONS } from '~/utils/constants'
import { getDaysInMonth, generateDayOptions, toMySQLDateTime } from '~/utils/dateHelpers'
import { convertToWebP } from '~/utils/imageHelpers'
import { generateYearOptions, calculateMonthAgeAndTime } from '~/utils/visitHelpers'
import { debounce } from '~/utils/helpers'
import { 
  PARTICIPANT_OPTIONS, 
  ACTIVITY_ANSWER_OPTIONS,
  validateSurveyStep,
  generateTimeOptions,
  normalizeImageUrl as normalizeImageUrlHelper,
  parseQ7Data,
  loadSurveyImages
} from '~/utils/surveyHelpers'
import { testSurveyTimeVisitRecording } from '~/utils/testSurveyTimeVisit'

export default {
  name: 'SurveyPage',
  layout: 'homevisitor',
  middleware: 'auth',
  data() {
    return {
      loading: false,
      loadingMessage: '',
      processing: false,
      appointmentCreationFailed: false,
      currentStep: 1,
      currentActivityIndex: 0,
      currentQ5Index: 0,
      currentImageSubStep: 1, // For Step 11: 1 = first image, 2 = second image
      
      // Visitor and survey metadata
      visitorData: null,
      surveyId: null,
      
      // System timestamps (เวลาที่ระบบบันทึกจริง)
      recStart: null, // เวลาที่ระบบเริ่มบันทึก
      recEnd: null,   // เวลาที่ระบบจบการบันทึก
      
      // User input times (เวลาที่ user กรอกเอง)
      timeStart: null, // เวลาที่ user กรอกว่าเริ่มทำกิจกรรม (อาจเป็นค่าว่าง)
      timeEnd: null,   // เวลาที่ user กรอกว่าจบกิจกรรม
      
      // Debounced save function
      saveProgressDebounced: null,
      
      // Activities from database
      activities: [], // สำหรับ q9 (กิจกรรมครั้งนี้)
      q5Activities: [], // สำหรับ q5 (กิจกรรมครั้งที่แล้ว)
      
      // Timestamps สำหรับ Q5/Q9 activities
      // เก็บเวลาที่ user ตอบแต่ละกิจกรรม { activityId: { first: 'YYYY-MM-DD HH:mm:ss', last: 'YYYY-MM-DD HH:mm:ss' } }
      q5Timestamps: {},
      q9Timestamps: {},
      
      // Flag to indicate if this is a synced survey (use existing activity IDs)
      isSyncedSurvey: false,
      
      // Flag to indicate if editing an incomplete survey (prevent recalculation)
      isEditingIncompleteSurvey: false,
      
      // Flag to indicate if step 12 (appointment) should be disabled
      // (when editing completed survey that has next survey already)
      shouldDisableStep12: false,
      
      // Image upload
      surveyImages: [],
      surveyImageKeys: [],
      
      // Activity detail modal
      activityDetailModalVisible: false,
      selectedActivity: null,
      
      // Camera modal
      cameraModalVisible: false,
      currentImageIndex: 0, // เก็บ index ของรูปที่กำลังถ่าย (0 หรือ 1)
      videoStream: null,
      capturedImage: null, // เก็บ base64 ของภาพที่ถ่าย
      videoElement: null,
      useFileInput: false, // fallback mode เมื่อ browser ไม่รองรับกล้อง
      uploadMode: null, // 'select' | 'camera' | null - โหมดการอัพโหลดที่ผู้ใช้เลือก
      cameraStarting: false, // flag เพื่อป้องกันการเรียก startCamera() ซ้ำ
      
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
        q6: null, // เลือกได้แค่ตัวเลือกเดียว
        q6_other: '',
        q7: null, // Single value: 1 = มี, 0 = ไม่มี
        q71: [], // Multi-select array for people who joined
        q71_des: '', // Text input for "อื่นๆ"
        q8: null,
        q9: {}, // { activityId: answer }
        notes: '',
        endHour: null,
        endMinute: null
      },
      
      // Options for multi-select questions
      q3Options: PARTICIPANT_OPTIONS,
      q6Options: PARTICIPANT_OPTIONS,
      q71Options: PARTICIPANT_OPTIONS,
      
      // Time options for end time
      hourOptions: [],
      minuteOptions: [],
      
      // New appointment data
      newAppointment: {
        appointmentDay: null,
        appointmentMonth: null,
        appointmentYear: null,
        appointmentTime: null,
        monthAge: null,
        timeActivity: 1,
        activities: []
      },
      
      monthOptions: MONTH_OPTIONS,
      yearOptions: [],
      timeOptions: TIME_OPTIONS
    }
  },
  computed: {
    currentDayOptions() {
      const month = this.newAppointment.appointmentMonth
      const year = this.newAppointment.appointmentYear
      
      if (!month || !year) {
        return generateDayOptions(31)
      }
      
      const daysInMonth = getDaysInMonth(month, year)
      return generateDayOptions(daysInMonth)
    },
    
    shouldShowStep5() {
      const timeVisit = Number(this.visitorData?.time_visit ||
       //this.visitorData?.time || dusable fallback ก่อนว่าจำเป็นต้องใช้ไหม
        1)
      return this.visitorData && timeVisit > 1
    },
    
    // ตรวจสอบว่า skip จาก Q1 หรือไม่
    skippedFromQ1() {
      return this.answers.q1 === 3
    },
    
    // ตรวจสอบว่า skip จาก Q2 หรือไม่
    skippedFromQ2() {
      return this.answers.q2 === 3
    },
    
    // แสดงรูปภาพที่ 1 - รองรับ Offline (ใช้ base64 เมื่อ offline)
    displayImage1() {
      const img = this.surveyImages[0]
      if (!img) {
        return null
      }
      
      // ใช้ store state แทน navigator.onLine เพื่อความแม่นยำ
      const isOffline = !this.$store.state.isOnline
      
      if (typeof img === 'object') {
        if (isOffline && img.base64) {
          return this.normalizeImageUrl(img.base64)
        }
        const rawUrl = img.url || img.base64 || null
        return this.normalizeImageUrl(rawUrl)
      }
      return this.normalizeImageUrl(img)
    },
    
    // แสดงรูปภาพที่ 2 - รองรับ Offline (ใช้ base64 เมื่อ offline)
    displayImage2() {
      const img = this.surveyImages[1]
      if (!img) {
        return null
      }
      
      // ใช้ store state แทน navigator.onLine เพื่อความแม่นยำ
      const isOffline = !this.$store.state.isOnline
      
      if (typeof img === 'object') {
        if (isOffline && img.base64) {
          return this.normalizeImageUrl(img.base64)
        }
        const rawUrl = img.url || img.base64 || null
        return this.normalizeImageUrl(rawUrl)
      }
      return this.normalizeImageUrl(img)
    },
    requiredEndTime() {
      return !this.answers.endHour || !this.answers.endMinute
    }
  },
  async mounted() {
    this.initTimeOptions()
    this.yearOptions = generateYearOptions(0, 2) // Current year to +2
    
    // สร้าง debounced save function (รอ 1000ms ก่อนบันทึก)
    this.saveProgressDebounced = debounce(() => {
      this.saveProgress()
    }, 1000)
    
    await this.initializeSurvey()
  },
  methods: {
    initTimeOptions() {
      const { hourOptions, minuteOptions } = generateTimeOptions()
      this.hourOptions = hourOptions
      this.minuteOptions = minuteOptions
      
      // Set default to current time
      // P'Kei เวลา ให้ว่างไว้ ไม่ต้องขึ้น default ถ้าไม่กรอกไปต่อไม่ได้ | 6.4.2026
      // const now = new Date()
      // this.answers.endHour = String(now.getHours()).padStart(2, '0')
      // this.answers.endMinute = String(now.getMinutes()).padStart(2, '0')
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
      // ใช้ store state แทน navigator.onLine เพื่อความแม่นยำ
      const isOffline = !this.$store.state.isOnline
      return normalizeImageUrlHelper(url, isOffline)
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
        
        // ตรวจสอบว่า IndexedDB พร้อมใช้งานหรือไม่
        if (!this.$indexedDB) {
          this.$toast.error('ระบบฐานข้อมูลยังไม่พร้อม กรุณารีเฟรชหน้าเว็บ')
          this.loading = false
          return
        }
        
        // ตรวจสอบว่า IndexedDB ถูก initialize แล้วหรือยัง
        const dbReady = await this.$indexedDB.ensureInitialized()
        if (!dbReady) {
          this.$toast.error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณารีเฟรชหน้าเว็บ')
          this.loading = false
          return
        }
        
        // โหลดจำนวนผู้รับบริการและอัพเดทข้อมูลในระบบ
        await this.loadPatientsCount()
        
        // ตรวจสอบ query parameters จาก URL ก่อน (สำหรับกรณีรีเฟรสหน้า)
        const urlParams = this.$route.query
        const mode = urlParams.mode
        const surveyIdFromUrl = urlParams.surveyId
        
        // ตรวจสอบว่าเป็นโหมดแก้ไขหรือไม่
        const editDataStr = localStorage.getItem('surveyEdit')
        
        if (editDataStr) {
          // โหมดแก้ไข (จาก localStorage)
          await this.loadEditMode(JSON.parse(editDataStr))
          localStorage.removeItem('surveyEdit')
        } else if (mode === 'edit' && surveyIdFromUrl) {
          // โหมดแก้ไข (จาก URL query parameters - กรณีรีเฟรสหน้า)
          await this.loadEditModeFromUrl(surveyIdFromUrl)
        } else {
          // โหมดสร้างใหม่
          await this.loadNewSurveyMode()
        }
        
        // โหลดกิจกรรมสำหรับคำถาม
        await this.loadActivities()
        
        // เตรียมตัวเลือกวันที่สำหรับนัดหมาย
        await this.initDateOptions()
        
        this.loading = false
      } catch (error) {
        console.error('initializeSurvey error:', error)
        this.loading = false
        // แสดงข้อความที่เหมาะสมตามสถานะ offline/online
        if (!this.$store.state.isOnline) {
          this.$toast.warning('กำลังทำงานในโหมดออฟไลน์ ข้อมูลจะถูกบันทึกในเครื่อง')
        } else {
          this.$toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        }
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
        }
      }
      
      // คำนวณ time_visit ถ้าไม่มี (ไม่ใช้ time เป็น fallback)
      let timeVisit = survey.time_visit
      if (!timeVisit) {
        const completedSurveys = await this.$indexedDB.getCompletedSurveysByStid(editData.stid)
        timeVisit = completedSurveys.length + 1
      }
      
      // ตั้งค่าข้อมูลผู้รับบริการ
      this.visitorData = {
        stid: editData.stid,
        name: editData.name,
        nickname: editData.nickname,
        time: editData.time,
        time_visit: timeVisit,
        month_age: monthAge,
        appointmentDate: survey.appointmentDate,
        appointmentTime: editData.appointmentTime
      }
      // เปลี่ยนเป็น เอาเวลา หน้าแก้ไขข้อมูล แทน
      // appointmentTime: survey.appointmentTime
      
      // โหลดข้อมูลแบบสอบถามเดิม
      await this.loadExistingSurvey(survey)
      
      // อัพเดท URL ให้มี query parameters (ถ้ายังไม่มี)
      if (!this.$route.query.mode || !this.$route.query.surveyId) {
        this.$router.replace({
          path: '/survey',
          query: { mode: 'edit', surveyId: editData.surveyId }
        })
      }
      
      this.$toast.info('กำลังแก้ไขบันทึกการเยี่ยมบ้าน')
    },
    
    async loadEditModeFromUrl(surveyId) {
      // โหลดข้อมูลจาก IndexedDB โดยใช้ surveyId จาก URL (กรณีรีเฟรสหน้า)
      const survey = await this.$indexedDB.getSurveyProgressById(surveyId)
      if (!survey) {
        this.$toast.error('ไม่พบข้อมูลการเยี่ยมบ้านที่ต้องการแก้ไข')
        this.$router.push('/')
        return
      }
      
      // ตรวจสอบว่าอนุมัติแล้วหรือไม่ (approve_status == 1)
      if (survey.approve_status === 1) {
        this.$toast.error('ไม่สามารถแก้ไขได้ เนื่องจากได้รับการอนุมัติแล้ว')
        this.$router.push('/')
        return
      }
      
      // ดึงข้อมูลผู้รับบริการจาก IndexedDB
      const visitor = await this.$indexedDB.getVisitor(survey.stid)
      if (!visitor) {
        this.$toast.error('ไม่พบข้อมูลผู้รับบริการ')
        this.$router.push('/')
        return
      }
      
      // ถ้า survey ไม่มี month_age ให้ดึงจาก booking
      let monthAge = survey.month_age
      if (!monthAge) {
        try {
          const booking = await this.$indexedDB.getBooking(survey.stid)
          if (booking && booking.month_age) {
            monthAge = booking.month_age
          }
        } catch (error) {
        }
      }
      
      // คำนวณ time_visit ถ้าไม่มี (ไม่ใช้ time เป็น fallback)
      let timeVisit = survey.time_visit
      if (!timeVisit) {
        const completedSurveys = await this.$indexedDB.getCompletedSurveysByStid(survey.stid)
        timeVisit = completedSurveys.length + 1
      }
      
      // ตั้งค่าข้อมูลผู้รับบริการ
      this.visitorData = {
        stid: survey.stid,
        name: visitor.cname || visitor.name,
        nickname: visitor.cnickname || visitor.nickname,
        time: survey.time,
        time_visit: timeVisit,
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
      let visitorDataStr = localStorage.getItem('surveyPatient')
      
      // ถ้าไม่มีใน localStorage ให้ลองดึงจาก query parameters
      if (!visitorDataStr) {
        const urlParams = this.$route.query
        const stid = urlParams.stid
        const timeVisit = urlParams.time_visit || urlParams.time // รองรับทั้ง time_visit และ time (backward compatibility)
        
        if (stid && timeVisit) {
          // ลองโหลดจาก IndexedDB โดยใช้ stid และ time_visit
          const existingSurvey = await this.$indexedDB.getSurveyProgress(stid, timeVisit)
          
          if (existingSurvey) {
            // พบแบบสอบถามที่ยังไม่เสร็จ
            const visitor = await this.$indexedDB.getVisitor(stid)
            if (visitor) {
              // ดึง booking เพื่อเอา appointmentTime และ startTime
              const booking = await this.$indexedDB.getBooking(stid)
              
              // คำนวณ time_visit ถ้าไม่มี (ไม่ใช้ time เป็น fallback)
              let timeVisit = existingSurvey.time_visit
              if (!timeVisit) {
                const completedSurveys = await this.$indexedDB.getCompletedSurveysByStid(stid)
                timeVisit = completedSurveys.length + 1
              }
              this.visitorData = {
                stid: stid,
                name: visitor.cname || visitor.name,
                nickname: visitor.cnickname || visitor.nickname,
                time: existingSurvey.time,
                time_visit: timeVisit,
                month_age: existingSurvey.month_age,
                appointmentDate: existingSurvey.appointmentDate,
                appointmentTime: existingSurvey.appointmentTime || booking?.appointmentTime,
                startTime: booking?.appointmentTime || existingSurvey.appointmentTime
              }
              await this.loadExistingSurvey(existingSurvey)
              
              // ถ้า existingSurvey ยังไม่มี timeStart ให้เอาจาก visitorData
              if (!this.timeStart && this.visitorData.startTime) {
                this.timeStart = this.visitorData.startTime
                await this.saveProgress()
              }
              
              // อัพเดท URL ให้มี query parameters (ถ้ายังไม่มี)
              if (!this.$route.query.stid || !this.$route.query.time_visit) {
                this.$router.replace({
                  path: '/survey',
                  query: { stid: stid, time_visit: timeVisit }
                })
              }
              
              this.$toast.info('พบแบบสอบถามที่ยังไม่เสร็จสิ้น กำลังโหลดความคืบหน้า...')
              return
            }
          }
        }
        
        // ไม่พบข้อมูลเลย
        this.$toast.error('ไม่พบข้อมูลผู้รับบริการ')
        this.$router.push('/')
        return
      }
      
      this.visitorData = JSON.parse(visitorDataStr)
  
      
      // ตรวจสอบแบบสอบถามที่ยังไม่เสร็จ
      const existingSurvey = await this.$indexedDB.getSurveyProgress(
        this.visitorData.stid,
        this.visitorData.time_visit || this.visitorData.time
      )
      
      if (existingSurvey) {
        // โหลดแบบสอบถามที่ค้างไว้
        await this.loadExistingSurvey(existingSurvey)
        
        // ถ้า existingSurvey ยังไม่มี timeStart ให้เอาจาก visitorData (localStorage)
        if (!this.timeStart && this.visitorData.startTime) {
          this.timeStart = this.visitorData.startTime
          await this.saveProgress()
        }
        
        this.$toast.info('พบแบบสอบถามที่ยังไม่เสร็จสิ้น กำลังโหลดความคืบหน้า...')
      } else {
        // สร้างแบบสอบถามใหม่
        await this.createNewSurvey()
      }
      
      // อัพเดท URL ให้มี query parameters (ถ้ายังไม่มี)
      if (!this.$route.query.stid || !this.$route.query.time_visit) {
        this.$router.replace({
          path: '/survey',
          query: { stid: this.visitorData.stid, time_visit: this.visitorData.time_visit || this.visitorData.time }
        })
      }
    },
    
    async createNewSurvey() {
      // ใช้ time_visit ในการสร้าง surveyId (ไม่ใช่ time) เพื่อให้ unique
      const timeVisit = this.visitorData.time_visit || this.visitorData.time
      this.surveyId = `${this.visitorData.stid}_${timeVisit}`
      this.recStart = toMySQLDateTime()
      
      if (this.visitorData.startTime) {
        this.timeStart = this.visitorData.startTime
      } else {
        this.timeStart = null
      }
      
      await this.saveProgress()
    },
    
    async loadExistingSurvey(survey) {
      this.surveyId = survey.id
      
      this.recStart = survey.recStart || null
      this.recEnd = survey.recEnd || null
      // เพิ่มตรงนี้ เพื่อเช็คว่า เป็นหน้าแก้ไข หรือไม่
      const urlParams = this.$route.query
      if (survey.completed && urlParams.mode === 'edit') {
        this.timeStart = this.visitorData.appointmentTime || null
      } else {
        this.timeStart = survey.timeStart || null
      }
      // this.timeStart = survey.timeStart || null
      this.timeEnd = survey.timeEnd || null
    
      this.isSyncedSurvey = survey.synced === true
      this.isEditingIncompleteSurvey = !survey.completed

      if (survey.completed) {
        const allSurveys = await this.$indexedDB.getAllSurveysByStid(survey.stid)
        
        const surveyTimes = allSurveys
          .map(s => Number(s.time_visit))
          .filter(t => !isNaN(t) && t > 0)
        const maxTime = surveyTimes.length > 0 ? Math.max(...surveyTimes) : 0
        const currentTime = Number(survey.time_visit || 0)
        
        if (maxTime > currentTime) {
          this.shouldDisableStep12 = true
        } else {
          this.shouldDisableStep12 = false
        }
      } else {
        this.shouldDisableStep12 = false
      }
      
      
      if (survey.completed) {
        this.currentStep = 1
      } else {
        this.currentStep = survey.currentStep || 1
      }
      
      const q7Data = parseQ7Data(
        survey.answers?.q7,
        survey.answers?.q71,
        survey.answers?.q71_des || ''
      )
      
      const baseAnswers = { ...this.answers }
      const savedAnswers = survey.answers || {}
      
      this.answers = {
        ...baseAnswers,
        q1: savedAnswers.q1 != null ? Number(savedAnswers.q1) : null,
        q2: savedAnswers.q2 != null ? Number(savedAnswers.q2) : null,
        q4: savedAnswers.q4 != null ? Number(savedAnswers.q4) : null,
        q8: savedAnswers.q8 != null ? Number(savedAnswers.q8) : null,
        q3: Array.isArray(savedAnswers.q3) ? savedAnswers.q3.map(v => Number(v)) : [],
        q6: savedAnswers.q6 != null ? (Array.isArray(savedAnswers.q6) ? (savedAnswers.q6.length > 0 ? Number(savedAnswers.q6[0]) : null) : Number(savedAnswers.q6)) : null,
        q7: q7Data.q7,
        q71: q7Data.q71,
        q71_des: q7Data.q71_des,
        q6_other: savedAnswers.q6_other || savedAnswers.q6_des || '',
        notes: savedAnswers.notes || survey.note || '',
        q1_des: savedAnswers.q1_des || '',
        q2_des: savedAnswers.q2_des || '',
        q3_des: savedAnswers.q3_des || '',
        q5: savedAnswers.q5 ? this.convertActivityAnswersToNumber(savedAnswers.q5) : {},
        q9: savedAnswers.q9 ? this.convertActivityAnswersToNumber(savedAnswers.q9) : {}
      }
      
      // ถ้า q5 เป็น {} และ time_visit > 1 ให้โหลด q5 จาก previous survey
      // (กรณีที่ survey ถูกสร้างใหม่แต่ยังไม่ได้ทำ step 5 หรือ skip step 5)
      if ((!this.answers.q5 || Object.keys(this.answers.q5).length === 0) && survey.time_visit) {
        const currentTimeVisit = Number(survey.time_visit)
        if (currentTimeVisit > 1) {
          const previousTimeVisit = currentTimeVisit - 1
          try {
            // หา previous survey เพื่อใช้ q9 เป็น q5
            const completedSurveys = await this.$indexedDB.getCompletedSurveysByStid(survey.stid)
            let previousSurvey = completedSurveys.find(s => 
              Number(s.time_visit) === previousTimeVisit && s.completed
            )
            
            if (!previousSurvey) {
              previousSurvey = await this.$indexedDB.getSurveyProgress(
                survey.stid,
                previousTimeVisit
              )
            }
            
            if (!previousSurvey) {
              const allSurveys = await this.$indexedDB.getAllSurveysByStid(survey.stid)
              previousSurvey = allSurveys.find(s => 
                Number(s.time_visit) === previousTimeVisit
              )
            }
            
            if (previousSurvey && previousSurvey.answers && previousSurvey.answers.q9 && Object.keys(previousSurvey.answers.q9).length > 0) {
              // ใช้ q9 จาก previous survey เป็น q5 เสมอ (ไม่สน q2)
              const q9Answers = previousSurvey.answers.q9
              // คัดลอก q9 จาก previous survey เป็น q5 (แม้ค่าเป็น null ก็ตาม)
              this.answers.q5 = { ...q9Answers }
              await this.saveProgress()
            }
          } catch (error) {
            console.warn('Failed to load q5 from previous survey in loadExistingSurvey:', error)
          }
        }
      }
      
      if (survey.completed) {
        this.currentActivityIndex = 0
        this.currentQ5Index = 0
      } else {
        this.currentActivityIndex = survey.currentActivityIndex || 0
        this.currentQ5Index = survey.currentQ5Index || 0
      }
      
        if (survey.surveyImages && Array.isArray(survey.surveyImages)) {
        const loadedImages = []
        
        for (let i = 0; i < survey.surveyImages.length; i++) {
          const img = survey.surveyImages[i]
          
          if (typeof img === 'object' && img !== null) {
            const imageData = img.url || img.base64
            if (imageData) {
              loadedImages.push({
                base64: img.base64 || null,
                url: img.url || null,
                key: img.key || `pic${i + 1}`
              })
            } else {
              loadedImages.push(null)
            }
          } else if (typeof img === 'string') {
            loadedImages.push({
              base64: img.startsWith('data:') ? img : null,
              url: img.startsWith('http') ? img : img.startsWith('/') ? img : null,
              key: `pic${i + 1}`
            })
          } else {
            loadedImages.push(null)
          }
        }
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
              }
            }
          }
        }
        
        this.surveyImages = loadedImages.filter(Boolean)
        
      } else if (survey.surveyImage) {
        this.surveyImages = [{
          base64: survey.surveyImage.startsWith('data:') ? survey.surveyImage : null,
          url: survey.surveyImage.startsWith('http') || survey.surveyImage.startsWith('/') ? survey.surveyImage : null,
          key: 'pic1'
        }]
      } else if (survey.surveyImageKeys && Array.isArray(survey.surveyImageKeys) && survey.surveyImageKeys.length > 0) {
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
        this.surveyImageKeys = [survey.surveyImageKey]
      } else {
        this.surveyImageKeys = []
      }
      if (survey.newAppointment) {
        this.newAppointment = survey.newAppointment
      }
      
      // โหลด timestamps สำหรับ Q5/Q9
      if (survey.q5Timestamps) {
        this.q5Timestamps = survey.q5Timestamps
      }
      if (survey.q9Timestamps) {
        this.q9Timestamps = survey.q9Timestamps
      }
      
      if (survey.q5Activities && Array.isArray(survey.q5Activities)) {
        // โหลด q5Activities จาก survey ที่บันทึกไว้
        // แต่ถ้าเป็น empty array ให้ปล่อยไว้เพื่อให้ loadActivities() โหลดใหม่จาก previous survey
        if (survey.q5Activities.length > 0) {
          this.q5Activities = survey.q5Activities
        } else {
          // ถ้าเป็น empty array ให้เป็น empty array เพื่อให้ loadActivities() โหลดใหม่
          this.q5Activities = []
        }
      }

      if (survey.timeEnd) {
        const timeStr = survey.timeEnd.replace(' น.', '').trim()
        const [hour, minute] = timeStr.split(':')
        this.answers.endHour = hour.padStart(2, '0')
        this.answers.endMinute = minute.padStart(2, '0')
      }
    },
    
    async fetchSurveyData() {
      // ฟังก์ชันนี้ไม่ได้ถูกเรียกใช้แล้ว (deprecated)
      // ข้อมูล survey จะถูกโหลดจาก IndexedDB แทน
      // ถ้าต้องการ sync จาก API ควรใช้ $systemInit.syncSurveyResults() แทน
      try {
        // ตรวจสอบสถานะ offline ก่อนเรียก API
        if (!this.$store.state.isOnline) {
          console.warn('Offline mode: Cannot fetch survey data from API')
          return
        }
        
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
              time: this.visitorData.time
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
        console.warn('fetchSurveyData error:', error)
      }
    },
    
    async loadActivities() {
      try {
        // ตรวจสอบว่า IndexedDB พร้อมใช้งานหรือไม่
        if (!this.$indexedDB) {
          console.warn('IndexedDB not available, skipping loadActivities')
          this.activities = []
          this.q5Activities = []
          return
        }
        
        // ตรวจสอบว่า IndexedDB ถูก initialize แล้วหรือยัง
        const dbReady = await this.$indexedDB.ensureInitialized()
        if (!dbReady) {
          console.warn('IndexedDB not initialized, skipping loadActivities')
          this.activities = []
          this.q5Activities = []
          return
        }
        
        const allActivities = await this.$indexedDB.getActivities()
        
        // ตรวจสอบว่ามี activities ใน IndexedDB หรือไม่
        if (!allActivities || allActivities.length === 0) {
          console.warn('No activities found in IndexedDB')
          // แสดงข้อความแจ้งเตือนเมื่อ offline และไม่มี activities
          if (!this.$store.state.isOnline) {
            this.$toast.warning('ไม่พบข้อมูลกิจกรรมในเครื่อง กรุณาเชื่อมต่ออินเทอร์เน็ตเพื่อโหลดข้อมูล')
          } else {
            this.$toast.warning('ไม่พบข้อมูลกิจกรรม กรุณารีเฟรชหน้าเว็บ')
          }
          this.activities = []
          this.q5Activities = []
          return
        }
        
        if (this.isSyncedSurvey) {
          const savedQ5Values = { ...this.answers.q5 }
          const savedQ9Values = { ...this.answers.q9 }
          
          if (this.answers.q9 && Object.keys(this.answers.q9).length > 0) {
            const q9ActivityIds = Object.keys(this.answers.q9)
            const q9MatchingActivities = allActivities.filter(activity => {
              return q9ActivityIds.includes(String(activity.no))
            })
            q9MatchingActivities.sort((a, b) => {
              return q9ActivityIds.indexOf(String(a.no)) - q9ActivityIds.indexOf(String(b.no))
            })
            this.activities = q9MatchingActivities
          }
          
          if (this.answers.q5 && Object.keys(this.answers.q5).length > 0) {
            const q5ActivityIds = Object.keys(this.answers.q5)
            const q5MatchingActivities = allActivities.filter(activity => {
              return q5ActivityIds.includes(String(activity.no))
            })
            q5MatchingActivities.sort((a, b) => {
              return q5ActivityIds.indexOf(String(a.no)) - q5ActivityIds.indexOf(String(b.no))
            })
            this.q5Activities = q5MatchingActivities
          }
          
          this.$set(this.answers, 'q5', savedQ5Values)
          this.$set(this.answers, 'q9', savedQ9Values)
          
          return
        }
        
        // ตรวจสอบว่า visitorData มีข้อมูลครบถ้วนหรือไม่
        if (!this.visitorData || !this.visitorData.month_age || !this.visitorData.time) {
          console.warn('Missing visitorData for activity filtering')
          this.activities = []
          this.q5Activities = []
          return
        }
        
        const q9Activities = allActivities.filter(activity => {
          return Number(activity.month_age) === Number(this.visitorData.month_age) &&
                 Number(activity.time) === Number(this.visitorData.time)
        })
        this.activities = q9Activities
        
        // ถ้ามี q5Activities อยู่แล้ว (โหลดจาก loadExistingSurvey) และไม่ใช่ empty array ให้ข้าม
        // แต่ถ้าเป็น empty array ให้ลองโหลดใหม่จาก previous survey
        if (this.q5Activities.length > 0) {
          return
        }
        
        // ถ้า q5Activities เป็น empty array และ currentTimeVisit > 1 ให้ลองโหลดใหม่
        // (กรณีนี้เกิดเมื่อ survey ที่บันทึกไว้มี q5Activities เป็น empty array)
        
        const currentTimeVisit = Number(this.visitorData.time_visit 
        || //this.visitorData.time dusable fallback ก่อนว่าจำเป็นต้องใช้ไหม
        1)
        
        if (currentTimeVisit > 1) {
          const previousTimeVisit = currentTimeVisit - 1
          try {
            // หา previous survey (time_visit - 1) เพื่อใช้ q9 เป็น q5
            // q5 = q9 ของ survey ก่อนหน้าเสมอ (ไม่สน q2)
            const completedSurveys = await this.$indexedDB.getCompletedSurveysByStid(this.visitorData.stid)
            let previousSurvey = completedSurveys.find(s => 
              Number(s.time_visit) === previousTimeVisit && s.completed
            )
            
            // ถ้าไม่พบใน completed surveys ให้ลองหาใน survey progress (รวมทั้งที่ยังไม่ completed)
            if (!previousSurvey) {
              previousSurvey = await this.$indexedDB.getSurveyProgress(
                this.visitorData.stid,
                previousTimeVisit
              )
            }
            
            // ถ้าไม่พบอีก ให้ลองหาโดยใช้ stid และ time_visit โดยตรง
            if (!previousSurvey) {
              const allSurveys = await this.$indexedDB.getAllSurveysByStid(this.visitorData.stid)
              previousSurvey = allSurveys.find(s => 
                Number(s.time_visit) === previousTimeVisit
              )
            }
            
            if (previousSurvey) {
              // ใช้ q9 จาก previous survey เป็น q5 เสมอ (ไม่สน q2)
              if (previousSurvey.answers && previousSurvey.answers.q9 && Object.keys(previousSurvey.answers.q9).length > 0) {
                const q9Answers = previousSurvey.answers.q9
                // ดึง activity IDs จาก keys ของ q9 object (แม้จะเป็น null values ก็ตาม)
                const q5ActivityIds = Object.keys(q9Answers).filter(id => id && id !== '')
                
                if (q5ActivityIds.length > 0) {
                  const q5MatchingActivities = allActivities.filter(activity => {
                    return q5ActivityIds.includes(String(activity.no))
                  })
                  
                  q5MatchingActivities.sort((a, b) => {
                    return q5ActivityIds.indexOf(String(a.no)) - q5ActivityIds.indexOf(String(b.no))
                  })
                  
                  this.q5Activities = q5MatchingActivities
                  await this.saveProgress()
                } else {
                  this.q5Activities = []
                }
              } else {
                // ถ้า previous survey ไม่มี q9 ให้เป็น empty array
                this.q5Activities = []
                console.warn(`Previous survey (time_visit ${previousTimeVisit}) does not have q9 for stid ${this.visitorData.stid}`)
              }
            } else {
              // ไม่พบ previous survey
              this.q5Activities = []
              console.warn(`Previous survey (time_visit ${previousTimeVisit}) not found for stid ${this.visitorData.stid}`)
            }
          } catch (error) {
            console.error('Failed to load previous survey for q5 activities:', error)
            this.q5Activities = []
          }
        } else {
          this.q5Activities = []
        }
        
      } catch (error) {
        console.error('loadActivities failed:', error)
        this.activities = []
        this.q5Activities = []
        // แสดงข้อความแจ้งเตือนที่เหมาะสม
        if (!this.$store.state.isOnline) {
          this.$toast.warning('ไม่สามารถโหลดข้อมูลกิจกรรมได้ในโหมดออฟไลน์')
        } else {
          this.$toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลกิจกรรม')
        }
      }
    },
    
    async saveProgress() {
      try {
        // ตรวจสอบว่าแบบสอบถามเสร็จแล้วหรือยัง
        const existingSurvey = await this.$indexedDB.getSurveyProgressById(this.surveyId)
        const isCompleted = existingSurvey?.completed || false
        let answersToSave = { ...this.answers }
        if (this.isSyncedSurvey && existingSurvey?.answers) {
          if (existingSurvey.answers.q5 && Object.keys(existingSurvey.answers.q5).length > 0) {
            answersToSave.q5 = { ...existingSurvey.answers.q5, ...this.answers.q5 }
          }
          if (existingSurvey.answers.q9 && Object.keys(existingSurvey.answers.q9).length > 0) {
            answersToSave.q9 = { ...existingSurvey.answers.q9, ...this.answers.q9 }
          }
        }
        
        // ตรวจสอบว่าข้อมูลมีการเปลี่ยนแปลงหรือไม่
        let hasChanges = false
        let wasSynced = existingSurvey?.synced || false
        
        if (existingSurvey && wasSynced) {
          // ตรวจสอบการเปลี่ยนแปลงของ answers
          hasChanges = JSON.stringify(existingSurvey.answers) !== JSON.stringify(answersToSave)
          
          // ตรวจสอบการเปลี่ยนแปลงของรูปภาพ
          if (!hasChanges && this.surveyImages.length > 0) {
            // ตรวจสอบว่ามีรูปใหม่ที่เป็น base64 หรือไม่
            for (let i = 0; i < this.surveyImages.length; i++) {
              const currentImg = this.surveyImages[i]
              const existingImg = existingSurvey.surveyImages?.[i]
              
              if (!currentImg && existingImg) {
                // ลบรูปเดิม
                hasChanges = true
                break
              } else if (currentImg && !existingImg) {
                // เพิ่มรูปใหม่
                hasChanges = true
                break
              } else if (currentImg && existingImg) {
                // ตรวจสอบว่ารูปเปลี่ยนหรือไม่
                const currentBase64 = typeof currentImg === 'object' ? currentImg.base64 : currentImg
                const existingBase64 = typeof existingImg === 'object' ? existingImg.base64 : existingImg
                const currentUrl = typeof currentImg === 'object' ? currentImg.url : null
                const existingUrl = typeof existingImg === 'object' ? existingImg.url : null
                
                if (currentBase64 !== existingBase64 || currentUrl !== existingUrl) {
                  hasChanges = true
                  break
                }
              }
            }
          }
          
          // ตรวจสอบการเปลี่ยนแปลงของ timeEnd
          if (!hasChanges && this.timeEnd !== existingSurvey.timeEnd) {
            hasChanges = true
          }
          
          // ตรวจสอบการเปลี่ยนแปลงของ newAppointment
          if (!hasChanges && JSON.stringify(this.newAppointment) !== JSON.stringify(existingSurvey.newAppointment)) {
            hasChanges = true
          }
        }
        
        // ถ้ามีการเปลี่ยนแปลงและเคย synced แล้ว ให้ set synced = false
        const shouldResetSync = wasSynced && hasChanges && isCompleted
        
        // คำนวณ time_visit (ไม่ใช้ time เป็น fallback)
        let timeVisit
        if (existingSurvey && existingSurvey.time_visit) {
          timeVisit = existingSurvey.time_visit
        } else {
          const completedSurveys = await this.$indexedDB.getCompletedSurveysByStid(this.visitorData.stid)
          timeVisit = completedSurveys.length + 1
        }
        
        // Validation: ตรวจสอบว่า time_visit ถูกต้อง
        if (!timeVisit || timeVisit < 1) {
          console.error(`⚠️ Invalid time_visit calculated: ${timeVisit} for stid: ${this.visitorData.stid}`)
          // Fallback: ใช้ 1 ถ้าไม่สามารถคำนวณได้
          timeVisit = 1
        }
        
        // Warning: ถ้า time_visit ตรงกับ time และ time_visit > 4 อาจเป็นปัญหา
        if (timeVisit === Number(this.visitorData.time) && timeVisit > 4) {
          console.warn(
            `⚠️ Warning: time_visit (${timeVisit}) equals time (${this.visitorData.time}) but time_visit > 4. This may indicate incorrect calculation.`
          )
        }
        
        const progressData = {
          id: this.surveyId,
          stid: this.visitorData.stid,
          time: this.visitorData.time,
          time_visit: timeVisit,
          month_age: this.visitorData.month_age,
          
          // System timestamps (เวลาที่ระบบบันทึกจริง)
          recStart: this.recStart,
          recEnd: this.recEnd,
          
          // User input times (เวลาที่ user กรอกเอง)
          timeStart: this.timeStart,
          timeEnd: this.timeEnd,
          
          appointmentDate: this.visitorData.appointmentDate,
          currentStep: this.currentStep,
          currentActivityIndex: this.currentActivityIndex,
          currentQ5Index: this.currentQ5Index,
          answers: answersToSave,
          note: answersToSave.notes || '',
          newAppointment: this.newAppointment,
          surveyImages: this.surveyImages,
          surveyImageKeys: this.surveyImageKeys,
          q5Activities: this.q5Activities,
          q5Timestamps: this.q5Timestamps,
          q9Timestamps: this.q9Timestamps,
          completed: isCompleted,
          synced: shouldResetSync ? false : (existingSurvey?.synced || false),
          approve_status: existingSurvey?.approve_status || 0
        }
        
  
        await this.$indexedDB.saveSurveyProgress(progressData)
      } catch (error) {
        // จัดการข้อผิดพลาด
      }
    },
    
    // สลับคำตอบแบบหลายตัวเลือก    
    toggleQ3Answer(value) {
      const numValue = Number(value)
      const index = this.answers.q3.indexOf(numValue)
      if (index > -1) {
        this.answers.q3.splice(index, 1)
      } else {
        this.answers.q3.push(numValue)
      }
    },
    
    toggleQ71Answer(value) {
      if (!this.answers.q71) {
        this.$set(this.answers, 'q71', [])
      }
      const numValue = Number(value)
      const index = this.answers.q71.indexOf(numValue)
      if (index > -1) {
        this.answers.q71.splice(index, 1)
      } else {
        this.answers.q71.push(numValue)
      }
    },
    
    // จัดการคำตอบกิจกรรมคำถามที่ 5
    setQ5Answer(activityId, answer) {
      this.$set(this.answers.q5, activityId, answer)
      
      // บันทึก timestamp สำหรับ Q5
      const now = this.generateTimestamp()
      if (!this.q5Timestamps[activityId]) {
        // ครั้งแรก — บันทึกทั้ง first และ last
        this.$set(this.q5Timestamps, activityId, { first: now, last: now })
      } else {
        // ครั้งต่อไป — อัพเดตเฉพาะ last
        this.$set(this.q5Timestamps, activityId, {
          ...this.q5Timestamps[activityId],
          last: now
        })
      }
    },
    
    async nextQ5Activity() {
      // ตรวจสอบคำตอบกิจกรรมปัจจุบัน
      if (!this.answers.q5[this.q5Activities[this.currentQ5Index].no]) {
        this.$toast.warning('กรุณาเลือกคำตอบ')
        return
      }
      
      if (this.currentQ5Index < this.q5Activities.length - 1) {
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
      
      // บันทึก timestamp สำหรับ Q9
      const now = this.generateTimestamp()
      if (!this.q9Timestamps[activityId]) {
        // ครั้งแรก — บันทึกทั้ง first และ last
        this.$set(this.q9Timestamps, activityId, { first: now, last: now })
      } else {
        // ครั้งต่อไป — อัพเดตเฉพาะ last
        this.$set(this.q9Timestamps, activityId, {
          ...this.q9Timestamps[activityId],
          last: now
        })
      }
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
        // แปลงเป็น WebP และปรับขนาด (ใช้ max 1000px สำหรับ survey)
        const webpBase64 = await convertToWebP(file, 1000, 1000, 0.90)
        
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
    },
    
    // Camera modal methods
    openCameraModal(index) {
      this.currentImageIndex = index
      this.capturedImage = null
      this.uploadMode = null
      this.useFileInput = false
      this.videoStream = null
      this.cameraModalVisible = true
    },

    selectUploadMode(mode) {
      this.uploadMode = mode
      
      if (mode === 'camera') {
        // เริ่มเปิดกล้องเมื่อผู้ใช้เลือกถ่ายภาพ
        this.startCamera()
      }
    },

    handleSelectFile() {
      // เปิด file picker เลย
      this.$nextTick(() => {
        if (this.$refs.fileInput) {
          this.$refs.fileInput.click()
        }
      })
    },

    resetUploadMode() {
      this.uploadMode = null
      this.stopCameraStream()
      this.capturedImage = null
    },

    // Method สำหรับปิด camera stream (ใช้ซ้ำได้)
    stopCameraStream() {
      // หยุด video stream ถ้ามี
      if (this.videoStream) {
        try {
          if (this.videoStream.getTracks) {
            this.videoStream.getTracks().forEach(track => {
              track.stop()
              track.enabled = false
            })
          } else if (this.videoStream.stop) {
            this.videoStream.stop()
          }
        } catch (error) {
          console.warn('Error stopping video stream:', error)
        }
        this.videoStream = null
      }
      
      // ล้าง video element
      if (this.videoElement) {
        try {
          if ('srcObject' in this.videoElement) {
            this.videoElement.srcObject = null
          } else if (this.videoElement.src) {
            this.videoElement.src = ''
          }
          this.videoElement.pause()
        } catch (error) {
          console.warn('Error clearing video element:', error)
        }
        this.videoElement = null
      }
      
      // รอสักครู่เพื่อให้ stream ปิดสมบูรณ์ (สำคัญสำหรับ Chrome Android)
      return new Promise(resolve => setTimeout(resolve, 100))
    },

    async startCamera() {
      // ป้องกันการเรียกซ้ำ
      if (this.cameraStarting) {
        return
      }
      
      // ปิด stream เก่าก่อนเปิดใหม่ (ป้องกัน NotReadableError)
      await this.stopCameraStream()
      
      this.cameraStarting = true
      
      // รอให้ modal แสดงก่อน
      await this.$nextTick()
      
      try {
        // ตรวจสอบว่า browser รองรับ getUserMedia หรือไม่
        let stream = null
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // Modern API - ลอง constraints หลายแบบเพื่อความเข้ากันได้
          const constraintsList = [
            // 1. ลอง constraints ที่ต้องการสูงสุดก่อน
            {
              video: {
                facingMode: 'environment',
                width: { ideal: 1920, min: 640 },
                height: { ideal: 1080, min: 480 }
              }
            },
            // 2. ลอง constraints ที่ยืดหยุ่นกว่า
            {
              video: {
                facingMode: 'environment',
                width: { min: 640 },
                height: { min: 480 }
              }
            },
            // 3. ลองแค่ facingMode
            {
              video: {
                facingMode: 'environment'
              }
            },
            // 4. ลองแค่ video: true (fallback สุดท้าย)
            {
              video: true
            }
          ]
          
          // ลอง constraints แต่ละแบบจนกว่าจะสำเร็จ
          let lastError = null
          for (const constraints of constraintsList) {
            try {
              stream = await navigator.mediaDevices.getUserMedia(constraints)
              if (stream) break
            } catch (err) {
              lastError = err
              // ถ้าเป็น NotReadableError หรือ NotAllowedError ให้หยุดทันที
              if (err.name === 'NotReadableError' || err.name === 'NotAllowedError' || 
                  err.name === 'NotFoundError' || err.name === 'PermissionDeniedError') {
                throw err
              }
              // ถ้าเป็น constraint error ให้ลองแบบถัดไป
              continue
            }
          }
          
          if (!stream && lastError) {
            throw lastError
          }
        } else if (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia) {
          // Legacy API (fallback) - ใช้ constraints แบบเก่า
          const getUserMedia = navigator.getUserMedia || 
                              navigator.webkitGetUserMedia || 
                              navigator.mozGetUserMedia || 
                              navigator.msGetUserMedia
          
          stream = await new Promise((resolve, reject) => {
            // Legacy API ใช้ constraints แบบ boolean หรือ object ง่ายๆ
            getUserMedia.call(
              navigator,
              { video: true }, // Legacy API ไม่รองรับ facingMode และ constraints ซับซ้อน
              resolve,
              reject
            )
          })
        } else {
          throw new Error('Browser does not support camera access')
        }
        
        if (!stream) {
          throw new Error('Failed to get camera stream')
        }
        
        this.videoStream = stream
        
        // รอให้ video element พร้อม
        await this.$nextTick()
        
        const videoElement = this.$refs.videoElement
        if (videoElement) {
          // ใช้ srcObject สำหรับ video stream (รองรับทั้ง modern และ legacy browser ที่มี getUserMedia)
          if ('srcObject' in videoElement) {
            videoElement.srcObject = stream
            // เรียก play() เพื่อให้วิดีโอเล่น (สำคัญสำหรับบางเบราว์เซอร์)
            try {
              await videoElement.play()
            } catch (playError) {
              console.warn('Video play() failed:', playError)
              // ไม่ critical - autoplay อาจจะทำงานอยู่แล้ว
            }
          } else {
            // Fallback: สำหรับ browser เก่าที่ไม่มี srcObject (หายากมาก)
            console.warn('srcObject not supported, video may not display')
            // Browser ที่ไม่มี srcObject มักจะไม่มี getUserMedia ด้วย
          }
          this.videoElement = videoElement
        }
        
        this.cameraStarting = false
      } catch (error) {
        this.cameraStarting = false
        // Log error details สำหรับ debug (โดยเฉพาะ Chrome Android)
        console.error('Error accessing camera:', {
          name: error.name,
          message: error.message,
          code: error.code,
          constraint: error.constraint,
          fullError: error
        })
        
        let errorMessage = 'ไม่สามารถเข้าถึงกล้องได้'
        
        // ตรวจสอบ error name และ message (รองรับทั้ง standard และ Chrome Android)
        const errorName = (error.name || '').toLowerCase()
        const errorMsg = (error.message || '').toLowerCase()
        const errorCode = error.code || ''
        
        // ตรวจสอบ NotReadableError (กล้องถูกใช้งาน) - รองรับหลายรูปแบบ
        if (errorName === 'notreadableerror' || 
            errorName === 'trackstarterror' ||
            errorCode === 'NotReadableError' ||
            errorMsg.includes('not readable') ||
            errorMsg.includes('could not start') ||
            errorMsg.includes('device in use') ||
            errorMsg.includes('busy') ||
            errorMsg.includes('already in use') ||
            errorMsg.includes('could not start video source') ||
            errorMsg.includes('failed to start') ||
            errorMsg.includes('cannot start') ||
            errorMsg.includes('unable to start')) {
          // ลองปิด stream อีกครั้งและ retry (อาจมี stream เก่าค้างอยู่)
          await this.stopCameraStream()
          // รอสักครู่แล้วลองอีกครั้ง
          await new Promise(resolve => setTimeout(resolve, 500))
          
          try {
            // ลองเปิดกล้องอีกครั้งด้วย constraints ง่ายๆ
            const retryStream = await navigator.mediaDevices.getUserMedia({ video: true })
            if (retryStream) {
              this.videoStream = retryStream
              await this.$nextTick()
              const videoElement = this.$refs.videoElement
              if (videoElement && 'srcObject' in videoElement) {
                videoElement.srcObject = retryStream
                try {
                  await videoElement.play()
                } catch (playError) {
                  console.warn('Video play() failed on retry:', playError)
                }
                this.videoElement = videoElement
                this.cameraStarting = false
                return // สำเร็จแล้ว ไม่ต้องแสดง error
              }
            }
          } catch (retryError) {
            console.log('Retry failed:', retryError)
            // ถ้า retry ไม่สำเร็จ ให้แสดง error message
          }
          
          errorMessage = 'กล้องถูกใช้งานโดยแอปพลิเคชันอื่น กรุณาปิดแอปอื่นแล้วลองอีกครั้ง'
        } else if (errorName === 'notallowederror' || errorName === 'permissiondeniederror' || 
                   errorCode === 'NotAllowedError' ||
                   errorMsg.includes('permission') || errorMsg.includes('denied')) {
          errorMessage = 'กรุณาอนุญาตให้เข้าถึงกล้องในเบราว์เซอร์'
        } else if (errorName === 'notfounderror' || errorName === 'devicesnotfounderror' ||
                   errorCode === 'NotFoundError' ||
                   errorMsg.includes('not found') || errorMsg.includes('no device')) {
          errorMessage = 'ไม่พบกล้องในอุปกรณ์'
        } else if (errorName === 'notsupportederror' || errorName === 'constraintnotsatisfiederror' || 
                   errorName === 'overconstrainederror' ||
                   errorCode === 'NotSupportedError' ||
                   errorMsg.includes('not supported') || errorMsg.includes('constraint')) {
          errorMessage = 'เบราว์เซอร์ไม่รองรับการเข้าถึงกล้องหรือ constraints ที่กำหนด'
        } else if (errorName === 'aborterror' || errorCode === 'AbortError' || errorMsg.includes('abort')) {
          errorMessage = 'การเข้าถึงกล้องถูกยกเลิก'
        } else if (errorName === 'securityerror' || errorCode === 'SecurityError' ||
                   errorMsg.includes('security') || errorMsg.includes('https') || 
                   errorMsg.includes('secure context')) {
          errorMessage = 'ไม่สามารถเข้าถึงกล้องได้เนื่องจากปัญหาด้านความปลอดภัย (ต้องใช้ HTTPS)'
        } else if (errorMsg.includes('not support') || errorMsg.includes('not available')) {
          errorMessage = 'เบราว์เซอร์ไม่รองรับการเข้าถึงกล้อง'
        }
        
        // ถ้า browser ไม่รองรับ ให้ใช้ file input fallback
        if (error.message && error.message.includes('not support')) {
          this.useFileInput = true
          this.$toast.warning('เบราว์เซอร์ไม่รองรับการเข้าถึงกล้อง ใช้การอัพโหลดไฟล์แทน')
          // เปิด file picker เลย
          this.$nextTick(() => {
            if (this.$refs.fileInput) {
              this.$refs.fileInput.click()
            }
          })
        } else {
          this.$toast.error(errorMessage)
          // กลับไปหน้าเลือก
          this.resetUploadMode()
        }
      }
    },
    
    closeCameraModal() {
      // หยุด video stream
      if (this.videoStream) {
        if (this.videoStream.getTracks) {
          this.videoStream.getTracks().forEach(track => track.stop())
        } else if (this.videoStream.stop) {
          // Legacy API
          this.videoStream.stop()
        }
        this.videoStream = null
      }
      
      if (this.videoElement) {
        if ('srcObject' in this.videoElement) {
          this.videoElement.srcObject = null
        } else if (this.videoElement.src) {
          // Legacy: clear src
          this.videoElement.src = ''
        }
        this.videoElement = null
      }
      
      this.capturedImage = null
      this.uploadMode = null
      this.useFileInput = false
      this.cameraModalVisible = false
    },
    
    // Handle file input fallback
    async handleFileInput(event) {
      const file = event.target.files?.[0]
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
        const webpBase64 = await convertToWebP(file, 1000, 1000, 0.90)
        
        // บันทึกรูปภาพ
        const index = this.currentImageIndex
        this.$set(this.surveyImages, index, {
          base64: webpBase64,
          url: null,
          key: `pic${index + 1}`
        })
        
        // บันทึกลง IndexedDB
        await this.saveImageToIndexedDB(webpBase64, index)
        
        this.$toast.success(`อัพโหลดรูปภาพที่ ${index + 1} สำเร็จ`)
        
        // Reset และปิด modal
        this.resetUploadMode()
        this.closeCameraModal()
      } catch (error) {
        console.error('Error processing file:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ')
      } finally {
        this.processing = false
        // Reset file input
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = ''
        }
      }
    },
    
    capturePhoto() {
      const videoElement = this.$refs.videoElement
      if (!videoElement || !videoElement.videoWidth) return
      
      try {
        // สร้าง canvas เพื่อจับภาพจาก video
        const canvas = document.createElement('canvas')
        const video = videoElement
        
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // แปลงเป็น base64
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        this.capturedImage = imageData
      } catch (error) {
        console.error('Error capturing photo:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการถ่ายภาพ')
      }
    },
    
    retakePhoto() {
      this.capturedImage = null
    },
    
    async usePhoto() {
      if (!this.capturedImage) return
      
      this.processing = true
      
      try {
        // แปลง base64 เป็น Blob
        const response = await fetch(this.capturedImage)
        const blob = await response.blob()
        
        // สร้าง File object จาก Blob
        const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' })
        
        // ใช้ convertToWebP เพื่อแปลงเป็น WebP และปรับขนาด
        const webpBase64 = await convertToWebP(file, 1000, 1000, 0.90)
        
        // บันทึกรูปภาพ
        const index = this.currentImageIndex
        this.$set(this.surveyImages, index, {
          base64: webpBase64,
          url: null,
          key: `pic${index + 1}`
        })
        
        // บันทึกลง IndexedDB
        await this.saveImageToIndexedDB(webpBase64, index)
        
        this.$toast.success(`บันทึกรูปภาพที่ ${index + 1} สำเร็จ`)
        
        // Reset และปิด modal
        this.resetUploadMode()
        this.closeCameraModal()
      } catch (error) {
        console.error('Error processing photo:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ')
      } finally {
        this.processing = false
      }
    },
    
    // Image sub-step navigation
    async nextImageSubStep() {
      // Validate current image
      if (this.currentImageSubStep === 1 && !this.displayImage1) {
        this.$toast.warning('กรุณาอัพโหลดรูปภาพที่ 1')
        return
      }
      
      this.currentImageSubStep = 2
      await this.saveProgress()
    },
    
    async prevImageSubStep() {
      this.currentImageSubStep = 1
      await this.saveProgress()
    },
    
    // การนำทาง
    async nextStep() {
      // ตรวจสอบความถูกต้อง
      if (!this.validateCurrentStep()) {
        return
      }
      // บันทึก timeEnd และ recEnd เมื่อออกจาก Step 10 (บันทึกผู้เยี่ยมบ้าน)
      if (this.currentStep === 10) {
        const now = new Date()
        const urlParams = this.$route.query
        if (
          (urlParams.mode === 'edit') ||
          !this.timeEnd
        ) {
          this.timeEnd = `${this.answers.endHour}:${this.answers.endMinute} น.`
        }
        
        
        // timeEnd: เวลาที่ user กรอก (จาก endHour และ endMinute) - Format: "HH:MM น."
        // if (!this.timeEnd) {
        //   this.timeEnd = `${this.answers.endHour}:${this.answers.endMinute} น.`
        // }
        
        // recEnd: เวลาที่ระบบบันทึกจริง (อัปเดตทุกครั้งที่มีการบันทึก)
        this.recEnd = toMySQLDateTime(now)
        
        // บันทึกลง IndexedDB ทันที
        await this.saveProgress()
      }

      
      
      // Skip logic: จาก step 1 ถ้า q1 === 3 แสดงแจ้งเตือนและลบ survey
      if (this.currentStep === 1 && this.skippedFromQ1) {
        // แสดงแจ้งเตือน
        await this.$swal.fire({
          title: 'แจ้งเตือน',
          text: 'กรุณานัดหมายใหม่อีกรอบ',
          icon: 'warning',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#3551a4',
          allowOutsideClick: false,
          allowEscapeKey: false
        })
        
        // ลบ survey จาก IndexedDB ถ้ามี
        if (this.surveyId && this.$indexedDB) {
          try {
            await this.$indexedDB.deleteSurveyProgress(this.surveyId)
          } catch (error) {
            console.error('Error deleting survey:', error)
          }
        }
        
        // ลบข้อมูล localStorage
        localStorage.removeItem('surveyPatient')
        localStorage.removeItem('surveyEdit')
        
        // เด้งกลับหน้าแรกพร้อมเปิด modal นัดหมาย
        this.$router.push({ path: '/', query: { openBooking: this.visitorData.stid } })
        return
      }
      
      this.currentStep++
      
      // บันทึกความคืบหน้าแบบ debounce (ไม่ block UI)
      // ข้าม debounce save หลังจาก Step 10 เพราะ save แล้วตอนเซ็ต timestamps
      const skipDebounceSave = this.currentStep === 11 // เพิ่งออกจาก Step 10
      if (this.saveProgressDebounced && !skipDebounceSave) {
        this.saveProgressDebounced()
      }
      
      const timeVisit = Number(this.visitorData?.time_visit || //this.visitorData.time dusable fallback ก่อนว่าจำเป็นต้องใช้ไหม
      1)
      
      if (this.currentStep === 3 && this.visitorData && timeVisit === 1) {
        this.answers.q3 = []
        this.answers.q3_des = ''
        this.answers.q4 = null
        this.answers.q5 = {}
        this.currentStep = 6
      }
      
      // ข้าม step 5 ถ้า time != 1 แต่ q2 === 3
      if (this.currentStep === 5 && (!this.shouldShowStep5 || this.skippedFromQ2)) {
        // เมื่อข้าม step 5 ให้เก็บ activity IDs ไว้ใน q5 แม้ว่าจะไม่มีคำตอบ
        // เพื่อใช้ในการสร้างนัดหมายครั้งถัดไป
        // ถ้า q2=3 ให้เก็บ q5 ครบทุก activity เหมือน q2=1 แต่ค่าเป็น null
        if (this.skippedFromQ2 && this.q5Activities && this.q5Activities.length > 0) {
          const q5WithIds = {}
          // เก็บครบทุก activity ใน q5Activities (เหมือน q2=1)
          this.q5Activities.forEach(activity => {
            if (activity && activity.no) {
              q5WithIds[activity.no] = null // ใช้ null เพื่อบ่งชี้ว่าไม่ได้ตอบ (q2=3)
            }
          })
          this.answers.q5 = q5WithIds
        } else if (this.skippedFromQ2) {
          // ถ้ายังไม่มี q5Activities ให้เป็น empty object
          this.answers.q5 = {}
        }
        // บันทึกความคืบหน้าเพื่อให้ q5 ถูกบันทึก
        await this.saveProgress()
        this.currentStep++
      }
      
      // ข้าม step 9 ถ้า q2 === 3
      if (this.currentStep === 9 && this.skippedFromQ2) {
        // เมื่อข้าม step 9 ให้เก็บ activity IDs ไว้ใน q9 แม้ว่าจะไม่มีคำตอบ
        // เพื่อใช้ในการสร้างนัดหมายครั้งถัดไป
        // ถ้า q2=3 ให้เก็บ q9 ครบทุก activity เหมือน q2=1 แต่ค่าเป็น null
        if (this.activities && this.activities.length > 0) {
          const q9WithIds = {}
          // เก็บครบทุก activity ใน activities (เหมือน q2=1)
          this.activities.forEach(activity => {
            if (activity && activity.no) {
              q9WithIds[activity.no] = null // ใช้ null เพื่อบ่งชี้ว่าไม่ได้ตอบ (q2=3)
            }
          })
          this.answers.q9 = q9WithIds
          
          // อัพเดท q5Activities เพื่อใช้ในครั้งถัดไป (แม้ว่าจะ skip)
          // q5Activities ควรถูกโหลดมาจาก previous survey แล้ว (จาก loadActivities)
          // แต่ต้องอัพเดทเป็น activities ปัจจุบันเสมอเมื่อจบ step 9 (เหมือน q2=1)
          this.q5Activities = [...this.activities]
        } else {
          // ถ้ายังไม่มี activities ให้เป็น empty object
          this.answers.q9 = {}
        }
        // บันทึกความคืบหน้าเพื่อให้ q9 และ q5Activities ถูกบันทึก
        await this.saveProgress()
        this.currentStep++
      }
      
      // ข้าม step 11 (อัพโหลดรูป) ถ้า q1 === 3 เท่านั้น
      if (this.currentStep === 11 && this.skippedFromQ1) {
        // ล้างรูปภาพเมื่อข้าม step 11
        this.surveyImages = []
        this.surveyImageKeys = []
        this.currentStep++
      }
      
      // Reset image sub-step when entering step 11
      if (this.currentStep === 11) {
        this.currentImageSubStep = 1
      }
      
      this.currentActivityIndex = 0
      this.currentQ5Index = 0
      await this.saveProgress()
    },
    
    async prevStep() {
      if (this.currentStep > 1) {
        // Special handling for Step 11: If on sub-step 2, go back to sub-step 1 first
        if (this.currentStep === 11 && this.currentImageSubStep === 2) {
          await this.prevImageSubStep()
          return
        }
        
        // Skip logic: ถ้าอยู่ที่ step 10 และ skip จาก Q1 ให้กลับไป step 1
        if (this.currentStep === 10 && this.skippedFromQ1) {
          this.currentStep = 1
          await this.saveProgress()
          return
        }
        
        const timeVisit = Number(this.visitorData?.time_visit || //this.visitorData.time dusable fallback ก่อนว่าจำเป็นต้องใช้ไหม
        1)
        if (this.currentStep === 6 && this.visitorData && timeVisit === 1) {
          this.currentStep = 2
          await this.saveProgress()
          return
        }
        
        // จัดการพิเศษเมื่อย้อนกลับจากขั้นตอนที่ 5 ไป 4
        if (this.currentStep === 5 && this.q5Activities.length > 0) {
          this.currentQ5Index = this.q5Activities.length - 1
        }
        
        // จัดการพิเศษเมื่อย้อนกลับจากขั้นตอนที่ 10 ไป 9
        if (this.currentStep === 10 && this.activities.length > 0) {
          this.currentActivityIndex = this.activities.length - 1
        }
        
        this.currentStep--
        
        // ข้าม step 11 (อัพโหลดรูป) ถ้า q1 === 3 เท่านั้น (เมื่อย้อนกลับจาก step 12)
        if (this.currentStep === 11 && this.skippedFromQ1) {
          this.currentStep--
        }
        
        // Set image sub-step to 2 when going back to step 11 from step 12
        if (this.currentStep === 11) {
          this.currentImageSubStep = 2
        }
        
        // ข้าม step 9 ถ้า q2 === 3 (เมื่อย้อนกลับจาก step 10)
        if (this.currentStep === 9 && this.skippedFromQ2) {
          this.currentStep--
        }
        
        // ข้าม step 5 ถ้า time != 1 แต่ q2 === 3 (เมื่อย้อนกลับจาก step 6)
        if (this.currentStep === 5 && (!this.shouldShowStep5 || this.skippedFromQ2)) {
          this.currentStep--
        }
        
        // บันทึกความคืบหน้าแบบ debounce (ไม่ block UI)
        if (this.saveProgressDebounced) {
          this.saveProgressDebounced()
        }
      }
    },
    
    validateCurrentStep() {
      const result = validateSurveyStep(
        this.currentStep,
        this.answers,
        { image1: this.displayImage1, image2: this.displayImage2 },
        this.currentImageSubStep
      )
      
      if (!result.valid) {
        this.$toast.warning(result.error)
        return false
      }
      
      // Additional validation for step 12
      if (this.currentStep === 12 && !this.shouldDisableStep12) {
        if (!this.newAppointment.appointmentDay || !this.newAppointment.appointmentMonth || 
            !this.newAppointment.appointmentYear || !this.newAppointment.appointmentTime) {
          this.$toast.warning('กรุณากรอกข้อมูลนัดหมายให้ครบถ้วน')
          return false
        }
        
        // ตรวจสอบว่าวันนัดใหม่ห่างจากวันนัดปัจจุบันอย่างน้อย 5 วัน
        if (this.visitorData && this.visitorData.appointmentDate) {
          const currentDate = new Date(this.visitorData.appointmentDate)
          const christianYear = this.newAppointment.appointmentYear - 543
          const newDate = new Date(christianYear, this.newAppointment.appointmentMonth - 1, this.newAppointment.appointmentDay)
          const diffDays = Math.floor((newDate - currentDate) / (1000 * 60 * 60 * 24))
          if (Math.abs(diffDays) < 5) {
            this.$toast.warning(`วันนัดหมายครั้งถัดไปต้องห่างจากวันนัดปัจจุบันอย่างน้อย 5 วัน (ห่าง ${Math.abs(diffDays)} วัน)`)
            return false
          }
        }
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
        
        if (!this.newAppointment.appointmentTime) {
          this.$toast.warning('กรุณาบันทึก เวลา นัดหมายการเยี่ยมบ้านครั้งถัดไป')
          return false
        }
        // ตรวจสอบว่าเป็นการแก้ไขแบบสอบถามที่เสร็จแล้วหรือไม่
        const existingSurvey = await this.$indexedDB.getSurveyProgressById(this.surveyId)
        const wasCompleted = existingSurvey?.completed || false
        
        // อัปเดต recEnd = เวลาที่ระบบบันทึกจริง (system timestamp) - อัปเดตเสมอ
        this.recEnd = toMySQLDateTime()
        
        // ตั้งค่า timeEnd = เวลาที่ user กรอกเอง (user input time) - Format: "HH:MM น."
        if (!this.timeEnd) {
          this.timeEnd = `${this.answers.endHour}:${this.answers.endMinute} น.`
        }
        if (wasCompleted) {
          // แก้ไขแบบสอบถามที่เสร็จแล้ว
          await this.saveProgress()
          
          // อัพเดท approve_status ถ้าเป็นการแก้ไขจากการขอแก้ไขของ Supervisor
          await this.updateApproveStatusAfterEdit()
          
          // เช็คและอัพเดท booking ครั้งถัดไปถ้ามีการเปลี่ยนแปลงวันนัดใน step12
          const bookingUpdated = await this.updateNextBookingIfChanged()
          if (bookingUpdated) {
            this.$toast.success('บันทึกการแก้ไขสำเร็จ และอัพเดทนัดหมายครั้งถัดไป')
          } else {
            this.$toast.success('บันทึกการแก้ไขสำเร็จ')
          }
          
          // Survey จะถูก sync อัตโนมัติผ่าน pushSurveyResultsToAPI()
        } else {
          await this.$indexedDB.markSurveyCompleted(this.surveyId, this.timeEnd, this.recEnd)
          try {
            await this.createNewAppointment()
            this.$toast.success('บันทึกแบบสอบถามสำเร็จ รอการซิงค์ขึ้นเซิร์ฟเวอร์')
          } catch (appointmentError) {
            this.appointmentCreationFailed = true
            this.$toast.warning('บันทึกแบบทดสอบสำเร็จ แต่การสร้างนัดหมายล้มเหลว')
          }
          // Survey จะถูก sync อัตโนมัติผ่าน pushSurveyResultsToAPI()
        }
        if (this.appointmentCreationFailed) {
          this.processing = false
          return
        }
        localStorage.removeItem('surveyPatient')
        setTimeout(() => {
          this.$router.push('/')
        }, 1500)
      } catch (error) {
        this.$toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
        this.processing = false
      }
    },
    
    async submitSurveyWithoutAppointment() {
      // บันทึก survey โดยไม่สร้างนัดหมายใหม่
      // ใช้เมื่อแก้ไข completed survey ที่มี survey ถัดไปอยู่แล้ว
      try {
        this.processing = true
        
        if (!this.newAppointment.appointmentTime) {
          this.$toast.warning('กรุณาบันทึก เวลา นัดหมายการเยี่ยมบ้านครั้งถัดไป')
          return false
        }
        // อัปเดต recEnd
        this.recEnd = toMySQLDateTime()
        
        // ตั้งค่า timeEnd ถ้ายังไม่มี - Format: "HH:MM น."
        if (!this.timeEnd) {
          this.timeEnd = `${this.answers.endHour}:${this.answers.endMinute} น.`
        }
        
        // บันทึกความคืบหน้า
        await this.saveProgress()
        
        // อัพเดท approve_status ถ้าเป็นการแก้ไขจากการขอแก้ไขของ Supervisor
        await this.updateApproveStatusAfterEdit()
        
        // เช็คและอัพเดท booking ครั้งถัดไปถ้ามีการเปลี่ยนแปลงวันนัดใน step12
        const bookingUpdated = await this.updateNextBookingIfChanged()
        if (bookingUpdated) {
          this.$toast.success('บันทึกการแก้ไขสำเร็จ และอัพเดทนัดหมายครั้งถัดไป')
        } else {
          this.$toast.success('บันทึกการแก้ไขสำเร็จ')
        }
        
        // กลับไปหน้าแรก
        localStorage.removeItem('surveyPatient')
        setTimeout(() => {
          this.$router.push('/')
        }, 1500)
      } catch (error) {
        this.$toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
        this.processing = false
      }
    },
    
    async createNewAppointment() {
      try {
        // แปลงปีพุทธศักราชเป็นคริสต์ศักราช
        const christianYear = this.newAppointment.appointmentYear - 543
        const appointmentDate = `${christianYear}-${String(this.newAppointment.appointmentMonth).padStart(2, '0')}-${String(this.newAppointment.appointmentDay).padStart(2, '0')}`
        const appointmentTime = this.newAppointment.appointmentTime
        
        // ใช้อายุเดือนและครั้งที่เยี่ยมที่คำนวณไว้แล้วจาก recalculateMonthAgeAndActivities()
        const newMonthAge = this.newAppointment.appointmentMonthAge || this.newAppointment.monthAge
        const newTimeActivity = this.newAppointment.timeActivity
        
        if (!newMonthAge || !newTimeActivity) {
          throw new Error('ไม่สามารถคำนวณอายุเดือนและครั้งที่เยี่ยมได้ กรุณาตรวจสอบข้อมูล')
        }
        
        const completedSurveys = await this.$indexedDB.getCompletedSurveysByStid(this.visitorData.stid)
        const newTimeVisit = completedSurveys.length + 1
        
        // ใช้วันที่ทำ survey จริงจากระบบ (recStart) ไม่ใช่วันที่ user กรอก
        let visitDate
        if (this.recStart) {
          // ใช้ recStart (เวลาที่ระบบบันทึกเริ่มทำ survey)
          visitDate = this.recStart.split(' ')[0] // เอาเฉพาะวันที่
        } else if (this.recEnd) {
          // fallback: ใช้ recEnd
          visitDate = this.recEnd.split(' ')[0]
        } else {
          // fallback สุดท้าย: ใช้วันที่ปัจจุบัน
          visitDate = new Date().toISOString().split('T')[0]
        }
        
        const bookingData = {
          stid: this.visitorData.stid,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          month_age: newMonthAge,
          time: newTimeActivity,
          time_visit: newTimeVisit,
          last_visit_date: visitDate, // ใช้วันที่ทำ survey จริง (สำคัญสำหรับการคำนวณครั้งถัดไป)
          dataSource: 'local',
          lastSyncedAt: new Date().toISOString()
        }
        
        // บันทึกนัดหมายใหม่
        await this.$indexedDB.addBooking(bookingData)
      } catch (error) {
        throw error
      }
    },
    
    async updateNextBookingIfChanged() {
      // เช็คและอัพเดท booking ครั้งถัดไปถ้ามีการเปลี่ยนแปลงวันนัดใน step12
      try {
        // คำนวณ time_visit ถัดไป (survey ปัจจุบัน + 1)
        const currentTimeVisit = this.visitorData.time_visit || this.visitorData.time
        const nextTimeVisit = Number(currentTimeVisit) + 1
        
        
        // ดึง booking ล่าสุด
        const existingBooking = await this.$indexedDB.getBooking(this.visitorData.stid)
        
        if (!existingBooking) {
          return false
        }

        
        // เช็คว่า booking ที่มีอยู่ตรงกับ time_visit ถัดไปหรือไม่
        if (existingBooking.time_visit !== nextTimeVisit) {
        
          return false
        }
        
        // แปลง newAppointment เป็นรูปแบบที่เปรียบเทียบได้
        const christianYear = this.newAppointment.appointmentYear - 543
        const newAppointmentDate = `${christianYear}-${String(this.newAppointment.appointmentMonth).padStart(2, '0')}-${String(this.newAppointment.appointmentDay).padStart(2, '0')}`
        const newAppointmentTime = this.newAppointment.appointmentTime
        const newMonthAge = this.newAppointment.appointmentMonthAge || this.newAppointment.monthAge
        const newTimeActivity = this.newAppointment.timeActivity
        
        // เช็คว่ามีการเปลี่ยนแปลงหรือไม่
        const hasChanges = (
          existingBooking.appointmentDate !== newAppointmentDate ||
          existingBooking.appointmentTime !== newAppointmentTime ||
          existingBooking.month_age !== newMonthAge ||
          existingBooking.time !== newTimeActivity
        )
        
        if (!hasChanges) {
          return false
        }
    
        // อัพเดท booking
        const updatedBookingData = {
          ...existingBooking,
          appointmentDate: newAppointmentDate,
          appointmentTime: newAppointmentTime,
          month_age: newMonthAge,
          time: newTimeActivity,
          dataSource: 'local',
          lastSyncedAt: new Date().toISOString()
        }
        
        await this.$indexedDB.addBooking(updatedBookingData)
        return true
      } catch (error) {
        return false
      }
    },
    
    /**
     * อัพเดท approve_status เป็น -2 เมื่อ Home Visitor แก้ไขผลเยี่ยมบ้านที่ถูกขอให้แก้ไข (approve_status = -1) จนเสร็จ
     */
    async updateApproveStatusAfterEdit() {
      try {
        // ตรวจสอบว่า survey ที่แก้ไขมี approve_status = -1 (ถูกขอให้แก้ไข) หรือไม่
        const currentSurvey = await this.$indexedDB.getSurveyProgressById(this.surveyId)
        
        if (currentSurvey && currentSurvey.approve_status === -1) {
          // อัพเดท approve_status เป็น -2 (แก้ไขแล้ว รอตรวจสอบใหม่)
          currentSurvey.approve_status = -2
          await this.$indexedDB.saveSurveyProgress(currentSurvey)
          
          // Sync ไปที่ API (PUT homevisitor_app)
          await this.syncApproveStatusToAPI(currentSurvey)
          
          return true
        }
        return false
      } catch (error) {
        console.error('Failed to update approve_status after edit:', error)
        return false
      }
    },
    
    /**
     * Sync approve_status ไปที่ API
     */
    async syncApproveStatusToAPI(survey) {
      try {
        await this.$axios.$put('/api/parenting2025_census/put/homevisit/putdata.php', {
          variable: ['approve_status'],
          value: [String(survey.approve_status)],
          pk: ['stid', 'time_visit'],
          pkval: [survey.stid, String(survey.time_visit)],
          tb: 'homevisitor_app'
        })
      } catch (error) {
        console.error('Failed to sync approve_status to API:', error)
        // ไม่ throw error เพราะจะ sync อีกครั้งตอน manual sync
      }
    },
    
    async retryCreateAppointment() {
      try {
        this.processing = true
        await this.createNewAppointment()
        this.appointmentCreationFailed = false
        this.$toast.success('สร้างนัดหมายสำเร็จ')
        
        // ลบข้อมูล localStorage
        localStorage.removeItem('surveyPatient')
        setTimeout(() => {
          this.$router.push('/')
        }, 1500)
      } catch (error) {
        this.$toast.error('ไม่สามารถสร้างนัดหมายได้ กรุณาลองอีกครั้ง')
        this.processing = false
      }
    },
    
    skipAndReturn() {
      localStorage.removeItem('surveyPatient')
      this.$router.push('/')
    },
    
    // ฟังก์ชันช่วยเหลือด้านวันที่
    async initDateOptions() {
      const now = new Date()
      const currentYear = now.getFullYear() + 543
      
      for (let i = currentYear; i <= currentYear + 2; i++) {
        this.yearOptions.push({ value: i, text: i.toString() })
      }
      const hasExistingAppointment = this.newAppointment.appointmentDay && 
                                     this.newAppointment.appointmentMonth && 
                                     this.newAppointment.appointmentYear
      
      if (!hasExistingAppointment) {
        // ลองใช้ q10_appDate จาก answers ก่อน (กรณีแก้ไข survey ที่ sync จาก API ซึ่ง newAppointment เป็น null)
        if (this.answers.q10_appDate) {
          const q10Date = new Date(this.answers.q10_appDate)
          if (!isNaN(q10Date.getTime())) {
            this.newAppointment.appointmentDay = q10Date.getDate()
            this.newAppointment.appointmentMonth = q10Date.getMonth() + 1
            this.newAppointment.appointmentYear = q10Date.getFullYear() + 543
            // ลบ Default ออก 6.4.2026
            // this.newAppointment.appointmentTime = this.answers.q10_appTime || this.visitorData.appointmentTime || '16:30 น.'
            this.newAppointment.appointmentTime = this.answers.q10_appTime || ''
            await this.recalculateMonthAgeAndActivities()
            return
          }
        }

        // ใช้ appointmentDate (วันนัดหมายปัจจุบัน) + 7 วัน สำหรับคำนวณวันนัดครั้งถัดไป
        let baseDate
        if (this.visitorData.appointmentDate) {
          // ใช้วันนัดหมายปัจจุบัน
          baseDate = new Date(this.visitorData.appointmentDate)
        } else if (this.recStart) {
          // fallback: ใช้ recStart ถ้าไม่มี appointmentDate
          baseDate = new Date(this.recStart)
        } else {
          // fallback สุดท้าย: ใช้วันปัจจุบัน
          baseDate = new Date()
        }
        
        const nextVisit = new Date(baseDate)
        nextVisit.setDate(nextVisit.getDate() + 7)
        
        this.newAppointment.appointmentDay = nextVisit.getDate()
        this.newAppointment.appointmentMonth = nextVisit.getMonth() + 1
        this.newAppointment.appointmentYear = nextVisit.getFullYear() + 543
        
        // ใช้เวลาจาก appointmentTime หรือค่า default
        // if (this.visitorData.appointmentTime) {
        //   this.newAppointment.appointmentTime = this.visitorData.appointmentTime
        // } else {
        //   // ลบ default 6.4.2026
        //   this.newAppointment.appointmentTime = null
        // }
      }
      await this.recalculateMonthAgeAndActivities()
    },
    
    
    async onMonthChange() {
      if (this.newAppointment.appointmentDay && this.newAppointment.appointmentYear) {
        const daysInMonth = getDaysInMonth(this.newAppointment.appointmentMonth, this.newAppointment.appointmentYear)
        
        if (this.newAppointment.appointmentDay > daysInMonth) {
          this.newAppointment.appointmentDay = daysInMonth
        }
      }
      
      // คำนวณอายุเดือนและกิจกรรมใหม่
      await this.recalculateMonthAgeAndActivities()
      
      // อัพเดท booking ถ้ามี (กรณีแก้ไข completed survey)
      await this.updateNextBookingIfChanged()
      
      // บันทึกความคืบหน้า
      if (this.saveProgressDebounced) {
        this.saveProgressDebounced()
      }
    },
    
    async onYearChange() {
      if (this.newAppointment.appointmentDay && this.newAppointment.appointmentMonth === 2) {
        const daysInMonth = getDaysInMonth(2, this.newAppointment.appointmentYear)
        
        if (this.newAppointment.appointmentDay > daysInMonth) {
          this.newAppointment.appointmentDay = daysInMonth
        }
      }
      
      // คำนวณอายุเดือนและกิจกรรมใหม่
      await this.recalculateMonthAgeAndActivities()
      
      // อัพเดท booking ถ้ามี (กรณีแก้ไข completed survey)
      await this.updateNextBookingIfChanged()
      
      // บันทึกความคืบหน้า
      if (this.saveProgressDebounced) {
        this.saveProgressDebounced()
      }
    },
    
    async onDayChange() {
      await this.recalculateMonthAgeAndActivities()
      
      // อัพเดท booking ถ้ามี (กรณีแก้ไข completed survey)
      await this.updateNextBookingIfChanged()
      
      // บันทึกความคืบหน้า
      if (this.saveProgressDebounced) {
        this.saveProgressDebounced()
      }
    },
    
    async onTimeChange() {
      // อัพเดท booking ถ้ามี (กรณีแก้ไข completed survey)
      await this.updateNextBookingIfChanged()
      
      // บันทึกความคืบหน้าเมื่อเปลี่ยนเวลา
      if (this.saveProgressDebounced) {
        this.saveProgressDebounced()
      }
    },
    
    async recalculateMonthAgeAndActivities() {

      if (!this.visitorData || !this.newAppointment.appointmentMonth || !this.newAppointment.appointmentYear || !this.newAppointment.appointmentDay) {
        return
      }
      
      try {
        // ดึงข้อมูล visitor เพื่อหาวันเกิด
        const visitor = await this.$indexedDB.getVisitor(this.visitorData.stid)
        
        if (!visitor || !visitor.month_birth || !visitor.year_birth) {
          return
        }
        
        // Create selected date for next appointment
        const selectedYear = this.newAppointment.appointmentYear - 543
        const selectedMonth = this.newAppointment.appointmentMonth
        const selectedDay = this.newAppointment.appointmentDay
        const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay)
        
        
        // 🔄 ใน step 12 ของ survey.vue: เราคำนวณนัดครั้งถัดไป
        // โดยใช้ survey ปัจจุบัน (visitorData) เป็น existingBooking
        // เพราะ survey นี้คือครั้งล่าสุดที่เพิ่งทำเสร็จ/กำลังทำอยู่
        
        // แปลง appointmentDate เป็น Date object
        let appointmentDateObj = this.visitorData.appointmentDate
        if (!appointmentDateObj) {
          // ถ้าไม่มี appointmentDate ใช้ recStart แทน
          appointmentDateObj = this.recStart ? new Date(this.recStart.split(' ')[0]) : new Date()
        } else if (typeof appointmentDateObj === 'string') {
          appointmentDateObj = new Date(appointmentDateObj)
        }
        
        const existingBooking = {
          appointmentDate: appointmentDateObj,
          month_age: Number(this.visitorData.month_age),
          time: Number(this.visitorData.time)
        }
        
     
        
        // คำนวณวันห่างจากนัดครั้งปัจจุบัน
        const daysSince = Math.floor((selectedDate - existingBooking.appointmentDate) / (1000 * 60 * 60 * 24))
        
        // Calculate using helper function
        const { monthAge, timeActivity } = calculateMonthAgeAndTime(
          parseInt(visitor.month_birth),
          parseInt(visitor.year_birth),
          parseInt(visitor.day_birth) || 1,
          selectedDate,
          existingBooking
        )
        
        // อัพเดทค่าที่คำนวณได้
        this.newAppointment.appointmentMonthAge = monthAge
        this.newAppointment.monthAge = monthAge
        this.newAppointment.timeActivity = timeActivity
 
        // ดึงกิจกรรมใหม่
        const activities = await this.$indexedDB.getActivityByMonthAgeAndTime(
          monthAge,
          timeActivity
        )
        this.newAppointment.activities = activities || []
        
      } catch (error) {
        console.error('ERROR in recalculateMonthAgeAndActivities:', error)
      }
    },
    
    getMonthName(monthValue) {
      const month = this.monthOptions.find(m => m.value === monthValue)
      return month ? month.text : ''
    },
    
    /**
     * สร้าง timestamp ปัจจุบันในรูปแบบ "YYYY-MM-DD HH:mm:ss"
     * ใช้สำหรับบันทึกเวลาที่ user ตอบ Q5/Q9 activities
     * @returns {string} Timestamp string
     */
    generateTimestamp() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    
    /**
     * Test function to verify time_visit and time recording
     * This can be called from browser console: this.testTimeVisitRecording('TEST_STID_001')
     * @param {string} stid - Visitor stid to test with (default: current visitor's stid)
     */
    async testTimeVisitRecording(stid = null) {
      const testStid = stid || this.visitorData?.stid || 'TEST_STID_001'
      
      if (!this.$indexedDB) {
        this.$toast.error('IndexedDB is not available')
        console.error('❌ IndexedDB is not available')
        return
      }
      
      console.log('🧪 Starting test: Survey Time Visit Recording')
      console.log(`📋 Using stid: ${testStid}`)
      console.log('')
      
      try {
        const results = await testSurveyTimeVisitRecording(testStid, this.$indexedDB)
        this.$toast.success(`Test completed! Check console for results.`)
        return results
      } catch (error) {
        console.error('❌ Test failed:', error)
        this.$toast.error('Test failed. Check console for details.')
        throw error
      }
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
  /* display: flex; */
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

.options-container.three-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.appointment-field:has(select:disabled) .appointment-label {
  opacity: 0.6;
  color: #6c757d;
}

.appointment-field:has(select:disabled) .appointment-label i {
  color: #6c757d;
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

.appointment-select:hover:not(:disabled) {
  border-color: #3551a4;
  box-shadow: 0 2px 8px rgba(53, 81, 164, 0.1);
}

.appointment-select:focus:not(:disabled) {
  border-color: #3551a4;
  outline: none;
  box-shadow: 0 0 0 0.3rem rgba(53, 81, 164, 0.2);
  transform: translateY(-2px);
}

.appointment-select:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
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

/* Appointment Locked Banner */
.appointment-locked-banner {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border: 3px solid #ffc107;
  padding: 2rem;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  animation: slideIn 0.5s ease;
}

.lock-icon {
  flex-shrink: 0;
}

.lock-icon i {
  font-size: 3rem;
  color: #ffc107;
}

.lock-content {
  flex: 1;
}

.lock-content h5 {
  color: #856404;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.lock-content p {
  color: #856404;
  font-size: 1.2rem;
  margin: 0;
}

/* Appointment Error Banner */
.appointment-error-banner {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  border: 3px solid #dc3545;
  padding: 2rem;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  animation: slideIn 0.5s ease;
}

.error-icon {
  flex-shrink: 0;
}

.error-icon i {
  font-size: 3rem;
  color: #dc3545;
  animation: pulse 2s infinite;
}

.error-content {
  flex: 1;
}

.error-content h5 {
  color: #721c24;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-content p {
  color: #721c24;
  font-size: 1.2rem;
  margin: 0;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
}

.error-actions .btn {
  font-size: 1.1rem;
  padding: 0.75rem 1.25rem;
  white-space: nowrap;
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
  
  .options-container.three-columns {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .options-container.three-columns {
    grid-template-columns: 1fr;
  }
}

/* Camera Modal Styles */
::v-deep .camera-modal .modal-content {
  border-radius: 1rem;
  overflow: hidden;
}

::v-deep .camera-modal .modal-header {
  background: linear-gradient(135deg, #3551a4, #2c4088);
  color: white;
  border-bottom: none;
  padding: 1.5rem 2rem;
}

::v-deep .camera-modal .modal-title {
  font-size: 1.5rem;
  font-weight: 500;
}

::v-deep .camera-modal .modal-body {
  padding: 0;
}

.camera-container {
  display: flex;
  flex-direction: column;
  background: #000;
  min-height: 400px;
}

.upload-choice-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.upload-choice-content {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.upload-choice-content h5 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.upload-choice-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.choice-btn {
  flex: 1;
  min-width: 180px;
  max-width: 220px;
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.2rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.choice-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.choice-btn i {
  display: block;
}

.choice-btn-cancel {
  min-width: 160px;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.file-input-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.file-input-container {
  text-align: center;
  max-width: 400px;
}

.file-input-container i {
  color: #6c757d;
}

.file-input-container p {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.file-input-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.camera-preview {
  position: relative;
  width: 100%;
  max-height: calc(100vh - 300px);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
}

.camera-video {
  width: auto;
  max-width: 100%;
  max-height: calc(100vh - 300px);
  height: auto;
  display: block;
  object-fit: contain;
}

.camera-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  z-index: 10;
}

.camera-loading p {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
}

.captured-preview {
  width: 100%;
  max-height: calc(100vh - 300px);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  padding: 1rem;
  overflow: hidden;
}

.captured-image {
  width: auto;
  height: 200px;
  object-fit: contain;
  border-radius: 0.5rem;
}

.camera-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-top: 2px solid #dee2e6;
}

.control-btn {
  min-width: 160px;
  font-size: 1.2rem;
  font-weight: 500;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.capture-btn {
  background: linear-gradient(135deg, #ffc107, #ff9800);
  border: none;
  color: white;
  font-size: 1.4rem;
  min-width: 200px;
}

.capture-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff9800, #f57c00);
}

@media (max-width: 768px) {
  .camera-preview,
  .captured-preview {
    max-height: calc(100vh - 250px);
    min-height: 250px;
  }

  .camera-video {
    max-height: calc(100vh - 250px);
  }
  
  .captured-image {
    height: 200px;
    width: auto;
  }
  
  .camera-controls {
    flex-direction: column;
    padding: 1.5rem;
  }
  
  .control-btn {
    width: 100%;
    min-width: auto;
  }
  
  .capture-btn {
    min-width: auto;
  }

  .upload-choice-buttons {
    flex-direction: column;
  }

  .choice-btn {
    width: 100%;
    max-width: 100%;
  }
}
</style>
