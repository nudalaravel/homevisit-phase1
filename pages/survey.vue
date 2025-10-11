<template>
  <div>
    <!-- Step 1: ผู้ปกครองสามารถควบคุมหากิจกรรม -->
    <div v-if="currentStep === 1" class="survey-step">
      <h4 class="question-title">1.ผู้ปกครองสามารถควบคุมหากิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</h4>
      
      <div class="options-container">
        <button
          class="option-btn"
          :class="{ 'selected': step1Answer === 1 }"
          @click="step1Answer = 1"
        >
          ได้ (1)
        </button>
        
        <button
          class="option-btn"
          :class="{ 'selected': step1Answer === 3 }"
          @click="step1Answer = 3"
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

    <!-- Step 2: การเยี่ยมบ้านครั้งนี้ -->
    <div v-if="currentStep === 2" class="survey-step">
      <h4 class="question-title">การเยี่ยมบ้านครั้งนี้</h4>
      <p class="question-subtitle">7 : มีผู้อื่นร่วมทำกิจกรรมด้วยหรือไม่ (มากกว่า 20 นาที)</p>
      
      <div class="options-container multi-select">
        <button
          v-for="option in step2Options"
          :key="option.value"
          class="option-btn"
          :class="{ 'selected': step2Answer.includes(option.value) }"
          @click="toggleStep2Answer(option.value)"
        >
          {{ option.label }}
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

    <!-- Step 3: บันทึกผู้เยี่ยมบ้าน -->
    <div v-if="currentStep === 3" class="survey-step">
      <h4 class="question-title">บันทึกผู้เยี่ยมบ้าน</h4>
      
      <div class="form-container">
        <b-form-textarea
          v-model="step3Notes"
          placeholder="กรอกข้อมูล..."
          rows="8"
          class="notes-textarea"
        ></b-form-textarea>

        <div class="dropdown-row">
          <b-form-select
            v-model="step3Select1"
            :options="selectOptions"
            class="select-field"
          ></b-form-select>
          <span class="colon">:</span>
          <b-form-select
            v-model="step3Select2"
            :options="selectOptions"
            class="select-field"
          ></b-form-select>
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

    <!-- Step 4: อัพโหลดรูป -->
    <div v-if="currentStep === 4" class="survey-step">
      <h4 class="question-title">อัพโหลดรูปถ่ายกิจกรรมกับผู้ปกครองและเด็ก</h4>
      
      <div class="upload-container">
        <div v-if="!step4Image" class="upload-placeholder">
          <i class="fas fa-image"></i>
          <p>ยังไม่มีรูปภาพ</p>
        </div>
        <div v-else class="image-preview">
          <img :src="step4Image" alt="Uploaded image" />
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
          {{ step4Image ? 'เลือกรูปใหม่' : 'กดเพื่ออัพโหลดไฟล์ใหม่' }}
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

    <!-- Step 5: นัดหมายครั้งถัดไป -->
    <div v-if="currentStep === 5" class="survey-step">
      <h4 class="question-title">10.นัดหมายการเยี่ยมบ้านครั้งต่อไป</h4>
      
      <div class="appointment-form">
        <b-form-group label="วัน" label-for="day-select">
          <b-form-select
            id="day-select"
            v-model="step5Day"
            :options="currentDayOptions"
          ></b-form-select>
        </b-form-group>

        <b-form-group label="เดือน" label-for="month-select">
          <b-form-select
            id="month-select"
            v-model="step5Month"
            :options="monthOptions"
            @change="onMonthChange"
          ></b-form-select>
        </b-form-group>

        <b-form-group label="ปี" label-for="year-select">
          <b-form-select
            id="year-select"
            v-model="step5Year"
            :options="yearOptions"
            @change="onYearChange"
          ></b-form-select>
        </b-form-group>

        <b-form-group label="เวลา" label-for="time-select">
          <b-form-select
            id="time-select"
            v-model="step5Time"
            :options="timeOptions"
          ></b-form-select>
        </b-form-group>
      </div>

      <div class="navigation-buttons">
        <b-button variant="primary" size="lg" @click="prevStep">
          ย้อนกลับ
        </b-button>
        <b-button variant="info" size="lg" @click="submitSurvey">
          ถัดไป
        </b-button>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="processing" class="processing-overlay">
      <div class="spinner-container">
        <b-spinner variant="primary"></b-spinner>
        <p>กำลังประมวลผลรูปภาพ...</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'admin',
  middleware: 'auth',
  data() {
    return {
      currentStep: 1,
      processing: false,
      
      // Step 1
      step1Answer: null,
      
      // Step 2
      step2Answer: [],
      step2Options: [
        { value: 1, label: 'มี (1)' },
        { value: 2, label: 'แม่ (1)' },
        { value: 3, label: 'พ่อ (3)' },
        { value: 5, label: 'ป่า/ยาย (5)' },
        { value: 7, label: 'ปู่/ตา (7)' },
        { value: 9, label: 'พี่/น้อง (9)' },
        { value: 11, label: 'ลุง/ป้า/น้า/อา (11)' },
        { value: 13, label: 'อื่นๆ (13)' },
        { value: 3, label: 'ไม่มี (3)' }
      ],
      
      // Step 3
      step3Notes: '',
      step3Select1: null,
      step3Select2: null,
      selectOptions: [
        { value: null, text: '-เลือก-' },
        { value: 1, text: 'ตัวเลือก 1' },
        { value: 2, text: 'ตัวเลือก 2' },
        { value: 3, text: 'ตัวเลือก 3' }
      ],
      
      // Step 4
      step4Image: null,
      step4ImageKey: null,
      
      // Step 5
      step5Day: null,
      step5Month: null,
      step5Year: null,
      step5Time: '09:00 น.',
      
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
      const month = this.step5Month
      const year = this.step5Year
      
      if (!month || !year) {
        return this.generateDayOptions(31)
      }
      
      const daysInMonth = this.getDaysInMonth(month, year)
      return this.generateDayOptions(daysInMonth)
    }
  },
  mounted() {
    this.initDateOptions()
  },
  methods: {
    initDateOptions() {
      const now = new Date()
      const currentYear = now.getFullYear() + 543
      
      // Generate year options
      for (let i = currentYear; i <= currentYear + 2; i++) {
        this.yearOptions.push({ value: i, text: i.toString() })
      }
      
      // Set default date to today
      this.step5Day = now.getDate()
      this.step5Month = now.getMonth() + 1
      this.step5Year = currentYear
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
      if (this.step5Day && this.step5Year) {
        const daysInMonth = this.getDaysInMonth(this.step5Month, this.step5Year)
        
        if (this.step5Day > daysInMonth) {
          this.step5Day = daysInMonth
          this.$toast.info(`เดือนนี้มี ${daysInMonth} วัน ปรับวันที่เป็น ${daysInMonth} แล้ว`)
        }
      }
    },
    
    onYearChange() {
      if (this.step5Day && this.step5Month === 2) {
        const daysInMonth = this.getDaysInMonth(2, this.step5Year)
        
        if (this.step5Day > daysInMonth) {
          this.step5Day = daysInMonth
          this.$toast.info(`กุมภาพันธ์ปีนี้มี ${daysInMonth} วัน ปรับวันที่เป็น ${daysInMonth} แล้ว`)
        }
      }
    },
    
    toggleStep2Answer(value) {
      const index = this.step2Answer.indexOf(value)
      if (index > -1) {
        this.step2Answer.splice(index, 1)
      } else {
        this.step2Answer.push(value)
      }
    },
    
    async handleFileSelect(event) {
      const file = event.target.files[0]
      if (!file) return
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.$toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.$toast.error('ไฟล์รูปภาพมีขนาดใหญ่เกินไป (สูงสุด 10MB)')
        return
      }
      
      this.processing = true
      
      try {
        // Convert to WebP and resize
        const webpBase64 = await this.convertToWebP(file)
        this.step4Image = webpBase64
        
        // Save to IndexedDB
        await this.saveImageToIndexedDB(webpBase64)
        
        this.$toast.success('อัพโหลดรูปภาพสำเร็จ')
      } catch (error) {
        console.error('Error processing image:', error)
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
            // Calculate new dimensions (max width 1000px)
            let width = img.width
            let height = img.height
            const maxWidth = 1000
            
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            }
            
            // Create canvas
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            
            // Convert to WebP
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
        console.warn('IndexedDB not available')
        return
      }
      
      try {
        const key = `survey_image_${Date.now()}`
        await this.$indexedDB.saveData('images', {
          id: key,
          image: base64Image,
          timestamp: new Date().toISOString()
        })
        
        this.step4ImageKey = key
      } catch (error) {
        console.error('Failed to save image to IndexedDB:', error)
      }
    },
    
    async removeImage() {
      if (this.step4ImageKey && this.$indexedDB) {
        try {
          await this.$indexedDB.deleteData('images', this.step4ImageKey)
        } catch (error) {
          console.error('Failed to delete image from IndexedDB:', error)
        }
      }
      
      this.step4Image = null
      this.step4ImageKey = null
      
      // Reset file input
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    
    nextStep() {
      // Validate current step
      if (this.currentStep === 1 && this.step1Answer === null) {
        this.$toast.warning('กรุณาเลือกคำตอบ')
        return
      }
      
      if (this.currentStep === 2 && this.step2Answer.length === 0) {
        this.$toast.warning('กรุณาเลือกคำตอบอย่างน้อย 1 ตัวเลือก')
        return
      }
      
      if (this.currentStep === 5) {
        this.submitSurvey()
        return
      }
      
      this.currentStep++
    },
    
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },
    
    goBack() {
      this.$router.push('/')
    },
    
    async submitSurvey() {
      // Validate appointment date
      if (!this.step5Day || !this.step5Month || !this.step5Year || !this.step5Time) {
        this.$toast.warning('กรุณากรอกข้อมูลนัดหมายให้ครบถ้วน')
        return
      }
      
      // Validate date is not in the past
      const selectedDate = new Date(
        this.step5Year - 543,
        this.step5Month - 1,
        this.step5Day
      )
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        this.$toast.error('ไม่สามารถเลือกวันที่ในอดีตได้')
        return
      }
      
      // Prepare survey data
      const surveyData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        step1: this.step1Answer,
        step2: this.step2Answer,
        step3: {
          notes: this.step3Notes,
          select1: this.step3Select1,
          select2: this.step3Select2
        },
        step4: {
          imageKey: this.step4ImageKey
        },
        step5: {
          day: this.step5Day,
          month: this.step5Month,
          year: this.step5Year,
          time: this.step5Time
        }
      }
      
      // Save to IndexedDB
      if (this.$indexedDB) {
        try {
          await this.$indexedDB.saveData('surveys', surveyData)
        } catch (error) {
          console.error('Failed to save survey to IndexedDB:', error)
        }
      }
      
      this.$toast.success('บันทึกแบบสอบถามสำเร็จ')
      
      // Redirect to home
      setTimeout(() => {
        this.$router.push('/')
      }, 1500)
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
  font-size: 1.35rem;
  font-weight: 600;
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
  font-size: 1.05rem;
  margin-bottom: 2rem;
  text-align: left;
  padding-left: 0.75rem;
  border-left: 3px solid #17a2b8;
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
  font-size: 1.05rem;
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

