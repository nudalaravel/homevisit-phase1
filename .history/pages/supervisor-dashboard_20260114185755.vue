<template>
  <div class="supervisor-dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">ผลการเยี่ยมบ้าน</h1>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label class="filter-label">ตำบล</label>
        <select
          v-model="filters.subdistrict"
          class="filter-select select2"
          ref="subdistrictSelect"
        >
          <option
            v-for="(option, index) in subdistrictOptions"
            :key="'subdistrict-' + index"
            :value="option.value"
          >
            {{ option.text }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">ผู้เยี่ยมบ้าน</label>
        <select
          v-model="filters.visitor"
          class="filter-select select2"
          ref="visitorSelect"
        >
          <option
            v-for="(option, index) in visitorOptions"
            :key="'visitor-' + index"
            :value="option.value"
          >
            {{ option.text }}
          </option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <!-- Skeleton Loading -->
      <div v-if="loading" class="skeleton-table">
        <table class="table table-striped">
          <thead>
            <tr>
              <th v-for="field in tableFields" :key="field.key">{{ field.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in 8" :key="'skeleton-' + n" class="skeleton-row">
              <td><div class="skeleton-cell skeleton-text"></div></td>
              <td><div class="skeleton-cell skeleton-text"></div></td>
              <td>
                <div class="skeleton-cell skeleton-text-short"></div>
                <div class="skeleton-cell skeleton-text-short mt-1"></div>
              </td>
              <td>
                <div class="skeleton-cell skeleton-text-short"></div>
              </td>
              <td><div class="skeleton-cell skeleton-button"></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Actual Table -->
      <b-table
        v-else
        :items="tableData"
        :fields="tableFields"
        striped
        hover
        responsive
        class="supervisor-table"
        show-empty
        empty-text="ไม่พบข้อมูล"
      >
        <template #cell(visitorName)="row">
          {{ row.item.visitorName }}
        </template>

        <template #cell(childName)="row">
          {{ row.item.childName }}
        </template>

        <template #cell(lastVisit)="row">
          <div class="visit-info">
            <div class="visit-date text-center">{{ row.item.lastVisitDate }}</div>
            <div class="visit-time text-center">{{ row.item.lastVisitTime }}</div>
            <div class="visit-number text-center">({{ row.item.visitNumber }})</div>
          </div>
        </template>

        <template #cell(nextVisit)="row">
          <div
            class="next-visit-info"
            :class="{ postponed: row.item.isPostponed }"
          >
            <div class="next-visit-date text-center">{{ row.item.nextVisitDate }}</div>
            <div class="postpone-info text-center" v-if="row.item.postponeCount > 0">
              ({{ row.item.postponeCount }} ครั้ง) / {{ row.item.nextVisitTime }}
            </div>
          </div>
        </template>

        <template #cell(history)="row">
          <button class="btn-history" @click="viewHistory(row.item)">
            ประวัติการเยี่ยมบ้าน
          </button>
        </template>
      </b-table>
    </div>

    <!-- Visit History Modal -->
    <b-modal
      id="visitHistoryModal"
      v-model="showVisitHistoryModal"
      title="ประวัติการเยี่ยมบ้าน"
      size="xl"
      no-close-on-backdrop
      @hidden="resetVisitHistoryForm"
      header-class="modal-header-visit"
      dialog-class="modal-95percent"
      no-enforce-focus
    >
      <template #modal-header>
        <div class="modal-header-content">
          <h5 class="modal-title">ประวัติการเยี่ยมบ้าน</h5>
          <div class="patient-info-bar">
            <i class="fas fa-user-circle"></i>
            <span class="patient-name-large">{{ visitHistoryForm.childName }}</span>
            <span class="patient-nickname-badge">({{ visitHistoryForm.visitorName }})</span>
          </div>
        </div>
      </template>

      <div v-if="visitHistoryForm.visits && visitHistoryForm.visits.length > 0" class="visit-history-table-container">
        <table class="visit-history-table">
          <thead>
            <tr>
              <th class="col-visit-number">ครั้งที่ / สถานะ</th>
              <th class="col-date-time">วันที่ / เวลา</th>
              <th class="col-action">ดูผลการเยี่ยมบ้าน</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(visit, index) in visitHistoryForm.visits" :key="index" class="visit-history-row">
              <td class="col-visit-number">
                <div class="visit-number-status">
                  <div class="visit-number-badge">ครั้งที่ {{ visit.visitNumber }}</div>
                  <!-- <div class="visit-status-badges">
                    <span v-if="!visit.synced" class="badge badge-warning">
                      รอส่งข้อมูล
                    </span>
                    <span v-else-if="!visit.approved" class="badge badge-secondary">
                      รออนุมัติ
                    </span>
                    <span v-else class="badge badge-success">
                      อนุมัติแล้ว
                    </span>
                  </div> -->
                </div>
              </td>
              <td class="col-date-time">
                <div class="date-time-info">
                  <div class="visit-date-text">
                    <i class="fas fa-calendar-day"></i>
                    {{ visit.date }}
                  </div>
                  <div class="visit-time-text">
                    <i class="fas fa-clock"></i>
                    {{ visit.time }}
                  </div>
                </div>
              </td>
              <td class="col-action">
                <button 
                  class="btn-view-result" 
                  @click="viewVisitResult(visit)"
                >
                  <i class="fas fa-eye"></i>
                  ดูผลการเยี่ยมบ้าน
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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

    <!-- Visit Result Modal (PDF Style) -->
    <b-modal
      id="visitResultModal"
      v-model="showVisitResultModal"
      title="แบบบันทึกข้อมูลเด็ก สำหรับผู้เยี่ยมบ้าน"
      :dialog-class="showVisitHistoryModal ? 'nested-modal-dialog nested-modal-level-2 record-modal-dialog' : 'record-modal-dialog'"
      no-close-on-backdrop
      @hidden="onNestedModalHidden"
      @shown="onNestedModalShown"
      header-class="modal-header-visit"
      body-class="record-modal-body"
      no-enforce-focus
      :static="showVisitHistoryModal"
    >
      <div v-if="loadingVisitResult" class="loading-record">
        <i class="fas fa-spinner fa-spin"></i>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else-if="visitResultForm && visitResultForm.childName" class="visit-record-wrapper">
        <div id="visit-result-pdf-content" class="visit-record-content">
          <!-- Header Section -->
          <div class="record-header">
            <div class="record-title">แบบบันทึกข้อมูลเด็ก สำหรับผู้เยี่ยมบ้าน</div>
          </div>

          <!-- Basic Info Section -->
          <div class="plain-text-section">
            <p>ชื่อ-นามสกุลของเด็ก : {{ visitResultForm.childName || '-' }} <span style="margin-left: 3rem;">วันพุธที่ {{ visitResultForm.visitDate || '-' }}</span></p>
            <p>ชื่อ-นามสกุลของผู้เยี่ยมบ้าน : {{ visitResultForm.visitorName || '-' }} <span style="margin-left: 3rem;">การเยี่ยมบ้านครั้งที่ {{ visitResultForm.visitNumber || '-' }}</span></p>
            <p>เวลาเริ่มต้นการเยี่ยมบ้าน {{ visitResultForm.visitTime || '-' }} น.</p>
          </div>

          <!-- Home Visit Section -->
          <div class="plain-text-section">
            <p class="section-header-text">การเยี่ยมบ้าน</p>
            <p>1 : ผู้ปกครองสามารถเข้าร่วมกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</p>
            <p class="indent-answer">{{ getQ1Answer(visitResultForm.answers?.q1) }}</p>
            <p>2 : เด็กสามารถเข้าร่วมกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</p>
            <p class="indent-answer">{{ getQ2Answer(visitResultForm.answers?.q2) }}</p>
          </div>

          <!-- Review Previous Visit Section -->
          <div class="plain-text-section">
            <p class="section-header-text underline">ทบทวนการเยี่ยมบ้านครั้งที่ผ่านมา</p>
            <p>3 : ในสัปดาห์ที่ผ่านมา ใครเป็นคนทำกิจกรรมที่ได้จากการเยี่ยมบ้านร่วมกับเด็ก</p>
            <p class="indent-answer">{{ getQ6Answer(visitResultForm.answers?.q6) }}</p>
            <p>4 : ในสัปดาห์ที่ผ่านมา ผู้ปกครองร่วมทำกิจกรรมกับเด็กบ่อยแค่ไหน ?</p>
            <p class="indent-answer">{{ getQ8Answer(visitResultForm.answers?.q4) }}</p>
            <p>5 : ให้ผู้เยี่ยมบ้าน <strong>สังเกต</strong> หรือ <strong>ทบทวน</strong> กิจกรรมการเยี่ยมบ้านครั้งที่ผ่านมา โดยขอให้ผู้ปกครองสาธิตการทำกิจกรรมร่วมกับเด็ก</p>
          </div>

          <!-- Activity Review Table (Q5) -->
          <div class="plain-text-section">
            <p class="section-header-text underline">ทบทวนกิจกรรมการเยี่ยมบ้าน : เดือนที่ {{ visitResultForm.monthAge || '-' }} การเยี่ยมบ้าน {{ visitResultForm.time || '-' }}</p>
            <table class="plain-table">
              <thead>
                <tr>
                  <th>ชื่อกิจกรรม</th>
                  <th>จุดประสงค์</th>
                  <th>คำตอบ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(activity, index) in visitResultForm.q5Activities" :key="'q5-' + index">
                  <td>{{ activity.title || `กิจกรรม ${index + 1}` }}</td>
                  <td>{{ activity.objective || '-' }}</td>
                  <td>{{ getActivityAnswer(activity.answer) }}</td>
                </tr>
                <tr v-if="!visitResultForm.q5Activities || visitResultForm.q5Activities.length === 0">
                  <td colspan="3" class="text-center text-muted">ไม่มีข้อมูลกิจกรรมทบทวน</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Additional Info Section -->
          <div class="plain-text-section">
            <p>6 : ใครทำกิจกรรมกับเด็ก</p>
            <p class="indent-answer">{{ getQ6Answer(visitResultForm.answers?.q6) }}</p>
            <p>7 : มีผู้อื่นร่วมทำกิจกรรมด้วยหรือไม่ (มากกว่า 20 นาที)</p>
            <p class="indent-answer">{{ visitResultForm.answers?.q7 === 1 ? 'มี' : visitResultForm.answers?.q7 === 3 ? 'ไม่มี' : '-' }}</p>
            <p>8 : มีเด็กคนอื่นร่วมทำกิจกรรมไปพร้อมกับเด็กกลุ่มตัวอย่างด้วยหรือไม่ (เด็กอายุไม่เกิน 5 ขวบ)</p>
            <p class="indent-answer">{{ visitResultForm.answers?.q8 === 1 ? 'มี' : visitResultForm.answers?.q8 === 3 ? 'ไม่มี' : '-' }}</p>
          </div>

          <!-- Current Visit Activities Section (Q9) -->
          <div v-if="visitResultForm.q9Activities && visitResultForm.q9Activities.length > 0" class="plain-text-section">
            <p>9 : ให้ผู้เยี่ยมบ้าน <strong>สังเกต</strong> หรือ <strong>ทบทวน</strong> กิจกรรมการเยี่ยมบ้าน เดือนที่ {{ visitResultForm.monthAge || '-' }} การเยี่ยมบ้าน {{ parseInt(visitResultForm.time || 0) + 1 }}</p>
            <p>โดยขอให้ผู้ปกครองสาธิตการทำกิจกรรมร่วมกับเด็ก</p>
            <table class="plain-table">
              <thead>
                <tr>
                  <th>ชื่อกิจกรรม</th>
                  <th>จุดประสงค์</th>
                  <th>คำตอบ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(activity, index) in visitResultForm.q9Activities" :key="'q9-' + index">
                  <td>{{ activity.title }}</td>
                  <td>{{ activity.objective || '-' }}</td>
                  <td>{{ getActivityAnswer(activity.answer) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Appointment Section -->
          <div class="plain-text-section">
            <p>10 : นัดหมายการเยี่ยมบ้านครั้งต่อไป วันที่ {{ visitResultForm.appointment?.date || '-' }} เวลา {{ visitResultForm.appointment?.time || '-' }} น.</p>
            <p>เวลาสิ้นสุดการเยี่ยมบ้าน {{ visitResultForm.endTime || '-' }} น.</p>
            <p v-if="visitResultForm.note">บันทึกผู้เยี่ยมบ้าน - {{ visitResultForm.note }}</p>
          </div>
        </div>
      </div>

      <div v-else class="empty-answers">
        <i class="fas fa-clipboard-question"></i>
        <p>ยังไม่มีข้อมูลการตอบคำถาม</p>
      </div>

      <template #modal-footer="{ cancel }">
        <b-button variant="secondary" @click="cancel()">
          <i class="fas fa-times"></i>
          ปิด
        </b-button>
        <b-button variant="primary" @click="downloadPDF" :disabled="!visitResultForm || loadingPDF">
          <i class="fas fa-download"></i>
          {{ loadingPDF ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF' }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { formatVisitDate } from '~/utils/dateHelpers'
import { PARTICIPANT_OPTIONS, ACTIVITY_ANSWER_OPTIONS } from '~/utils/surveyHelpers'

export default {
  layout: 'supervisor',
  middleware: 'auth',
  data() {
    return {
      loading: true,
      filters: {
        subdistrict: 'all',
        visitor: 'all'
      },
      subdistrictOptions: [
        { value: 'all', text: '--ทั้งหมด--' }
      ],
      visitorOptions: [
        { value: 'all', text: '--ทั้งหมด--' }
      ],
      showVisitHistoryModal: false,
      showVisitResultModal: false,
      visitHistoryForm: {
        childName: '',
        visitorName: '',
        visits: []
      },
      visitResultForm: {
        childName: '',
        visitorName: '',
        visitNumber: null,
        visitDate: '',
        visitTime: '',
        answers: []
      },
      tableFields: [
        {
          key: 'visitorName',
          label: 'ชื่อผู้เยี่ยมบ้าน',
          thClass: 'table-header'
        },
        {
          key: 'childName',
          label: 'ชื่อเด็ก',
          thClass: 'table-header'
        },
        {
          key: 'lastVisit',
          label: 'เยี่ยมบ้านล่าสุด/เวลา (เยี่ยมบ้านครั้งที่)',
          thClass: 'table-header'
        },
        {
          key: 'nextVisit',
          label: 'เยี่ยมบ้านครั้งถัดไป (เลื่อนกี่ครั้ง)/เวลา',
          thClass: 'table-header'
        },
        {
          key: 'history',
          label: 'ประวัติการเยี่ยมบ้าน',
          thClass: 'table-header'
        }
      ],
      tableData: [],
      rawTableData: [], // เก็บข้อมูลดิบจาก API สำหรับ filter ที่ frontend
      dataFetched: false, // flag เพื่อตรวจสอบว่าดึงข้อมูลแล้วหรือยัง
      homevisitResultData: [], // เก็บข้อมูลจาก gethomevisit_result_data API สำหรับ modal
      loadingPDF: false,
      loadingVisitResult: false
    }
  },
  async mounted() {
    // Load html2pdf.js from CDN
    if (process.client && !window.html2pdf) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      script.onload = () => {
        console.log('html2pdf.js loaded')
      }
      document.head.appendChild(script)
    }

    // Load data from APIs
    await this.fetchAmphoeOptions()
    await this.fetchVisitorOptions()
    await this.fetchTableData()
    await this.fetchHomevisitResultData()
    
    // Initialize Select2 for dropdowns
    this.$nextTick(() => {
      if (this.$select2) {
        if (this.$refs.subdistrictSelect) {
          this.$select2.init(this.$refs.subdistrictSelect)
          // Sync v-model with select2 - เรียก filterTableData แทนการยิง API
          window.$(this.$refs.subdistrictSelect).on('change', () => {
            const newVal = window.$(this.$refs.subdistrictSelect).val()
            if (this.filters.subdistrict !== newVal) {
              this.filters.subdistrict = newVal
              this.filterTableData()
            }
          })
        }
        if (this.$refs.visitorSelect) {
          this.$select2.init(this.$refs.visitorSelect)
          // Sync v-model with select2 - เรียก filterTableData แทนการยิง API
          window.$(this.$refs.visitorSelect).on('change', () => {
            const newVal = window.$(this.$refs.visitorSelect).val()
            if (this.filters.visitor !== newVal) {
              this.filters.visitor = newVal
              this.filterTableData()
            }
          })
        }
      }
    })
  },
  // ลบ watcher ออกเพราะ Select2 จัดการเอง - ป้องกัน trigger('change') ซ้ำ
  watch: {},
  beforeDestroy() {
    // Destroy Select2 instances
    if (this.$select2) {
      if (this.$refs.subdistrictSelect && window.$) {
        window.$(this.$refs.subdistrictSelect).off('change')
        this.$select2.destroy(this.$refs.subdistrictSelect)
      }
      if (this.$refs.visitorSelect && window.$) {
        window.$(this.$refs.visitorSelect).off('change')
        this.$select2.destroy(this.$refs.visitorSelect)
      }
    }
  },
  methods: {
    // ดึงข้อมูลอำเภอ/ตำบลสำหรับ dropdown
    async fetchAmphoeOptions() {
      try {
        const response = await this.$axios.$get('/api/parenting2025_census/get/homevisit/getamphoe.php')
        if (response.statusCode === 200 && response.results) {
          this.subdistrictOptions = [
            { value: 'all', text: '--ทั้งหมด--' },
            ...response.results.map(item => ({
              value: item.amp_code,
              text: item.amp_nameT
            }))
          ]
        }
      } catch (error) {
        console.error('Error fetching amphoe options:', error)
      }
    },
    
    // ดึงข้อมูลผู้เยี่ยมบ้านสำหรับ dropdown
    async fetchVisitorOptions() {
      try {
        const response = await this.$axios.$get('/api/parenting2025_census/get/homevisit/getuser.php')
        // รองรับทั้ง response.message === 'success' และ response.statusCode === 200
        const isSuccess = response.message === 'success' || response.statusCode === 200
        if (isSuccess && response.results) {
          // กรองเฉพาะผู้เยี่ยมบ้าน (level_input === '3' = staff)
          const homeVisitors = response.results.filter(item => 
            item.level_input === '3' || item.level === 'staff'
          )
          
          this.visitorOptions = [
            { value: 'all', text: '--ทั้งหมด--' },
            ...homeVisitors.map(item => ({
              // ใช้ username เป็น value (เพราะไม่มี user_id)
              value: item.username || item.user_id || item.id,
              // แสดงชื่อ-นามสกุล
              text: `${item.fname || ''} ${item.lname || ''}`.trim() || item.username
            }))
          ]
        }
      } catch (error) {
        console.error('Error fetching visitor options:', error)
      }
    },
    
    // ดึงข้อมูลตารางผลการเยี่ยมบ้าน (ดึงครั้งเดียวจาก API แล้ว filter ที่ frontend)
    async fetchTableData() {
      this.loading = true
      try {
        // ถ้ายังไม่เคยดึงข้อมูล ให้ดึงจาก API
        if (!this.dataFetched) {
          const url = `/api/parenting2025_census/get/homevisit/sup/gethomevisit_result.php`
          const response = await this.$axios.$get(url)
          
          // รองรับทั้ง response.message === 'success' และ response.statusCode === 200
          const isSuccess = response.message === 'success' || response.statusCode === 200
          if (isSuccess && response.results) {
            // สร้าง lookup map: username -> ชื่อเต็ม จาก visitorOptions
            const visitorNameMap = {}
            this.visitorOptions.forEach(opt => {
              if (opt.value !== 'all') {
                visitorNameMap[opt.value] = opt.text
              }
            })
            
            this.rawTableData = response.results.map((item, index) => ({
              id: `${item.stid}-${index}`,
              stid: item.stid,
              recby: item.recby, // เก็บ username ไว้สำหรับ filter
              ampCode: item.amp_code, // เก็บรหัสอำเภอไว้สำหรับ filter
              // แปลง recby (username) เป็นชื่อจริงจาก visitorOptions
              visitorName: visitorNameMap[item.recby] || item.recby || '-',
              childName: item.fullname_visit || `${item.fname_ch || ''} ${item.lname_ch || ''}`.trim() || '-',
              lastVisitDate: item.date_visit || '-',
              lastVisitTime: item.timeStart || '-',
              visitNumber: parseInt(item.maxvisit) || parseInt(item.time_visit) || 0,
              nextVisitDate: item.q10_appDate || '-',
              nextVisitTime: item.q10_appTime || '-',
              postponeCount: parseInt(item.cnt_app) || 0,
              isPostponed: (parseInt(item.cnt_app) || 0) > 0,
              recStatus: item.recStatus,
              tamCode: item.tam_code,
              prefix: item.prefix
            }))
            this.dataFetched = true
          } else {
            this.rawTableData = []
          }
        }
        
        // Filter ข้อมูลที่ frontend
        this.filterTableData()
      } catch (error) {
        console.error('Error fetching table data:', error)
        this.tableData = []
        this.rawTableData = []
      } finally {
        this.loading = false
      }
    },
    
    // Filter ข้อมูลที่ frontend โดยไม่ต้องยิง API
    filterTableData() {
      let filtered = [...this.rawTableData]
      
      // Filter ตามอำเภอ
      if (this.filters.subdistrict && this.filters.subdistrict !== 'all') {
        filtered = filtered.filter(item => item.ampCode === this.filters.subdistrict)
      }
      
      // Filter ตามผู้เยี่ยมบ้าน
      if (this.filters.visitor && this.filters.visitor !== 'all') {
        filtered = filtered.filter(item => item.recby === this.filters.visitor)
      }
      
      this.tableData = filtered
    },
    
    // ดึงข้อมูล gethomevisit_result_data สำหรับใช้ใน modal
    async fetchHomevisitResultData() {
      try {
        const response = await this.$axios.$get('/api/parenting2025_census/get/homevisit/sup/gethomevisit_result_data.php')
        const isSuccess = response.message === 'success' || response.statusCode === 200
        if (isSuccess && response.results) {
          this.homevisitResultData = response.results
        }
      } catch (error) {
        console.error('Error fetching homevisit result data:', error)
      }
    },
    
    viewHistory(item) {
      // Filter ข้อมูลจาก homevisitResultData ตาม stid (child ID)
      const childVisits = this.homevisitResultData.filter(visit => visit.stid === item.stid)
      
      // Sort by time_visit descending (ล่าสุดก่อน)
      childVisits.sort((a, b) => parseInt(b.time_visit) - parseInt(a.time_visit))
      
      // Map to visits format
      const visits = childVisits.map(visit => ({
        id: `${visit.stid}-${visit.time_visit}`,
        visitNumber: parseInt(visit.time_visit) || 1,
        date: visit.date_visit || '-',
        time: visit.timeStart || '-',
        synced: visit.recStatus === '1',
        approved: visit.recStatus === '1',
        rawData: visit // เก็บข้อมูลดิบสำหรับ viewVisitResult
      }))
      
      this.visitHistoryForm = {
        childName: item.childName,
        visitorName: item.visitorName,
        stid: item.stid,
        visits: visits
      }
      
      this.showVisitHistoryModal = true
    },
    
    async viewVisitResult(visit) {
      const raw = visit.rawData
      if (!raw) {
        this.$toast?.error('ไม่พบข้อมูลการเยี่ยมบ้าน')
        return
      }
      
      try {
        this.loadingVisitResult = true
        
        // ดึงข้อมูลกิจกรรมจาก IndexedDB เพื่อ map ชื่อกิจกรรม
        let activitiesMap = {}
        try {
          let allActivities = await this.$indexedDB.getActivities()
          
          // ถ้าไม่มีใน IndexedDB ให้ดึงจาก API
          if (!allActivities || allActivities.length === 0) {
            const response = await this.$axios.$get('/api/parenting2025_census/get/homevisit/getobjective.php')
            if (response && response.results && response.results.length > 0) {
              await this.$indexedDB.clearActivities()
              await this.$indexedDB.addActivities(response.results)
              allActivities = response.results
            }
          }
          
          if (allActivities && allActivities.length > 0) {
            allActivities.forEach(act => {
              activitiesMap[String(act.no)] = {
                title: act.title || act.objective || `กิจกรรม ${act.no}`,
                objective: act.objective || '-'
              }
            })
          }
        } catch (err) {
          console.warn('ไม่สามารถโหลดข้อมูลกิจกรรม:', err)
        }
        
        // สร้าง q5 activities จาก q51_name - q55_name และ q51 - q55 (ทบทวนครั้งก่อน)
        const q5Activities = []
        for (let i = 1; i <= 5; i++) {
          const activityNo = raw[`q5${i}_name`]
          const activityAnswer = raw[`q5${i}`]
          if (activityNo) {
            const actInfo = activitiesMap[String(activityNo)] || {}
            q5Activities.push({
              no: activityNo,
              title: actInfo.title || `กิจกรรม ${activityNo}`,
              objective: actInfo.objective || '-',
              answer: activityAnswer
            })
          }
        }
        
        // สร้าง q9 activities จาก q91_name - q95_name และ q91 - q95
        const q9Activities = []
        for (let i = 1; i <= 5; i++) {
          const activityNo = raw[`q9${i}_name`]
          const activityAnswer = raw[`q9${i}`]
          if (activityNo) {
            const actInfo = activitiesMap[String(activityNo)] || {}
            q9Activities.push({
              no: activityNo,
              title: actInfo.title || `กิจกรรม ${activityNo}`,
              objective: actInfo.objective || '-',
              answer: activityAnswer
            })
          }
        }
        
        this.visitResultForm = {
          childName: raw.fullname_visit || this.visitHistoryForm.childName,
          visitorName: this.visitHistoryForm.visitorName,
          visitNumber: raw.time_visit || 1,
          visitDate: raw.date_visit || '-',
          visitTime: raw.timeStart || '-',
          endTime: raw.timeEnd || '-',
          monthAge: raw.month_age || null,
          time: raw.time_visit,
          note: raw.note || '',
          answers: {
            q1: parseInt(raw.q1) || null,
            q1_des: raw.q1_des || '',
            q2: parseInt(raw.q2) || null,
            q2_des: raw.q2_des || '',
            q3: raw.q3 || '',
            q3_des: raw.q3_des || '',
            q4: parseInt(raw.q4) || null,
            q6: parseInt(raw.q6) || null,
            q6_des: raw.q6_des || '',
            q7: parseInt(raw.q7) || null,
            q71: raw.q71 || '',
            q71_des: raw.q71_des || '',
            q8: parseInt(raw.q8) || null
          },
          q5Activities: q5Activities,
          q9Activities: q9Activities,
          appointment: {
            date: raw.q10_appDate || '',
            time: raw.q10_appTime || ''
          }
        }
        
        // ไม่ปิด visitHistoryModal แต่เปิด visitResultModal ซ้อนกัน
        this.showVisitResultModal = true
      } catch (error) {
        console.error('Error loading visit result:', error)
        this.$toast?.error('ไม่สามารถโหลดข้อมูลได้')
      } finally {
        this.loadingVisitResult = false
      }
    },
    
    // Helper methods for Q&A display
    getQ1Answer(value) {
      if (value === 1) return 'ได้'
      if (value === 2) return 'ทำบ้าง'
      if (value === 3) return 'ไม่ได้'
      return '-'
    },
    getQ2Answer(value) {
      if (value === 1) return 'ได้'
      if (value === 2) return 'ทำบ้าง'
      if (value === 3) return 'ไม่ได้'
      return '-'
    },
    getQ6Answer(value) {
      if (!value) return '-'
      const option = PARTICIPANT_OPTIONS.find(opt => opt.value === Number(value))
      return option ? option.label : '-'
    },
    getQ8Answer(value) {
      if (!value) return '-'
      const options = {
        1: 'ทำทุกวัน (7 วัน)',
        2: 'ทำบ่อย (5-6 วัน)',
        3: 'ทำบ้างเป็นบางวัน (3-4 วัน)',
        4: 'ทำน้อย (1-2 วัน)',
        5: 'ไม่ได้ทำเลย (0 วัน)'
      }
      return options[Number(value)] || '-'
    },
    getActivityAnswer(value) {
      if (value === null || value === undefined) return '-'
      const option = ACTIVITY_ANSWER_OPTIONS.find(opt => opt.value === Number(value))
      return option ? option.label : '-'
    },
    
    async downloadPDF() {
      if (!this.visitResultForm || !window.html2pdf) {
        this.$toast?.error('ไม่สามารถสร้าง PDF ได้ กรุณารอสักครู่แล้วลองอีกครั้ง')
        return
      }
      
      try {
        this.loadingPDF = true
        const element = document.getElementById('visit-result-pdf-content')
        if (!element) {
          this.$toast?.error('ไม่พบข้อมูลที่จะสร้าง PDF')
          return
        }
        
        const opt = {
          margin: [10, 10, 10, 10],
          filename: `แบบบันทึก_${this.visitResultForm.childName}_ครั้งที่${this.visitResultForm.visitNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }
        
        await window.html2pdf().set(opt).from(element).save()
        this.$toast?.success('ดาวน์โหลด PDF สำเร็จ')
      } catch (error) {
        console.error('Error generating PDF:', error)
        this.$toast?.error('เกิดข้อผิดพลาดในการสร้าง PDF')
      } finally {
        this.loadingPDF = false
      }
    },
    
    resetVisitHistoryForm() {
      this.visitHistoryForm = {
        childName: '',
        visitorName: '',
        stid: '',
        visits: []
      }
    },
    resetVisitResultForm() {
      this.visitResultForm = {
        childName: '',
        visitorName: '',
        visitNumber: null,
        visitDate: '',
        visitTime: '',
        endTime: '',
        answers: {},
        q5Activities: [],
        q9Activities: [],
        appointment: {}
      }
    },
    formatVisitDate(dateStr) {
      return formatVisitDate(dateStr)
    },
    onNestedModalShown() {
      // จัดการ z-index เมื่อ nested modal เปิด
      this.$nextTick(() => {
        // หา nested modal
        const nestedModal = document.getElementById('visitResultModal')
        if (nestedModal) {
          const modalElement = nestedModal.closest('.modal')
          if (modalElement) {
            modalElement.style.zIndex = '1070'
          }
        }
        
        // จัดการ backdrop ทั้งหมด
        const backdrops = document.querySelectorAll('.modal-backdrop')
        if (backdrops.length >= 2) {
          // Backdrop แรก (parent modal)
          backdrops[backdrops.length - 2].style.zIndex = '1055'
          // Backdrop ที่สอง (nested modal)
          backdrops[backdrops.length - 1].style.zIndex = '1065'
        } else if (backdrops.length === 1) {
          backdrops[0].style.zIndex = '1055'
        }
      })
    },
    onNestedModalHidden() {
      // ล้างข้อมูลเมื่อปิด nested modal
      this.resetVisitResultForm()
      
      // จัดการ backdrop เมื่อปิด nested modal
      this.$nextTick(() => {
        // รอให้ Bootstrap Vue จัดการ backdrop เสร็จก่อน
        setTimeout(() => {
          const backdrops = document.querySelectorAll('.modal-backdrop')
          
          // ถ้ายังมี parent modal เปิดอยู่ (visit history modal)
          if (this.showVisitHistoryModal) {
            // ถ้ามี backdrop มากกว่า 1 ตัว แสดงว่ายังมี backdrop ของ nested modal ค้างอยู่
            if (backdrops.length > 1) {
              // ลบ backdrop ที่มี z-index สูงสุด (ของ nested modal)
              backdrops.forEach((backdrop, index) => {
                if (parseInt(backdrop.style.zIndex) === 1065 || backdrop.style.zIndex === '1065') {
                  backdrop.remove()
                }
              })
            }
            
            // ปรับ z-index ของ parent modal backdrop ให้ถูกต้อง
            const remainingBackdrops = document.querySelectorAll('.modal-backdrop')
            if (remainingBackdrops.length > 0) {
              remainingBackdrops[0].style.zIndex = '1055'
            }
            
            // ปรับ z-index ของ parent modal
            const parentModal = document.getElementById('visitHistoryModal')
            if (parentModal) {
              const modalElement = parentModal.closest('.modal')
              if (modalElement) {
                modalElement.style.zIndex = '1060'
              }
            }
          }
        }, 100)
      })
    }
  }
}
</script>

<style scoped>
.supervisor-dashboard {
  padding: 2rem;
  min-height: 100vh;
  background-color: #ffffff;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.version-info {
  font-size: 0.85rem;
  color: #6c757d;
}

.filters-section {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.filter-label {
  font-weight: 500;
  color: #495057;
  font-size: 0.95rem;
}

.filter-select {
  width: 100%;
  min-height: 40px;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
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

.table-container {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

/* Skeleton Loading Styles */
.skeleton-table {
  width: 100%;
}

.skeleton-table table {
  width: 100%;
  margin-bottom: 0;
}

.skeleton-table thead th {
  background-color: #3551a4;
  color: white;
  font-weight: 500;
  text-align: center;
  padding: 1rem;
  border: none;
}

.skeleton-row td {
  padding: 1rem;
  vertical-align: middle;
}

.skeleton-cell {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-text {
  height: 16px;
  width: 80%;
}

.skeleton-text-short {
  height: 14px;
  width: 60%;
  margin: 0 auto;
}

.skeleton-button {
  height: 32px;
  width: 120px;
  margin: 0 auto;
  border-radius: 6px;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

::v-deep .supervisor-table {
  margin-bottom: 0;
}

::v-deep .supervisor-table .table-header {
  background-color: #3551a4;
  color: white;
  font-weight: 500;
  text-align: center;
  padding: 1rem;
  border: none;
}

::v-deep .supervisor-table tbody tr {
  border-bottom: 1px solid #e9ecef;
}

::v-deep .supervisor-table tbody tr:hover {
  background-color: #f8f9fa;
  transition: none;
}

::v-deep .supervisor-table tbody td {
  padding: 1rem;
  vertical-align: middle;
  text-align: center;
}

.visit-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
}

.visit-date {
  font-weight: 500;
  color: #2c3e50;
}

.visit-time {
  color: #6c757d;
  font-size: 0.9rem;
}

.visit-number {
  color: #6c757d;
  font-size: 0.85rem;
}

.next-visit-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
}

.next-visit-info.postponed {
  color: #dc3545;
}

.next-visit-date {
  font-weight: 500;
}

.postpone-info {
  font-size: 0.9rem;
  font-weight: 500;
}

.next-visit-time {
  color: #6c757d;
  font-size: 0.9rem;
}

.btn-history {
  background-color: #3551a4;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: none;
}

.btn-history:hover {
  background-color: #2c4088;
}

@media (max-width: 768px) {
  .supervisor-dashboard {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .filters-section {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }
}

/* Visit History Modal Styles */
::v-deep .modal-header-visit {
  background: #3551a4 !important;
  color: white !important;
  border-bottom: none !important;
  padding: 1rem 1.5rem !important;
}

::v-deep .modal-header-visit .modal-title {
  color: white !important;
  font-size: 1.75rem !important;
  font-weight: 400 !important;
}

.modal-header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
    align-items: center;
}

.modal-header-content .modal-title {
  margin: 0;
  padding: 0;
}

/* 95% Modal */
::v-deep .modal-95percent {
  max-width: 95vw !important;
  width: 95vw !important;
  margin: 2.5vh auto !important;
}

/* Nested Modal Styles */
/* First level modal (visit history) */
::v-deep #visitHistoryModal {
  z-index: 1060 !important;
}

::v-deep #visitHistoryModal .modal-dialog {
  z-index: 1060 !important;
}

/* Second level modal (visit result - nested) */
::v-deep #visitResultModal {
  z-index: 1070 !important;
}

::v-deep #visitResultModal .modal-dialog {
  z-index: 1070 !important;
}

/* Backdrop management for nested modals */
::v-deep .modal-backdrop {
  z-index: 1040;
}

/* When visit history modal is open */
::v-deep body.modal-open #visitHistoryModal ~ .modal-backdrop {
  z-index: 1055 !important;
}

/* When both modals are open - nested modal backdrop */
::v-deep body.modal-open #visitResultModal ~ .modal-backdrop {
  z-index: 1065 !important;
}

/* Ensure nested modal appears above parent */
::v-deep .nested-modal-level-2 {
  z-index: 1070 !important;
}

::v-deep .nested-modal-level-2 .modal-dialog {
  z-index: 1070 !important;
  position: relative;
}

::v-deep .modal-95percent .modal-dialog {
  max-width: 95vw !important;
  width: 95vw !important;
  height: 95vh !important;
  margin: 0 !important;
  display: flex !important;
  flex-direction: column !important;
}

::v-deep .modal-95percent .modal-content {
  height: 95vh !important;
  border-radius: 0.5rem !important;
  display: flex !important;
  flex-direction: column !important;
  border: 1px solid #dee2e6 !important;
  box-shadow: none !important;
}

::v-deep .modal-95percent .modal-body {
  flex: 1 !important;
  overflow-y: auto !important;
  padding: 1.5rem !important;
}

::v-deep .modal-95percent .modal-header {
  flex-shrink: 0 !important;
}

::v-deep .modal-95percent .modal-footer {
  flex-shrink: 0 !important;
}

.patient-info-bar {
  background: rgba(255, 255, 255, 0.8);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: black;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.patient-info-bar i {
  font-size: 1.5rem;
  color: black;
}

.patient-name-large {
  font-size: 1.25rem;
  font-weight: 400;
  color: black;
}

.patient-nickname-badge {
  font-size: 1.05rem;
  font-weight: 300;
  color: black;
  margin-left: 0.5rem;
}

/* Visit History Table */
.visit-history-table-container {
  overflow-x: auto;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}

.visit-history-table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.visit-history-table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.visit-history-table-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.visit-history-table-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.visit-history-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  overflow: hidden;
}

.visit-history-table thead {
  background: #3551a4;
  color: white;
}

.visit-history-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 500;
  font-size: 1.1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.visit-history-table th.col-visit-number {
  width: 25%;
}

.visit-history-table th.col-date-time {
  width: 40%;
}

.visit-history-table th.col-action {
  width: 35%;
  text-align: center;
}

.visit-history-table tbody tr {
  border-bottom: 1px solid #e9ecef;
  transition: none;
}

.visit-history-table tbody tr:hover {
  background-color: #f8f9fa;
}

.visit-history-table tbody tr:last-child {
  border-bottom: none;
}

.visit-history-table td {
  padding: 1rem 1.5rem;
  vertical-align: middle;
}

.visit-history-table td.col-visit-number {
  width: 25%;
}

.visit-history-table td.col-date-time {
  width: 40%;
}

.visit-history-table td.col-action {
  width: 35%;
  text-align: center;
}

.visit-number-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.visit-number-badge {
  background: #3551a4;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-block;
}

.visit-status-badges {
  display: flex;
  align-items: center;
}

.visit-status-badges .badge {
  font-size: 0.85rem;
  padding: 0.35rem 0.7rem;
  border-radius: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.visit-status-badges .badge-warning {
  background: #ffc107;
  color: #333;
}

.visit-status-badges .badge-secondary {
  background: #6c757d;
  color: white;
}

.visit-status-badges .badge-success {
  background: #28a745;
  color: white;
}

.date-time-info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.visit-date-text {
  font-size: 1rem;
  font-weight: 500;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.visit-date-text i {
  color: #3551a4;
  font-size: 1rem;
}

.visit-time-text {
  font-size: 0.95rem;
  font-weight: 400;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.visit-time-text i {
  color: #6c757d;
  font-size: 0.9rem;
}

.btn-view-result {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-view-result:hover {
  background: #138496;
}

.btn-view-result i {
  font-size: 1rem;
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

/* Visit Result Modal Styles */
.visit-result-header {
  margin-bottom: 2rem;
}

.visit-date-info {
  background: #e3f2fd;
  padding: 1rem 1.35rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1976d2;
  font-size: 1.15rem;
  font-weight: 500;
  border: 1px solid #bbdefb;
}

.visit-date-info i {
  font-size: 1.3rem;
}

.survey-answers-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.answer-item {
  background: #f8f9fa;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 2px solid #dee2e6;
  transition: none;
}

.answer-item:hover {
  border-color: #3551a4;
}

.answer-question {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #dee2e6;
}

.question-number {
  background: #3551a4;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1.1rem;
  min-width: 60px;
  text-align: center;
}

.question-text {
  font-size: 1.25rem;
  font-weight: 500;
  color: #2c3e50;
  flex: 1;
  line-height: 1.5;
}

.answer-content {
  padding-left: 0.5rem;
}

.answer-text {
  font-size: 1.15rem;
  color: #495057;
  line-height: 1.6;
  white-space: pre-line;
}

.answer-options {
  font-size: 1.15rem;
}

.answer-option {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  display: inline-block;
  border: 1px solid #c8e6c9;
}

.answer-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: #3551a4;
}

.answer-list {
  font-size: 1.15rem;
  color: #495057;
}

.answer-list ul {
  margin: 0;
  padding-left: 1.5rem;
}

.answer-list li {
  line-height: 1.8;
  margin-bottom: 0.5rem;
}

.empty-answers {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.empty-answers i {
  font-size: 5.5rem;
  color: #dee2e6;
  margin-bottom: 1.5rem;
}

.empty-answers p {
  font-size: 1.35rem;
  font-weight: 300;
  margin: 0;
}

@media (max-width: 768px) {
  .visit-history-table-container {
    max-height: calc(100vh - 200px);
  }
  
  .visit-history-table {
    font-size: 0.9rem;
  }
  
  .visit-history-table th,
  .visit-history-table td {
    padding: 0.75rem 1rem;
  }
  
  .visit-number-status {
    gap: 0.3rem;
  }
  
  .visit-number-badge {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }
  
  .visit-status-badges .badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  
  .date-time-info {
    gap: 0.3rem;
  }
  
  .visit-date-text,
  .visit-time-text {
    font-size: 0.9rem;
  }
  
  .btn-view-result {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
  
  .answer-question {
    flex-direction: column;
    gap: 0.75rem;
  }
}

/* PDF Style Modal - Record Modal Dialog */
::v-deep .record-modal-dialog {
  width: 95vw;
  max-width: 95vw;
  height: 95vh;
  max-height: 95vh;
  margin: 2.5vh auto;
  display: flex;
  flex-direction: column;
}

::v-deep .record-modal-dialog .modal-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

::v-deep .record-modal-dialog .modal-header {
  flex-shrink: 0;
}

::v-deep .record-modal-dialog .modal-footer {
  flex-shrink: 0;
}

::v-deep .record-modal-body {
  padding: 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.visit-record-wrapper {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.visit-record-content {
  padding: 1.5rem;
  background: white;
  font-family: 'Kanit', sans-serif;
  color: #2c3e50;
  width: 100%;
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.record-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #3551a4;
}

.record-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3551a4;
}

.record-section {
  margin-bottom: 1.5rem;
}

.record-section .section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #3551a4;
  margin-bottom: 0.5rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #dee2e6;
}

.info-row-single {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.info-label {
  font-weight: 600;
  color: #495057;
  font-size: 1rem;
  white-space: nowrap;
}

.info-value {
  font-size: 1.05rem;
  color: #2c3e50;
  font-weight: 500;
}

.record-section .question-item {
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.75rem;
}

.record-section .question-text {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  font-size: 1.05rem;
}

.record-section .answer-text {
  font-size: 1.1rem;
  color: #3551a4;
  font-weight: 600;
  padding-left: 1rem;
}

.activity-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
  font-size: 1rem;
}

.activity-table thead {
  background: #3551a4;
  color: white;
}

.activity-table th {
  padding: 0.5rem;
  text-align: left;
  font-weight: 500;
  border: 1px solid #dee2e6;
}

.activity-table td {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  vertical-align: top;
}

.activity-table tbody tr:nth-child(even) {
  background: #f8f9fa;
}

.loading-record {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
}

.loading-record i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #3551a4;
}

.loading-record p {
  font-size: 1.2rem;
  margin: 0;
}

/* Print styles for A4 */
@media print {
  .visit-record-content {
    width: 210mm;
    min-height: 297mm;
    margin: 0;
    padding: 1.5rem;
  }
}

/* Plain Text Format Styles */
.plain-text-section {
  margin-bottom: 1rem;
}

.plain-text-section p {
  margin: 0.3rem 0;
  font-size: 1rem;
  line-height: 1.6;
  color: #2c3e50;
}

.section-header-text {
  font-weight: 600;
  color: #2c3e50;
  margin-top: 0.75rem !important;
  margin-bottom: 0.5rem !important;
}

.section-header-text.underline {
  text-decoration: underline;
}

.indent-answer {
  padding-left: 2rem;
  color: #2c3e50;
}

.plain-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.plain-table thead {
  background: transparent;
}

.plain-table th {
  padding: 0.5rem;
  text-align: left;
  font-weight: 600;
  border: 1px solid #2c3e50;
  color: #2c3e50;
}

.plain-table td {
  padding: 0.5rem;
  border: 1px solid #2c3e50;
  vertical-align: top;
  color: #2c3e50;
}
</style>

