<template>
  <div class="dashboard">
    <Loading :show="loading" :message="loadingMessage" />
    

    
    <!-- Patients List -->
    <div class="patients-card">
      <div class="patients-body">
        <div v-if="visitors.length === 0" class="empty-state">
          <i class="fas fa-user-plus"></i>
          <p>ยังไม่มีข้อมูลผู้เยี่ยมบ้าน</p>
           
          </div>
        <div v-else class="patients-grid">
          <!-- Grid Header -->
          <div class="grid-header-row">
            <div class="grid-header-col">ชื่อ (ชื่อเล่น)</div>
            <div class="grid-header-col">วันนัดหมาย (กิจกรรม)</div>
            <div class="grid-header-col">บันทึกการเยี่ยมบ้าน</div>
            <div class="grid-header-col">แก้ไข</div>
          </div>

          <!-- Grid Body -->
          <div v-for="(visitor, index) in visitors" :key="visitor.id" class="patient-card-row">
            <div class="card-col card-col-name" @click="editPatient(visitor)">
              <div class="card-name">{{ visitor.name }}</div>
              <div class="card-nickname">({{ visitor.nickname }})</div>
            </div>
            
            <div 
              class="card-col card-col-appointment"
              :class="{
                'has-appointment': visitor.appointmentDate,
                'no-appointment': !visitor.appointmentDate,
                'disabled-appointment': !visitor.canEditAppointment
              }"
              @click="visitor.canEditAppointment ? scheduleAppointment(visitor) : null"
              :style="{ cursor: visitor.canEditAppointment ? 'pointer' : 'not-allowed' }"
            >
              <div v-if="visitor.appointmentDate" class="appointment-date">
                <div class="appointment-date">{{ formatAppointmentDateShort(visitor.appointmentDate) }}</div>
                <div class="appointment-time">{{ visitor.appointmentTime }}  <template v-if="visitor.month_age && visitor.time">
                  ({{ visitor.month_age }}/{{ visitor.time }})
                </template></div>
               
              </div>
              <div v-else class="appointment-placeholder">
                ยังไม่ได้กำหนดวันนัดหมาย

              </div>
            </div>

            <div 
              class="card-col card-col-visit"
              :class="{
                'visit-ready': visitor.appointmentDate && canRecordVisit(visitor),
                'visit-disabled': !visitor.appointmentDate || !canRecordVisit(visitor),
                'visit-completed': visitor.currentSurveyCompleted && visitor.currentSurveySynced,
                'visit-warning': visitor.currentSurveyNote && !visitor.currentSurveyApproved,
                'visit-pending-upload': visitor.currentSurveyCompleted && !visitor.currentSurveySynced
              }"
              @click="visitor.appointmentDate && canRecordVisit(visitor) ? recordVisit(visitor) : null"
              :style="{ cursor: visitor.appointmentDate && canRecordVisit(visitor) ? 'pointer' : 'not-allowed' }"
            >
              <!-- กรณีทำแบบทดสอบเสร็จแล้วแต่ยังไม่ sync -->
              <div v-if="visitor.currentSurveyCompleted && !visitor.currentSurveySynced" class="visit-text-disabled">
                รอการอัพโหลด<br>ขึ้นระบบ
              </div>
              <!-- กรณีมี note จาก API และยังไม่อนุมัติ -->
              <div v-else-if="visitor.currentSurveyCompleted && visitor.currentSurveySynced && !visitor.currentSurveyApproved && visitor.currentSurveyNote" class="visit-text-warning">
                {{ visitor.currentSurveyNote }}
              </div>
              <!-- กรณีบันทึกเรียบร้อยแล้วแต่ยังไม่อนุมัติ และไม่มี note -->
              <div v-else-if="visitor.currentSurveyCompleted && visitor.currentSurveySynced && !visitor.currentSurveyApproved && !visitor.currentSurveyNote" class="visit-text-disabled">
                บันทึกเรียบร้อย
              </div>
              <!-- กรณีรอการอนุมัติ (ครั้งที่แล้วยังไม่อนุมัติ) - เช็คเฉพาะ time >= 2 -->
              <div v-else-if="!canRecordVisit(visitor) && visitor.appointmentDate && visitor.time >= 2" class="visit-text-disabled">
                รอการอนุมัติ<br>จากระบบ
              </div>
              <!-- กรณีพร้อมบันทึก -->
              <div v-else-if="visitor.appointmentDate && canRecordVisit(visitor)" class="visit-text">
                บันทึกเยี่ยมบ้าน
              </div>
              <!-- กรณียังไม่ได้บันทึก -->
              <div v-else class="visit-text-disabled">
                ยังไม่ได้บันทึก<br>การเยี่ยมบ้าน
              </div>
            </div>

            <div 
              class="card-col card-col-edit" 
              :class="{ 'card-col-disabled': !visitor.hasCompletedSurveys }"
              @click="visitor.hasCompletedSurveys ? showVisitHistory(visitor) : null"
              :style="{ cursor: visitor.hasCompletedSurveys ? 'pointer' : 'not-allowed' }"
            >
              <div class="edit-text">แก้ไขการเยี่ยมบ้าน</div>
            </div>
          </div>
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
          label-for="edit-tel"
          :invalid-feedback="editFormErrors.tel"
          :state="editFormErrors.tel ? false : null"
        >
          <b-form-input
            id="edit-tel"
            v-model.trim="editForm.tel"
            placeholder="เบอร์โทรศัพท์ (เช่น 0812345678)"
            :state="editFormErrors.tel ? false : null"
            @input="clearEditError('tel')"
            @blur="validateEditTel"
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
                @change="onDayChange"
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

        <div v-if="appointmentForm.monthAge !== null && appointmentForm.timeVisit !== null" class="appointment-info">
          <p class="font-weight-bold">(เดือนที่ {{ appointmentForm.monthAge }} / ครั้งที่ {{ appointmentForm.timeVisit }})</p>
        </div>

        <div v-if="appointmentForm.activities && appointmentForm.activities.length > 0">
          <b-row>
            <b-col cols="6">
              <div class="info-section">
                <h6 class="font-weight-bold">กิจกรรม</h6>
                <div>
                  <p v-for="(activity, idx) in appointmentForm.activities" :key="'activity-' + idx" v-show="activity.activity" style="white-space: pre-line; margin: 0 0 0.5rem 0; font-size: 1.15rem; line-height: 1.4;">{{ activity.activity }}</p>
                </div>
              </div>
            </b-col>
            <b-col cols="6">
              <div class="info-section">
                <h6 class="font-weight-bold">จุดประสงค์</h6>
                <div>
                  <p v-for="(activity, idx) in appointmentForm.activities" :key="'objective-' + idx" v-show="activity.objective" style="white-space: pre-line; margin: 0 0 0.5rem 0; font-size: 1.15rem; line-height: 1.4;">{{ activity.objective }}</p>
                </div>
              </div>
            </b-col>
          </b-row>
        </div>
        <div v-else class="alert alert-info">
          <i class="fas fa-info-circle"></i>
          ไม่พบข้อมูลกิจกรรมสำหรับเดือนที่ {{ appointmentForm.monthAge }} ครั้งที่ {{ appointmentForm.timeVisit }}
        </div>
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
          เริ่มทำแบบสอบถาม
        </b-button>
      </template>
    </b-modal>

    <!-- Visit History Modal -->
    <b-modal
      id="visitHistoryModal"
      v-model="showVisitHistoryModal"
      title="ประวัติการเยี่ยมบ้าน"
      size="xl"
      no-close-on-backdrop
      @hidden="resetVisitHistoryForm"
      header-class="modal-header-visit"
    >
      <div class="visit-history-header">
        <div class="patient-info-bar">
          <i class="fas fa-user-circle"></i>
          <span class="patient-name-large">{{ visitHistoryForm.patientName }}</span>
          <span class="patient-nickname-badge">({{ visitHistoryForm.nickname }})</span>
        </div>
      </div>

      <div v-if="visitHistoryForm.visits && visitHistoryForm.visits.length > 0" class="visit-history-list">
        <div v-for="(visit, index) in visitHistoryForm.visits" :key="index" class="visit-history-row">
          <div class="visit-card visit-card-date">
            <i class="fas fa-calendar-day"></i>
            <div class="visit-card-content">
              <div class="visit-number-badge">ครั้งที่ {{ visit.visitNumber }}</div>
              <div class="visit-date-text">{{ formatVisitDate(visit.date) }}</div>
              <div class="visit-time-text">{{ visit.time }}</div>
              <div class="visit-status-badges">
                <span v-if="!visit.synced" class="badge badge-warning">
                 รอ Sync
                </span>
                <span v-else-if="!visit.approved" class="badge badge-secondary">
                  รออนุมัติ
                </span>
                <span v-else class="badge badge-success">
                   อนุมัติแล้ว
                </span>
              </div>
            </div>
          </div>
          
          <div 
            class="visit-card visit-card-action visit-card-edit-record" 
            :class="{ 'disabled': visit.approved }"
            @click="visit.approved ? null : editVisitRecord(visit)"
          >
            <i class="fas fa-edit"></i>
            <span>แก้ไขบันทึกการเยี่ยม</span>
          </div>

          <div 
            class="visit-card visit-card-action visit-card-edit-photos" 
            :class="{ 'disabled': visit.approved }"
            @click="visit.approved ? null : editVisitPhotos(visit)"
          >
            <i class="fas fa-images"></i>
            <span>แก้ไขรูปภาพ</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-visit-history">
        <i class="fas fa-folder-open"></i>
        <p>ยังไม่มีประวัติการเยี่ยมบ้าน</p>
      </div>

      <template #modal-footer="{ cancel }">
        <b-button variant="secondary" @click="cancel()">
          <i class="fas fa-times"></i>
          ปิด
        </b-button>
      </template>
    </b-modal>

    <!-- Edit Photo Modal -->
    <b-modal
      id="editPhotoModal"
      v-model="showEditPhotoModal"
      title="แก้ไขรูปภาพกิจกรรม"
      size="xl"
      no-close-on-backdrop
      @hidden="resetEditPhotoForm"
      header-class="modal-header-visit"
    >
      <div class="edit-photo-content">
        <div class="patient-info-bar-small">
          <i class="fas fa-user-circle"></i>
          <span>{{ editPhotoForm.patientName }}</span>
          <span class="badge badge-info">ครั้งที่ {{ editPhotoForm.visitNumber }}</span>
        </div>

        <div class="dual-image-container">
          <!-- Image 1 -->
          <div class="image-section">
            <h6>รูปภาพที่ 1</h6>
            <div v-if="editPhotoForm.currentImages[0]" class="current-image-section">
              <div class="image-preview-large">
                <img :src="editPhotoForm.currentImages[0]" alt="Current photo 1">
                <button class="btn-remove-current" @click="removeCurrentImage(0)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div v-else class="no-image-section">
              <i class="fas fa-image"></i>
              <p>ยังไม่มีรูปภาพ</p>
            </div>
            <div class="upload-new-section">
              <b-button variant="warning" @click="$refs.photoInput1.click()">
                <i class="fas fa-upload"></i>
                อัพโหลดรูปที่ 1
              </b-button>
              <input
                ref="photoInput1"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handlePhotoSelect($event, 0)"
              >
            </div>
          </div>

          <!-- Image 2 -->
          <div class="image-section">
            <h6>รูปภาพที่ 2</h6>
            <div v-if="editPhotoForm.currentImages[1]" class="current-image-section">
              <div class="image-preview-large">
                <img :src="editPhotoForm.currentImages[1]" alt="Current photo 2">
                <button class="btn-remove-current" @click="removeCurrentImage(1)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div v-else class="no-image-section">
              <i class="fas fa-image"></i>
              <p>ยังไม่มีรูปภาพ</p>
            </div>
            <div class="upload-new-section">
              <b-button variant="warning" @click="$refs.photoInput2.click()">
                <i class="fas fa-upload"></i>
                อัพโหลดรูปที่ 2
              </b-button>
              <input
                ref="photoInput2"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handlePhotoSelect($event, 1)"
              >
            </div>
          </div>
        </div>
      </div>

      <template #modal-footer="{ cancel }">
        <b-button variant="secondary" @click="cancel()">
          <i class="fas fa-times"></i>
          ยกเลิก
        </b-button>
        <b-button variant="primary" @click="savePhotoEdit">
          <i class="fas fa-save"></i>
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
      visitors: [], // รายชื่อผู้รับบริการจาก IndexedDB
      loading: false,
      loadingMessage: 'กำลังโหลดข้อมูล...',
      isSyncingQueue: false, // ป้องกันการซิงค์ซ้อน
      syncQueueTimeout: null, // ใช้สำหรับดีเลย์คำสั่ง
      showEditModal: false,
      showAppointmentModal: false,
      showVisitModal: false,
      showVisitHistoryModal: false,
      showAddModal: false,
      showEditPhotoModal: false,
      editForm: {
        id: null,
        stid: null,
        name: '',
        nickname: '',
        tel: '',
        address: ''
      },
      editFormErrors: {},
      appointmentForm: {
        id: null,
        name: '',
        month: null,
        day: null,
        year: null,
        time: '16:00 น.',
        monthAge: null,
        timeVisit: null,
        activities: [],
        visitorBirthMonth: null,
        visitorBirthYear: null,
        existingBooking: null
      },
      appointmentFormErrors: {},
      visitForm: {
        id: null,
        patientName: '',
        nickname: '',
        visitDate: '',
        startTime: '16:00 น.'
      },
      visitHistoryForm: {
        id: null,
        stid: null,
        patientName: '',
        nickname: '',
        visits: [],
        totalVisits: 48
      },
      editPhotoForm: {
        surveyId: null,
        patientName: '',
        visitNumber: null,
        currentImages: [],
        currentImageKeys: [],
        newImages: [],
        newImagePreviews: [],
        removeCurrentPhotos: []
      },
      addForm: {
        name: '',
        nickname: '',
        tel: '',
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
      return this.visitors.filter(v => v.appointmentDate).length
    },
    pendingCount() {
      return this.visitors.filter(v => !v.appointmentDate).length
    },
    currentDayOptions() {
      // คำนวณจำนวนวันในเดือนตามเดือนและปีที่เลือก
      const month = this.appointmentForm.month
      const year = this.appointmentForm.year
      
      if (!month || !year) {
        // คืนค่าทุกวันถ้ายังไม่ได้เลือกเดือนหรือปี
        return this.generateDayOptions(31)
      }
      
      const daysInMonth = this.getDaysInMonth(month, year)
      return this.generateDayOptions(daysInMonth)
    }
  },
  async mounted() {
    this.initDateOptions()
    this.updateVisitorsCount()
    
    // เริ่มต้นระบบ
    await this.initializeSystem()
    
    // รอรับการแจ้งเตือนเมื่อซิงค์เสร็จ
    this.$nuxt.$on('sync-completed', this.handleSyncCompleted)
    
    // รอรับการแจ้งเตือนเมื่อสถานะออนไลน์เปลี่ยน
    window.addEventListener('online', this.handleOnlineStatusChange)
    window.addEventListener('offline', this.handleOnlineStatusChange)
  },
  beforeDestroy() {
    // ลบการรับฟังเหตุการณ์
    this.$nuxt.$off('sync-completed', this.handleSyncCompleted)
    window.removeEventListener('online', this.handleOnlineStatusChange)
    window.removeEventListener('offline', this.handleOnlineStatusChange)
    
    // ยกเลิกตัวจับเวลา
    if (this.syncQueueTimeout) {
      clearTimeout(this.syncQueueTimeout)
    }
  },
  watch: {
    visitors: {
      handler() {
        this.updateVisitorsCount()
      },
      deep: true
    },
    '$store.state.isOnline'(newValue, oldValue) {
      // เมื่อ online status เปลี่ยนจาก offline เป็น online
      if (newValue && !oldValue) {
        this.handleOnlineStatusChange()
      }
    }
  },
  methods: {
    updateVisitorsCount() {
      this.$store.commit('setPatientsCount', this.visitors.length)
    },
    async addToSyncQueue(item) {
      try {
        await this.$indexedDB.addToSyncQueue(item)
      } catch (error) {
        // จัดการข้อผิดพลาด
      }
    },
    async processSyncQueue() {
      // ป้องกันการซิงค์ซ้อน
      if (this.isSyncingQueue) {
        return
      }
      
      if (!this.$store.state.isOnline) {
        return
      }
      
      this.isSyncingQueue = true
      
      try {
        const queueItems = await this.$indexedDB.getSyncQueue()
        
        if (queueItems.length === 0) {
          return
        }
        
        let successCount = 0
        let failCount = 0
        
        for (const item of queueItems) {
          try {
            if (item.type === 'UPDATE_VISITOR') {
              // ซิงค์ไปยัง API
              await this.$axios.$put(
                '/parenting2025_census/put/homevisit/putdata_arr.php',
                item.payload
              )
              
              // อัพเดทข้อมูลใน IndexedDB ว่าซิงค์แล้ว
              const existingVisitor = await this.$indexedDB.getVisitor(item.stid)
              if (existingVisitor) {
                await this.$indexedDB.updateVisitor({
                  ...existingVisitor,
                  ...item.data,
                  dataSource: 'api',
                  lastSyncedAt: new Date().toISOString()
                })
              }
              
              // ลบออกจากคิว
              await this.$indexedDB.removeFromSyncQueue(item.id)
              successCount++
            }
          } catch (error) {
            failCount++
          }
        }
        
        if (successCount > 0) {
          this.$toast.success(`ซิงค์ข้อมูลสำเร็จ ${successCount} รายการ`)
          // โหลดข้อมูลใหม่เพื่ออัพเดทหน้าจอ
          await this.loadVisitors()
        }
        
        if (failCount > 0) {
          this.$toast.warning(`ซิงค์ข้อมูลล้มเหลว ${failCount} รายการ`)
        }
      } catch (error) {
        // จัดการข้อผิดพลาดคิวซิงค์
      } finally {
        // ปลดล็อกเมื่อเสร็จสิ้น
        this.isSyncingQueue = false
      }
    },
    async handleOnlineStatusChange() {
      if (this.$store.state.isOnline) {
        // ยกเลิกตัวจับเวลาก่อนหน้า ถ้ามี
        if (this.syncQueueTimeout) {
          clearTimeout(this.syncQueueTimeout)
        }
        
        // หน่วงเวลา 2 วินาที ป้องกันการเรียกซ้ำจากหลายเหตุการณ์
        this.syncQueueTimeout = setTimeout(async () => {
          // ซิงค์ข้อมูลผู้รับบริการจากคิว
          await this.processSyncQueue()
          
          // TODO: ซิงค์การนัดหมายที่แก้ไขออฟไลน์
          
          const username = this.$offlineAuth?.getUser?.()?.username
          if (this.$systemInit && username) {
            try {
              // ส่งการนัดหมายที่ยังไม่ซิงค์ก่อน
              await this.$systemInit.pushBookingsToAPI()
              
              // ส่งผลการทำแบบทดสอบที่ยังไม่ซิงค์
              await this.$systemInit.pushSurveyResultsToAPI()
              
              // จากนั้นดึงการนัดหมายล่าสุดจาก API
              await this.$systemInit.syncBookings(username)
              
              // ซิงค์ผลการบันทึกเยี่ยมบ้าน
              await this.$systemInit.syncSurveyResults(username)
              
              // โหลดข้อมูลใหม่พร้อมการนัดหมายที่อัพเดท
              await this.loadVisitors()
            } catch (error) {
              // จัดการข้อผิดพลาดการซิงค์นัดหมาย
            }
          }
        }, 2000)
      }
    },
    async initializeSystem() {
      try {
        this.loading = true
        this.loadingMessage = 'กำลังเริ่มต้นระบบ...'
        
        // เริ่มต้นระบบผ่าน store
        await this.$store.dispatch('initializeSystem', this)
        
        // ซิงค์ข้อมูลถ้าออนไลน์
        const username = this.$offlineAuth?.getUser?.()?.username
        if (this.$store.state.isOnline && username) {
          this.loadingMessage = 'กำลังซิงค์ข้อมูลผู้รับบริการ...'
          await this.$systemInit.syncVisitors(username)
          
          // TODO: ปิดการซิงค์การนัดหมายไว้ชั่วคราว
          
          this.loadingMessage = 'กำลังซิงค์ข้อมูลการนัดหมาย...'
          await this.$systemInit.syncBookings(username)
          
          // ส่งการนัดหมายที่ยังไม่ซิงค์
          this.loadingMessage = 'กำลังส่งข้อมูลการนัดหมาย...'
          await this.$systemInit.pushBookingsToAPI()
          
          // ส่งผลการทำแบบทดสอบที่ยังไม่ซิงค์
          this.loadingMessage = 'กำลังส่งผลการทำแบบทดสอบ...'
          await this.$systemInit.pushSurveyResultsToAPI()
          
          // ซิงค์ผลการบันทึกเยี่ยมบ้าน
          this.loadingMessage = 'กำลังซิงค์ผลการบันทึกเยี่ยมบ้าน...'
          await this.$systemInit.syncSurveyResults(username)
          
        }
        
        // โหลดข้อมูลผู้รับบริการจาก IndexedDB
        this.loadingMessage = 'กำลังโหลดข้อมูลผู้รับบริการ...'
        await this.loadVisitors()
        
        this.loading = false
      } catch (error) {
        this.loading = false
        this.$toast.error('เกิดข้อผิดพลาดในการเริ่มต้นระบบ')
      }
    },
    async handleSyncCompleted() {
      try {
        await this.loadVisitors()
      } catch (error) {
        this.$toast.error('ไม่สามารถโหลดข้อมูลใหม่ได้')
      }
    },
    async loadVisitors() {
      try {
        // ดึงชื่อผู้ใช้ปัจจุบัน
        const username = this.$offlineAuth?.getUser?.()?.username
        
        if (!username) {
          return
        }
        
        // โหลดข้อมูลผู้รับบริการจาก IndexedDB
        const visitors = await this.$indexedDB.getVisitorsByHomevisitor(username)
        
        // โหลดข้อมูลการนัดหมายจาก IndexedDB
        const bookings = await this.$indexedDB.getBookings()
        
        // สร้างแผนที่การนัดหมายตาม stid เพื่อค้นหาเร็ว
        const bookingsMap = new Map()
        bookings.forEach(booking => {
          bookingsMap.set(booking.stid, booking)
        })
        
        // จัดเตรียมข้อมูลผู้รับบริการสำหรับแสดงผลและรวมกับการนัดหมาย
        const visitorPromises = visitors.map(async visitor => {
          // สร้างชื่อเต็มจากฟิลด์ที่มี
          let fullName = ''
          if (visitor.stname) {
            fullName = visitor.stname // ถ้ามีชื่อเต็มอยู่แล้ว
          } else if (visitor.prename || visitor.fname || visitor.lname) {
            fullName = `${visitor.prename || ''}${visitor.fname || ''} ${visitor.lname || ''}`.trim()
          }
          
          // ดึงข้อมูลการนัดหมายของผู้รับบริการคนนี้
          const booking = bookingsMap.get(visitor.stid)
          
          // ดึงแบบสอบถามทั้งหมด (รวม completed และไม่ completed)
          const allSurveys = await this.$indexedDB.getAllSurveysByStid(visitor.stid)
          
          // คำนวณว่าสามารถแก้ไขนัดหมายได้หรือไม่
          const timeVisit = booking?.time || 1
          let canEdit = true
          
          // ดึงแบบสอบถามที่ completed เท่านั้น (สำหรับแสดงสถานะ)
          const completedSurveys = allSurveys
            .filter(s => s.completed)
            .sort((a, b) => {
              // เรียงตาม time จากมากไปน้อย
              const timeA = parseInt(a.time) || 0
              const timeB = parseInt(b.time) || 0
              return timeB - timeA
            })
          
          // ดึง survey ของครั้งที่แล้ว (time - 1) สำหรับเช็คการอนุมัติ
          const previousTimeVisit = parseInt(timeVisit) - 1
          const previousCompletedSurvey = completedSurveys.find(s => 
            String(s.time) === String(previousTimeVisit)
          )
          
          // ตรวจสอบว่ามี survey_progress ของครั้งนี้หรือไม่ (ไม่ว่า completed จะเป็นอะไร)
          const currentVisitSurvey = allSurveys.find(s => String(s.time) === String(timeVisit))
          
          // Debug log เพื่อตรวจสอบสถานะ
          if (currentVisitSurvey) {
            console.log(`📊 Survey status for ${visitor.stid} (time: ${timeVisit}):`, {
              completed: currentVisitSurvey.completed,
              synced: currentVisitSurvey.synced,
              approve_status: currentVisitSurvey.approve_status,
              hasAnswers: !!currentVisitSurvey.answers,
              q1: currentVisitSurvey.answers?.q1
            })
          }
          
          if (currentVisitSurvey) {
            // ถ้ามี survey_progress ของครั้งนี้แล้ว
            // ถ้า approve_status = 1 แล้ว ให้ปลดล็อคเพื่อแก้ไขนัดหมายครั้งถัดไปได้
            if (currentVisitSurvey.approve_status === 1) {
              canEdit = true
            } else {
              canEdit = false
            }
          }
          
          // ตรวจสอบว่า time >= 2 แต่ไม่มีข้อมูลครั้งที่แล้ว
          const needsPreviousVisit = parseInt(timeVisit) >= 2 && !previousCompletedSurvey
          
          return {
            id: visitor.stid, // ใช้ stid เป็น id
            stid: visitor.stid,
            name: fullName,
            nickname: visitor.nickname || '',
            tel: visitor.tel || '', // ใช้ชื่อฟิลด์ตรงกับฐานข้อมูล
            address: visitor.address || '',
            // รวมข้อมูลการนัดหมาย
            appointmentDate: booking?.appointmentDate || null,
            appointmentTime: booking?.appointmentTime || null,
            month_age: booking?.month_age || null,
            time: timeVisit,
            dataSource: visitor.dataSource || 'api',
            lastSyncedAt: visitor.lastSyncedAt || null,
            // สถานะการซิงค์แบบสอบถามของครั้งที่แล้ว (สำหรับเช็คว่าสามารถบันทึกครั้งถัดไปได้หรือไม่)
            needsPreviousVisit: needsPreviousVisit, // ต้องบันทึกครั้งที่แล้วก่อน
            latestSurveySynced: previousCompletedSurvey?.synced || false,
            latestSurveyApproved: previousCompletedSurvey?.approve_status === 1,
            // สถานะของการบันทึกเยี่ยมบ้านครั้งปัจจุบัน
            currentSurveyCompleted: currentVisitSurvey?.completed || false,
            currentSurveySynced: currentVisitSurvey?.synced || false,
            currentSurveyApproved: currentVisitSurvey?.approve_status === 1,
            currentSurveyNote: currentVisitSurvey?.note || null,
            // สถานะว่าสามารถแก้ไขนัดหมายได้หรือไม่
            canEditAppointment: canEdit,
            // เก็บข้อมูลว่ามี survey_progress หรือไม่
            hasSurveyProgress: !!currentVisitSurvey,
            // เช็คว่ามีรายการบันทึกเยี่ยมบ้านที่เสร็จแล้วหรือไม่
            hasCompletedSurveys: completedSurveys.length > 0
          }
        })
        
        this.visitors = await Promise.all(visitorPromises)
      } catch (error) {
        this.$toast.error('ไม่สามารถโหลดข้อมูลผู้รับบริการได้')
      }
    },
   
    initDateOptions() {
      // สร้างตัวเลือกปี ปีปัจจุบัน -2 ถึง +2
      const currentYear = new Date().getFullYear() + 543 // ปีพุทธศักราช
      for (let i = currentYear - 2; i <= currentYear + 2; i++) {
        this.yearOptions.push({ value: i, text: i.toString() })
      }
    },
    // ตรวจสอบว่าเป็นปีอธิกสุรทินหรือไม่
    isLeapYear(year) {
      // แปลงปีพุทธศักราชเป็นคริสต์ศักราช
      const gregorianYear = year - 543
      return (gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) || (gregorianYear % 400 === 0)
    },
    // คำนวณจำนวนวันในเดือนและปีที่ระบุ
    getDaysInMonth(month, year) {
      // จำนวนวันในแต่ละเดือน ปีปกติ
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      
      // ปรับสำหรับปีอธิกสุรทิน กุมภาพันธ์
      if (month === 2 && this.isLeapYear(year)) {
        return 29
      }
      
      return daysInMonth[month - 1]
    },
    // สร้างรายการตัวเลือกวัน
    generateDayOptions(maxDays) {
      const options = []
      for (let i = 1; i <= maxDays; i++) {
        options.push({ value: i, text: i.toString() })
      }
      return options
    },
    // จัดการเมื่อเปลี่ยนวัน
    async onDayChange() {
      this.clearAppointmentError('day')
      
      // คำนวณอายุเดือนและกิจกรรมใหม่
      await this.recalculateMonthAgeAndActivities()
    },
    // คำนวณอายุเดือนและกิจกรรมใหม่ตามวันที่ที่เลือก
    async recalculateMonthAgeAndActivities() {
      if (!this.appointmentForm.visitorBirthMonth || !this.appointmentForm.visitorBirthYear) {
        return
      }
      
      if (!this.appointmentForm.month || !this.appointmentForm.year) {
        return
      }
      
      // คำนวณอายุเดือนจากวันเกิดถึงวันที่เลือก
      const selectedYear = this.appointmentForm.year - 543 // แปลงเป็นคริสต์ศักราช
      const selectedMonth = this.appointmentForm.month
      
      const birthYear = this.appointmentForm.visitorBirthYear - 543
      const birthMonth = this.appointmentForm.visitorBirthMonth
      
      let calculatedMonthAge = (selectedYear - birthYear) * 12 + (selectedMonth - birthMonth)
      
      // จำกัดอายุเดือนไว้ที่ 48
      if (calculatedMonthAge > 48) {
        calculatedMonthAge = 48
      }
      
      // อายุเดือนต้องไม่น้อยกว่า 0
      if (calculatedMonthAge < 0) {
        calculatedMonthAge = 0
      }
      
      // คำนวณครั้งที่เยี่ยมตาม booking เดิม
      let timeVisit = 1
      const existingBooking = this.appointmentForm.existingBooking
      
      if (existingBooking && existingBooking.last_visit_date) {
        const selectedDate = new Date(selectedYear, selectedMonth - 1, this.appointmentForm.day || 1)
        const lastVisitDate = new Date(existingBooking.last_visit_date)
        const daysSinceLastVisit = Math.floor((selectedDate - lastVisitDate) / (1000 * 60 * 60 * 24))
        
        if (daysSinceLastVisit > 21) {
          // เกิน 21 วัน รีเซ็ตครั้งที่เยี่ยม
          timeVisit = 1
        } else {
          // 21 วันหรือน้อยกว่า เพิ่มครั้งที่เยี่ยม
          timeVisit = (existingBooking.time || 0) + 1
          
          // ถ้าครั้งก่อนเป็นครั้งที่ 4 ให้เพิ่มอายุเดือนและรีเซ็ตครั้งที่เยี่ยม
          if (existingBooking.time === 4) {
            calculatedMonthAge = (existingBooking.month_age || 0) + 1
            timeVisit = 1
            
            if (calculatedMonthAge > 48) {
              calculatedMonthAge = 48
            }
          } else if (timeVisit > 4) {
            timeVisit = 4
          }
        }
      }
      
      // อัพเดทอายุเดือนและครั้งที่เยี่ยม
      this.appointmentForm.monthAge = calculatedMonthAge
      this.appointmentForm.timeVisit = timeVisit
      
      // ดึงกิจกรรมใหม่
      const activities = await this.$indexedDB.getActivityByMonthAgeAndTime(
        calculatedMonthAge,
        timeVisit
      )
      this.appointmentForm.activities = activities || []
      
      console.log('🔄 Recalculated:', {
        monthAge: calculatedMonthAge,
        timeVisit: timeVisit,
        activities: activities?.length || 0
      })
    },
    // จัดการเมื่อเปลี่ยนเดือน
    async onMonthChange() {
      this.clearAppointmentError('month')
      
      // ตรวจสอบว่าวันที่เลือกใช้ได้กับเดือนใหม่หรือไม่
      if (this.appointmentForm.day && this.appointmentForm.year) {
        const daysInMonth = this.getDaysInMonth(
          this.appointmentForm.month,
          this.appointmentForm.year
        )
        
        // ถ้าวันที่เลือกเกินจำนวนวันในเดือน ปรับเป็นวันสุดท้ายของเดือน
        if (this.appointmentForm.day > daysInMonth) {
          this.appointmentForm.day = daysInMonth
        }
      }
      
      // คำนวณอายุเดือนและกิจกรรมใหม่
      await this.recalculateMonthAgeAndActivities()
    },
    // จัดการเมื่อเปลี่ยนปี
    async onYearChange() {
      this.clearAppointmentError('year')
      
      // ตรวจสอบว่าวันที่เลือกใช้ได้กับปีใหม่หรือไม่ มีผลกับกุมภาพันธ์ในปีอธิกสุรทิน
      if (this.appointmentForm.day && this.appointmentForm.month === 2) {
        const daysInMonth = this.getDaysInMonth(2, this.appointmentForm.year)
        
        // ถ้าวันที่เลือกเกินจำนวนวันในกุมภาพันธ์ ปรับเป็นวันสุดท้าย
        if (this.appointmentForm.day > daysInMonth) {
          this.appointmentForm.day = daysInMonth
        }
      }
      
      // คำนวณอายุเดือนและกิจกรรมใหม่
      await this.recalculateMonthAgeAndActivities()
    },
    // ตรวจสอบความถูกต้องของฟอร์มแก้ไขผู้รับบริการ
    validateEditTel() {
      if (this.editForm.tel && this.editForm.tel.length > 0) {
        const phoneRegex = /^[0-9\-\s()]+$/
        if (!phoneRegex.test(this.editForm.tel)) {
          this.editFormErrors.tel = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
          return false
        }
        if (this.editForm.tel.replace(/[^0-9]/g, '').length < 9) {
          this.editFormErrors.tel = 'เบอร์โทรศัพท์ต้องมีอย่างน้อย 9 หลัก'
          return false
        }
      }
      delete this.editFormErrors.tel
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
      const telValid = this.validateEditTel()
      const addressValid = this.validateEditAddress()
      return telValid && addressValid
    },
    editPatient(patient) {
      this.editForm = {
        id: patient.id,
        stid: patient.stid || null,
        name: patient.name,
        nickname: patient.nickname,
        tel: patient.tel || '',
        address: patient.address || ''
      }
      
      this.editFormErrors = {}
      this.showEditModal = true
    },
    async savePatientEdit(bvModalEvt) {
      bvModalEvt.preventDefault()
      
      if (!this.validateEditForm()) {
        return
      }
      
      try {
        // อัพเดทข้อมูลในรายการ
        const visitorIndex = this.visitors.findIndex(v => v.id === this.editForm.id)
        if (visitorIndex !== -1) {
          this.visitors[visitorIndex] = {
            ...this.visitors[visitorIndex],
            tel: this.editForm.tel,
            address: this.editForm.address
          }
        }
        
        // บันทึกลง IndexedDB ถ้ามี stid
        if (this.editForm.stid) {
          const visitorData = {
            stid: this.editForm.stid,
            tel: this.editForm.tel || null,
            address: this.editForm.address || null,
            dataSource: 'local',
            lastSyncedAt: new Date().toISOString()
          }
          
          // ดึงข้อมูลเดิม
          const existingVisitor = await this.$indexedDB.getVisitor(this.editForm.stid)
          if (existingVisitor) {
            // รวมกับข้อมูลเดิม
            await this.$indexedDB.updateVisitor({
              ...existingVisitor,
              ...visitorData
            })
          }
          
          // ถ้าออนไลน์ ให้ซิงค์กับ API
          if (this.$store.state.isOnline) {
            try {
              const payload = {
                variable: [['tel', 'address']],
                value: [[
                  this.editForm.tel || ''],
                  [this.editForm.address || ''
                ]],
                pk: [['stid']],
                pkval: [[this.editForm.stid]],
                tb: 'homevisitor_sample_students'
              }
              
              await this.$axios.$put(
                '/parenting2025_census/put/homevisit/putdata_arr.php',
                payload
              )
              
              // อัพเดทเป็นซิงค์แล้ว
              if (existingVisitor) {
                await this.$indexedDB.updateVisitor({
                  ...existingVisitor,
                  ...visitorData,
                  dataSource: 'api',
                  lastSyncedAt: new Date().toISOString()
                })
              }
              
              this.$toast.success('บันทึกและซิงค์ข้อมูลสำเร็จ')
            } catch (apiError) {
              this.$toast.warning('บันทึกข้อมูลสำเร็จ แต่ยังไม่ได้ซิงค์กับเซิร์ฟเวอร์')
            }
          } else {
            // เก็บไว้ในคิวเพื่อซิงค์ทีหลังเมื่อออนไลน์
            await this.addToSyncQueue({
              type: 'UPDATE_VISITOR',
              stid: this.editForm.stid,
              data: visitorData,
              payload: {
                variable: [['tel', 'address']],
                value: [[
                  this.editForm.tel || '',
                  this.editForm.address || ''
                ]],
                pk: [['stid']],
                pkval: [[this.editForm.stid]],
                tb: 'homevisitor_sample_students'
              },
              timestamp: new Date().toISOString()
            })
            this.$toast.success('บันทึกข้อมูลสำเร็จ (จะซิงค์เมื่อออนไลน์)')
          }
        } else {
        this.$toast.success('บันทึกข้อมูลสำเร็จ')
        }
        
        // โหลดข้อมูลใหม่เพื่ออัพเดทหน้าจอ
        await this.loadVisitors()
        
        this.$nextTick(() => {
          this.showEditModal = false
        })
      } catch (error) {
        this.$toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      }
    },
    resetEditForm() {
      this.editForm = {
        id: null,
        stid: null,
        name: '',
        nickname: '',
        tel: '',
        address: ''
      }
      this.editFormErrors = {}
    },
    // ตรวจสอบความถูกต้องของฟอร์มนัดหมาย
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
      
      // ตรวจสอบความถูกต้องของวันที่
      const daysInMonth = this.getDaysInMonth(
        this.appointmentForm.month,
        this.appointmentForm.year
      )
      
      if (this.appointmentForm.day > daysInMonth) {
        this.appointmentFormErrors.day = `เดือนนี้มีเพียง ${daysInMonth} วัน`
        return false
      }
      
      // ตรวจสอบว่าเป็นวันที่ในอดีตหรือไม่
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
    async scheduleAppointment(patient) {
      try {
        let month, day, year
        
        // ถ้ามีวันนัดหมายอยู่แล้ว ใช้วันนั้น
        if (patient.appointmentDate) {
          const appointmentDate = new Date(patient.appointmentDate)
          month = appointmentDate.getMonth() + 1
          day = appointmentDate.getDate()
          year = appointmentDate.getFullYear() + 543 // แปลงเป็นปีพุทธศักราช
        } else {
          // ไม่มีวันนัดให้ใช้วันปัจจุบัน
          const now = new Date()
          month = now.getMonth() + 1
          day = now.getDate()
          year = now.getFullYear() + 543
        }
        
        // ดึงข้อมูลผู้รับบริการเพื่อหาวันเกิด
        const visitor = await this.$indexedDB.getVisitor(patient.stid)
        
        // ตรวจสอบว่ามีข้อมูลวันเกิดหรือไม่
        if (!visitor || !visitor.month_birth || !visitor.year_birth) {
          this.$toast.warning('ไม่พบข้อมูลวันเกิดของผู้รับบริการ')
          // ตั้งค่าเริ่มต้นและแสดงฟอร์ม
          this.appointmentForm = {
            id: patient.id,
            name: `${patient.name} (${patient.nickname})`,
            month: month,
            day: day,
            year: year,
            time: patient.appointmentTime || '16:00 น.',
            monthAge: null,
            timeVisit: 1,
            activities: []
          }
          this.appointmentFormErrors = {}
          this.showAppointmentModal = true
          return
        }
        
        // คำนวณอายุเดือนจากวันเกิดถึงวันนี้
        const today = new Date()
        const birthYear = parseInt(visitor.year_birth) - 543 // แปลงพุทธศักราชเป็นคริสต์ศักราช
        const birthMonth = parseInt(visitor.month_birth)
        
        let calculatedMonthAge = (today.getFullYear() - birthYear) * 12 + (today.getMonth() + 1 - birthMonth)
        
        // จำกัดอายุเดือนไว้ที่ 48
        if (calculatedMonthAge > 48) {
          calculatedMonthAge = 48
        }
        
        // อายุเดือนต้องไม่น้อยกว่า 0
        if (calculatedMonthAge < 0) {
          calculatedMonthAge = 0
        }
        
        // ดึงข้อมูลการนัดหมายเดิมเพื่อตรวจสอบว่าเป็นการแก้ไขหรือสร้างใหม่
        const existingBooking = await this.$indexedDB.getBooking(patient.stid)
        
        let monthAge = calculatedMonthAge
        let timeVisit = 1
        
        // ตรวจสอบว่าเป็นการแก้ไขนัดหมายเดิมหรือสร้างใหม่
        if (patient.appointmentDate && existingBooking) {
          // กำลังแก้ไขนัดหมายเดิม เก็บค่าเดิมไว้
          monthAge = existingBooking.month_age || calculatedMonthAge
          timeVisit = existingBooking.time || 1
        } else if (existingBooking && existingBooking.last_visit_date) {
          // กำลังสร้างนัดหมายใหม่ คำนวณจากครั้งสุดท้าย
          const lastVisitDate = new Date(existingBooking.last_visit_date)
          const daysSinceLastVisit = Math.floor((today - lastVisitDate) / (1000 * 60 * 60 * 24))
          
          if (daysSinceLastVisit > 21) {
            // เกิน 21 วัน คำนวณอายุเดือนใหม่และรีเซ็ตครั้งที่เยี่ยม
            monthAge = calculatedMonthAge
            timeVisit = 1
            
            // จำกัดอายุเดือนไว้ที่ 48
            if (monthAge > 48) {
              monthAge = 48
            }
          } else {
            // 21 วันหรือน้อยกว่า ใช้อายุเดือนเดิมและเพิ่มครั้งที่เยี่ยม
            monthAge = existingBooking.month_age || calculatedMonthAge
            timeVisit = (existingBooking.time || 0) + 1
            
            // กรณีพิเศษ ถ้าครั้งก่อนเป็นครั้งที่ 4 ให้เพิ่มอายุเดือนและรีเซ็ตครั้งที่เยี่ยมเป็น 1
            if (existingBooking.time === 4) {
              monthAge = (existingBooking.month_age || 0) + 1
              timeVisit = 1
              
              // จำกัดอายุเดือนไว้ที่ 48
              if (monthAge > 48) {
                monthAge = 48
              }
            } else if (timeVisit > 4) {
              // จำกัดครั้งที่เยี่ยมไว้ที่ 4
              timeVisit = 4
            }
          }
        }
        
        // ดึงข้อมูลกิจกรรมทั้งหมดจาก IndexedDB
        const activities = await this.$indexedDB.getActivityByMonthAgeAndTime(monthAge, timeVisit)
        console.log('📋 Activities loaded:', activities)
        console.log('📊 Activities count:', activities?.length || 0)
        
        // ตั้งค่าฟอร์มนัดหมายพร้อมข้อมูลทั้งหมด
        this.appointmentForm = {
          id: patient.id,
          name: `${patient.name} (${patient.nickname})`,
          month: month,
          day: day,
          year: year,
          time: patient.appointmentTime || '16:00 น.',
          monthAge: monthAge,
          timeVisit: timeVisit,
          activities: activities || [],
          visitorBirthMonth: parseInt(visitor.month_birth),
          visitorBirthYear: parseInt(visitor.year_birth),
          existingBooking: existingBooking
        }
        this.appointmentFormErrors = {}
        this.showAppointmentModal = true
      } catch (error) {
        this.$toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลนัดหมาย')
      }
    },
    async saveAppointment(bvModalEvt) {
      bvModalEvt.preventDefault()
      
      if (!this.validateAppointmentForm()) {
        return
      }
      
      try {
        const visitor = this.visitors.find(v => v.id === this.appointmentForm.id)
        if (!visitor) return
        
        // แปลงปีพุทธศักราชเป็นคริสต์ศักราช
        const christianYear = this.appointmentForm.year - 543
        const appointmentDate = `${christianYear}-${String(this.appointmentForm.month).padStart(2, '0')}-${String(this.appointmentForm.day).padStart(2, '0')}`
        const appointmentTime = this.appointmentForm.time
        
        // ดึงข้อมูล visitor จาก IndexedDB เพื่อเอา fname, lname
        const visitorData = await this.$indexedDB.getVisitor(visitor.stid)
        
        // สร้าง recStart (MySQL format: YYYY-MM-DD HH:MM:SS)
        const now = new Date()
        const recStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        
        // ดึง activity IDs จาก activities array (q1_name ถึง q5_name)
        const activityIds = []
        for (let i = 0; i < 5; i++) {
          if (this.appointmentForm.activities[i]) {
            activityIds.push(this.appointmentForm.activities[i].no || '')
          } else {
            activityIds.push('')
          }
        }
        
        // อัพเดทการแสดงผล
        visitor.appointmentDate = appointmentDate
        visitor.appointmentTime = appointmentTime
        visitor.month_age = this.appointmentForm.monthAge
        visitor.time = this.appointmentForm.timeVisit
        
        // บันทึกลงตารางการนัดหมาย (IndexedDB) - cnt_app จะอัพเดทหลังจาก sync กับ API
        await this.$indexedDB.addBooking({
          stid: visitor.stid,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          month_age: this.appointmentForm.monthAge,
          time: this.appointmentForm.timeVisit,
          last_visit_date: new Date().toISOString(),
          dataSource: 'local',
          lastSyncedAt: new Date().toISOString()
        })
        
        // เรียก API เพื่อบันทึกนัดหมาย
        if (navigator.onLine) {
          try {
            const username = this.$offlineAuth?.getUser?.()?.username
            
            // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
            const checkResponse = await this.$axios.$get(
              '/api/parenting2025_census/get/homevisit/getchildsample_app.php',
              {
                params: {
                  homevisitor: username,
                  stid: visitor.stid,
                  time: this.appointmentForm.timeVisit
                }
              }
            )
            
            // ตรวจสอบว่ามีรายการที่ตรงกับ stid, time และ month_age หรือไม่
            const existingRecord = checkResponse?.results?.find(record => 
              record.stid === visitor.stid && 
              String(record.time) === String(this.appointmentForm.timeVisit) && 
              String(record.month_age) === String(this.appointmentForm.monthAge)
            )
            
            if (existingRecord) {
              // แก้ไขนัดหมาย (เลื่อนนัด) - ใช้ PUT และเพิ่ม cnt_app
              const currentCntApp = parseInt(existingRecord.cnt_app) || 1
              const newCntApp = currentCntApp + 1
              
              await this.$axios.$put(
                '/api/parenting2025_census/put/homevisit/putdata.php',
                {
                  variable: [
                    'time_app_curr',
                    'date_app_curr',
                    'cnt_app',
                    'month_age',
                    'time',
                    'q1_name',
                    'q2_name',
                    'q3_name',
                    'q4_name',
                    'q5_name'
                  ],
                  value: [
                    appointmentTime,        // time_app_curr
                    appointmentDate,        // date_app_curr
                    String(newCntApp),      // cnt_app - จำนวนการเลื่อนนัด (เพิ่มขึ้นทุกครั้งที่แก้ไข)
                    this.appointmentForm.monthAge,
                    this.appointmentForm.timeVisit,
                    activityIds[0],
                    activityIds[1],
                    activityIds[2],
                    activityIds[3],
                    activityIds[4]
                  ],
                  pk: ['stid', 'time'],
                  pkval: [visitor.stid, this.appointmentForm.timeVisit],
                  tb: 'homevisitor_app'
                }
              )
            } else {
              // สร้างนัดหมายครั้งแรก - ใช้ POST (cnt_app = 1)
              await this.$axios.$post(
                '/api/parenting2025_census/post/homevisit/datarecord1row.php',
                {
                  variable: [
                    'recby',
                    'stid',
                    'project',
                    'recStart',
                    'time',
                    'fname_ch',
                    'lname_ch',
                    'month_age',
                    'time',
                    'time_app_first',
                    'date_app_first',
                    'time_app_curr',
                    'date_app_curr',
                    'cnt_app',
                    'q1_name',
                    'q2_name',
                    'q3_name',
                    'q4_name',
                    'q5_name'
                  ],
                  value: [
                    username || '',
                    visitor.stid,
                    '15',
                    recStart,
                    this.appointmentForm.timeVisit,
                    visitorData?.fname || '',
                    visitorData?.lname || '',
                    this.appointmentForm.monthAge,
                    appointmentTime,
                    appointmentTime,  // time_app_first
                    appointmentDate,  // date_app_first
                    appointmentTime,  // time_app_curr
                    appointmentDate,  // date_app_curr
                    '1',              // cnt_app - ค่าเริ่มต้น
                    activityIds[0],
                    activityIds[1],
                    activityIds[2],
                    activityIds[3],
                    activityIds[4]
                  ],
                  tb: 'homevisitor_app'
                }
              )
            }
            
            this.$toast.success('บันทึกนัดหมายและซิงค์กับเซิร์ฟเวอร์สำเร็จ')
          } catch (apiError) {
            console.error('API Error:', apiError)
            this.$toast.warning('บันทึกนัดหมายสำเร็จ แต่ยังไม่ได้ซิงค์กับเซิร์ฟเวอร์')
          }
        } else {
          this.$toast.success('บันทึกนัดหมายสำเร็จ (จะซิงค์เมื่อออนไลน์)')
        }
        
        // โหลดข้อมูล visitors ใหม่เพื่ออัพเดทหน้าจอ
        await this.loadVisitors()
        
        this.$nextTick(() => {
          this.showAppointmentModal = false
        })
      } catch (error) {
        console.error('Save appointment error:', error)
        this.$toast.error('ไม่สามารถบันทึกนัดหมายได้')
      }
    },
    resetAppointmentForm() {
      this.appointmentForm = {
        id: null,
        name: '',
        month: null,
        day: null,
        year: null,
        time: '16:00 น.',
        monthAge: null,
        timeVisit: null,
        activities: [],
        visitorBirthMonth: null,
        visitorBirthYear: null,
        existingBooking: null
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
    async goToSurvey(patient) {
      try {
        // Get booking data for month_age and time
        const booking = await this.$indexedDB.getBooking(patient.stid)
        
        if (!booking || !booking.month_age || !booking.time) {
          this.$toast.error('ไม่พบข้อมูลการนัดหมาย กรุณากำหนดนัดหมายก่อน')
          return
        }
        
        // Store complete survey data including booking info
        const surveyData = {
          ...patient,
          month_age: booking.month_age,
          time: booking.time,
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime || this.visitForm.startTime
        }
        
        localStorage.setItem('surveyPatient', JSON.stringify(surveyData))
        
        // Navigate to survey page
        this.$router.push('/survey')
      } catch (error) {
        this.$toast.error('เกิดข้อผิดพลาดในการเตรียมข้อมูล')
      }
    },
    async continueToSurvey() {
      // ปิดฟอร์มและไปหน้าแบบสอบถาม
      this.showVisitModal = false
      const patient = this.visitors.find(v => v.id === this.visitForm.id)
      if (patient) {
        await this.goToSurvey(patient)
      }
    },
    // ตรวจสอบว่าสามารถบันทึกการเยี่ยมใหม่ได้หรือไม่
    canRecordVisit(visitor) {
      // ถ้าบันทึกครั้งปัจจุบันเสร็จแล้ว (ไม่ว่าจะ sync หรือยัง) ไม่ให้บันทึกซ้ำ
      if (visitor.currentSurveyCompleted) {
        return false
      }
      
      // ครั้งที่ 1 สามารถบันทึกได้เสมอ
      if (!visitor.time || String(visitor.time) === '1') {
        return true
      }
      
      // ครั้งที่ 2+ ต้องซิงค์และอนุมัติแล้วเท่านั้น
      return visitor.latestSurveySynced === true && visitor.latestSurveyApproved === true
    },
    
    // แสดงประวัติการเยี่ยมบ้าน
    async showVisitHistory(patient) {
      try {
        console.log(`📋 Loading visit history for stid: ${patient.stid}`)
        
        // ดึงแบบสอบถามที่เสร็จแล้วทั้งหมดของผู้รับบริการคนนี้ (filter ตาม stid)
        const surveys = await this.$indexedDB.getCompletedSurveysByStid(patient.stid)
        
        console.log(`📋 Found ${surveys.length} completed surveys for ${patient.name} (${patient.stid})`)
        
        // แปลงข้อมูลแบบสอบถามเป็นประวัติการเยี่ยม
        const visits = surveys.map((survey, index) => {
          const visitDate = survey.appointmentDate || survey.timeStart?.split(' ')[0] || ''
          const visitTime = survey.appointmentTime || survey.timeStart?.split(' ')[1] || ''
          
          return {
            id: survey.id,
            surveyId: survey.id,
            date: visitDate,
            time: visitTime,
            patientId: patient.id,
            visitNumber: survey.time || (index + 1),
            timeStart: survey.timeStart,
            timeEnd: survey.timeEnd,
            synced: survey.synced || false,
            approved: survey.approve_status === 1,
            answers: survey.answers,
            surveyImage: survey.surveyImage,
            surveyImageKey: survey.surveyImageKey
          }
        })
        
        console.log(`📋 Prepared ${visits.length} visit records`)
        
        this.visitHistoryForm = {
          id: patient.id,
          stid: patient.stid,
          patientName: patient.name,
          nickname: patient.nickname,
          visits: visits,
          totalVisits: 48
        }
        this.showVisitHistoryModal = true
      } catch (error) {
        console.error('❌ Error loading visit history:', error)
        this.$toast.error('ไม่สามารถโหลดประวัติการเยี่ยมบ้านได้')
      }
    },
    resetVisitHistoryForm() {
      this.visitHistoryForm = {
        id: null,
        stid: null,
        patientName: '',
        nickname: '',
        visits: [],
        totalVisits: 48
      }
    },
    formatVisitDate(dateStr) {
      if (!dateStr) return ''
      
      const date = new Date(dateStr)
      const day = date.getDate()
      const month = this.getThaiMonthFull(date.getMonth())
      const year = date.getFullYear() + 543
      
      return `${day} ${month} ${year}`
    },
    async editVisitRecord(visit) {
      try {
        // ตรวจสอบว่าอนุมัติแล้วหรือไม่ (approve_status == 1)
        if (visit.approved === true) {
          this.$toast.error('ไม่สามารถแก้ไขบันทึกที่อนุมัติแล้ว')
          return
        }
        
        this.showVisitHistoryModal = false
        
        // เก็บข้อมูลแบบสอบถามสำหรับแก้ไข
        const surveyData = {
          mode: 'edit',
          surveyId: visit.surveyId,
          stid: this.visitHistoryForm.stid,
          name: this.visitHistoryForm.patientName,
          nickname: this.visitHistoryForm.nickname,
          time: visit.visitNumber,
          editAllowed: true // อนุญาตให้แก้ไขทั้งหมด
        }
        
        localStorage.setItem('surveyEdit', JSON.stringify(surveyData))
        
        // ไปหน้าแบบสอบถามโหมดแก้ไข
        this.$router.push('/survey?mode=edit&surveyId=' + visit.surveyId)
      } catch (error) {
        this.$toast.error('ไม่สามารถเปิดหน้าแก้ไขบันทึกได้')
      }
    },
    async editVisitPhotos(visit) {
      try {
        // ดึงข้อมูลแบบสอบถามจาก IndexedDB
        const survey = await this.$indexedDB.getSurveyProgressById(visit.surveyId)
        if (!survey) {
          this.$toast.error('ไม่พบข้อมูลการเยี่ยมบ้าน')
          return
        }
        
        let currentImages = []
        let currentImageKeys = []
        
        // Handle both old single image and new array format
        if (survey.surveyImages && Array.isArray(survey.surveyImages)) {
          // New format: array of images
          for (let i = 0; i < survey.surveyImages.length; i++) {
            const img = survey.surveyImages[i]
            
            // Check if it's new object format { base64, url, key }
            if (typeof img === 'object' && img !== null) {
              // Prioritize URL, fallback to base64
              const imageData = img.url || img.base64
              currentImages.push(imageData)
              currentImageKeys.push(survey.surveyImageKeys?.[i] || null)
            } else if (typeof img === 'string') {
              // Old format: string base64
              currentImages.push(img)
              currentImageKeys.push(survey.surveyImageKeys?.[i] || null)
            } else if (survey.surveyImageKeys && survey.surveyImageKeys[i]) {
              // Load from images store
              const imageObject = await this.$indexedDB.getImage(survey.surveyImageKeys[i])
              const imageData = imageObject?.data || imageObject?.image || null
              currentImages.push(imageData)
              currentImageKeys.push(survey.surveyImageKeys[i])
            }
          }
        } else {
          // Old format: single image - convert to array
          let currentImageData = null
          if (survey.surveyImageKey) {
            const imageObject = await this.$indexedDB.getImage(survey.surveyImageKey)
            currentImageData = imageObject?.data || imageObject?.image || null
          } else if (survey.surveyImage) {
            currentImageData = survey.surveyImage
          }
          
          if (currentImageData) {
            currentImages = [currentImageData]
            currentImageKeys = [survey.surveyImageKey || null]
          }
        }
        
        this.editPhotoForm = {
          surveyId: visit.surveyId,
          patientName: this.visitHistoryForm.patientName,
          visitNumber: visit.visitNumber,
          currentImages: currentImages,
          currentImageKeys: currentImageKeys,
          newImages: [],
          newImagePreviews: [],
          removeCurrentPhotos: []
        }
        
        this.showVisitHistoryModal = false
        this.showEditPhotoModal = true
      } catch (error) {
        console.error('❌ Error loading photos:', error)
        this.$toast.error('ไม่สามารถเปิดหน้าแก้ไขรูปภาพได้')
      }
    },
    
    async handlePhotoSelect(event, index) {
      const file = event.target.files[0]
      if (!file) return
      
      // ตรวจสอบขนาดไฟล์ สูงสุด 5MB
      if (file.size > 5 * 1024 * 1024) {
        this.$toast.error('ขนาดไฟล์ใหญ่เกินไป (สูงสุด 5MB)')
        return
      }
      
      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        this.$toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        return
      }
      
      try {
        // แปลงเป็น WebP
        const webpImage = await this.convertToWebP(file)
        
        this.$set(this.editPhotoForm.newImages, index, webpImage)
        this.$set(this.editPhotoForm.newImagePreviews, index, webpImage)
        
        // Update current image preview immediately
        this.$set(this.editPhotoForm.currentImages, index, webpImage)
        
        // รีเซ็ตช่องเลือกไฟล์เพื่อให้เลือกไฟล์เดิมได้อีก
        event.target.value = ''
        
        this.$toast.success(`อัพโหลดรูปภาพที่ ${index + 1} สำเร็จ`)
      } catch (error) {
        this.$toast.error('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ')
      }
    },
    
    async convertToWebP(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        
        reader.onload = (e) => {
          const img = new Image()
          
          img.onload = () => {
            // สร้าง canvas
            const canvas = document.createElement('canvas')
            const maxWidth = 1200
            const maxHeight = 1200
            let width = img.width
            let height = img.height
            
            // คำนวณขนาดใหม่
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height
                height = maxHeight
              }
            }
            
            canvas.width = width
            canvas.height = height
            
            // วาดรูปภาพ
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            
            // แปลงเป็น WebP
            const webpDataUrl = canvas.toDataURL('image/webp', 0.8)
            resolve(webpDataUrl)
          }
          
          img.onerror = reject
          img.src = e.target.result
        }
        
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    },
    
    removeCurrentImage(index) {
      this.$set(this.editPhotoForm.removeCurrentPhotos, index, true)
      this.$set(this.editPhotoForm.currentImages, index, null)
    },
    
    removeNewImage(index) {
      this.$set(this.editPhotoForm.newImages, index, null)
      this.$set(this.editPhotoForm.newImagePreviews, index, null)
    },
    
    async savePhotoEdit() {
      try {
        // ตรวจสอบว่ามีการเลือกรูปภาพอย่างน้อย 1 รูป
        const hasImage1 = this.editPhotoForm.currentImages[0] !== null && this.editPhotoForm.currentImages[0] !== undefined
        const hasImage2 = this.editPhotoForm.currentImages[1] !== null && this.editPhotoForm.currentImages[1] !== undefined
        
        if (!hasImage1 && !hasImage2) {
          this.$toast.warning('กรุณาเลือกรูปภาพอย่างน้อย 1 รูป')
          return
        }
        
        // ตรวจสอบว่ามีรูปภาพครบ 2 รูป
        if (!hasImage1 || !hasImage2) {
          this.$toast.warning('กรุณาเลือกรูปภาพให้ครบ 2 รูป')
          return
        }
        
        this.loading = true
        this.loadingMessage = 'กำลังบันทึกรูปภาพ...'
        
        // ดึงข้อมูลแบบสอบถาม
        const survey = await this.$indexedDB.getSurveyProgressById(this.editPhotoForm.surveyId)
        if (!survey) {
          this.$toast.error('ไม่พบข้อมูลการเยี่ยมบ้าน')
          this.loading = false
          return
        }
        
        let newImageKeys = survey.surveyImageKeys || []
        let newImages = survey.surveyImages || []
        
        // Process each image (support up to 2 images)
        for (let i = 0; i < 2; i++) {
          // จัดการการลบรูปภาพเก่า
          if (this.editPhotoForm.removeCurrentPhotos[i] && this.editPhotoForm.currentImageKeys[i]) {
            await this.$indexedDB.deleteImage(this.editPhotoForm.currentImageKeys[i])
            newImageKeys[i] = null
            newImages[i] = null
          }
          
          // จัดการการอัพโหลดรูปภาพใหม่
          if (this.editPhotoForm.newImages[i]) {
            // ลบรูปภาพเก่าถ้ามี
            if (newImageKeys[i]) {
              await this.$indexedDB.deleteImage(newImageKeys[i])
            }
            
            // บันทึกรูปภาพใหม่เป็น object format
            const timestamp = Date.now()
            const newKey = `survey_${this.editPhotoForm.surveyId}_${i}_${timestamp}`
            await this.$indexedDB.saveImage(newKey, this.editPhotoForm.newImages[i])
            newImageKeys[i] = newKey
            
            // บันทึกเป็น object format { base64, url, key }
            newImages[i] = {
              base64: this.editPhotoForm.newImages[i],
              url: null,  // จะถูกอัพเดทหลัง sync
              key: `pic${i + 1}`
            }
          } else if (!this.editPhotoForm.removeCurrentPhotos[i]) {
            // Keep existing image if not removed and no new image
            newImageKeys[i] = this.editPhotoForm.currentImageKeys[i] || newImageKeys[i]
            
            // ตรวจสอบว่าเป็น object format หรือไม่
            const existingImg = this.editPhotoForm.currentImages[i] || newImages[i]
            if (typeof existingImg === 'string') {
              // Convert old format to new format
              newImages[i] = {
                base64: existingImg,
                url: null,
                key: `pic${i + 1}`
              }
            } else {
              newImages[i] = existingImg
            }
          }
        }
        
        // อัพเดทแบบสอบถามด้วยรหัสรูปภาพใหม่และเปลี่ยนสถานะเป็นยังไม่ sync
        await this.$indexedDB.update('survey_progress', {
          ...survey,
          surveyImages: newImages.filter(img => img !== null && img !== undefined),
          surveyImageKeys: newImageKeys.filter((key, idx) => newImages[idx] !== null && newImages[idx] !== undefined),
          synced: false, // เปลี่ยนสถานะเป็นยังไม่ sync เพื่อให้อัพเดทขึ้น API ใหม่
          lastUpdated: new Date().toISOString()
        })
        
        this.$toast.success('บันทึกรูปภาพสำเร็จ')
        
        this.loading = false
        this.showEditPhotoModal = false
        
        // รีเฟรสการแสดงผลหน้าหลัก
        await this.loadVisitors()
        
        // ถ้า online อยู่ ให้ sync ข้อมูลทันที
        if (this.$store.state.isOnline) {
          this.loadingMessage = 'กำลัง Sync ข้อมูลไปยังเซิร์ฟเวอร์...'
          this.loading = true
          
          try {
            await this.$systemInit.pushSurveyResultsToAPI()
            this.$toast.success('อัพเดทข้อมูลไปยังเซิร์ฟเวอร์สำเร็จ')
            
            // รีเฟรสข้อมูลหลัง sync
            await this.loadVisitors()
          } catch (error) {
            console.error('❌ Sync error:', error)
            this.$toast.warning('บันทึกสำเร็จ แต่ยังไม่สามารถ Sync ไปยังเซิร์ฟเวอร์ได้ กรุณา Sync อีกครั้ง')
          } finally {
            this.loading = false
          }
        } else {
          this.$toast.info('บันทึกสำเร็จ จะอัพเดทไปยังเซิร์ฟเวอร์เมื่อออนไลน์')
        }
        
        // โหลดประวัติการเยี่ยมใหม่
        const patient = this.visitors.find(v => v.stid === this.visitHistoryForm.stid)
        if (patient) {
          await this.showVisitHistory(patient)
        }
      } catch (error) {
        console.error('❌ Save photo error:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการบันทึกรูปภาพ')
        this.loading = false
      }
    },
    
    resetEditPhotoForm() {
      this.editPhotoForm = {
        surveyId: null,
        patientName: '',
        visitNumber: null,
        currentImages: [],
        currentImageKeys: [],
        newImages: [],
        newImagePreviews: [],
        removeCurrentPhotos: []
      }
    },
    // ตรวจสอบความถูกต้องของฟอร์มเพิ่มผู้รับบริการ
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
    validateAddTel() {
      if (this.addForm.tel && this.addForm.tel.length > 0) {
        const phoneRegex = /^[0-9\-\s()]+$/
        if (!phoneRegex.test(this.addForm.tel)) {
          this.addFormErrors.tel = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
          return false
        }
        if (this.addForm.tel.replace(/[^0-9]/g, '').length < 9) {
          this.addFormErrors.tel = 'เบอร์โทรศัพท์ต้องมีอย่างน้อย 9 หลัก'
          return false
        }
      }
      delete this.addFormErrors.tel
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
      const telValid = this.validateAddTel()
      const addressValid = this.validateAddAddress()
      return nameValid && nicknameValid && telValid && addressValid
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
      
      // เพิ่มผู้รับบริการในรายการ
      const newId = Math.max(...this.visitors.map(v => v.id), 0) + 1
      this.visitors.push({
        id: newId,
          name: this.addForm.name,
          nickname: this.addForm.nickname,
          tel: this.addForm.tel,
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
        tel: '',
        address: ''
      }
      this.addFormErrors = {}
    },
    formatAppointmentDate(dateStr, timeStr) {
      if (!dateStr) return 'ยังไม่ได้กำหนดวันนัดหมาย'
      
      const date = new Date(dateStr)
      const day = date.getDate()
      const month = this.getThaiMonth(date.getMonth())
      const year = date.getFullYear() + 543
      
      return `${day} ${month} ${year} ${timeStr || ''}`
    },
    formatAppointmentDateShort(dateStr, timeStr) {
      if (!dateStr) return ''
      
      const date = new Date(dateStr)
      const day = date.getDate()
      const month = this.getThaiMonthFull(date.getMonth())
      const year = (date.getFullYear() + 543).toString().slice(-2)
      
      return `อา. ${day} ${month}. ${year}`
    },
    getThaiMonth(monthIndex) {
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ]
      return thaiMonths[monthIndex]
    },
    getThaiMonthFull(monthIndex) {
      const thaiMonths = [
        'ม.ค', 'ก.พ', 'มี.ค', 'เม.ย', 'พ.ค', 'มิ.ย',
        'ก.ค', 'ส.ค', 'ก.ย', 'ต.ค', 'พ.ย', 'ธ.ค'
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
  font-weight: 500;
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

.patients-body {
  padding: 1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 4.4rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1.2rem;
  font-weight: 300;
  margin-bottom: 1.5rem;
}

/* Patients Grid */
.patients-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Grid Header */
.grid-header-row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1.2fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.grid-header-col {
  background: transparent;
  border-bottom: 2px solid #dee2e6;
  padding: 1.2rem 1rem;
  text-align: center;
  font-size: 1.3rem;
  font-weight: 400;
  color: #2c3e50;
}

.patient-card-row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1.2fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.card-col {
  border: 2px solid #2c3e50;
  border-radius: 0.75rem;
  padding: 1.6rem 1.1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  min-height: 150px;
  font-weight: 400;
}

.card-col:hover {
  border-color: #3551a4;
}

/* Name Card */
.card-col-name {
  background: #ffffff;
  border: 2px solid #3551a4;
  cursor: pointer;
}

.card-col-name:hover {
  background: #f0f7ff;
  border-color: #2c4088;
}

.card-name {
  font-size: 1.45rem;
  color: #2c3e50;
  margin-bottom: 0.3rem;
  line-height: 1.4;
  font-weight: 400;
}

.card-nickname {
  font-size: 1.25rem;
  color: #6c757d;
  font-weight: 300;
}

/* Appointment Card */
.card-col-appointment {
  font-size: 1.2rem;
  line-height: 1.5;
}

.card-col-appointment.has-appointment {
  background: #28a745;
  color: white;
  border-color: #1e7e34;
}

.card-col-appointment.has-appointment:hover {
  background: #218838;
  border-color: #1e7e34;
}

.card-col-appointment.no-appointment {
  background: #ffc107;
  color: #333;
  border-color: #ff9800;
}

.card-col-appointment.no-appointment:hover {
  background: #e0a800;
  border-color: #d39e00;
}

.card-col-appointment.disabled-appointment {
  opacity: 0.7;
  cursor: not-allowed !important;
}

.card-col-appointment.disabled-appointment:hover {
  transform: none;
}

.appointment-date {
  white-space: pre-line;
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.5;
}

.appointment-time {
  font-size: 1.4rem;
  font-weight: 300;
}

.appointment-visit-info {
  font-size: 1.2rem;
  font-weight: 300;
  margin-top: 0.3rem;
  color: rgba(255, 255, 255, 0.9);
}

.appointment-placeholder {
  font-size: 1.4rem;
  font-weight: 300;
}

/* Visit Card */
.card-col-visit {
  font-size: 1.2rem;
}

.card-col-visit.visit-ready {
  background: #17a2b8;
  color: white;
  border-color: #138496;
}

.card-col-visit.visit-ready:hover {
  background: #138496;
  border-color: #117a8b;
}

.card-col-visit.visit-disabled {
  background: #e9ecef;
  color: #6c757d;
  border-color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.8;
}

.card-col-visit.visit-disabled:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.card-col-visit.visit-completed {
  background: #28a745;
  color: white;
  border-color: #218838;
}

.card-col-visit.visit-completed:hover {
  background: #218838;
  border-color: #1e7e34;
}

.card-col-visit.visit-warning {
  background: #dc3545;
  color: white;
  border-color: #c82333;
}

.card-col-visit.visit-warning:hover {
  background: #c82333;
  border-color: #bd2130;
}

.card-col-visit.visit-pending-upload {
  background: #ffc107;
  color: #333;
  border-color: #ff9800;
  cursor: not-allowed;
}

.card-col-visit.visit-pending-upload:hover {
  background: #ffc107;
  border-color: #ff9800;
}

.visit-text {
  font-size: 1.4rem;
  font-weight: 400;
}

.visit-text-disabled {
  font-size: 1.4rem;
  line-height: 1.6;
  font-weight: 300;
}

.visit-text-warning {
  font-size: 1.3rem;
  line-height: 1.5;
  font-weight: 500;
  color: white;
  text-align: center;
  padding: 0.5rem;
}

/* Edit Card */
.card-col-edit {
  background: #6c757d;
  color: white;
  border-color: #495057;
}

.card-col-edit:hover {
  background: #5a6268;
  border-color: #545b62;
}

.card-col-edit.card-col-disabled {
  background: #e9ecef;
  color: #adb5bd;
  border-color: #dee2e6;
  opacity: 0.6;
  cursor: not-allowed !important;
}

.card-col-edit.card-col-disabled:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  transform: none;
}

.edit-text {
  font-size: 1.4rem;
  font-weight: 400;
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
  font-weight: 500;
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
  font-weight: 500;
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
  font-weight: 500;
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

/* Modal Improvements */
::v-deep .modal-dialog {
  max-width: 650px;
}

::v-deep .modal-dialog.modal-lg {
  max-width: 950px;
}

::v-deep .modal-content {
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

::v-deep .modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #e9ecef;
}

::v-deep .modal-title {
  font-size: 1.65rem;
  font-weight: 400;
  color: #2c3e50;
}

::v-deep .modal-body {
  padding: 2rem;
}

::v-deep .modal-footer {
  padding: 1.25rem 2rem;
  border-top: 2px solid #e9ecef;
}

/* Form Controls in Modal */
::v-deep .form-group {
  margin-bottom: 1.75rem;
}

::v-deep .form-group label {
  font-size: 1.2rem;
  font-weight: 400;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

::v-deep .form-control,
::v-deep .custom-select {
  font-size: 1.2rem;
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
  font-size: 1.1rem;
  font-weight: 400;
  margin-top: 0.5rem;
}

/* Modal Buttons */
::v-deep .modal-footer .btn {
  font-size: 1.25rem;
  font-weight: 400;
  padding: 0.975rem 2.2rem;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

::v-deep .modal-footer .btn-primary {
  background: linear-gradient(135deg, #3551a4, #2c4088);
  color: white;
}

::v-deep .modal-footer .btn-primary:hover {
  background: linear-gradient(135deg, #2c4088, #1f2f5f);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(53, 81, 164, 0.3);
}

::v-deep .modal-footer .btn-secondary {
  background: #6c757d;
  color: white;
}

::v-deep .modal-footer .btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.modal-header-custom {
  background: linear-gradient(135deg, #3551a4, #2c4088) !important;
  color: white !important;
  border-bottom: none !important;
}

.modal-header-custom .modal-title {
  color: white !important;
  font-size: 1.75rem !important;
  font-weight: 400 !important;
}

.modal-header-visit {
  background: linear-gradient(135deg, #3551a4, #2c4088) !important;
  color: white !important;
  border-bottom: none !important;
}

.modal-header-visit .modal-title {
  color: white !important;
  font-size: 1.75rem !important;
  font-weight: 400 !important;
}

.visit-staff-info {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  padding: 1.25rem 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #1976d2;
  font-size: 1.15rem;
  font-weight: 500;
  border: 2px solid #90caf9;
}

.visit-staff-info i {
  font-size: 1.5rem;
}

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

.appointment-info {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  padding: 1.35rem 1.6rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  text-align: center;
  border: 2px solid #ffc107;
}

.appointment-info p {
  font-size: 1.3rem !important;
  font-weight: 400 !important;
  color: #856404 !important;
  margin: 0 !important;
}

.info-section {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 1.35rem 1.6rem;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  min-height: 140px;
  border: 2px solid #dee2e6;
}

.info-section h6 {
  margin-bottom: 0.8rem;
  color: #3551a4;
  font-size: 1.25rem;
  font-weight: 400;
}

.info-section ul {
  margin-bottom: 0;
}

.info-section ul li {
  line-height: 1.8;
  font-size: 1.15rem;
  font-weight: 300;
  color: #495057;
}

.text-danger {
  color: #dc3545;
  font-weight: 500;
  font-size: 1rem;
}

/* Visit History Modal */
.visit-history-header {
  margin-bottom: 2rem;
}

.patient-info-bar {
  background: linear-gradient(135deg, #3551a4, #2c4088);
  padding: 1.35rem 1.85rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1.1rem;
  color: white;
  box-shadow: 0 4px 12px rgba(53, 81, 164, 0.3);
}

.patient-info-bar i {
  font-size: 2.2rem;
  color: rgba(255, 255, 255, 0.9);
}

.patient-name-large {
  font-size: 1.55rem;
  font-weight: 400;
  color: white;
}

.patient-nickname-badge {
  font-size: 1.3rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.85);
  margin-left: 0.5rem;
}

.visit-history-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.visit-history-row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1.2fr;
  gap: 0.75rem;
}

.visit-card {
  border: 2px solid #2c3e50;
  border-radius: 0.75rem;
  padding: 1.6rem 1.35rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  min-height: 130px;
  font-weight: 400;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.visit-card i {
  font-size: 1.9rem;
  margin-bottom: 0.5rem;
}

.visit-card span {
  font-size: 1.15rem;
  font-weight: 400;
  line-height: 1.5;
}

.visit-card-date {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #3551a4;
  cursor: default;
}

.visit-card-date:hover {
  box-shadow: 0 3px 10px rgba(53, 81, 164, 0.2);
  border-color: #3551a4;
}

.visit-card-date i {
  color: #3551a4;
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.visit-card-content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  align-items: center;
}

.visit-number-badge {
  background: linear-gradient(135deg, #3551a4, #2c4088);
  color: white;
  padding: 0.4rem 0.9rem;
  border-radius: 1.5rem;
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 0.25rem;
  box-shadow: 0 2px 6px rgba(53, 81, 164, 0.3);
}

.visit-date-text {
  font-size: 1.25rem;
  font-weight: 400;
  color: #2c3e50;
}

.visit-time-text {
  font-size: 1.1rem;
  font-weight: 300;
  color: #6c757d;
}

.visit-status-badges {
  margin-top: 0.5rem;
}

.visit-status-badges .badge {
  font-size: 0.95rem;
  padding: 0.4rem 0.75rem;
  border-radius: 1rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.visit-status-badges .badge-warning {
  background: linear-gradient(135deg, #ffc107, #ffb300);
  color: #333;
}

.visit-status-badges .badge-secondary {
  background: linear-gradient(135deg, #6c757d, #5a6268);
  color: white;
}

.visit-status-badges .badge-success {
  background: linear-gradient(135deg, #28a745, #1e7e34);
  color: white;
}

.visit-card-action {
  cursor: pointer;
}

.visit-card-action:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-color: #3551a4;
}

.visit-card-edit-record {
  background: linear-gradient(135deg, #17a2b8 0%, #20c9e3 100%);
  color: white;
  border-color: #138496;
}

.visit-card-edit-record:hover {
  background: linear-gradient(135deg, #20c9e3 0%, #17a2b8 100%);
  border-color: #17a2b8;
}

.visit-card-edit-record i {
  color: white;
}

.visit-card-edit-photos {
  background: linear-gradient(135deg, #ffc107 0%, #ffcd39 100%);
  color: #333;
  border-color: #ff9800;
}

.visit-card-edit-photos:hover {
  background: linear-gradient(135deg, #ffcd39 0%, #ffc107 100%);
  border-color: #ffc107;
}

.visit-card-edit-photos i {
  color: #333;
}

.visit-card-action.disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  pointer-events: none;
}

.visit-card-action.disabled:hover {
  transform: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-visit-history {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.empty-visit-history i {
  font-size: 5.5rem;
  color: #dee2e6;
  margin-bottom: 1.5rem;
}

.empty-visit-history p {
  font-size: 1.35rem;
  font-weight: 300;
  margin: 0;
}

/* Edit Photo Modal */
.edit-photo-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.patient-info-bar-small {
  background: linear-gradient(135deg, #3551a4, #2c4088);
  padding: 1rem 1.35rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-size: 1.15rem;
  font-weight: 500;
}

.patient-info-bar-small i {
  font-size: 1.5rem;
}

.patient-info-bar-small .badge {
  margin-left: auto;
  font-size: 0.95rem;
  padding: 0.4rem 0.75rem;
}

.dual-image-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-top: 1.5rem;
}

.image-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-section h6 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  padding: 0.5rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 0.5rem;
}

.current-image-section h6,
.upload-new-section h6 {
  font-size: 1.2rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.image-preview-large {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-preview-large img {
  width: 100%;
  height: auto;
  display: block;
}

.btn-remove-current,
.btn-remove-new {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.btn-remove-current:hover,
.btn-remove-new:hover {
  background: rgba(220, 53, 69, 1);
  transform: scale(1.1);
}

.no-image-section {
  text-align: center;
  padding: 3rem 2rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  color: #6c757d;
}

.no-image-section i {
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.no-image-section p {
  font-size: 1.2rem;
  font-weight: 400;
  margin: 0;
}

.upload-area {
  border: 3px dashed #ced4da;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.upload-area:hover {
  border-color: #3551a4;
  background: #f0f7ff;
}

.upload-placeholder-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #6c757d;
}

.upload-placeholder-small i {
  font-size: 3rem;
  color: #3551a4;
}

.upload-placeholder-small p {
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
  color: #2c3e50;
}

.upload-placeholder-small small {
  font-size: 0.95rem;
  color: #6c757d;
}

.new-image-preview {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.new-image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

/* Responsive styles for photo modal */
@media (max-width: 768px) {
  .dual-image-container {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  
  .image-section .image-preview-large {
    height: 250px;
  }
}

</style>
