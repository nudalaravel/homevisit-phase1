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
            5 : ให้ผู้เยี่ยมบ้าน <strong>สังเกต</strong> หรือ <strong>ทบทวน</strong> กิจกรรมการเยี่ยมบ้านครั้งที่ผ่านมา โดยขอให้ผู้ปกครองสาธิตการทำ
กิจกรรมร่วมกับเด็ก
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
              ทำได้เอง (1)
            </button>
            
            <button
              class="option-btn"
              :class="{ 'selected': answers.q5[activities[currentQ5Index].no] === 2 }"
              @click="setQ5Answer(activities[currentQ5Index].no, 2)"
            >
              ทำได้โดยได้รับการช่วยเหลือ (2)
            </button>

            <button
              class="option-btn"
              :class="{ 'selected': answers.q5[activities[currentQ5Index].no] === 3 }"
              @click="setQ5Answer(activities[currentQ5Index].no, 3)"
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
        ไม่พบกิจกรรมสำหรับเดือนที่ {{ visitorData.month_age }} ครั้งที่ {{ visitorData.time }}
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

          <input
            ref="fileInput1"
            type="file"
            accept="image/*"
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
            {{ displayImage1 ? 'เลือกรูปใหม่' : 'อัพโหลดรูปภาพที่ 1' }}
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
            {{ displayImage2 ? 'เลือกรูปใหม่' : 'อัพโหลดรูปภาพที่ 2' }}
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
  </div>
</template>

<script>
import { MONTH_OPTIONS, TIME_OPTIONS } from '~/utils/constants'
import { getDaysInMonth, generateDayOptions } from '~/utils/dateHelpers'
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