.notes-textarea {
  width: 100%;
  margin-bottom: 1.5rem;
  font-size: 1rem;
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

.dropdown-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 1.5rem;
  border-radius: 0.75rem;
}

.select-field {
  flex: 1;
  max-width: 220px;
  font-size: 1.2rem;
  /* padding: 0 0.875rem; */
  border: 2px solid #dee2e6;
  border-radius: 0.75rem;
  background: white;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  height: 50px;
  color: #495057;
  font-weight: 500;
}

.select-field:focus {
  border-color: #3551a4;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(53, 81, 164, 0.15);
}

.colon {
  font-size: 1.75rem;
  font-weight: bold;
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
  font-size: 5rem;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.5);
}

.upload-placeholder p {
  font-size: 1.2rem;
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
  font-size: 1.3rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.remove-image-btn:hover {
  background: rgba(220, 53, 69, 1);
  transform: scale(1.1);
}

.upload-btn {
  font-size: 1.05rem;
  font-weight: 600;
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
  font-size: 1.3rem;
}

/* Appointment Form */
.appointment-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.75rem;
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 1rem;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
}

.appointment-form .form-group {
  margin-bottom: 0;
}

.appointment-form label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.appointment-form label::before {
  content: '•';
  color: #3551a4;
  font-size: 1.5rem;
}

.appointment-form select {
  width: 100%;
  font-size: 1.2rem;
  padding: 0 0.875rem;
  height: 50px;
  border: 2px solid #dee2e6;
  border-radius: 0.75rem;
  background: white;
  color: #495057;
  font-weight: 500;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.appointment-form select:focus {
  border-color: #3551a4;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(53, 81, 164, 0.15);
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
  font-weight: 600;
  padding: 1rem 2.25rem;
  font-size: 1.05rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .survey-step {
    padding: 1.75rem;
    margin: 1rem;
  }
  
  .question-title {
    font-size: 1.15rem;
  }
  
  .question-subtitle {
    font-size: 0.95rem;
  }
  
  .options-container.multi-select {
    grid-template-columns: 1fr;
  }
  
  .option-btn {
    padding: 1rem 1.25rem;
  }
  
  .dropdown-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .select-field {
    max-width: 100%;
  }
  
  .appointment-form {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }
  
  .navigation-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .navigation-buttons .btn {
    width: 100%;
  }
  
  .upload-placeholder,
  .image-preview {
    height: 250px;
    max-width: 100%;
  }
  
  .upload-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

