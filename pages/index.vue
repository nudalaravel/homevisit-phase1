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
              :class="visitor.appointmentDate ? 'has-appointment' : 'no-appointment'"
              @click="scheduleAppointment(visitor)"
            >
              <div v-if="visitor.appointmentDate" class="appointment-date">
                <div class="appointment-date">{{ formatAppointmentDateShort(visitor.appointmentDate) }}</div>
                <div class="appointment-time">{{ visitor.appointmentTime }}</div>
              
              </div>
              <div v-else class="appointment-placeholder">
                ยังไม่ได้กำหนดหมาย
              </div>
            </div>

            <div 
              class="card-col card-col-visit"
              :class="visitor.appointmentDate ? 'visit-ready' : 'visit-disabled'"
              @click="visitor.appointmentDate ? recordVisit(visitor) : null"
            >
              <div v-if="visitor.appointmentDate" class="visit-text">
                บันทึกเยี่ยมบ้าน
              </div>
              <div v-else class="visit-text-disabled">
                ยังไม่ได้บันทึก<br>การเยี่ยมบ้าน
              </div>
            </div>

            <div class="card-col card-col-edit" @click="showVisitHistory(visitor)">
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

        <b-form-group label="จังหวัด" label-for="edit-province">
          <b-form-select
            id="edit-province"
            v-model="editForm.prov_code"
            :options="provinces"
            value-field="prov_code"
            text-field="prov_name"
            @change="onProvinceChange"
          >
            <template #first>
              <b-form-select-option :value="null">-- เลือกจังหวัด --</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>

        <b-form-group label="อำเภอ" label-for="edit-amphoe">
          <b-form-select
            id="edit-amphoe"
            v-model="editForm.amp_code"
            :options="filteredAmphoes"
            value-field="amp_code"
            text-field="amp_name"
            :disabled="!editForm.prov_code"
            @change="onAmphoeChange"
          >
            <template #first>
              <b-form-select-option :value="null">-- เลือกอำเภอ --</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>

        <b-form-group label="ตำบล" label-for="edit-tambon">
          <b-form-select
            id="edit-tambon"
            v-model="editForm.tam_code"
            :options="filteredTambons"
            value-field="tam_code"
            text-field="tam_name"
            :disabled="!editForm.amp_code"
          >
            <template #first>
              <b-form-select-option :value="null">-- เลือกตำบล --</b-form-select-option>
            </template>
          </b-form-select>
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
              <div class="visit-number-badge">{{ visit.visitNumber }}/{{ visitHistoryForm.totalVisits }}</div>
              <div class="visit-date-text">{{ formatVisitDate(visit.date) }}</div>
              <div class="visit-time-text">{{ visit.time }}</div>
            </div>
          </div>
          
          <div class="visit-card visit-card-action visit-card-edit-record" @click="editVisitRecord(visit)">
            <i class="fas fa-edit"></i>
            <span>แก้ไขบันทึกการเยี่ยม</span>
          </div>

          <div class="visit-card visit-card-action visit-card-edit-photos" @click="editVisitPhotos(visit)">
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

  </div>
</template>