export default {
  name: 'SurveyPage',
  layout: 'admin',
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
      activities: [],
      
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
        appointmentTime: '09:00 น.',
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
      return normalizeImageUrlHelper(url, !navigator.onLine)
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
      
      // ตั้งค่าข้อมูลผู้รับบริการ
      this.visitorData = {
        stid: editData.stid,
        name: editData.name,
        nickname: editData.nickname,
        time: editData.time,
        time_visit: survey.time_visit || editData.time,
        month_age: monthAge,
        appointmentDate: survey.appointmentDate,
        appointmentTime: survey.appointmentTime
      }
      
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
      
      // ตั้งค่าข้อมูลผู้รับบริการ
      this.visitorData = {
        stid: survey.stid,
        name: visitor.cname || visitor.name,
        nickname: visitor.cnickname || visitor.nickname,
        time: survey.time,
        time_visit: survey.time_visit || survey.time,
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
        const time = urlParams.time
        
        if (stid && time) {
          // ลองโหลดจาก IndexedDB โดยใช้ stid และ time
          const existingSurvey = await this.$indexedDB.getSurveyProgress(stid, time)
          
          if (existingSurvey) {
            // พบแบบสอบถามที่ยังไม่เสร็จ
            const visitor = await this.$indexedDB.getVisitor(stid)
            if (visitor) {
              this.visitorData = {
                stid: stid,
                name: visitor.cname || visitor.name,
                nickname: visitor.cnickname || visitor.nickname,
                time: existingSurvey.time || time,
                time_visit: existingSurvey.time_visit || time,
                month_age: existingSurvey.month_age,
                appointmentDate: existingSurvey.appointmentDate,
                appointmentTime: existingSurvey.appointmentTime
              }
              await this.loadExistingSurvey(existingSurvey)
              
              // อัพเดท URL ให้มี query parameters (ถ้ายังไม่มี)
              if (!this.$route.query.stid || !this.$route.query.time) {
                this.$router.replace({
                  path: '/survey',
                  query: { stid: stid, time: time }
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
      
      console.log('📋 [DEBUG] Received visitorData from localStorage:', {
        appointmentTime: this.visitorData.appointmentTime,
        startTime: this.visitorData.startTime,
        stid: this.visitorData.stid,
        time: this.visitorData.time,
        time_visit: this.visitorData.time_visit
      })
      
      // ตรวจสอบแบบสอบถามที่ยังไม่เสร็จ
      const existingSurvey = await this.$indexedDB.getSurveyProgress(
        this.visitorData.stid,
        this.visitorData.time_visit || this.visitorData.time
      )
      
      if (existingSurvey) {
        // โหลดแบบสอบถามที่ค้างไว้
        await this.loadExistingSurvey(existingSurvey)
        this.$toast.info('พบแบบสอบถามที่ยังไม่เสร็จสิ้น กำลังโหลดความคืบหน้า...')
      } else {
        // สร้างแบบสอบถามใหม่
        await this.createNewSurvey()
      }
      
      // อัพเดท URL ให้มี query parameters (ถ้ายังไม่มี)
      if (!this.$route.query.stid || !this.$route.query.time) {
        this.$router.replace({
          path: '/survey',
          query: { stid: this.visitorData.stid, time: this.visitorData.time }
        })
      }
    },
    
    async createNewSurvey() {
      // สร้างรหัสแบบสอบถาม (ใช้ format มาตรฐาน stid_time เพื่อป้องกันข้อมูลซ้ำ)
      this.surveyId = `${this.visitorData.stid}_${this.visitorData.time}`
      
      // ตั้งค่าเวลาเริ่มต้นของระบบ (system timestamp)
      this.recStart = new Date().toISOString().slice(0, 19).replace('T', ' ')
      console.log('🕒 [DEBUG recStart] Set recStart on createNewSurvey:', this.recStart)
      
      // timeStart (user input): เวลาเริ่มบันทึกที่ user กรอกใน modal ที่หน้า index
      if (this.visitorData.startTime) {
        // แปลงจาก format "HH:MM น." เป็น "YYYY-MM-DD HH:MM:00"
        const today = new Date()
        const dateStr = today.toISOString().slice(0, 10)
        const timeStr = this.visitorData.startTime.replace(' น.', '')
        this.timeStart = `${dateStr} ${timeStr}:00`
        console.log('🕒 [DEBUG timeStart] Set timeStart from startTime:', this.timeStart)
      } else {
        this.timeStart = null
        console.log('🕒 [DEBUG timeStart] No startTime provided, timeStart is null')
      }
      
      // บันทึกความคืบหน้าเริ่มต้น
      await this.saveProgress()
    },
    
    async loadExistingSurvey(survey) {
      this.surveyId = survey.id
      
      // System timestamps
      this.recStart = survey.recStart || null
      this.recEnd = survey.recEnd || null
      
      // User input times
      this.timeStart = survey.timeStart || null
      this.timeEnd = survey.timeEnd || null
      
      console.log('📂 [DEBUG recEnd] loadExistingSurvey:', {
        recStart: this.recStart,
        recEnd: this.recEnd,
        timeStart: this.timeStart,
        timeEnd: this.timeEnd
      })
      
      // ตรวจสอบว่า survey นี้ sync แล้วหรือยัง
      this.isSyncedSurvey = survey.synced === true
      
      // Set flag if editing an incomplete survey (prevent recalculation of month_age/time)
      this.isEditingIncompleteSurvey = !survey.completed
      
      // Check if should disable step 12 (appointment editing)
      // Disable if: editing completed survey AND there's any survey with higher time
      console.log('🔍 [DEBUG] Checking shouldDisableStep12...')
      console.log('  - Survey completed:', survey.completed)
      console.log('  - Current survey time:', survey.time)
      console.log('  - Current survey stid:', survey.stid)
      
      if (survey.completed) {
        // Get all surveys for this stid
        const allSurveys = await this.$indexedDB.getAllSurveysByStid(survey.stid)
        console.log('  - Total surveys found:', allSurveys.length)
        
        // Find max time_visit from all surveys
        const surveyTimes = allSurveys
          .map(s => Number(s.time_visit || s.time))
          .filter(t => !isNaN(t))
        const maxTime = surveyTimes.length > 0 ? Math.max(...surveyTimes) : 0
        const currentTime = Number(survey.time_visit || survey.time)
        
        console.log('  - All survey times:', surveyTimes)
        console.log('  - Max time_visit found:', maxTime)
        console.log('  - Current time_visit:', currentTime)
        console.log('  - Has next survey? (maxTime > currentTime):', maxTime > currentTime)
        
        // Disable if there's any survey with time_visit > current survey time_visit
        if (maxTime > currentTime) {
          console.log('🔒 [DEBUG] Found survey with higher time_visit - disabling step 12')
          this.shouldDisableStep12 = true
        } else {
          console.log('✅ [DEBUG] No survey with higher time_visit - step 12 can be edited')
          this.shouldDisableStep12 = false
        }
      } else {
        console.log('ℹ️ [DEBUG] Incomplete survey - step 12 is always editable')
        this.shouldDisableStep12 = false
      }
      
      console.log('📌 [DEBUG] Final shouldDisableStep12 =', this.shouldDisableStep12)
      
      if (survey.completed) {
        this.currentStep = 1
      } else {
        this.currentStep = survey.currentStep || 1
      }
      
      // Merge answers with defaults to ensure new fields exist
      const q7Data = parseQ7Data(
        survey.answers?.q7,
        survey.answers?.q71,
        survey.answers?.q71_des || ''
      )
      
      // แยกการ merge เพื่อป้องกัน type conflict
      const baseAnswers = { ...this.answers }
      const savedAnswers = survey.answers || {}
      
      this.answers = {
        ...baseAnswers,
        // Convert to number (handle both string and number from API/IndexedDB)
        q1: savedAnswers.q1 != null ? Number(savedAnswers.q1) : null,
        q2: savedAnswers.q2 != null ? Number(savedAnswers.q2) : null,
        q4: savedAnswers.q4 != null ? Number(savedAnswers.q4) : null,
        q8: savedAnswers.q8 != null ? Number(savedAnswers.q8) : null,
        // Ensure q3 is array with numbers
        q3: Array.isArray(savedAnswers.q3) ? savedAnswers.q3.map(v => Number(v)) : [],
        // q6 เป็น single value (รองรับข้อมูลเก่าที่เป็น array)
        q6: savedAnswers.q6 != null ? (Array.isArray(savedAnswers.q6) ? (savedAnswers.q6.length > 0 ? Number(savedAnswers.q6[0]) : null) : Number(savedAnswers.q6)) : null,
        // New q7 structure with backward compatibility
        q7: q7Data.q7,
        q71: q7Data.q71,
        q71_des: q7Data.q71_des,
        // Map q6_des to q6_other (IndexedDB structure)
        q6_other: savedAnswers.q6_other || savedAnswers.q6_des || '',
        // Ensure notes field exists
        notes: savedAnswers.notes || survey.note || '',
        q1_des: savedAnswers.q1_des || '',
        q2_des: savedAnswers.q2_des || '',
        q3_des: savedAnswers.q3_des || '',
        // Convert q5 and q9 activity answers to numbers
        q5: savedAnswers.q5 ? this.convertActivityAnswersToNumber(savedAnswers.q5) : {},
        q9: savedAnswers.q9 ? this.convertActivityAnswersToNumber(savedAnswers.q9) : {}
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
        console.log('📅 [DEBUG] Loaded newAppointment:', this.newAppointment)
      }

      // แปลง timeEnd กลับเป็น endHour และ endMinute (ไม่ว่า completed หรือไม่)
      if (survey.timeEnd) {
        const timeEndDate = new Date(survey.timeEnd)
        this.answers.endHour = String(timeEndDate.getHours()).padStart(2, '0')
        this.answers.endMinute = String(timeEndDate.getMinutes()).padStart(2, '0')
        console.log('⏰ [DEBUG] Loaded timeEnd:', {
          timeEnd: survey.timeEnd,
          endHour: this.answers.endHour,
          endMinute: this.answers.endMinute
        })
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
        
        let timeVisit
        if (existingSurvey && existingSurvey.time_visit) {
          timeVisit = existingSurvey.time_visit
        } else {
          const completedSurveys = await this.$indexedDB.getCompletedSurveysByStid(this.visitorData.stid)
          timeVisit = completedSurveys.length + 1
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
          note: answersToSave.notes || '', // เก็บ note ที่ top level เพื่อ sync ได้ตรง
          newAppointment: this.newAppointment,
          surveyImages: this.surveyImages,
          surveyImageKeys: this.surveyImageKeys,
          completed: isCompleted,
          synced: shouldResetSync ? false : (existingSurvey?.synced || false),
          approve_status: existingSurvey?.approve_status || 0
        }
        
        console.log('💾 [DEBUG recEnd] progressData timestamps:', {
          recStart: progressData.recStart,
          recEnd: progressData.recEnd,
          timeStart: progressData.timeStart,
          timeEnd: progressData.timeEnd
        })
        
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
      
      // รีเซ็ตช่องเลือกไฟล์
      const refName = `fileInput${index + 1}`
      if (this.$refs[refName]) {
        this.$refs[refName].value = ''
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
      
      // บันทึก timeEnd และ recEnd เมื่อออกจาก Step 1 (บันทึกผู้เยี่ยมบ้าน)
      if (this.currentStep === 1) {
        const now = new Date()
        const dateStr = now.toISOString().slice(0, 10)
        
        // timeEnd: เวลาที่ user กรอก (จาก endHour และ endMinute) - เซ็ตเฉพาะครั้งแรก
        if (!this.timeEnd) {
          this.timeEnd = `${dateStr} ${this.answers.endHour}:${this.answers.endMinute}:00`
          console.log('🕒 [DEBUG timeEnd] Set timeEnd when leaving Step 1:', this.timeEnd)
        }
        
        // recEnd: เวลาที่ระบบบันทึกจริง (อัปเดตทุกครั้งที่มีการบันทึก)
        this.recEnd = now.toISOString().slice(0, 19).replace('T', ' ')
        console.log('🕒 [DEBUG recEnd] Update recEnd when leaving Step 1:', this.recEnd)
        
        // บันทึกลง IndexedDB ทันที
        await this.saveProgress()
      }
      
      // Skip logic: จาก step 1 ถ้า q1 === 3 ไปที่ step 10
      if (this.currentStep === 1 && this.skippedFromQ1) {
        // ล้าง value ของคำถามที่ข้าม (q2-q9)
        this.answers.q2 = null
        this.answers.q2_des = ''
        this.answers.q3 = []
        this.answers.q3_des = ''
        this.answers.q4 = null
        this.answers.q5 = {}
        this.answers.q6 = null
        this.answers.q6_other = ''
        this.answers.q7 = null
        this.answers.q71 = []
        this.answers.q71_des = ''
        this.answers.q8 = null
        this.answers.q9 = {}
        this.currentStep = 10
        await this.saveProgress()
        return
      }
      
      this.currentStep++
      
      // บันทึกความคืบหน้าแบบ debounce (ไม่ block UI)
      // ข้าม debounce save หลังจาก Step 1 เพราะ save แล้วตอนเซ็ต timestamps
      const skipDebounceSave = this.currentStep === 2 // เพิ่งออกจาก Step 1
      if (this.saveProgressDebounced && !skipDebounceSave) {
        this.saveProgressDebounced()
      }
      
      // ข้าม step 3, 4, 5 ถ้า time = 1 (first visit)
      if (this.currentStep === 3 && this.visitorData && Number(this.visitorData.time) === 1) {
        // ล้าง value ของคำถามที่ข้าม (q3, q4, q5)
        this.answers.q3 = []
        this.answers.q3_des = ''
        this.answers.q4 = null
        this.answers.q5 = {}
        this.currentStep = 6 // Skip to step 6
      }
      
      // ข้าม step 5 ถ้า time != 1 แต่ q2 === 3
      if (this.currentStep === 5 && (!this.shouldShowStep5 || this.skippedFromQ2)) {
        // ล้าง value ของ q5 เมื่อข้าม step 5
        if (this.skippedFromQ2) {
          this.answers.q5 = {}
        }
        this.currentStep++
      }
      
      // ข้าม step 9 ถ้า q2 === 3
      if (this.currentStep === 9 && this.skippedFromQ2) {
        // ล้าง value ของ q9 เมื่อข้าม step 9
        this.answers.q9 = {}
        this.currentStep++
      }
      
      // ข้าม step 11 (อัพโหลดรูป) ถ้า q1 === 3 หรือ q2 === 3
      if (this.currentStep === 11 && (this.skippedFromQ1 || this.skippedFromQ2)) {
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
        if (this.currentStep === 6 && this.visitorData && Number(this.visitorData.time) === 1) {
          this.currentStep = 2
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
        
        // อัปเดต recEnd = เวลาที่ระบบบันทึกจริง (system timestamp) - อัปเดตเสมอ
        this.recEnd = new Date().toISOString().slice(0, 19).replace('T', ' ')
        console.log('🕒 [DEBUG recEnd] Set recEnd on submit:', this.recEnd)
        
        // ตั้งค่า timeEnd = เวลาที่ user กรอกเอง (user input time) - ถ้ายังไม่มี
        if (!this.timeEnd) {
          const today = new Date()
          const dateStr = today.toISOString().slice(0, 10)
          this.timeEnd = `${dateStr} ${this.answers.endHour}:${this.answers.endMinute}:00`
          console.log('🕒 [DEBUG timeEnd] Set timeEnd on submit:', this.timeEnd)
        } else {
          console.log('🕒 [DEBUG timeEnd] timeEnd already set, keeping existing value:', this.timeEnd)
        }
        
        if (wasCompleted) {
          // แก้ไขแบบสอบถามที่เสร็จแล้ว
          console.log('💾 [DEBUG recEnd] Saving progress with recEnd:', this.recEnd)
          await this.saveProgress()
          
          // เช็คและอัพเดท booking ครั้งถัดไปถ้ามีการเปลี่ยนแปลงวันนัดใน step12
          const bookingUpdated = await this.updateNextBookingIfChanged()
          if (bookingUpdated) {
            this.$toast.success('บันทึกการแก้ไขสำเร็จ และอัพเดทนัดหมายครั้งถัดไป')
          } else {
            this.$toast.success('บันทึกการแก้ไขสำเร็จ')
          }
          
          // Survey จะถูก sync อัตโนมัติผ่าน pushSurveyResultsToAPI()
        } else {
          console.log('✅ [DEBUG recEnd] Marking survey completed with recEnd:', this.recEnd)
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
        
        // อัปเดต recEnd
        this.recEnd = new Date().toISOString().slice(0, 19).replace('T', ' ')
        console.log('💾 [DEBUG] Saving survey without creating new appointment')
        
        // ตั้งค่า timeEnd ถ้ายังไม่มี
        if (!this.timeEnd) {
          const today = new Date()
          const dateStr = today.toISOString().slice(0, 10)
          this.timeEnd = `${dateStr} ${this.answers.endHour}:${this.answers.endMinute}:00`
        }
        
        // บันทึกความคืบหน้า
        await this.saveProgress()
        
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
        // ⚠️ สำคัญ: ต้องใช้ค่าจาก newAppointment ที่คำนวณจาก recalculateMonthAgeAndActivities()
        const newMonthAge = this.newAppointment.appointmentMonthAge || this.newAppointment.monthAge
        const newTimeActivity = this.newAppointment.timeActivity
        
        if (!newMonthAge || !newTimeActivity) {
          throw new Error('ไม่สามารถคำนวณอายุเดือนและครั้งที่เยี่ยมได้ กรุณาตรวจสอบข้อมูล')
        }
        
        const completedSurveys = await this.$indexedDB.getCompletedSurveysByStid(this.visitorData.stid)
        const newTimeVisit = completedSurveys.length + 1
        
        // ใช้วันที่ทำ survey จริงจากระบบ (recStart) ไม่ใช่วันที่ user กรอก
        // ⚠️ สำคัญ: last_visit_date ต้องเป็นวันที่เยี่ยมจริงจากระบบ เพื่อใช้ในการคำนวณครั้งถัดไป
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
        
        console.log('🔍 [DEBUG] updateNextBookingIfChanged - looking for booking with time_visit:', nextTimeVisit)
        
        // ดึง booking ล่าสุด
        const existingBooking = await this.$indexedDB.getBooking(this.visitorData.stid)
        
        if (!existingBooking) {
          console.log('ℹ️ [DEBUG] No booking found, skip update')
          return false
        }
        
        console.log('📋 [DEBUG] Found booking:', {
          time_visit: existingBooking.time_visit,
          appointmentDate: existingBooking.appointmentDate,
          time: existingBooking.time,
          month_age: existingBooking.month_age
        })
        
        // เช็คว่า booking ที่มีอยู่ตรงกับ time_visit ถัดไปหรือไม่
        if (existingBooking.time_visit !== nextTimeVisit) {
          console.log('⚠️ [DEBUG] time_visit mismatch:', {
            expected: nextTimeVisit,
            found: existingBooking.time_visit
          })
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
          console.log('ℹ️ [DEBUG] No changes in appointment, skip update')
          return false
        }
        
        console.log('🔄 [DEBUG] Booking changes detected, updating...')
        console.log('  Old:', {
          date: existingBooking.appointmentDate,
          time: existingBooking.appointmentTime,
          month_age: existingBooking.month_age,
          time: existingBooking.time
        })
        console.log('  New:', {
          date: newAppointmentDate,
          time: newAppointmentTime,
          month_age: newMonthAge,
          time: newTimeActivity
        })
        
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
        console.log('✅ [DEBUG] Booking updated successfully')
        return true
      } catch (error) {
        console.error('❌ [ERROR] Failed to update booking:', error)
        return false
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
        if (this.visitorData.appointmentTime) {
          this.newAppointment.appointmentTime = this.visitorData.appointmentTime
        } else {
          this.newAppointment.appointmentTime = '09:00 น.'
        }
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
      console.log('💾 [DEBUG] onMonthChange - saving newAppointment:', this.newAppointment)
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
      console.log('💾 [DEBUG] onYearChange - saving newAppointment:', this.newAppointment)
      if (this.saveProgressDebounced) {
        this.saveProgressDebounced()
      }
    },
    
    async onDayChange() {
      await this.recalculateMonthAgeAndActivities()
      
      // อัพเดท booking ถ้ามี (กรณีแก้ไข completed survey)
      await this.updateNextBookingIfChanged()
      
      // บันทึกความคืบหน้า
      console.log('💾 [DEBUG] onDayChange - saving newAppointment:', this.newAppointment)
      if (this.saveProgressDebounced) {
        this.saveProgressDebounced()
      }
    },
    
    async onTimeChange() {
      // อัพเดท booking ถ้ามี (กรณีแก้ไข completed survey)
      await this.updateNextBookingIfChanged()
      
      // บันทึกความคืบหน้าเมื่อเปลี่ยนเวลา
      console.log('💾 [DEBUG] onTimeChange - saving appointmentTime:', this.newAppointment.appointmentTime)
      if (this.saveProgressDebounced) {
        this.saveProgressDebounced()
      }
    },
    
    async recalculateMonthAgeAndActivities() {
      console.log('🔍 [DEBUG] START recalculateMonthAgeAndActivities (survey.vue)')
      console.log('📋 [DEBUG] Input Data:', {
        visitorData: this.visitorData,
        appointmentMonth: this.newAppointment.appointmentMonth,
        appointmentYear: this.newAppointment.appointmentYear,
        appointmentDay: this.newAppointment.appointmentDay
      })
      
      if (!this.visitorData || !this.newAppointment.appointmentMonth || !this.newAppointment.appointmentYear || !this.newAppointment.appointmentDay) {
        console.log('❌ [DEBUG] Missing required data, returning early')
        return
      }
      
      try {
        // ดึงข้อมูล visitor เพื่อหาวันเกิด
        const visitor = await this.$indexedDB.getVisitor(this.visitorData.stid)
        
        if (!visitor || !visitor.month_birth || !visitor.year_birth) {
          console.log('❌ [DEBUG] Visitor missing birth data, returning early')
          return
        }
        
        // Create selected date for next appointment
        const selectedYear = this.newAppointment.appointmentYear - 543
        const selectedMonth = this.newAppointment.appointmentMonth
        const selectedDay = this.newAppointment.appointmentDay
        const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay)
        
        console.log('📅 [DEBUG] Selected date for NEXT appointment:', selectedDate.toISOString().split('T')[0])
        
        // 🔄 ใน step 12 ของ survey.vue: เราคำนวณนัดครั้งถัดไป
        // โดยใช้ survey ปัจจุบัน (visitorData) เป็น existingBooking
        // เพราะ survey นี้คือครั้งล่าสุดที่เพิ่งทำเสร็จ/กำลังทำอยู่
        
        // แปลง appointmentDate เป็น Date object
        let appointmentDateObj = this.visitorData.appointmentDate
        if (!appointmentDateObj) {
          // ถ้าไม่มี appointmentDate ใช้ recStart แทน
          appointmentDateObj = this.recStart ? new Date(this.recStart.split(' ')[0]) : new Date()
          console.log('⚠️ [DEBUG] No appointmentDate, using fallback:', appointmentDateObj.toISOString().split('T')[0])
        } else if (typeof appointmentDateObj === 'string') {
          appointmentDateObj = new Date(appointmentDateObj)
        }
        
        const existingBooking = {
          appointmentDate: appointmentDateObj,
          month_age: Number(this.visitorData.month_age),
          time: Number(this.visitorData.time)
        }
        
        console.log('📝 [DEBUG] Using current survey as existingBooking:', {
          time: existingBooking.time,
          month_age: existingBooking.month_age,
          appointmentDate: existingBooking.appointmentDate.toISOString().split('T')[0]
        })
        
        // คำนวณวันห่างจากนัดครั้งปัจจุบัน
        const daysSince = Math.floor((selectedDate - existingBooking.appointmentDate) / (1000 * 60 * 60 * 24))
        console.log('📊 [DEBUG] Days since current appointment:', daysSince)
        
        // Calculate using helper function
        const { monthAge, timeActivity } = calculateMonthAgeAndTime(
          parseInt(visitor.month_birth),
          parseInt(visitor.year_birth),
          parseInt(visitor.day_birth) || 1,
          selectedDate,
          existingBooking
        )
        
        console.log('✅ [DEBUG] Calculated for NEXT appointment:')
        console.log('  - monthAge:', monthAge)
        console.log('  - timeActivity:', timeActivity)
        console.log('  - Logic used:', daysSince > 21 ? 'RESET (>21 days)' : daysSince >= 0 ? 'INCREMENT (≤21 days)' : 'N/A')
        
        // อัพเดทค่าที่คำนวณได้
        this.newAppointment.appointmentMonthAge = monthAge
        this.newAppointment.monthAge = monthAge
        this.newAppointment.timeActivity = timeActivity
        
        console.log('💾 [DEBUG] Updated newAppointment:', {
          appointmentMonthAge: this.newAppointment.appointmentMonthAge,
          monthAge: this.newAppointment.monthAge,
          timeActivity: this.newAppointment.timeActivity,
          date: `${selectedDay}/${selectedMonth}/${this.newAppointment.appointmentYear}`
        })
        
        // ดึงกิจกรรมใหม่
        const activities = await this.$indexedDB.getActivityByMonthAgeAndTime(
          monthAge,
          timeActivity
        )
        this.newAppointment.activities = activities || []
        
        console.log('📋 [DEBUG] Retrieved', activities?.length || 0, 'activities for month_age:', monthAge, 'time:', timeActivity)
        console.log('✅ [DEBUG] END recalculateMonthAgeAndActivities - Success')
      } catch (error) {
        console.error('❌ [DEBUG] ERROR in recalculateMonthAgeAndActivities:', error)
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
</style>
