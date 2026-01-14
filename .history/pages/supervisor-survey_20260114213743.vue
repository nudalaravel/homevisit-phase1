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

      <!-- Survey Form Content -->
      <div v-if="isFormReady" class="survey-content">

        <!-- Question 1: ผู้ปกครองสามารถร่วมทำกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่ -->
        <div class="question-section">
          <h4 class="question-title">1. ผู้ปกครองสามารถร่วมทำกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</h4>
          <div class="options-container">
            <button
              type="button"
              class="option-btn"
              :class="{ 'selected': answers.q1 === 1 }"
              @click="answers.q1 = 1"
            >
              ได้ (1)
            </button>
            <button
              type="button"
              class="option-btn"
              :class="{ 'selected': answers.q1 === 3 }"
              @click="answers.q1 = 3"
            >
              ไม่ได้ (3)
            </button>
          </div>
          <!-- Show input when "ไม่ได้" is selected -->
          <div v-if="answers.q1 === 3" class="sub-question-input">
            <label class="form-label">โปรดให้เหตุผล:</label>
            <b-form-input
              v-model="answers.q1_des"
              placeholder="กรอกเหตุผล..."
            ></b-form-input>
          </div>
        </div>

        <!-- Question 2: เด็กสามารถร่วมทำกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่ -->
        <div class="question-section">
          <h4 class="question-title">2. เด็กสามารถร่วมทำกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</h4>
          <div class="options-container">
            <button
              type="button"
              class="option-btn"
              :class="{ 'selected': answers.q2 === 1 }"
              @click="answers.q2 = 1"
            >
              ได้ (1)
            </button>
            <button
              type="button"
              class="option-btn"
              :class="{ 'selected': answers.q2 === 3 }"
              @click="answers.q2 = 3"
            >
              ไม่ได้ (3)
            </button>
          </div>
          <div v-if="answers.q2 === 3" class="sub-question-input">
            <label class="form-label">โปรดให้เหตุผล:</label>
            <b-form-input
              v-model="answers.q2_des"
              placeholder="กรอกเหตุผล..."
            ></b-form-input>
          </div>
        </div>

        <!-- Question 3: ในสัปดาห์ที่ผ่านมา ใครเป็นคนทำกิจกรรมที่ได้จากการเยี่ยมบ้านร่วมกับเด็ก -->
        <div class="question-section">
          <h4 class="question-title">3. ในสัปดาห์ที่ผ่านมา ใครเป็นคนทำกิจกรรมที่ได้จากการเยี่ยมบ้านร่วมกับเด็ก (ทบทวนการเยี่ยมบ้านที่ผ่านมา)</h4>
          <div class="options-container multi-select">
            <button
              v-for="option in q3Options"
              :key="option.value"
              type="button"
              class="option-btn"
              :class="{ 'selected': answers.q3.includes(option.value) }"
              @click="toggleQ3Answer(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
          <div v-if="answers.q3.includes(13)" class="sub-question-input">
            <label class="form-label">อื่นๆ ระบุ:</label>
            <b-form-input
              v-model="answers.q3_des"
              placeholder="โปรดระบุ..."
            ></b-form-input>
          </div>
        </div>

        <!-- Question 4: ในสัปดาห์ที่ผ่านมา ผู้ปกครองร่วมทำกิจกรรมกับเด็กบ่อยแค่ไหน -->
        <div class="question-section">
          <h4 class="question-title">4. ในสัปดาห์ที่ผ่านมา ผู้ปกครองร่วมทำกิจกรรมกับเด็กบ่อยแค่ไหน ? (ทบทวนการเยี่ยมบ้านที่ผ่านมา)</h4>
          <div class="options-container">
            <button
              type="button"
              class="option-btn"
              :class="{ 'selected': answers.q4 === 1 }"
              @click="answers.q4 = 1"
            >
              ไม่ทำเลย
            </button>
            <button
              type="button"
              class="option-btn"
              :class="{ 'selected': answers.q4 === 2 }"
              @click="answers.q4 = 2"
            >
              ทำน้อย (1-2 วัน)
            </button>
            <button
              type="button"
              class="option-btn"
              :class="{ 'selected': answers.q4 === 3 }"
              @click="answers.q4 = 3"
            >
              ทำบ้างเป็นบางวัน (3-4 วัน)
            </button>
            <button
              type="button"
              class="option-btn"
              :class="{ 'selected': answers.q4 === 4 }"
              @click="answers.q4 = 4"
            >
              ทำเกือบทุกวัน (5-7 วัน)
            </button>
          </div>
        </div>

        <!-- Question 5: Dynamic Activities from previous visit (Mockup) -->
        <div class="question-section">
          <h4 class="question-title">5. ให้ผู้เยี่ยมบ้าน <strong>สังเกต</strong> หรือ <strong>ทบทวน</strong> กิจกรรมการเยี่ยมบ้านครั้งที่ผ่านมา</h4>
          <p class="question-subtitle">กิจกรรมจากการเยี่ยมบ้านครั้งก่อน</p>
          <div v-for="(activity, index) in q5Activities" :key="activity.no" class="activity-block">
            <div class="activity-title">{{ index + 1 }}. {{ activity.title }}</div>
            <div class="options-container">
              <button
                type="button"
                class="option-btn"
                :class="{ 'selected': answers.q5[activity.no] === 1 }"
                @click="setQ5Answer(activity.no, 1)"
              >
                ทำได้เอง (1)
              </button>
              <button
                type="button"
                class="option-btn"
                :class="{ 'selected': answers.q5[activity.no] === 2 }"
                @click="setQ5Answer(activity.no, 2)"
              >
                ทำได้โดยได้รับการช่วยเหลือ (2)
              </button>
              <button
                type="button"
                class="option-btn"
                :class="{ 'selected': answers.q5[activity.no] === 3 }"
                @click="setQ5Answer(activity.no, 3)"
              >
                ทำไม่ได้เลย (3)
              </button>
            </div>
          </div>
        </div>

        <!-- Question 6: ใครเป็นคนทำกิจกรรมการเยี่ยมบ้านร่วมกับเด็กเป็นหลัก -->
        <div class="question-section">
          <h4 class="question-title">6. ใครเป็นคนทำกิจกรรมการเยี่ยมบ้านร่วมกับเด็กเป็นหลัก (การเยี่ยมบ้านครั้งนี้)</h4>
          <div class="options-container three-columns">
            <button
              v-for="option in q6Options"
              :key="option.value"
              type="button"
              class="option-btn"
              :class="{ 'selected': answers.q6 === option.value }"
              @click="answers.q6 = option.value"
            >
              {{ option.label }}
            </button>
          </div>
          <div v-if="answers.q6 === 13" class="sub-question-input">
            <label class="form-label">อื่นๆ ระบุ:</label>
            <b-form-input
              v-model="answers.q6_other"
              placeholder="โปรดระบุ..."
            ></b-form-input>
          </div>
        </div>

        <!-- Question 7: มีผู้อื่นร่วมทำกิจกรรมด้วยหรือไม่ -->
        <div class="question-section">
          <h4 class="question-title">7. มีผู้อื่นร่วมทำกิจกรรมด้วยหรือไม่ (มากกว่า 20 นาที)</h4>
          <div class="options-container">
            <button
              type="button"
              class="option-btn"
              :class="{ 'selected': answers.q7 === 3 }"
              @click="answers.q7 = 3"
            >
              ไม่มี (3)
            </button>
            <button
              type="button"
              class="option-btn"
              :class="{ 'selected': answers.q7 === 1 }"
              @click="answers.q7 = 1"
            >
              มี (1)
            </button>
          </div>
          <!-- Sub-question when "มี" is selected -->
          <div v-if="answers.q7 === 1" class="sub-question">
            <h5 class="sub-question-title">ใครเป็นผู้ร่วมทำกิจกรรม</h5>
            <div class="options-container multi-select">
              <button
                v-for="option in q71Options"
                :key="option.value"
                type="button"
                class="option-btn"
                :class="{ 'selected': answers.q71 && answers.q71.includes(option.value) }"
                @click="toggleQ71Answer(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            <div v-if="answers.q71 && answers.q71.includes(13)" class="sub-question-input">
              <label class="form-label">อื่นๆ โปรดระบุ:</label>
              <b-form-input
                v-model="answers.q71_des"
                placeholder="โปรดระบุ..."
              ></b-form-input>
            </div>
          </div>
        </div>

        <!-- Question 8: มีเด็กคนอื่นร่วมทำกิจกรรมไปพร้อมกับเด็ก -->
        <div class="question-section">
          <h4 class="question-title">8. มีเด็กคนอื่นร่วมทำกิจกรรมไปพร้อมกับเด็กกลุ่มตัวอย่างหรือไม่ (เด็กอายุไม่เกิน 5 ขวบ)</h4>
          <div class="options-container">
            <button
              type="button"
              class="option-btn"
              :class="{ 'selected': answers.q8 === 1 }"
              @click="answers.q8 = 1"
            >
              มี (1)
            </button>
            <button
              type="button"
              class="option-btn"
              :class="{ 'selected': answers.q8 === 3 }"
              @click="answers.q8 = 3"
            >
              ไม่มี (3)
            </button>
          </div>
        </div>

        <!-- Question 9: Dynamic Activities for current visit (Mockup) -->
        <div class="question-section">
          <h4 class="question-title">9. ให้ผู้เยี่ยมบ้าน <strong>สังเกต</strong> หรือ <strong>ทบทวน</strong> กิจกรรมการเยี่ยมบ้านครั้งนี้</h4>
          <p class="question-subtitle">กิจกรรมจากการเยี่ยมบ้านครั้งนี้</p>
          <div v-for="(activity, index) in q9Activities" :key="activity.no" class="activity-block">
            <div class="activity-title">{{ index + 1 }}. {{ activity.title }}</div>
            <div class="options-container">
              <button
                type="button"
                class="option-btn"
                :class="{ 'selected': answers.q9[activity.no] === 1 }"
                @click="setQ9Answer(activity.no, 1)"
              >
                ทำได้เอง (1)
              </button>
              <button
                type="button"
                class="option-btn"
                :class="{ 'selected': answers.q9[activity.no] === 2 }"
                @click="setQ9Answer(activity.no, 2)"
              >
                ทำได้โดยได้รับการช่วยเหลือ (2)
              </button>
              <button
                type="button"
                class="option-btn"
                :class="{ 'selected': answers.q9[activity.no] === 3 }"
                @click="setQ9Answer(activity.no, 3)"
              >
                ทำไม่ได้เลย (3)
              </button>
            </div>
          </div>
        </div>

        <!-- Question 10: Notes Section -->
        <div class="question-section">
          <h4 class="question-title">10. บันทึกผู้เยี่ยมบ้าน</h4>
          <b-form-textarea
            v-model="answers.notes"
            placeholder="กรอกข้อมูล..."
            rows="6"
            class="notes-textarea"
          ></b-form-textarea>
        </div>

        <!-- Image Upload Section -->
        <div class="question-section">
          <h4 class="question-title">11. รูปภาพการเยี่ยมบ้าน</h4>
          
          <!-- Image 1: รูปของเล่น/สื่ออุปกรณ์ -->
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

          <!-- Image 2: รูปเด็กและผู้ปกครองทำกิจกรรม -->
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
            <span v-else>
              <i class="fas fa-check-circle mr-2"></i>
              บันทึกและสิ้นสุด
            </span>
          </b-button>
        </div>
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
        visitDate: null
      },
      answers: {
        q1: null,
        q1_des: '',
        q2: null,
        q2_des: '',
        q3: [],
        q3_des: '',
        q4: null,
        q5: {},
        q6: null,
        q6_other: '',
        q7: null,
        q71: [],
        q71_des: '',
        q8: null,
        q9: {},
        notes: ''
      },
      images: {
        image1: null,
        image2: null
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
      q3Options: [
        { value: 1, label: 'แม่ (1)' },
        { value: 2, label: 'พ่อ (2)' },
        { value: 3, label: 'ย่า (3)' },
        { value: 4, label: 'ยาย (4)' },
        { value: 5, label: 'ปู่ (5)' },
        { value: 6, label: 'ตา (6)' },
        { value: 7, label: 'พี่ชาย (7)' },
        { value: 8, label: 'พี่สาว (8)' },
        { value: 9, label: 'น้องชาย (9)' },
        { value: 10, label: 'น้องสาว (10)' },
        { value: 11, label: 'ลุง/ป้า/น้า/อา (11)' },
        { value: 12, label: 'ไม่ใช่ญาติ (12)' },
        { value: 13, label: 'อื่นๆ (13)' }
      ],
      q6Options: [
        { value: 1, label: 'แม่ (1)' },
        { value: 2, label: 'พ่อ (2)' },
        { value: 3, label: 'ย่า (3)' },
        { value: 4, label: 'ยาย (4)' },
        { value: 5, label: 'ปู่ (5)' },
        { value: 6, label: 'ตา (6)' },
        { value: 7, label: 'พี่ชาย (7)' },
        { value: 8, label: 'พี่สาว (8)' },
        { value: 9, label: 'น้องชาย (9)' },
        { value: 10, label: 'น้องสาว (10)' },
        { value: 11, label: 'ลุง/ป้า/น้า/อา (11)' },
        { value: 12, label: 'ไม่ใช่ญาติ (12)' },
        { value: 13, label: 'อื่นๆ (13)' }
      ],
      q71Options: [
        { value: 1, label: 'แม่ (1)' },
        { value: 2, label: 'พ่อ (2)' },
        { value: 3, label: 'ย่า (3)' },
        { value: 4, label: 'ยาย (4)' },
        { value: 5, label: 'ปู่ (5)' },
        { value: 6, label: 'ตา (6)' },
        { value: 7, label: 'พี่ชาย (7)' },
        { value: 8, label: 'พี่สาว (8)' },
        { value: 9, label: 'น้องชาย (9)' },
        { value: 10, label: 'น้องสาว (10)' },
        { value: 11, label: 'ลุง/ป้า/น้า/อา (11)' },
        { value: 12, label: 'ไม่ใช่ญาติ (12)' },
        { value: 13, label: 'อื่นๆ (13)' }
      ],
      // Mockup activities for Q5 (previous visit)
      q5Activities: [
        { no: 'A1', title: 'กิจกรรมตัวอย่างที่ 1 - เล่นกับลูกบอล' },
        { no: 'A2', title: 'กิจกรรมตัวอย่างที่ 2 - อ่านหนังสือนิทาน' },
        { no: 'A3', title: 'กิจกรรมตัวอย่างที่ 3 - ร้องเพลง' }
      ],
      // Mockup activities for Q9 (current visit)
      q9Activities: [
        { no: 'B1', title: 'กิจกรรมตัวอย่างที่ 1 - เล่นต่อบล็อก' },
        { no: 'B2', title: 'กิจกรรมตัวอย่างที่ 2 - ระบายสี' },
        { no: 'B3', title: 'กิจกรรมตัวอย่างที่ 3 - เล่นของเล่นเสริมพัฒนาการ' }
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
    toggleQ3Answer(value) {
      const index = this.answers.q3.indexOf(value)
      if (index === -1) {
        this.answers.q3.push(value)
      } else {
        this.answers.q3.splice(index, 1)
      }
    },
    toggleQ71Answer(value) {
      if (!this.answers.q71) {
        this.answers.q71 = []
      }
      const index = this.answers.q71.indexOf(value)
      if (index === -1) {
        this.answers.q71.push(value)
      } else {
        this.answers.q71.splice(index, 1)
      }
    },
    setQ5Answer(activityNo, value) {
      this.$set(this.answers.q5, activityNo, value)
    },
    setQ9Answer(activityNo, value) {
      this.$set(this.answers.q9, activityNo, value)
    },
    triggerFileInput(index) {
      const refName = `fileInput${index}`
      if (this.$refs[refName]) {
        this.$refs[refName].click()
      }
    },
    handleFileInput(event, index) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (index === 0) {
            this.images.image1 = e.target.result
          } else {
            this.images.image2 = e.target.result
          }
        }
        reader.readAsDataURL(file)
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
    async handleSubmit() {
      if (!this.isFormReady) {
        this.$toast.error('กรุณาเลือกข้อมูลครบถ้วน', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      this.isSubmitting = true

      try {
        // TODO: Implement API call to save survey data
        // Combine form and answers for submission
        const submissionData = {
          ...this.form,
          answers: this.answers
        }
        
        console.log('Survey Data:', submissionData)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.$toast.success('บันทึกข้อมูลสำเร็จ', 'สำเร็จ')
      } catch (error) {
        console.error('Error saving survey:', error)
        this.$toast.error(
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
          'ข้อผิดพลาด'
        )
      } finally {
        this.isSubmitting = false
      }
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

.question-subtitle {
  color: #6c757d;
  margin-bottom: 1rem;
  font-size: 0.95rem;
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

.options-container.three-columns {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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

.sub-question {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #fff;
  border-radius: 0.375rem;
  border-left: 4px solid #3551a4;
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

.activity-block {
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.activity-title {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.75rem;
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

  .options-container.three-columns {
    grid-template-columns: 1fr;
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
</style>
