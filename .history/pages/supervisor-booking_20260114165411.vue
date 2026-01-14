<template>
  <div class="supervisor-booking">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">ยืนยันการเยี่ยมบ้าน</h1>
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
              <td><div class="skeleton-cell skeleton-text-short"></div></td>
              <td><div class="skeleton-cell skeleton-text"></div></td>
              <td><div class="skeleton-cell skeleton-text"></div></td>
              <td><div class="skeleton-cell skeleton-text"></div></td>
              <td><div class="skeleton-cell skeleton-button"></div></td>
              <td><div class="skeleton-cell skeleton-button-small"></div></td>
              <td><div class="skeleton-cell skeleton-checkbox"></div></td>
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
        <template #cell(index)="row">
          {{ row.index + 1 }}
        </template>

        <template #cell(visitDate)="row">
          {{ row.item.visitDate }}
        </template>

        <template #cell(visitorName)="row">
          {{ row.item.visitorName }}
        </template>

        <template #cell(childName)="row">
          {{ row.item.childName }}
        </template>

        <template #cell(record)="row">
          <button
            class="btn-record"
            :class="{
              'btn-success': row.item.recordStatus === 'completed',
              'btn-warning': row.item.recordStatus === 'pending'
            }"
            @click="viewRecord(row.item)"
          >
            <i
              class="fas"
              :class="
                row.item.recordStatus === 'completed'
                  ? 'fa-check'
                  : 'fa-exclamation-triangle'
              "
            ></i>
            แบบเยี่ยมบ้าน
          </button>
        </template>

        <template #cell(photos)="row">
          <button
            v-if="row.item.hasPhotos"
            class="btn-photos"
            @click="viewPhotos(row.item)"
          >
            <i class="fas fa-camera"></i>
            ดูรูป
          </button>
          <span v-else class="no-photos">
            <i class="fas fa-times"></i>
          </span>
        </template>

        <template #cell(confirm)="row">
          <div class="confirm-status">
            <i
              v-if="row.item.confirmStatus === 'confirmed'"
              class="fas fa-check-circle text-success"
            ></i>
            <i
              v-else-if="row.item.confirmStatus === 'warning'"
              class="fas fa-exclamation-circle text-warning"
            ></i>
            <input
              v-else
              type="checkbox"
              :checked="selectedItems.includes(row.item)"
              @change="toggleConfirm(row.item, $event)"
            />
          </div>
        </template>
      </b-table>
    </div>

    <!-- Action Buttons -->
    <div v-if="selectedItems.length > 0" class="action-buttons-section">
      <div class="action-buttons">
        <button class="btn-action btn-approve" @click="handleApprove">
          <i class="fas fa-check"></i>
          อนุมัติ
        </button>
        <button class="btn-action btn-edit" @click="handleEdit">
          <i class="fas fa-edit"></i>
          แก้ไข
        </button>
      </div>
      <div class="selected-count">
        เลือกแล้ว {{ selectedItems.length }} รายการ
      </div>
    </div>

    <!-- Latest Approvals Table -->
    <div class="latest-approvals-section">
      <div class="section-header">
        <h2 class="section-title">การอนุมัติล่าสุด</h2>
        <button class="btn-refresh" @click="refreshLatestApprovals">
          <i class="fas fa-sync-alt"></i>
          รีเฟรส
        </button>
      </div>
      <div class="table-container">
        <b-table
          :items="latestApprovalsData"
          :fields="tableFields"
          striped
          hover
          responsive
          class="supervisor-table"
        >
          <template #cell(index)="row">
            {{ row.index + 1 }}
          </template>

          <template #cell(visitDate)="row">
            {{ row.item.visitDate }}
          </template>

          <template #cell(visitorName)="row">
            {{ row.item.visitorName }}
          </template>

          <template #cell(childName)="row">
            {{ row.item.childName }}
          </template>

          <template #cell(record)="row">
            <button
              class="btn-record"
              :class="{
                'btn-success': row.item.recordStatus === 'completed',
                'btn-warning': row.item.recordStatus === 'pending'
              }"
              @click="viewRecord(row.item)"
            >
              <i
                class="fas"
                :class="
                  row.item.recordStatus === 'completed'
                    ? 'fa-check'
                    : 'fa-exclamation-triangle'
                "
              ></i>
              แบบเยี่ยมบ้าน
            </button>
          </template>

          <template #cell(photos)="row">
            <button
              v-if="row.item.hasPhotos"
              class="btn-photos"
              @click="viewPhotos(row.item)"
            >
              <i class="fas fa-camera"></i>
              ดูรูป
            </button>
            <span v-else class="no-photos">
              <i class="fas fa-times"></i>
            </span>
          </template>

          <template #cell(confirm)="row">
            <div class="confirm-status">
              <i
                v-if="row.item.confirmStatus === 'confirmed'"
                class="fas fa-check-circle text-success"
              ></i>
              <i
                v-else-if="row.item.confirmStatus === 'warning'"
                class="fas fa-exclamation-circle text-warning"
              ></i>
              <span v-else class="text-muted">-</span>
            </div>
          </template>
        </b-table>
      </div>
    </div>

    <!-- Photo View Modal -->
    <b-modal
      v-model="showPhotoModal"
      title="รูปภาพกิจกรรม"
      size="xl"
      no-close-on-backdrop
      @hidden="closePhotoModal"
      header-class="modal-header-visit"
    >
      <div class="photo-view-content">
        <div class="patient-info-bar-small">
          <i class="fas fa-user-circle"></i>
          <span>{{ photoModalData.childName }}</span>
          <span class="badge badge-info">{{ photoModalData.visitDate }}</span>
        </div>

        <div v-if="loadingPhotos" class="loading-photos">
          <i class="fas fa-spinner fa-spin"></i>
          <p>กำลังโหลดรูปภาพ...</p>
        </div>

        <div v-else class="dual-image-container">
          <!-- Image 1 -->
          <div class="image-section">
            <h6>รูปภาพที่ 1: รูปของเล่น สื่ออุปกรณ์ที่ใช้ในครั้งนี้</h6>
            <div v-if="photoModalData.images[0]" class="current-image-section">
              <div class="image-preview-large">
                <img :src="photoModalData.images[0]" alt="รูปของเล่น สื่ออุปกรณ์">
              </div>
            </div>
            <div v-else class="no-image-section">
              <i class="fas fa-image"></i>
              <p>ยังไม่มีรูปภาพ</p>
            </div>
          </div>

          <!-- Image 2 -->
          <div class="image-section">
            <h6>รูปภาพที่ 2: รูปขณะที่เด็กและผู้ปกครองทำกิจกรรม</h6>
            <div v-if="photoModalData.images[1]" class="current-image-section">
              <div class="image-preview-large">
                <img :src="photoModalData.images[1]" alt="รูปขณะที่เด็กและผู้ปกครองทำกิจกรรม">
              </div>
            </div>
            <div v-else class="no-image-section">
              <i class="fas fa-image"></i>
              <p>ยังไม่มีรูปภาพ</p>
            </div>
          </div>
        </div>
      </div>

      <template #modal-footer="{ cancel }">
        <b-button variant="secondary" @click="cancel()">
          <i class="fas fa-times"></i>
          ปิด
        </b-button>
      </template>
    </b-modal>

    <!-- Visit Record Detail Modal -->
    <b-modal
      v-model="showRecordModal"
      title="แบบบันทึกข้อมูลเด็ก สำหรับผู้เยี่ยมบ้าน"
      :dialog-class="'record-modal-dialog'"
      no-close-on-backdrop
      @hidden="closeRecordModal"
      header-class="modal-header-visit"
      body-class="record-modal-body"  hide-footer
    >
      <div v-if="recordData" class="visit-record-wrapper">
        <div id="visit-record-content" class="visit-record-content">
        <!-- Header Section -->
        <div class="record-header">
          <div class="record-title">แบบบันทึกข้อมูลเด็ก สำหรับผู้เยี่ยมบ้าน</div>
        </div>

        <!-- Basic Info Section -->
        <div class="plain-text-section">
          <p>ชื่อ-นามสกุลของเด็ก : {{ recordData.childName || '-' }} <span style="margin-left: 3rem;">วันพุธที่ {{ recordData.visitDate || '-' }}</span></p>
          <p>ชื่อ-นามสกุลของผู้เยี่ยมบ้าน : {{ recordData.visitorName || '-' }} <span style="margin-left: 3rem;">การเยี่ยมบ้านครั้งที่ {{ recordData.visitNumber || '-' }}</span></p>
          <p>เวลาเริ่มต้นการเยี่ยมบ้าน {{ recordData.startTime || '-' }} น.</p>
        </div>

        <!-- Home Visit Section -->
        <div class="plain-text-section">
          <p class="section-header-text">การเยี่ยมบ้าน</p>
          <p>1 : ผู้ปกครองสามารถเข้าร่วมกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</p>
          <p class="indent-answer">{{ getQ1Answer(recordData.answers?.q1) }}</p>
          <p>2 : เด็กสามารถเข้าร่วมกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</p>
          <p class="indent-answer">{{ getQ2Answer(recordData.answers?.q2) }}</p>
        </div>

        <!-- Review Previous Visit Section -->
        <div class="plain-text-section">
          <p class="section-header-text underline">ทบทวนการเยี่ยมบ้านครั้งที่ผ่านมา</p>
          <p>3 : ในสัปดาห์ที่ผ่านมา ใครเป็นคนทำกิจกรรมที่ได้จากการเยี่ยมบ้านร่วมกับเด็ก</p>
          <p class="indent-answer">{{ getQ6Answer(recordData.answers?.q6) }}</p>
          <p>4 : ในสัปดาห์ที่ผ่านมา ผู้ปกครองร่วมทำกิจกรรมกับเด็กบ่อยแค่ไหน ?</p>
          <p class="indent-answer">{{ getQ8Answer(recordData.answers?.q8) }}</p>
          <p>5 : ให้ผู้เยี่ยมบ้าน <strong>สังเกต</strong> หรือ <strong>ทบทวน</strong> กิจกรรมการเยี่ยมบ้านครั้งที่ผ่านมา โดยขอให้ผู้ปกครองสาธิตการทำกิจกรรมร่วมกับเด็ก</p>
        </div>

        <!-- Activity Review Table -->
        <div class="plain-text-section">
          <p class="section-header-text underline">ทบทวนกิจกรรมการเยี่ยมบ้าน : เดือนที่ {{ recordData.monthAge || '-' }} การเยี่ยมบ้าน {{ recordData.time || '-' }}</p>
          <table class="plain-table">
            <thead>
              <tr>
                <th>ชื่อกิจกรรม</th>
                <th>จุดประสงค์</th>
                <th>คำตอบ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(activity, index) in recordData.q5Activities" :key="'q5-' + index">
                <td>{{ activity.title || activity.activity || `กิจกรรม ${index + 1}` }}</td>
                <td>{{ activity.objective || '-' }}</td>
                <td>{{ getActivityAnswer(activity.answer || recordData.answers?.q5?.[activity.no]) }}</td>
              </tr>
              <tr v-if="!recordData.q5Activities || recordData.q5Activities.length === 0">
                <td colspan="3" class="text-center text-muted">ไม่มีข้อมูลกิจกรรมทบทวน</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Additional Info Section -->
        <div class="plain-text-section">
          <p>6 : ใครทำกิจกรรมกับเด็ก</p>
          <p class="indent-answer">{{ getQ6Answer(recordData.answers?.q6) }}</p>
          <p>7 : มีผู้อื่นร่วมทำกิจกรรมด้วยหรือไม่ (มากกว่า 20 นาที)</p>
          <p class="indent-answer">{{ recordData.answers?.q7 === 1 ? 'มี' : recordData.answers?.q7 === 3 ? 'ไม่มี' : '-' }}</p>
          <p>8 : มีเด็กคนอื่นร่วมทำกิจกรรมไปพร้อมกับเด็กกลุ่มตัวอย่างด้วยหรือไม่ (เด็กอายุไม่เกิน 5 ขวบ)</p>
          <p class="indent-answer">{{ recordData.answers?.q8 === 1 ? 'มี' : recordData.answers?.q8 === 3 ? 'ไม่มี' : '-' }}</p>
        </div>

        <!-- Current Visit Activities Section (Q9) -->
        <div v-if="recordData.q9Activities && recordData.q9Activities.length > 0" class="plain-text-section">
          <p>9 : ให้ผู้เยี่ยมบ้าน <strong>สังเกต</strong> หรือ <strong>ทบทวน</strong> กิจกรรมการเยี่ยมบ้าน เดือนที่ {{ recordData.monthAge || '-' }} การเยี่ยมบ้าน {{ parseInt(recordData.time || 0) + 1 }}</p>
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
              <tr v-for="(activity, index) in recordData.q9Activities" :key="'q9-' + index">
                <td>{{ activity.title }}</td>
                <td>{{ activity.objective || '-' }}</td>
                <td>{{ getActivityAnswer(activity.answer || recordData.answers?.q9?.[activity.no]) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Appointment Section -->
        <div class="plain-text-section">
          <p>10 : นัดหมายการเยี่ยมบ้านครั้งต่อไป วันที่ {{ recordData.appointment?.date || '-' }} เวลา {{ recordData.appointment?.time || '-' }} น.</p>
          <p>เวลาสิ้นสุดการเยี่ยมบ้าน {{ recordData.endTime || '-' }} น.</p>
          <p v-if="recordData.note">บันทึกผู้เยี่ยมบ้าน - {{ recordData.note }}</p>
        </div>

        </div>
      </div>

      <div v-else class="loading-record">
        <i class="fas fa-spinner fa-spin"></i>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <template #modal-footer="{ cancel }">
        <b-button variant="secondary" @click="cancel()">
          <i class="fas fa-times"></i>
          ปิด
        </b-button>
        <!-- <b-button variant="primary" @click="downloadPDF" :disabled="!recordData || loadingPDF">
          <i class="fas fa-download"></i>
          {{ loadingPDF ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF' }}
        </b-button> -->
      </template>
    </b-modal>
  </div>
</template>

<script>
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
      tableFields: [
        {
          key: 'index',
          label: '#',
          thClass: 'table-header'
        },
        {
          key: 'visitDate',
          label: 'เยี่ยมบ้าน (ครั้งที่)',
          thClass: 'table-header'
        },
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
          key: 'record',
          label: 'บันทึกเยี่ยมบ้าน',
          thClass: 'table-header'
        },
        {
          key: 'photos',
          label: 'รูปกิจกรรม',
          thClass: 'table-header'
        },
        {
          key: 'confirm',
          label: 'ยืนยันการเยี่ยมบ้าน',
          thClass: 'table-header'
        }
      ],
      tableData: [],
      showPhotoModal: false,
      photoModalData: {
        childName: '',
        visitDate: '',
        images: []
      },
      loadingPhotos: false,
      selectedItems: [],
      showRecordModal: false,
      recordData: null,
      loadingRecord: false,
      loadingPDF: false,
      latestApprovalsData: []
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

    // Initialize Select2 for dropdowns
    this.$nextTick(() => {
      if (this.$select2) {
        if (this.$refs.subdistrictSelect) {
          this.$select2.init(this.$refs.subdistrictSelect)
          // Sync v-model with select2 - เรียก fetchTableData เฉพาะจาก event นี้เท่านั้น
          window.$(this.$refs.subdistrictSelect).on('change', () => {
            const newVal = window.$(this.$refs.subdistrictSelect).val()
            if (this.filters.subdistrict !== newVal) {
              this.filters.subdistrict = newVal
              this.fetchTableData()
            }
          })
        }
        if (this.$refs.visitorSelect) {
          this.$select2.init(this.$refs.visitorSelect)
          // Sync v-model with select2 - เรียก fetchTableData เฉพาะจาก event นี้เท่านั้น
          window.$(this.$refs.visitorSelect).on('change', () => {
            const newVal = window.$(this.$refs.visitorSelect).val()
            if (this.filters.visitor !== newVal) {
              this.filters.visitor = newVal
              this.fetchTableData()
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
        const isSuccess = response.message === 'success' || response.statusCode === 200
        if (isSuccess && response.results) {
          this.subdistrictOptions = [
            { value: 'all', text: '--ทั้งหมด--' },
            ...response.results.map(item => ({
              value: item.amp_code || item.code,
              text: item.amp_nameT || item.name
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
        const isSuccess = response.message === 'success' || response.statusCode === 200
        if (isSuccess && response.results) {
          // ใช้ทุก user ที่มี และใช้ username เป็น key สำหรับ map กับ recby
          this.visitorOptions = [
            { value: 'all', text: '--ทั้งหมด--' },
            ...response.results.map(item => ({
              value: item.username,  // ใช้ username ให้ตรงกับ recby
              text: `${item.fname || ''} ${item.lname || ''}`.trim() || item.username
            }))
          ]
        }
      } catch (error) {
        console.error('Error fetching visitor options:', error)
      }
    },

    // ดึงข้อมูลตารางผลการเยี่ยมบ้าน
    async fetchTableData() {
      this.loading = true
      try {
        const params = new URLSearchParams()
        if (this.filters.subdistrict && this.filters.subdistrict !== 'all') {
          params.append('amp_code', this.filters.subdistrict)
        }
        if (this.filters.visitor && this.filters.visitor !== 'all') {
          params.append('user_id', this.filters.visitor)
        }
        
        // ใช้ API ใหม่ที่มีข้อมูลครบถ้วน
        const url = `/api/parenting2025_census/get/homevisit/sup/gethomevisit_result_data.php${params.toString() ? '?' + params.toString() : ''}`
        const response = await this.$axios.$get(url)
        
        const isSuccess = response.message === 'success' || response.statusCode === 200
        if (isSuccess && response.results) {
          // สร้าง lookup map: username -> ชื่อเต็ม จาก visitorOptions
          const visitorNameMap = {}
          this.visitorOptions.forEach(opt => {
            if (opt.value !== 'all') {
              visitorNameMap[opt.value] = opt.text
            }
          })
          
          // Filter ข้อมูลฝั่ง client ตามผู้เยี่ยมบ้านที่เลือก
          let filteredResults = response.results
          if (this.filters.visitor && this.filters.visitor !== 'all') {
            filteredResults = response.results.filter(item => item.recby === this.filters.visitor)
          }
          
          this.tableData = filteredResults.map((item, index) => ({
            id: `${item.stid}-${item.time_visit}-${index}`,
            stid: item.stid,
            visitDate: `${item.date_visit || '-'} (${item.time_visit || '-'})`,
            visitorName: visitorNameMap[item.recby] || item.recby || '-',
            childName: item.fullname_visit || `${item.fname_ch || ''} ${item.lname_ch || ''}`.trim() || '-',
            recordStatus: item.recStatus === '1' ? 'completed' : 'pending',
            hasPhotos: !!(item.pic1 || item.pic2),
            confirmStatus: item.confirmStatus || 'pending',
            surveyId: item.stid,
            recby: item.recby,
            tamCode: item.tam_code,
            timeVisit: item.time_visit,
            // เก็บ response ดิบไว้สำหรับ modal
            rawData: item
          }))
        } else {
          this.tableData = []
        }
      } catch (error) {
        console.error('Error fetching table data:', error)
        this.tableData = []
      } finally {
        this.loading = false
      }
    },

    refreshLatestApprovals() {
      // TODO: Implement refresh approved items API
      this.$toast.info('รีเฟรสข้อมูลการอนุมัติล่าสุด')
    },

    async viewRecord(item) {
      try {
        this.loadingRecord = true
        this.showRecordModal = true
        this.recordData = null

        // ใช้ข้อมูลจาก rawData (API response) โดยตรง
        if (item.rawData) {
          const raw = item.rawData
          
          // ดึงข้อมูลกิจกรรมจาก IndexedDB เพื่อ map ชื่อกิจกรรม
          let activitiesMap = {}
          try {
            let allActivities = await this.$indexedDB.getActivities()
            
            // ถ้าไม่มีใน IndexedDB ให้ดึงจาก API
            if (!allActivities || allActivities.length === 0) {
              console.log('ไม่พบข้อมูลกิจกรรมใน IndexedDB, กำลังดึงจาก API...')
              const response = await this.$axios.$get('/api/parenting2025_census/get/homevisit/getobjective.php')
              if (response && response.results && response.results.length > 0) {
                // บันทึกลง IndexedDB
                await this.$indexedDB.clearActivities()
                await this.$indexedDB.addActivities(response.results)
                allActivities = response.results
                console.log(`โหลดกิจกรรม ${allActivities.length} รายการจาก API แล้ว`)
              }
            }
            
            if (allActivities && allActivities.length > 0) {
              allActivities.forEach(act => {
                activitiesMap[String(act.no)] = act.title || act.objective || `กิจกรรม ${act.no}`
              })
            }
          } catch (err) {
            console.warn('ไม่สามารถโหลดข้อมูลกิจกรรม:', err)
          }
          
          // สร้าง q9 activities จาก q91_name - q95_name และ q91 - q95
          const q9Activities = []
          for (let i = 1; i <= 5; i++) {
            const activityNo = raw[`q9${i}_name`]
            const activityAnswer = raw[`q9${i}`]
            if (activityNo) {
              q9Activities.push({
                no: activityNo,
                title: activitiesMap[String(activityNo)] || `กิจกรรม ${activityNo}`,
                answer: activityAnswer
              })
            }
          }

          // สร้าง q5 activities จาก q51_name - q55_name และ q51 - q55 (ทบทวนครั้งก่อน)
          const q5Activities = []
          for (let i = 1; i <= 5; i++) {
            const activityNo = raw[`q5${i}_name`]
            const activityAnswer = raw[`q5${i}`]
            if (activityNo) {
              q5Activities.push({
                no: activityNo,
                title: activitiesMap[String(activityNo)] || `กิจกรรม ${activityNo}`,
                answer: activityAnswer
              })
            }
          }

          this.recordData = {
            childName: raw.fullname_visit || item.childName,
            visitorName: item.visitorName,
            visitDate: raw.date_visit || item.visitDate,
            visitNumber: raw.time_visit || 1,
            startTime: raw.timeStart || '16:00 น.',
            endTime: raw.timeEnd || '-',
            monthAge: null, // ไม่มีใน API
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
              q8: parseInt(raw.q8) || null,
              q5: {},  // จะ map จาก q5Activities
              q9: {}   // จะ map จาก q9Activities
            },
            q5Activities: q5Activities,
            q9Activities: q9Activities,
            appointment: {
              date: raw.q10_appDate || '',
              time: raw.q10_appTime || ''
            },
            pics: {
              pic1: raw.pic1 || '',
              pic2: raw.pic2 || '',
              pic3: raw.pic3 || ''
            }
          }

          // Map q5 answers
          q5Activities.forEach(act => {
            if (act.answer) {
              this.recordData.answers.q5[act.no] = parseInt(act.answer)
            }
          })

          // Map q9 answers  
          q9Activities.forEach(act => {
            if (act.answer) {
              this.recordData.answers.q9[act.no] = parseInt(act.answer)
            }
          })
        } else {
          // Fallback: ใช้ข้อมูลจาก item โดยตรง
          this.recordData = {
            childName: item.childName,
            visitorName: item.visitorName,
            visitDate: item.visitDate,
            visitNumber: item.timeVisit || 1,
            startTime: '16:00 น.',
            endTime: '-',
            answers: {},
            q5Activities: [],
            q9Activities: []
          }
        }
      } catch (error) {
        console.error('Error loading record:', error)
        this.$toast.error('ไม่สามารถโหลดข้อมูลได้')
        this.recordData = null
      } finally {
        this.loadingRecord = false
      }
    },
    async loadRecordData(survey, item) {
      // Parse visit date and time
      const visitDate = survey.appointmentDate || survey.timeStart?.split(' ')[0] || item.visitDate
      const startTime = survey.timeStart?.split(' ')[1] || survey.appointmentTime || '16:00 น.'
      const visitNumber = survey.time || survey.time_visit || this.extractVisitNumber(item.visitDate)

      // Load q5 activities if available
      let q5Activities = []
      if (survey.answers?.q5 && Object.keys(survey.answers.q5).length > 0) {
        const q5ActivityIds = Object.keys(survey.answers.q5).filter(id => id && id !== '')
        if (q5ActivityIds.length > 0) {
          try {
            const allActivities = await this.$indexedDB.getAll('activities')
            const q5MatchingActivities = allActivities.filter(activity => {
              return q5ActivityIds.includes(String(activity.no))
            })
            q5MatchingActivities.sort((a, b) => {
              return q5ActivityIds.indexOf(String(a.no)) - q5ActivityIds.indexOf(String(b.no))
            })
            q5Activities = q5MatchingActivities
          } catch (error) {
            console.error('Error loading q5 activities:', error)
          }
        }
      }

      // If no q5 activities or less than 10, generate mock activities
      if (q5Activities.length < 10) {
        q5Activities = this.generateMockActivities(q5Activities, survey.month_age, survey.time)
      }

      this.recordData = {
        childName: survey.fullname_visit || item.childName,
        visitorName: item.visitorName,
        visitDate: visitDate,
        visitNumber: visitNumber,
        startTime: startTime,
        monthAge: survey.month_age,
        time: survey.time,
        answers: survey.answers || {},
        q5Activities: q5Activities
      }
    },
    generateMockActivities(existingActivities, monthAge, time) {
      const mockActivities = [
        {
          no: '1',
          title: 'จิ๊กซอว์ 16 - ปลา',
          objective: 'เด็กวางจิ๊กซอว์เข้าด้วยกันเพื่อประกอบเป็นรูปปลา และพูดเกี่ยวกับปลา',
          month_age: monthAge || 44,
          time: time || 2
        },
        {
          no: '2',
          title: 'ของเล่นร้อยเชือก 1 - เชือกร้อยลูกปัด',
          objective: 'เด็กร้อยคอขวดหรือลูกปัดตามลำดับสี – สีแดง เหลือง แดง เหลือง',
          month_age: monthAge || 44,
          time: time || 2
        },
        {
          no: '3',
          title: 'เกมแอคชั่น 5 - อะไรหายไป',
          objective: 'เด็กบอกชื่อสิ่งของที่หายไป',
          month_age: monthAge || 44,
          time: time || 2
        },
        {
          no: '4',
          title: 'บล็อกไม้ - สร้างหอคอย',
          objective: 'เด็กวางบล็อกไม้ซ้อนกันเป็นหอคอยสูง 8 ชั้น',
          month_age: monthAge || 44,
          time: time || 2
        },
        {
          no: '5',
          title: 'หนังสือภาพ - เล่านิทาน',
          objective: 'เด็กเล่าเรื่องจากภาพในหนังสือได้อย่างน้อย 3 หน้า',
          month_age: monthAge || 44,
          time: time || 2
        },
        {
          no: '6',
          title: 'ดินน้ำมัน - ปั้นรูปสัตว์',
          objective: 'เด็กปั้นดินน้ำมันเป็นรูปสัตว์ที่รู้จักได้อย่างน้อย 2 ชนิด',
          month_age: monthAge || 44,
          time: time || 2
        },
        {
          no: '7',
          title: 'สีเทียน - วาดรูป',
          objective: 'เด็กใช้สีเทียนวาดรูปตามจินตนาการและบอกเล่าเรื่องราว',
          month_age: monthAge || 44,
          time: time || 2
        },
        {
          no: '8',
          title: 'ลูกบอล - โยนรับ',
          objective: 'เด็กโยนลูกบอลและรับได้อย่างน้อย 3 ครั้งติดต่อกัน',
          month_age: monthAge || 44,
          time: time || 2
        },
        {
          no: '9',
          title: 'ตัวต่อ - ต่อรถ',
          objective: 'เด็กต่อตัวต่อเป็นรูปรถและบอกชื่อส่วนประกอบ',
          month_age: monthAge || 44,
          time: time || 2
        },
        {
          no: '10',
          title: 'เกมจับคู่ - รูปภาพกับคำ',
          objective: 'เด็กจับคู่รูปภาพกับคำศัพท์ที่เกี่ยวข้องได้อย่างน้อย 5 คู่',
          month_age: monthAge || 44,
          time: time || 2
        }
      ]

      // Merge existing activities with mock activities
      const result = [...existingActivities]
      const existingNos = existingActivities.map(a => String(a.no))
      
      for (let i = 0; i < mockActivities.length && result.length < 10; i++) {
        if (!existingNos.includes(mockActivities[i].no)) {
          result.push(mockActivities[i])
        }
      }

      // Fill remaining slots if needed
      while (result.length < 10) {
        const index = result.length + 1
        result.push({
          no: String(index),
          title: `กิจกรรม ${index}`,
          objective: `จุดประสงค์ของกิจกรรม ${index}`,
          month_age: monthAge || 44,
          time: time || 2
        })
      }

      return result.slice(0, 10)
    },
    extractVisitNumber(visitDateStr) {
      // Extract visit number from string like "อ. 20 มิถุนายน 2566 (27)"
      const match = visitDateStr.match(/\((\d+)\)/)
      return match ? match[1] : '-'
    },
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
    closeRecordModal() {
      this.showRecordModal = false
      this.recordData = null
    },
    openImageViewer(imageUrl) {
      if (imageUrl) {
        window.open(imageUrl, '_blank')
      }
    },
    async downloadPDF() {
      if (!this.recordData || !window.html2pdf) {
        this.$toast.error('ไม่สามารถสร้าง PDF ได้ กรุณารอสักครู่แล้วลองอีกครั้ง')
        return
      }

      try {
        this.loadingPDF = true
        const element = document.getElementById('visit-record-content')
        if (!element) {
          this.$toast.error('ไม่พบข้อมูลที่จะสร้าง PDF')
          return
        }

        const opt = {
          margin: [10, 10, 10, 10],
          filename: `แบบบันทึกข้อมูลเด็ก_${this.recordData.childName}_${this.recordData.visitDate}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }

        await window.html2pdf().set(opt).from(element).save()
        this.$toast.success('ดาวน์โหลด PDF สำเร็จ')
      } catch (error) {
        console.error('Error generating PDF:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการสร้าง PDF')
      } finally {
        this.loadingPDF = false
      }
    },
    async viewPhotos(item) {
      try {
        this.loadingPhotos = true
        this.showPhotoModal = true
        
        // Set basic info
        this.photoModalData = {
          childName: item.childName,
          visitDate: item.visitDate,
          images: []
        }

        // ใช้รูปจาก rawData (pic1, pic2) ที่ได้จาก API
        if (item.rawData) {
          const images = []
          if (item.rawData.pic1) {
            images.push(item.rawData.pic1)
          }
          if (item.rawData.pic2) {
            images.push(item.rawData.pic2)
          }
          if (item.rawData.pic3) {
            images.push(item.rawData.pic3)
          }
          this.photoModalData.images = images
        } else {
          // Fallback: load from IndexedDB if surveyId is available
          if (item.surveyId) {
            const survey = await this.$indexedDB.getSurveyProgressById(item.surveyId)
            if (survey) {
              await this.loadSurveyImages(survey)
            } else {
              this.photoModalData.images = []
            }
          } else {
            this.photoModalData.images = []
          }
        }
      } catch (error) {
        console.error('Error loading photos:', error)
        this.$toast.error('ไม่สามารถโหลดรูปภาพได้')
        this.photoModalData.images = []
      } finally {
        this.loadingPhotos = false
      }
    },
    async loadSurveyImages(survey) {
      const images = []
      
      // Handle both old single image and new array format
      if (survey.surveyImages && Array.isArray(survey.surveyImages)) {
        // New format: array of images
        for (let i = 0; i < survey.surveyImages.length && i < 2; i++) {
          const img = survey.surveyImages[i]
          
          // Check if it's new object format { base64, url, key }
          if (typeof img === 'object' && img !== null) {
            // Use base64 when offline, url when online
            const isOffline = !this.$store.state.isOnline
            const imageData = (isOffline && img.base64) ? img.base64 : (img.url || img.base64)
            images.push(imageData)
          } else if (typeof img === 'string') {
            // Old format: string base64
            images.push(img)
          } else if (survey.surveyImageKeys && survey.surveyImageKeys[i]) {
            // Load from IndexedDB
            try {
              const imageObject = await this.$indexedDB.getImage(survey.surveyImageKeys[i])
              const imageData = imageObject?.data || imageObject?.image || null
              images.push(imageData)
            } catch (error) {
              console.error(`Error loading image ${i}:`, error)
              images.push(null)
            }
          } else {
            images.push(null)
          }
        }
      } else {
        // Old format: single image - convert to array
        let currentImageData = null
        if (survey.surveyImageKey) {
          try {
            const imageObject = await this.$indexedDB.getImage(survey.surveyImageKey)
            currentImageData = imageObject?.data || imageObject?.image || null
          } catch (error) {
            console.error('Error loading image:', error)
          }
        } else if (survey.surveyImage) {
          currentImageData = survey.surveyImage
        }
        
        if (currentImageData) {
          images.push(currentImageData)
        } else {
          images.push(null)
        }
      }
      
      // Ensure we have 2 slots
      while (images.length < 2) {
        images.push(null)
      }
      
      this.photoModalData.images = images
    },
    closePhotoModal() {
      this.showPhotoModal = false
      this.photoModalData = {
        childName: '',
        visitDate: '',
        images: []
      }
    },
    toggleConfirm(item, event) {
      if (event.target.checked) {
        if (!this.selectedItems.includes(item)) {
          this.selectedItems.push(item)
        }
      } else {
        const index = this.selectedItems.indexOf(item)
        if (index > -1) {
          this.selectedItems.splice(index, 1)
        }
      }
    },
    async handleApprove() {
      if (this.selectedItems.length === 0) {
        return
      }

      const result = await this.$swal.fire({
        title: 'ยืนยันการอนุมัติ',
        text: `คุณกำลังจะบันทึกจำนวน ${this.selectedItems.length} รายการใช่หรือไม่`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ใช่, อนุมัติ',
        cancelButtonText: 'ยกเลิก',
        customClass: {
          confirmButton: 'btn btn-success mx-2',
          cancelButton: 'btn btn-secondary mx-2'
        },
        buttonsStyling: false
      })

      if (result.isConfirmed) {
        try {
          // TODO: Implement approve functionality
          this.$toast.success(`อนุมัติ ${this.selectedItems.length} รายการสำเร็จ`)
          this.selectedItems = []
        } catch (error) {
          this.$toast.error('เกิดข้อผิดพลาดในการอนุมัติ')
        }
      }
    },
    async handleEdit() {
      if (this.selectedItems.length === 0) {
        return
      }

      const result = await this.$swal.fire({
        title: 'ยืนยันการแก้ไข',
        text: `คุณกำลังจะบันทึกจำนวน ${this.selectedItems.length} รายการใช่หรือไม่`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ใช่, แก้ไข',
        cancelButtonText: 'ยกเลิก',
        customClass: {
          confirmButton: 'btn btn-primary mx-2',
          cancelButton: 'btn btn-secondary mx-2'
        },
        buttonsStyling: false
      })

      if (result.isConfirmed) {
        try {
          // TODO: Implement edit functionality
          this.$toast.success(`แก้ไข ${this.selectedItems.length} รายการสำเร็จ`)
          this.selectedItems = []
        } catch (error) {
          this.$toast.error('เกิดข้อผิดพลาดในการแก้ไข')
        }
      }
    },
    async refreshLatestApprovals() {
      try {
        // TODO: Load latest approvals from API
        this.$toast.info('กำลังรีเฟรสข้อมูล...')
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        this.$toast.success('รีเฟรสข้อมูลสำเร็จ')
      } catch (error) {
        this.$toast.error('เกิดข้อผิดพลาดในการรีเฟรสข้อมูล')
      }
    }
  }
}
</script>

<style scoped>
.supervisor-booking {
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  width: 40%;
  margin: 0 auto;
}

.skeleton-button {
  height: 32px;
  width: 100px;
  margin: 0 auto;
  border-radius: 6px;
}

.skeleton-button-small {
  height: 28px;
  width: 70px;
  margin: 0 auto;
  border-radius: 4px;
}

.skeleton-checkbox {
  height: 18px;
  width: 18px;
  margin: 0 auto;
  border-radius: 3px;
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
}

::v-deep .supervisor-table tbody td {
  padding: 1rem;
  vertical-align: middle;
  text-align: center;
}

.btn-record {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
}

.btn-record.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-record.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-record:hover {
  opacity: 0.9;
}

.btn-photos {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.btn-photos:hover {
  background-color: #5a6268;
}

.no-photos {
  color: #dc3545;
  font-size: 1.2rem;
}

.confirm-status {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
}

.confirm-status input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.text-success {
  color: #28a745;
}

.text-warning {
  color: #ffc107;
}

@media (max-width: 768px) {
  .supervisor-booking {
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

/* Action Buttons Section */
.action-buttons-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-action {
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-approve {
  background-color: #28a745;
  color: white;
}

.btn-approve:hover {
  background-color: #218838;
}

.btn-edit {
  background-color: #007bff;
  color: white;
}

.btn-edit:hover {
  background-color: #0056b3;
}

.selected-count {
  color: #495057;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Latest Approvals Section */
.latest-approvals-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: #2c3e50;
  margin: 0;
}

.btn-refresh {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.btn-refresh:hover {
  background-color: #5a6268;
}

.btn-refresh i {
  transition: transform 0.3s;
}

.btn-refresh:hover i {
  transform: rotate(180deg);
}

.text-muted {
  color: #6c757d;
}

/* Photo View Modal */
.photo-view-content {
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
  background-color: rgba(255, 255, 255, 0.2);
}

.loading-photos {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
}

.loading-photos i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #3551a4;
}

.loading-photos p {
  font-size: 1.2rem;
  margin: 0;
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

.current-image-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-preview-large {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.image-preview-large img {
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: 400px;
  display: block;
  object-fit: contain;
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

::v-deep .modal-header-visit {
  background: linear-gradient(135deg, #3551a4, #2c4088);
  color: white;
  border-bottom: none;
}

::v-deep .modal-header-visit .modal-title {
  color: white;
  font-weight: 500;
}

::v-deep .modal-header-visit .close {
  color: white;
  opacity: 0.8;
}

::v-deep .modal-header-visit .close:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .dual-image-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .image-preview-large {
    max-height: 300px;
  }
}

/* Visit Record Modal */
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

.section-title {
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

.question-item {
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.75rem;
}

.question-text {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  font-size: 1.05rem;
}

.answer-text {
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

.visit-record-wrapper {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

/* Photos Grid Styles */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.photo-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.photo-label {
  font-size: 1rem;
  color: #3551a4;
  font-weight: 600;
}

.photo-image {
  width: 100%;
  height: auto;
  max-width: 400px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.photo-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