<script>
export default {
  layout: 'admin',
  middleware: 'auth',
  data() {
    return {
      visitors: [], // โหลดจาก IndexedDB table visitors
      loading: false,
      loadingMessage: 'กำลังโหลดข้อมูล...',
      isSyncingQueue: false, // ป้องกันการ sync ซ้ำ
      syncQueueTimeout: null, // สำหรับ debounce
      showEditModal: false,
      showAppointmentModal: false,
      showVisitModal: false,
      showVisitHistoryModal: false,
      showAddModal: false,
      editForm: {
        id: null,
        stid: null,
        name: '',
        nickname: '',
        tel: '', // ชื่อ field ตรงกับ database
        address: '',
        prov_code: null,
        amp_code: null,
        tam_code: null,
        latitude: null,
        longitude: null
      },
      editFormErrors: {},
      provinces: [],
      amphoes: [],
      tambons: [],
      filteredAmphoes: [],
      filteredTambons: [],
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
      visitHistoryForm: {
        id: null,
        patientName: '',
        nickname: '',
        visits: [],
        totalVisits: 48
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
  async mounted() {
    this.initDateOptions()
    this.updateVisitorsCount()
    
    // Initialize system
    await this.initializeSystem()
    
    // Listen for sync-completed event
    this.$nuxt.$on('sync-completed', this.handleSyncCompleted)
    
    // Listen for online status changes
    window.addEventListener('online', this.handleOnlineStatusChange)
    window.addEventListener('offline', this.handleOnlineStatusChange)
  },
  beforeDestroy() {
    // Cleanup event listeners
    this.$nuxt.$off('sync-completed', this.handleSyncCompleted)
    window.removeEventListener('online', this.handleOnlineStatusChange)
    window.removeEventListener('offline', this.handleOnlineStatusChange)
    
    // Clear timeout
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
        console.error('Failed to add to sync queue:', error)
      }
    },
    async processSyncQueue() {
      // ป้องกันการ sync ซ้ำ
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
              // Sync to API
              await this.$axios.$put(
                '/api/parenting2025_census/put/homevisit/putdata_arr.php',
                item.payload
              )
              
              // Update visitor in IndexedDB to mark as synced
              const existingVisitor = await this.$indexedDB.getVisitor(item.stid)
              if (existingVisitor) {
                await this.$indexedDB.updateVisitor({
                  ...existingVisitor,
                  ...item.data,
                  dataSource: 'api',
                  lastSyncedAt: new Date().toISOString()
                })
              }
              
              // Remove from queue
              await this.$indexedDB.removeFromSyncQueue(item.id)
              successCount++
            }
          } catch (error) {
            console.error('Failed to sync item:', item, error)
            failCount++
          }
        }
        
        if (successCount > 0) {
          this.$toast.success(`ซิงค์ข้อมูลสำเร็จ ${successCount} รายการ`)
          // Reload visitors to update UI
          await this.loadVisitors()
        }
        
        if (failCount > 0) {
          this.$toast.warning(`ซิงค์ข้อมูลล้มเหลว ${failCount} รายการ`)
        }
      } catch (error) {
        console.error('Process sync queue error:', error)
      } finally {
        // ปลดล็อกเมื่อเสร็จสิ้น
        this.isSyncingQueue = false
      }
    },
    handleOnlineStatusChange() {
      if (this.$store.state.isOnline) {
        // Clear timeout ก่อนหน้า (ถ้ามี)
        if (this.syncQueueTimeout) {
          clearTimeout(this.syncQueueTimeout)
        }
        
        // Debounce: รอ 2 วินาทีก่อน process (ป้องกันการเรียกซ้ำจาก multiple events)
        this.syncQueueTimeout = setTimeout(() => {
          this.processSyncQueue()
        }, 2000)
      }
    },
    async initializeSystem() {
      try {
        this.loading = true
        this.loadingMessage = 'กำลังเริ่มต้นระบบ...'
        
        // Initialize system via store action
        await this.$store.dispatch('initializeSystem', this)
        
        // Load location data for dropdowns
        await this.loadLocationData()
        
        // Sync visitors if online
        if (this.$store.state.isOnline && this.$auth.user?.username) {
          this.loadingMessage = 'กำลังซิงค์ข้อมูล...'
          await this.$systemInit.syncVisitors(this.$auth.user.username)
        }
        
        // Load visitors from IndexedDB
        this.loadingMessage = 'กำลังโหลดข้อมูลผู้รับบริการ...'
        await this.loadVisitors()
        
        this.loading = false
      } catch (error) {
        console.error('System initialization error:', error)
        this.loading = false
        this.$toast.error('เกิดข้อผิดพลาดในการเริ่มต้นระบบ')
      }
    },
    async handleSyncCompleted() {
      try {
        await this.loadVisitors()
      } catch (error) {
        console.error('Failed to reload visitors:', error)
        this.$toast.error('ไม่สามารถโหลดข้อมูลใหม่ได้')
      }
    },
    async loadVisitors() {
      try {
        // Get current user's username
        const username = this.$auth.user?.username || this.$offlineAuth?.getUser?.()?.username
        
        if (!username) {
          console.warn('No username found, cannot load visitors')
          return
        }
        
        // Load visitors from IndexedDB
        const visitors = await this.$indexedDB.getVisitorsByHomevisitor(username)
        
        // Map visitors data for UI
        this.visitors = visitors.map(visitor => {
          // สร้างชื่อเต็มจาก field ที่มี
          let fullName = ''
          if (visitor.stname) {
            fullName = visitor.stname // ถ้ามีชื่อเต็มอยู่แล้ว
          } else if (visitor.prename || visitor.fname || visitor.lname) {
            fullName = `${visitor.prename || ''}${visitor.fname || ''} ${visitor.lname || ''}`.trim()
          }
          
          return {
            id: visitor.stid, // ใช้ stid เป็น id
            stid: visitor.stid,
            name: fullName,
            nickname: visitor.nickname || '',
            tel: visitor.tel || '', // ใช้ชื่อ field ตรงกับ database
            address: visitor.address || '',
            // แปลง location codes เป็น string เพื่อให้ v-model select ทำงานถูกต้อง
            prov_code: visitor.prov_code ? String(visitor.prov_code) : null,
            amp_code: visitor.amp_code ? String(visitor.amp_code) : null,
            tam_code: visitor.tam_code ? String(visitor.tam_code) : null,
            latitude: visitor.latitude || null,
            longitude: visitor.longitude || null,
            appointmentDate: visitor.appointmentDate || null, // จะเพิ่ม field นี้ภายหลัง
            appointmentTime: visitor.appointmentTime || null,
            dataSource: visitor.dataSource || 'api',
            lastSyncedAt: visitor.lastSyncedAt || null
          }
        })
      } catch (error) {
        console.error('Failed to load visitors:', error)
        this.$toast.error('ไม่สามารถโหลดข้อมูลผู้รับบริการได้')
      }
    },
    async loadLocationData() {
      try {
        // Load provinces และแปลง prov_code เป็น string
        const provincesData = await this.$indexedDB.getProvinces()
        this.provinces = provincesData.map(p => ({
          ...p,
          prov_code: String(p.prov_code)
        }))
        
        // Load amphoes และแปลง codes เป็น string
        const amphoesData = await this.$indexedDB.getAmphoes()
        this.amphoes = amphoesData.map(a => ({
          ...a,
          amp_code: String(a.amp_code),
          prov_code: String(a.prov_code)
        }))
        
        // Load tambons และแปลง codes เป็น string
        const tambonsData = await this.$indexedDB.getTambons()
        this.tambons = tambonsData.map(t => ({
          ...t,
          tam_code: String(t.tam_code),
          amp_code: String(t.amp_code)
        }))
      } catch (error) {
        console.error('Failed to load location data:', error)
      }
    },
    onProvinceChange() {
      // Filter amphoes based on selected province
      if (this.editForm.prov_code) {
        this.filteredAmphoes = this.amphoes.filter(
          a => String(a.prov_code) === String(this.editForm.prov_code)
        )
      } else {
        this.filteredAmphoes = []
      }
      
      // Reset amphoe and tambon selection
      this.editForm.amp_code = null
      this.editForm.tam_code = null
      this.filteredTambons = []
    },
    onAmphoeChange() {
      // Filter tambons based on selected amphoe
      if (this.editForm.amp_code) {
        this.filteredTambons = this.tambons.filter(
          t => String(t.amp_code) === String(this.editForm.amp_code)
        )
      } else {
        this.filteredTambons = []
      }
      
      // Reset tambon selection
      this.editForm.tam_code = null
    },
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
        address: patient.address || '',
        prov_code: patient.prov_code || null,
        amp_code: patient.amp_code || null,
        tam_code: patient.tam_code || null,
        latitude: patient.latitude || null,
        longitude: patient.longitude || null
      }
      
      // Populate filtered dropdowns based on existing selection
      if (this.editForm.prov_code) {
        this.filteredAmphoes = this.amphoes.filter(
          a => String(a.prov_code) === String(this.editForm.prov_code)
        )
      } else {
        this.filteredAmphoes = []
      }
      
      if (this.editForm.amp_code) {
        this.filteredTambons = this.tambons.filter(
          t => String(t.amp_code) === String(this.editForm.amp_code)
        )
      } else {
        this.filteredTambons = []
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
        // Update visitor in local array
        const visitorIndex = this.visitors.findIndex(v => v.id === this.editForm.id)
        if (visitorIndex !== -1) {
          this.visitors[visitorIndex] = {
            ...this.visitors[visitorIndex],
            tel: this.editForm.tel,
            address: this.editForm.address,
            prov_code: this.editForm.prov_code,
            amp_code: this.editForm.amp_code,
            tam_code: this.editForm.tam_code,
            latitude: this.editForm.latitude,
            longitude: this.editForm.longitude
          }
        }
        
        // Save to IndexedDB if stid exists (visitor data)
        if (this.editForm.stid) {
          const visitorData = {
            stid: this.editForm.stid,
            tel: this.editForm.tel || null,
            address: this.editForm.address || null,
            prov_code: this.editForm.prov_code || null,
            amp_code: this.editForm.amp_code || null,
            tam_code: this.editForm.tam_code || null,
            latitude: this.editForm.latitude || null,
            longitude: this.editForm.longitude || null,
            dataSource: 'local',
            lastSyncedAt: new Date().toISOString()
          }
          
          // Get existing visitor data
          const existingVisitor = await this.$indexedDB.getVisitor(this.editForm.stid)
          if (existingVisitor) {
            // Merge with existing data
            await this.$indexedDB.updateVisitor({
              ...existingVisitor,
              ...visitorData
            })
          }
          
          // If online, sync to API
          if (this.$store.state.isOnline) {
            try {
              const payload = {
                variable: [['tel', 'address', 'prov_code', 'amp_code', 'tam_code', 'latitude', 'longitude']],
                value: [[
                  this.editForm.tel || '',
                  this.editForm.address || '',
                  this.editForm.prov_code || '',
                  this.editForm.amp_code || '',
                  this.editForm.tam_code || '',
                  this.editForm.latitude || '',
                  this.editForm.longitude || ''
                ]],
                pk: [['stid']],
                pkval: [[this.editForm.stid]],
                tb: 'homevisitor_sample_students'
              }
              
              await this.$axios.$put(
                '/api/parenting2025_census/put/homevisit/putdata_arr.php',
                payload
              )
              
              // Update to mark as synced
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
              console.error('API sync failed:', apiError)
              this.$toast.warning('บันทึกข้อมูลสำเร็จ แต่ยังไม่ได้ซิงค์กับเซิร์ฟเวอร์')
            }
          } else {
            // เก็บไว้ใน sync queue เพื่อ sync ภายหลังเมื่อ online
            await this.addToSyncQueue({
              type: 'UPDATE_VISITOR',
              stid: this.editForm.stid,
              data: visitorData,
              payload: {
                variable: [['tel', 'address', 'prov_code', 'amp_code', 'tam_code', 'latitude', 'longitude']],
                value: [[
                  this.editForm.tel || '',
                  this.editForm.address || '',
                  this.editForm.prov_code || '',
                  this.editForm.amp_code || '',
                  this.editForm.tam_code || '',
                  this.editForm.latitude || '',
                  this.editForm.longitude || ''
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
        
        // Reload visitors from IndexedDB to update UI
        await this.loadVisitors()
        
        this.$nextTick(() => {
          this.showEditModal = false
        })
      } catch (error) {
        console.error('Save patient edit error:', error)
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
        address: '',
        prov_code: null,
        amp_code: null,
        tam_code: null,
        latitude: null,
        longitude: null
      }
      this.filteredAmphoes = []
      this.filteredTambons = []
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
      
      // Update visitor in local array
        const visitor = this.visitors.find(v => v.id === this.appointmentForm.id)
        if (visitor) {
          visitor.appointmentDate = `${this.appointmentForm.year}-${String(this.appointmentForm.month).padStart(2, '0')}-${String(this.appointmentForm.day).padStart(2, '0')}`
          visitor.appointmentTime = this.appointmentForm.time
          
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
      this.goToSurvey(this.visitors.find(v => v.id === this.visitForm.id))
    },
    // Visit History Modal
    showVisitHistory(patient) {
      // Demo: สร้างข้อมูลตัวอย่างการเยี่ยมบ้าน
      const demoVisits = [
        {
          id: 1,
          date: '2568-10-01',
          time: '09:00 น.',
          patientId: patient.id,
          visitNumber: 3
        },
        {
          id: 2,
          date: '2568-09-15',
          time: '14:00 น.',
          patientId: patient.id,
          visitNumber: 2
        },
        {
          id: 3,
          date: '2568-09-01',
          time: '10:30 น.',
          patientId: patient.id,
          visitNumber: 1
        }
      ]
      
      this.visitHistoryForm = {
        id: patient.id,
        patientName: patient.name,
        nickname: patient.nickname,
        visits: demoVisits,
        totalVisits: 48
      }
      this.showVisitHistoryModal = true
    },
    resetVisitHistoryForm() {
      this.visitHistoryForm = {
        id: null,
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
    editVisitRecord(visit) {
      // TODO: เปิดหน้าแก้ไขบันทึกการเยี่ยม
      this.$toast.info('เปิดหน้าแก้ไขบันทึกการเยี่ยม')
    },
    editVisitPhotos(visit) {
      // TODO: เปิดหน้าแก้ไขรูปภาพ
      this.$toast.info('เปิดหน้าแก้ไขรูปภาพ')
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
      
      // Add visitor to local array
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
      if (!dateStr) return 'ยังไม่ได้นัดหมาย'
      
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

.visit-text {
  font-size: 1.4rem;
  font-weight: 400;
}

.visit-text-disabled {
  font-size: 1.4rem;
  line-height: 1.6;
  font-weight: 300;
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


</style>
