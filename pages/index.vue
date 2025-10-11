<template>
  <div class="dashboard">
    <Loading :show="loading" :message="loadingMessage" />
    
  

    <!-- Stats Cards -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon stat-icon-total">
              <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ patients.length }}</div>
          <div class="stat-label">ผู้รับการประเมินทั้งหมด</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-scheduled">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ scheduledCount }}</div>
          <div class="stat-label">มีนัดหมายแล้ว</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-pending">
          <i class="fas fa-calendar-plus"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ pendingCount }}</div>
          <div class="stat-label">รอนัดหมาย</div>
        </div>
      </div>
    </div>
    
    <!-- Patients List -->
    <div class="patients-card">
      <div class="patients-header">
        <h3 class="patients-title">
          <i class="fas fa-list"></i>
              รายการผู้รับบริการ
        </h3>
      </div>
      <div class="patients-body">
        <div v-if="patients.length === 0" class="empty-state">
          <i class="fas fa-user-plus"></i>
          <p>ยังไม่มีข้อมูลผู้รับบริการ</p>
            <button class="btn btn-primary" @click="showAddPatientModal">
            เพิ่มผู้รับบริการแรก
            </button>
          </div>
        <div v-else class="table-responsive">
          <table class="patients-table">
                <thead>
                  <tr>
                <th class="col-name">ชื่อ-นามสกุล</th>
                <th class="col-nickname">ชื่อเล่น</th>
                <th class="col-appointment">วันนัดหมาย</th>
                <th class="col-actions">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
              <tr v-for="(patient, index) in patients" :key="patient.id" class="patient-row">
                <td class="col-name">
                  <a href="#" class="patient-name-link" @click.prevent="editPatient(patient)">
                    <i class="fas fa-user"></i>
                    {{ patient.name }}
                      </a>
                    </td>
                <td class="col-nickname">
                  <span class="nickname-badge">{{ patient.nickname }}</span>
                </td>
                <td class="col-appointment">
                      <button
                    class="appointment-btn"
                    :class="patient.appointmentDate ? 'appointment-set' : 'appointment-none'"
                        @click="scheduleAppointment(patient)"
                      >
                    <i :class="patient.appointmentDate ? 'fas fa-calendar-check' : 'fas fa-calendar-plus'"></i>
                    {{ patient.appointmentDate ? formatAppointmentDate(patient.appointmentDate, patient.appointmentTime) : 'กำหนดนัดหมาย' }}
                      </button>
                    </td>
                <td class="col-actions">
                  <div class="action-buttons-group">
                    <button class="action-btn btn-visit" @click="recordVisit(patient)" title="บันทึกการเยี่ยม">
                      <i class="fas fa-file-alt"></i>
                      <span>บันทึกการเยี่ยม</span>
                    </button>
                  </div>
                </td>
                  </tr>
                </tbody>
              </table>
        </div>
      </div>
    </div>

    <!-- Edit Patient Modal -->
    <b-modal
      id="editPatientModal"
      v-model="showEditModal"
      title="แก้ไขข้อมูล"
      no-close-on-backdrop
      @ok="savePatientEdit"
      @hidden="resetEditForm"
    >
      <b-form @submit.prevent="savePatientEdit">
        <b-form-group label="ชื่อ-นามสกุล" label-for="edit-name">
          <b-form-input
            id="edit-name"
            v-model="editForm.name"
            disabled
            placeholder="ชื่อ-นามสกุล"
          ></b-form-input>
        </b-form-group>
        <b-form-group label="ชื่อเล่น" label-for="edit-nickname">
          <b-form-input
            id="edit-nickname"
            v-model="editForm.nickname"
            disabled
            placeholder="ชื่อเล่น"
          ></b-form-input>
        </b-form-group>
        <b-form-group 
          label="เบอร์โทรศัพท์" 
          label-for="edit-phone"
          :invalid-feedback="editFormErrors.phone"
          :state="editFormErrors.phone ? false : null"
        >
          <b-form-input
            id="edit-phone"
            v-model.trim="editForm.phone"
            placeholder="เบอร์โทรศัพท์ (เช่น 081-234-5678)"
            :state="editFormErrors.phone ? false : null"
            @input="clearEditError('phone')"
            @blur="validateEditPhone"
          ></b-form-input>
        </b-form-group>
        <b-form-group 
          label="ที่อยู่" 
          label-for="edit-address"
          :invalid-feedback="editFormErrors.address"
          :state="editFormErrors.address ? false : null"
        >
          <b-form-textarea
            id="edit-address"
            v-model.trim="editForm.address"
            placeholder="ที่อยู่"
            rows="3"
            :state="editFormErrors.address ? false : null"
            @input="clearEditError('address')"
            @blur="validateEditAddress"
          ></b-form-textarea>
        </b-form-group>
      </b-form>
      <template #modal-footer="{ ok, cancel }">
        <b-button variant="secondary" @click="cancel()">
          ยกเลิก
        </b-button>
        <b-button variant="primary" @click="ok()">
          บันทึก
        </b-button>
      </template>
    </b-modal>

    <!-- Schedule Appointment Modal -->
    <b-modal
      id="scheduleAppointmentModal"
      v-model="showAppointmentModal"
      title="นัดหมายใหม่"
      size="lg"
      no-close-on-backdrop
      @ok="saveAppointment"
      @hidden="resetAppointmentForm"
      header-class="modal-header-custom"
    >
      <b-form @submit.prevent="saveAppointment">
        <b-form-group label="ชื่อ-นามสกุล" label-for="appointment-name">
          <b-form-input
            id="appointment-name"
            v-model="appointmentForm.name"
            disabled
            placeholder="ชื่อ-นามสกุล"
          ></b-form-input>
        </b-form-group>

        <b-row>
          <b-col cols="4">
            <b-form-group 
              label="วัน" 
              label-for="appointment-day"
              :invalid-feedback="appointmentFormErrors.day"
              :state="appointmentFormErrors.day ? false : null"
            >
              <b-form-select
                id="appointment-day"
                v-model="appointmentForm.day"
                :options="currentDayOptions"
                :state="appointmentFormErrors.day ? false : null"
                @change="clearAppointmentError('day')"
              ></b-form-select>
            </b-form-group>
          </b-col>
          <b-col cols="4">
            <b-form-group 
              label="เดือน" 
              label-for="appointment-month"
              :invalid-feedback="appointmentFormErrors.month"
              :state="appointmentFormErrors.month ? false : null"
            >
              <b-form-select
                id="appointment-month"
                v-model="appointmentForm.month"
                :options="monthOptions"
                :state="appointmentFormErrors.month ? false : null"
                @change="onMonthChange"
              ></b-form-select>
            </b-form-group>
          </b-col>
          
          <b-col cols="4">
            <b-form-group 
              label="ปี" 
              label-for="appointment-year"
              :invalid-feedback="appointmentFormErrors.year"
              :state="appointmentFormErrors.year ? false : null"
            >
              <b-form-select
                id="appointment-year"
                v-model="appointmentForm.year"
                :options="yearOptions"
                :state="appointmentFormErrors.year ? false : null"
                @change="onYearChange"
              ></b-form-select>
            </b-form-group>
          </b-col>
        </b-row>

        <b-form-group 
          label="เวลาเริ่มต้นการเยี่ยมบ้าน" 
          label-for="appointment-time"
          :invalid-feedback="appointmentFormErrors.time"
          :state="appointmentFormErrors.time ? false : null"
        >
          <b-form-select
            id="appointment-time"
            v-model="appointmentForm.time"
            :options="timeOptions"
            :state="appointmentFormErrors.time ? false : null"
            @change="clearAppointmentError('time')"
          ></b-form-select>
        </b-form-group>

        <div class="appointment-info">
          <p class="font-weight-bold">(เดือนที่ 33 / ครั้งที่ 3)</p>
        </div>

        <b-row>
          <b-col cols="6">
            <div class="info-section">
              <h6 class="font-weight-bold">กิจกรรม</h6>
              <ul class="list-unstyled small">
                <li>เปิด 7 - รอบรรยายความรู้ไข้เดินแอ - รอบราวทุกไข้ เปิดอินสามบึ้งเด็ก 1 ขัน เปิดลงอ่านฟังดั้งกล่วงที่ยวาลฐบน</li>
              </ul>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="info-section">
              <h6 class="font-weight-bold">จุดประสงค์</h6>
              <ul class="list-unstyled small">
                <li>เด็กสร้างบ้าน เด็ญถึงบัฐรรทุกบพานบ้าน และขอขึ้งใด้รว่า ฬด ไกล และ ไกล</li>
              </ul>
            </div>
          </b-col>
        </b-row>

        <b-row>
          <b-col cols="12">
            <div class="info-section">
              <h6 class="font-weight-bold">เพลง - ทุกครอบจึงเมลงพังที่เหมาะสมคำของไข้ก่อบกล้วบแต่</h6>
            </div>
          </b-col>
        </b-row>
      </b-form>
      <template #modal-footer="{ ok, cancel }">
        <b-button variant="secondary" @click="cancel()">
          ย้อนกลับ
        </b-button>
        <b-button variant="primary" @click="ok()">
          บันทึก
        </b-button>
      </template>
    </b-modal>

    <!-- Visit Record Modal -->
    <b-modal
      id="visitRecordModal"
      v-model="showVisitModal"
      title="แบบบันทึกข้อมูลสำหรับผู้เยี่ยมบ้าน"
      size="lg"
      no-close-on-backdrop
      @hidden="resetVisitForm"
      header-class="modal-header-visit"
    >
      <b-form>
        <div class="visit-staff-info">
          <i class="fas fa-user-tie"></i>
          <span><strong>STAFF:</strong> น.ส.สีเนาะ กาลานต</span>
        </div>

        <div class="visit-info-grid">
          <div class="info-item">
            <label><i class="fas fa-calendar-alt"></i> วันที่เยี่ยมบ้าน</label>
            <div class="info-value">{{ visitForm.visitDate }}</div>
          </div>

          <div class="info-item">
            <label><i class="fas fa-user"></i> ชื่อ-นามสกุล</label>
            <div class="info-value">{{ visitForm.patientName }}</div>
          </div>

          <div class="info-item">
            <label><i class="fas fa-id-badge"></i> ชื่อเล่น</label>
            <div class="info-value">{{ visitForm.nickname }}</div>
          </div>

          <div class="info-item full-width">
            <label><i class="fas fa-clock"></i> เวลาเริ่มต้นการเยี่ยมบ้าน</label>
            <b-form-select
              v-model="visitForm.startTime"
              :options="timeOptions"
              class="custom-select-visit"
            ></b-form-select>
          </div>
        </div>
      </b-form>

      <template #modal-footer="{ cancel }">
        <b-button variant="secondary" @click="cancel()">
          <i class="fas fa-times"></i>
          ปิด
        </b-button>
        <b-button variant="primary" @click="continueToSurvey">
          <i class="fas fa-arrow-right"></i>
          ไปที่แบบสอบถาม
        </b-button>
      </template>
    </b-modal>

    <!-- Add Patient Modal -->
    <b-modal
      id="addPatientModal"
      v-model="showAddModal"
      title="เพิ่มผู้รับบริการใหม่"
      no-close-on-backdrop
      @ok="addNewPatient"
      @hidden="resetAddForm"
    >
      <b-form @submit.prevent="addNewPatient">
        <b-form-group 
          label-for="add-name"
          :invalid-feedback="addFormErrors.name"
          :state="addFormErrors.name ? false : null"
        >
          <template #label>
            ชื่อ-นามสกุล <span class="text-danger">*</span>
          </template>
          <b-form-input
            id="add-name"
            v-model.trim="addForm.name"
            placeholder="ชื่อ-นามสกุล"
            :state="addFormErrors.name ? false : null"
            @input="clearAddError('name')"
            @blur="validateAddName"
          ></b-form-input>
        </b-form-group>
        <b-form-group 
          label-for="add-nickname"
          :invalid-feedback="addFormErrors.nickname"
          :state="addFormErrors.nickname ? false : null"
        >
          <template #label>
            ชื่อเล่น <span class="text-danger">*</span>
          </template>
          <b-form-input
            id="add-nickname"
            v-model.trim="addForm.nickname"
            placeholder="ชื่อเล่น"
            :state="addFormErrors.nickname ? false : null"
            @input="clearAddError('nickname')"
            @blur="validateAddNickname"
          ></b-form-input>
        </b-form-group>
        <b-form-group 
          label="เบอร์โทรศัพท์" 
          label-for="add-phone"
          :invalid-feedback="addFormErrors.phone"
          :state="addFormErrors.phone ? false : null"
        >
          <b-form-input
            id="add-phone"
            v-model.trim="addForm.phone"
            placeholder="เบอร์โทรศัพท์ (เช่น 081-234-5678)"
            :state="addFormErrors.phone ? false : null"
            @input="clearAddError('phone')"
            @blur="validateAddPhone"
          ></b-form-input>
        </b-form-group>
        <b-form-group 
          label="ที่อยู่" 
          label-for="add-address"
          :invalid-feedback="addFormErrors.address"
          :state="addFormErrors.address ? false : null"
        >
          <b-form-textarea
            id="add-address"
            v-model.trim="addForm.address"
            placeholder="ที่อยู่"
            rows="3"
            :state="addFormErrors.address ? false : null"
            @input="clearAddError('address')"
          ></b-form-textarea>
        </b-form-group>
      </b-form>
      <template #modal-footer="{ ok, cancel }">
        <b-button variant="secondary" @click="cancel()">
          ยกเลิก
        </b-button>
        <b-button variant="primary" @click="ok()">
          บันทึก
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  layout: 'admin',
  middleware: 'auth',
  data() {
    return {
      patients: [
        {
          id: 1,
          name: 'นายสมชาย ใจดี',
          nickname: 'ชาย',
          phone: '081-234-5678',
          address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
          appointmentDate: '2568-10-15',
          appointmentTime: '09:00 น.'
        },
        {
          id: 2,
          name: 'นางสาวสมหญิง รักดี',
          nickname: 'หญิง',
          phone: '082-345-6789',
          address: '456 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400',
          appointmentDate: '2568-10-20',
          appointmentTime: '14:00 น.'
        },
        {
          id: 3,
          name: 'นายวิชัย ทรงพล',
          nickname: 'ชัย',
          phone: '083-456-7890',
          address: '789 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10320',
          appointmentDate: null,
          appointmentTime: null
        },
        {
          id: 4,
          name: 'นางพิมพ์ใจ สวยงาม',
          nickname: 'พิม',
          phone: '084-567-8901',
          address: '321 ซอยสุขสวัสดิ์ แขวงบางมด เขตทุ่งครุ กรุงเทพฯ 10140',
          appointmentDate: '2568-10-18',
          appointmentTime: '10:00 น.'
        },
        {
          id: 5,
          name: 'นายประยุทธ์ มั่นคง',
          nickname: 'ยุทธ์',
          phone: '085-678-9012',
          address: '654 ถนนพระราม 4 แขวงพระโขนง เขตคลองเตย กรุงเทพฯ 10110',
          appointmentDate: null,
          appointmentTime: null
        },
        {
          id: 6,
          name: 'นางสาวอรุณี สดใส',
          nickname: 'อรุณ',
          phone: '086-789-0123',
          address: '987 ถนนศรีนครินทร์ แขวงหนองบอน เขตประเวศ กรุงเทพฯ 10250',
          appointmentDate: '2568-10-22',
          appointmentTime: '15:00 น.'
        }
      ],
      loading: false,
      loadingMessage: 'กำลังโหลดข้อมูล...',
      showEditModal: false,
      showAppointmentModal: false,
      showVisitModal: false,
      showAddModal: false,
      editForm: {
        id: null,
        name: '',
        nickname: '',
        phone: '',
        address: ''
      },
      editFormErrors: {},
      appointmentForm: {
        id: null,
        name: '',
        month: null,
        day: null,
        year: null,
        time: '16:00 น.'
      },
      appointmentFormErrors: {},
      visitForm: {
        id: null,
        patientName: '',
        nickname: '',
        visitDate: '',
        startTime: '16:00 น.'
      },
      addForm: {
        name: '',
        nickname: '',
        phone: '',
        address: ''
      },
      addFormErrors: {},
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
    scheduledCount() {
      return this.patients.filter(p => p.appointmentDate).length
    },
    pendingCount() {
      return this.patients.filter(p => !p.appointmentDate).length
    },
    currentDayOptions() {
      // Calculate days in month based on selected month and year
      const month = this.appointmentForm.month
      const year = this.appointmentForm.year
      
      if (!month || !year) {
        // Return all days if month or year not selected
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
      // Generate year options (current year - 2 to current year + 2)
      const currentYear = new Date().getFullYear() + 543 // Thai Buddhist year
      for (let i = currentYear - 2; i <= currentYear + 2; i++) {
        this.yearOptions.push({ value: i, text: i.toString() })
      }
    },
    // Check if year is leap year
    isLeapYear(year) {
      // Convert Thai Buddhist year to Gregorian year
      const gregorianYear = year - 543
      return (gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) || (gregorianYear % 400 === 0)
    },
    // Get number of days in a specific month and year
    getDaysInMonth(month, year) {
      // Days in each month (non-leap year)
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      
      // Adjust for leap year (February)
      if (month === 2 && this.isLeapYear(year)) {
        return 29
      }
      
      return daysInMonth[month - 1]
    },
    // Generate day options array
    generateDayOptions(maxDays) {
      const options = []
      for (let i = 1; i <= maxDays; i++) {
        options.push({ value: i, text: i.toString() })
      }
      return options
    },
    // Handle month change
    onMonthChange() {
      this.clearAppointmentError('month')
      
      // Check if selected day is valid for new month
      if (this.appointmentForm.day && this.appointmentForm.year) {
        const daysInMonth = this.getDaysInMonth(
          this.appointmentForm.month,
          this.appointmentForm.year
        )
        
        // If selected day exceeds days in month, reset to last day of month
        if (this.appointmentForm.day > daysInMonth) {
          this.appointmentForm.day = daysInMonth
          this.$toast.info(`เดือนนี้มี ${daysInMonth} วัน ปรับวันที่เป็น ${daysInMonth} แล้ว`)
        }
      }
    },
    // Handle year change
    onYearChange() {
      this.clearAppointmentError('year')
      
      // Check if selected day is valid for new year (affects Feb in leap year)
      if (this.appointmentForm.day && this.appointmentForm.month === 2) {
        const daysInMonth = this.getDaysInMonth(2, this.appointmentForm.year)
        
        // If selected day exceeds days in February, reset to last day
        if (this.appointmentForm.day > daysInMonth) {
          this.appointmentForm.day = daysInMonth
          this.$toast.info(`กุมภาพันธ์ปีนี้มี ${daysInMonth} วัน ปรับวันที่เป็น ${daysInMonth} แล้ว`)
        }
      }
    },
    // Edit Patient Form Validation
    validateEditPhone() {
      if (this.editForm.phone && this.editForm.phone.length > 0) {
        const phoneRegex = /^[0-9\-\s()]+$/
        if (!phoneRegex.test(this.editForm.phone)) {
          this.editFormErrors.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
          return false
        }
        if (this.editForm.phone.replace(/[^0-9]/g, '').length < 9) {
          this.editFormErrors.phone = 'เบอร์โทรศัพท์ต้องมีอย่างน้อย 9 หลัก'
          return false
        }
      }
      delete this.editFormErrors.phone
      return true
    },
    validateEditAddress() {
      if (this.editForm.address && this.editForm.address.length > 500) {
        this.editFormErrors.address = 'ที่อยู่ยาวเกินไป (สูงสุด 500 ตัวอักษร)'
        return false
      }
      delete this.editFormErrors.address
      return true
    },
    clearEditError(field) {
      if (this.editFormErrors[field]) {
        delete this.editFormErrors[field]
      }
    },
    validateEditForm() {
      this.editFormErrors = {}
      const phoneValid = this.validateEditPhone()
      const addressValid = this.validateEditAddress()
      return phoneValid && addressValid
    },
    editPatient(patient) {
      this.editForm = {
        id: patient.id,
        name: patient.name,
        nickname: patient.nickname,
        phone: patient.phone || '',
        address: patient.address || ''
      }
      this.editFormErrors = {}
      this.showEditModal = true
    },
    savePatientEdit(bvModalEvt) {
      bvModalEvt.preventDefault()
      
      if (!this.validateEditForm()) {
        return
      }
      
      // Update patient in local array
      const patientIndex = this.patients.findIndex(p => p.id === this.editForm.id)
      if (patientIndex !== -1) {
        this.patients[patientIndex] = {
          ...this.patients[patientIndex],
          phone: this.editForm.phone,
          address: this.editForm.address
        }
      }
        
        this.$toast.success('บันทึกข้อมูลสำเร็จ')
        
        this.$nextTick(() => {
          this.showEditModal = false
        })
    },
    resetEditForm() {
      this.editForm = {
        id: null,
        name: '',
        nickname: '',
        phone: '',
        address: ''
      }
      this.editFormErrors = {}
    },
    // Appointment Form Validation
    validateAppointmentDate() {
      if (!this.appointmentForm.month) {
        this.appointmentFormErrors.month = 'กรุณาเลือกเดือน'
        return false
      }
      if (!this.appointmentForm.day) {
        this.appointmentFormErrors.day = 'กรุณาเลือกวัน'
        return false
      }
      if (!this.appointmentForm.year) {
        this.appointmentFormErrors.year = 'กรุณาเลือกปี'
        return false
      }
      
      // Validate date using calendar calculation
      const daysInMonth = this.getDaysInMonth(
        this.appointmentForm.month,
        this.appointmentForm.year
      )
      
      if (this.appointmentForm.day > daysInMonth) {
        this.appointmentFormErrors.day = `เดือนนี้มีเพียง ${daysInMonth} วัน`
        return false
      }
      
      // Check if date is in the past (optional warning)
      const selectedDate = new Date(
        this.appointmentForm.year - 543,
        this.appointmentForm.month - 1,
        this.appointmentForm.day
      )
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        this.appointmentFormErrors.day = 'ไม่สามารถเลือกวันที่ในอดีตได้'
        return false
      }
      
      delete this.appointmentFormErrors.month
      delete this.appointmentFormErrors.day
      delete this.appointmentFormErrors.year
      return true
    },
    validateAppointmentTime() {
      if (!this.appointmentForm.time) {
        this.appointmentFormErrors.time = 'กรุณาเลือกเวลา'
        return false
      }
      delete this.appointmentFormErrors.time
      return true
    },
    clearAppointmentError(field) {
      if (this.appointmentFormErrors[field]) {
        delete this.appointmentFormErrors[field]
      }
    },
    validateAppointmentForm() {
      this.appointmentFormErrors = {}
      const dateValid = this.validateAppointmentDate()
      const timeValid = this.validateAppointmentTime()
      return dateValid && timeValid
    },
    scheduleAppointment(patient) {
      const now = new Date()
      const thaiYear = now.getFullYear() + 543
      
      this.appointmentForm = {
        id: patient.id,
        name: `${patient.name} (${patient.nickname})`,
        month: now.getMonth() + 1,
        day: now.getDate(),
        year: thaiYear,
        time: patient.appointmentTime || '16:00 น.'
      }
      this.appointmentFormErrors = {}
      this.showAppointmentModal = true
    },
    saveAppointment(bvModalEvt) {
      bvModalEvt.preventDefault()
      
      if (!this.validateAppointmentForm()) {
        return
      }
      
      // Update patient in local array
        const patient = this.patients.find(p => p.id === this.appointmentForm.id)
        if (patient) {
          patient.appointmentDate = `${this.appointmentForm.year}-${String(this.appointmentForm.month).padStart(2, '0')}-${String(this.appointmentForm.day).padStart(2, '0')}`
          patient.appointmentTime = this.appointmentForm.time
          
          this.$toast.success('บันทึกนัดหมายสำเร็จ')
          
          this.$nextTick(() => {
            this.showAppointmentModal = false
        })
      }
    },
    resetAppointmentForm() {
      this.appointmentForm = {
        id: null,
        name: '',
        month: null,
        day: null,
        year: null,
        time: '16:00 น.'
      }
      this.appointmentFormErrors = {}
    },
    recordVisit(patient) {
      const now = new Date()
      const day = now.getDate()
      const month = this.getThaiMonth(now.getMonth())
      const thaiYear = now.getFullYear() + 543
      
      this.visitForm = {
        id: patient.id,
        patientName: patient.name,
        nickname: patient.nickname,
        visitDate: `${day} ${month} ${thaiYear}`,
        startTime: patient.appointmentTime || '16:00 น.'
      }
      this.showVisitModal = true
    },
    saveVisitRecord() {
      // Demo: Just show success message
      this.$toast.success('บันทึกการเยี่ยมสำเร็จ')
    },
    resetVisitForm() {
      this.visitForm = {
        id: null,
        patientName: '',
        nickname: '',
        visitDate: '',
        startTime: '16:00 น.'
      }
    },
    goToSurvey(patient) {
      // Store patient info for survey
      localStorage.setItem('surveyPatient', JSON.stringify(patient))
      // Navigate to survey page
      this.$router.push('/survey')
    },
    continueToSurvey() {
      // Close modal and go to survey
      this.showVisitModal = false
      this.goToSurvey(this.patients.find(p => p.id === this.visitForm.id))
    },
    // Add Patient Form Validation
    validateAddName() {
      if (!this.addForm.name || this.addForm.name.trim().length === 0) {
        this.addFormErrors.name = 'กรุณากรอกชื่อ-นามสกุล'
        return false
      }
      if (this.addForm.name.length < 2) {
        this.addFormErrors.name = 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'
        return false
      }
      if (this.addForm.name.length > 100) {
        this.addFormErrors.name = 'ชื่อยาวเกินไป (สูงสุด 100 ตัวอักษร)'
        return false
      }
      delete this.addFormErrors.name
      return true
    },
    validateAddNickname() {
      if (!this.addForm.nickname || this.addForm.nickname.trim().length === 0) {
        this.addFormErrors.nickname = 'กรุณากรอกชื่อเล่น'
        return false
      }
      if (this.addForm.nickname.length < 2) {
        this.addFormErrors.nickname = 'ชื่อเล่นต้องมีอย่างน้อย 2 ตัวอักษร'
        return false
      }
      if (this.addForm.nickname.length > 50) {
        this.addFormErrors.nickname = 'ชื่อเล่นยาวเกินไป (สูงสุด 50 ตัวอักษร)'
        return false
      }
      delete this.addFormErrors.nickname
      return true
    },
    validateAddPhone() {
      if (this.addForm.phone && this.addForm.phone.length > 0) {
        const phoneRegex = /^[0-9\-\s()]+$/
        if (!phoneRegex.test(this.addForm.phone)) {
          this.addFormErrors.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
          return false
        }
        if (this.addForm.phone.replace(/[^0-9]/g, '').length < 9) {
          this.addFormErrors.phone = 'เบอร์โทรศัพท์ต้องมีอย่างน้อย 9 หลัก'
          return false
        }
      }
      delete this.addFormErrors.phone
      return true
    },
    validateAddAddress() {
      if (this.addForm.address && this.addForm.address.length > 500) {
        this.addFormErrors.address = 'ที่อยู่ยาวเกินไป (สูงสุด 500 ตัวอักษร)'
        return false
      }
      delete this.addFormErrors.address
      return true
    },
    clearAddError(field) {
      if (this.addFormErrors[field]) {
        delete this.addFormErrors[field]
      }
    },
    validateAddForm() {
      this.addFormErrors = {}
      const nameValid = this.validateAddName()
      const nicknameValid = this.validateAddNickname()
      const phoneValid = this.validateAddPhone()
      const addressValid = this.validateAddAddress()
      return nameValid && nicknameValid && phoneValid && addressValid
    },
    showAddPatientModal() {
      this.addFormErrors = {}
      this.showAddModal = true
    },
    addNewPatient(bvModalEvt) {
      bvModalEvt.preventDefault()
      
      if (!this.validateAddForm()) {
        return
      }
      
      // Add patient to local array
      const newId = Math.max(...this.patients.map(p => p.id), 0) + 1
      this.patients.push({
        id: newId,
          name: this.addForm.name,
          nickname: this.addForm.nickname,
          phone: this.addForm.phone,
          address: this.addForm.address,
          appointmentDate: null,
          appointmentTime: null
        })
        
        this.$toast.success('เพิ่มผู้รับบริการสำเร็จ')
        
        this.$nextTick(() => {
          this.showAddModal = false
        })
    },
    resetAddForm() {
      this.addForm = {
        name: '',
        nickname: '',
        phone: '',
        address: ''
      }
      this.addFormErrors = {}
    },
    formatAppointmentDate(dateStr, timeStr) {
      if (!dateStr) return 'ยังไม่ได้นัดหมาย'
      
      const date = new Date(dateStr)
      const day = date.getDate()
      const month = this.getThaiMonth(date.getMonth())
      const year = date.getFullYear() + 543
      
      return `${day} ${month} ${year} ${timeStr || ''}`
    },
    getThaiMonth(monthIndex) {
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ]
      return thaiMonths[monthIndex]
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

/* Welcome Section */
.welcome-section {
  background: linear-gradient(135deg, #3551a4 0%, #2c4088 100%);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(53, 81, 164, 0.2);
}

.welcome-content {
  flex: 1;
}

.welcome-title {
  color: white;
  font-size: 1.75rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.welcome-title i {
  font-size: 1.5rem;
}

.welcome-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin: 0;
}

.btn-add-patient {
  background: white;
  color: #3551a4;
  border: none;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-add-patient:hover {
  background: #f8f9fa;
}

.btn-add-patient i {
  font-size: 1.1rem;
}

/* Stats Container */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: white;
}

.stat-icon-total {
  background: linear-gradient(135deg, #3551a4, #2c4088);
}

.stat-icon-scheduled {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.stat-icon-pending {
  background: linear-gradient(135deg, #ffc107, #ff9800);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.95rem;
  color: #6c757d;
  font-weight: 400;
}

/* Patients Card */
.patients-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.patients-header {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.patients-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.patients-title i {
  color: #3551a4;
}

.patients-body {
  padding: 1.5rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

/* Patients Table */
.table-responsive {
  overflow-x: auto;
}

.patients-table {
  width: 100%;
  border-collapse: collapse;
}

.patients-table thead tr {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.patients-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.patients-table th.col-no {
  width: 80px;
  text-align: center;
}

.patients-table th.col-nickname {
  width: 150px;
}

.patients-table th.col-appointment {
  width: 250px;
}

.patients-table th.col-actions {
  width: 280px;
  text-align: center;
}

.patient-row {
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
}

.patient-row:hover {
  background-color: #f8f9fa;
}

.patients-table td {
  padding: 1rem;
  vertical-align: middle;
}

.col-no {
  text-align: center;
  font-weight: 500;
  color: #6c757d;
}

.patient-name-link {
  color: #3551a4;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.patient-name-link:hover {
  color: #2c4088;
  text-decoration: underline;
}

.patient-name-link i {
  font-size: 0.9rem;
}

.nickname-badge {
  display: inline-block;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1976d2;
  padding: 0.4rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.appointment-btn {
  width: 100%;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.appointment-none {
  background: linear-gradient(135deg, #fff9e6, #ffe9a0);
  color: #856404;
  border: 1px solid #ffc107;
}

.appointment-none:hover {
  background: linear-gradient(135deg, #ffe9a0, #ffd54f);
}

.appointment-set {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #2e7d32;
  border: 1px solid #4caf50;
}

.appointment-set:hover {
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
}

.action-buttons-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.action-btn {
  background: linear-gradient(135deg, #3551a4, #2c4088);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover {
  background: linear-gradient(135deg, #2c4088, #1f2f5f);
}

.btn-survey {
  background: linear-gradient(135deg, #17a2b8, #138496);
}

.btn-survey:hover {
  background: linear-gradient(135deg, #138496, #0f6674);
}

.action-btn i {
  font-size: 1rem;
}

.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
  margin-bottom: 1.5rem;
}

.card-header {
  padding: 1rem 1.5rem;
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.card-title i {
  margin-right: 0.5rem;
  color: #0ea5e9;
}

.card-body {
  padding: 1.5rem;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  margin-bottom: 0;
  color: #212529;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 0.75rem;
  vertical-align: middle;
  border-top: 1px solid #dee2e6;
}

.table thead th {
  vertical-align: bottom;
  border-bottom: 2px solid #dee2e6;
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.025);
}

.btn-appointment-none {
  background-color: #fff9c4;
  border-color: #fff176;
  color: #333;
  font-weight: 500;
}

.btn-appointment-none:hover {
  background-color: #fff176;
  border-color: #fff176;
  color: #333;
}

.btn-appointment-set {
  background-color: #c8e6c9;
  border-color: #81c784;
  color: #333;
  font-weight: 500;
}

.btn-appointment-set:hover {
  background-color: #81c784;
  border-color: #81c784;
  color: #fff;
}

.modal-header-custom {
  background-color: #003d7a;
  color: white;
}

.modal-header-visit {
  background: linear-gradient(135deg, #3551a4, #2c4088);
  color: white;
  border-bottom: none;
}

.modal-header-visit .modal-title {
  font-weight: 600;
}

.visit-staff-info {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1976d2;
  font-size: 0.95rem;
}

.visit-staff-info i {
  font-size: 1.2rem;
}

.visit-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-item label i {
  color: #3551a4;
  font-size: 0.95rem;
}

.info-value {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
  color: #2c3e50;
  font-weight: 500;
}

.custom-select-visit {
  /* padding: 0 0.875rem; */
  /* border: 2px solid #dee2e6; */
  /* border-radius: 0.75rem; */
  font-size: 1.2rem;
  height: 50px;
  color: #495057;
  font-weight: 500;
  background-color: white;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.custom-select-visit:focus {
  border-color: #3551a4;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(53, 81, 164, 0.15);
}

.appointment-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  text-align: center;
}

.info-section {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  min-height: 120px;
}

.info-section h6 {
  margin-bottom: 0.5rem;
  color: #003d7a;
}

.info-section ul {
  margin-bottom: 0;
}

.info-section ul li {
  line-height: 1.5;
}

/* Custom Bootstrap Vue Modal styles */
.modal-dialog {
  max-width: 600px;
}

.modal-dialog.modal-lg {
  max-width: 900px;
}

.modal-dialog.modal-xl {
  max-width: 1200px;
}

.text-danger {
  color: #dc3545;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .welcome-title {
    font-size: 1.4rem;
    justify-content: center;
  }
  
  .welcome-subtitle {
    font-size: 0.95rem;
  }
  
  .btn-add-patient {
    width: 100%;
    justify-content: center;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .patients-table {
    font-size: 0.875rem;
  }
  
  .patients-table th,
  .patients-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .appointment-btn,
  .action-btn {
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
  }
  
  .action-buttons-group {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .action-btn span {
    display: none;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .visit-info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .visit-staff-info {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .welcome-section {
    padding: 1.5rem;
  }
  
  .welcome-title {
    font-size: 1.2rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .stat-number {
    font-size: 1.75rem;
  }
  
  .stat-label {
    font-size: 0.85rem;
  }
  
  .patients-table th,
  .patients-table td {
    padding: 0.5rem 0.25rem;
  }
  
  .nickname-badge {
    font-size: 0.8rem;
    padding: 0.3rem 0.5rem;
  }
}
</style>
