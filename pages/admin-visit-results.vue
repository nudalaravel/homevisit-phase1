<template>
  <div class="admin-visit-results">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">ผลการเยี่ยมบ้าน</h1>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label class="filter-label">ทีม</label>
        <select
          v-model="filters.team"
          class="filter-select select2"
          ref="teamSelect"
        >
          <option
            v-for="option in teamOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.text }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">ตำบล</label>
        <select
          v-model="filters.subdistrict"
          class="filter-select select2"
          ref="subdistrictSelect"
        >
          <option
            v-for="option in subdistrictOptions"
            :key="option.value"
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
            v-for="option in visitorOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.text }}
          </option>
        </select>
      </div>
    </div>

    <!-- Note -->
    <!-- <div class="note-section">
      ***ภาคใต้ ตำบลสะบ้าย้อย แก้ไขเป็น ตำบลท่าพระยา | 3.1.2023
    </div> -->

    <!-- Data Table -->
    <div class="table-container">
      <b-table
        :items="tableData"
        :fields="tableFields"
        striped
        hover
        responsive
        class="admin-table"
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
            <div v-else class="next-visit-time text-center">
              {{ row.item.nextVisitTime }}
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
          <h5 class="modal-title">ประวัติการเยี่ยมบ้าน* {{ visitHistoryForm.childName }}</h5>
          <button class="close-button" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </template>

      <div v-if="visitHistoryForm.visits && visitHistoryForm.visits.length > 0" class="visit-history-table-container">
        <table class="visit-history-table">
          <thead>
            <tr>
              <th class="col-visit-number">ครั้งที่</th>
              <th class="col-visitor">ผู้เยี่ยมบ้าน</th>
              <th class="col-time">เวลา</th>
              <th class="col-record">บันทึกเยี่ยมบ้าน</th>
              <th class="col-photos">รูปกิจกรรม</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(visit, index) in visitHistoryForm.visits" :key="index" class="visit-history-row">
              <td class="col-visit-number">
                {{ visit.visitNumber }}
              </td>
              <td class="col-visitor">
                {{ visit.visitorName }}
              </td>
              <td class="col-time">
                {{ visit.date }} {{ visit.time }}
              </td>
              <td class="col-record">
                <button class="btn-survey" @click="viewSurvey(visit)">
                  <i class="fas fa-check-circle"></i>
                  แบบเยี่ยมบ้าน*
                </button>
              </td>
              <td class="col-photos">
                <button class="btn-photos" @click="viewPhotos(visit)">
                  <i class="fas fa-camera"></i>
                  ดูรูป
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

    <!-- Photo View Modal -->
    <b-modal
      id="photoModal"
      v-model="showPhotoModal"
      title="รูปภาพกิจกรรม"
      size="xl"
      no-close-on-backdrop
      @hidden="closePhotoModal"
      @shown="onNestedModalShown"
      header-class="modal-header-visit"
      :dialog-class="showVisitHistoryModal ? 'nested-modal-dialog nested-modal-level-2' : ''"
      no-enforce-focus
      :static="showVisitHistoryModal"
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
      id="recordModal"
      v-model="showRecordModal"
      title="แบบบันทึกข้อมูลเด็ก สำหรับผู้เยี่ยมบ้าน"
      :dialog-class="showVisitHistoryModal ? 'nested-modal-dialog nested-modal-level-2 record-modal-dialog' : 'record-modal-dialog'"
      no-close-on-backdrop
      @hidden="closeRecordModal"
      @shown="onNestedModalShown"
      header-class="modal-header-visit"
      body-class="record-modal-body"
      no-enforce-focus
      :static="showVisitHistoryModal"
      hide-footer
    >
      <div v-if="recordData" class="visit-record-wrapper">
        <div id="visit-record-content" class="visit-record-content">
          <!-- Header Section -->
          <div class="record-header">
            <div class="record-title">แบบบันทึกข้อมูลเด็ก สำหรับผู้เยี่ยมบ้าน</div>
          </div>

          <!-- Basic Info Section -->
          <div class="record-section">
            <div class="info-row-single">
              <span class="info-label">ชื่อ-นามสกุลของเด็ก:</span>
              <span class="info-value">{{ recordData.childName || '-' }}</span>
            </div>
            <div class="info-row-single">
              <span class="info-label">ชื่อ-นามสกุลของผู้เยี่ยมบ้าน:</span>
              <span class="info-value">{{ recordData.visitorName || '-' }}</span>
            </div>
            <div class="info-row-single">
              <span class="info-label">เวลาเริ่มต้นการเยี่ยมบ้าน:</span>
              <span class="info-value">{{ recordData.startTime || '-' }}</span>
            </div>
            <div class="info-row-single">
              <span class="info-label">วันที่เยี่ยมบ้าน:</span>
              <span class="info-value">{{ recordData.visitDate || '-' }}</span>
              <span class="info-label" style="margin-left: 1rem;">การเยี่ยมบ้านครั้งที่:</span>
              <span class="info-value">{{ recordData.visitNumber || '-' }}</span>
            </div>
          </div>

          <!-- Home Visit Section -->
          <div class="record-section">
            <div class="section-title">การเยี่ยมบ้าน</div>
            <div class="question-item">
              <div class="question-text">ผู้ปกครองสามารถเข้าร่วมกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</div>
              <div class="answer-text">{{ getQ1Answer(recordData.answers?.q1) }}</div>
            </div>
            <div class="question-item">
              <div class="question-text">เด็กสามารถเข้าร่วมกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</div>
              <div class="answer-text">{{ getQ2Answer(recordData.answers?.q2) }}</div>
            </div>
          </div>

          <!-- Review Previous Visit Section -->
          <div class="record-section">
            <div class="section-title">ทบทวนการเยี่ยมบ้านครั้งที่ผ่านมา</div>
            <div class="question-item">
              <div class="question-text">ใครทำกิจกรรมจากกิจกรรมการเยี่ยมบ้านกับเด็กในสัปดาห์ที่ผ่านมา</div>
              <div class="answer-text">{{ getQ6Answer(recordData.answers?.q6) }}</div>
            </div>
            <div class="question-item">
              <div class="question-text">ผู้ปกครองทำกิจกรรมกับเด็กบ่อยแค่ไหนในสัปดาห์ที่ผ่านมา</div>
              <div class="answer-text">{{ getQ8Answer(recordData.answers?.q8) }}</div>
            </div>
            <div class="question-item">
              <div class="question-text">ให้ผู้เยี่ยมบ้าน <strong>สังเกต</strong> หรือ <strong>ทบทวน</strong> กิจกรรมการเยี่ยมบ้านครั้งที่ผ่านมา โดยขอให้ผู้ปกครองสาธิตการทำกิจกรรมร่วมกับเด็ก</div>
            </div>
          </div>

          <!-- Activity Review Table -->
          <div class="record-section">
            <div class="section-title">ทบทวนกิจกรรมการเยี่ยมบ้าน : เดือนที่ {{ recordData.monthAge || '-' }} การเยี่ยมบ้าน {{ recordData.time || '-' }}</div>
            <table class="activity-table">
              <thead>
                <tr>
                  <th>ชื่อกิจกรรม</th>
                  <th>จุดประสงค์</th>
                  <th>คำตอบ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(activity, index) in recordData.q5Activities" :key="index">
                  <td>{{ activity.title || activity.activity || `กิจกรรม ${index + 1}` }}</td>
                  <td>{{ activity.objective || '-' }}</td>
                  <td>{{ getActivityAnswer(recordData.answers?.q5?.[activity.no]) }}</td>
                </tr>
              </tbody>
            </table>
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
      </template>
    </b-modal>
  </div>
</template>

<script>
import { PARTICIPANT_OPTIONS, ACTIVITY_ANSWER_OPTIONS } from '~/utils/surveyHelpers'

export default {
  layout: 'admin',
  middleware: 'auth',
  data() {
    return {
      filters: {
        team: 'songkhla',
        subdistrict: 'all',
        visitor: 'all'
      },
      teamOptions: [
        { value: 'songkhla', text: 'สงขลา' },
        { value: 'all', text: '--ทั้งหมด--' }
      ],
      subdistrictOptions: [
        { value: 'all', text: '--ทั้งหมด--' }
      ],
      visitorOptions: [
        { value: 'all', text: '--ทั้งหมด--' }
      ],
      showVisitHistoryModal: false,
      visitHistoryForm: {
        childName: '',
        visitorName: '',
        visits: []
      },
      showPhotoModal: false,
      photoModalData: {
        childName: '',
        visitDate: '',
        images: []
      },
      loadingPhotos: false,
      showRecordModal: false,
      recordData: null,
      loadingRecord: false,
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
      tableData: [
        {
          visitorName: 'วิลาวัณย์ จุลพงค์',
          childName: 'กรณ์รณัฐ นาวารี',
          lastVisitDate: 'พ. 25 มกราคม 2566',
          lastVisitTime: '15.00',
          visitNumber: 8,
          nextVisitDate: 'พ. 01 กุมภาพันธ์ 2566',
          nextVisitTime: '15.00',
          postponeCount: 1,
          isPostponed: true
        },
        {
          visitorName: 'สาวิตรี ราชเล็ก',
          childName: 'ธนัชญา เปล้าแก้ว',
          lastVisitDate: 'อา. 26 มีนาคม 2566',
          lastVisitTime: '14.00',
          visitNumber: 16,
          nextVisitDate: 'อา. 02 เมษายน 2566',
          nextVisitTime: '10.00',
          postponeCount: 9,
          isPostponed: true
        },
        {
          visitorName: 'ดวงทิพย์ ด่าจํานงค์',
          childName: 'จิรดา เขียนปัญญา',
          lastVisitDate: 'อ. 18 เมษายน 2566',
          lastVisitTime: '16.00',
          visitNumber: 19,
          nextVisitDate: 'จ. 24 เมษายน 2566',
          nextVisitTime: '16.00',
          postponeCount: 2,
          isPostponed: true
        },
        {
          visitorName: 'น.ส.อาซีซะ ยะลาหะ',
          childName: 'เด็กชายภาคิน สุขศรี',
          lastVisitDate: 'จ. 01 พฤษภาคม 2566',
          lastVisitTime: '16.30',
          visitNumber: 4,
          nextVisitDate: 'อา. 07 พฤษภาคม 2566',
          nextVisitTime: '16.30',
          postponeCount: 1,
          isPostponed: true
        },
        {
          visitorName: 'สาวิตรี ราชเล็ก',
          childName: 'ชนากานต์ ขาวชู',
          lastVisitDate: 'อ. 20 มิถุนายน 2566',
          lastVisitTime: '17.00',
          visitNumber: 28,
          nextVisitDate: 'พฤ. 29 มิถุนายน 2566',
          nextVisitTime: '17.00',
          postponeCount: 7,
          isPostponed: true
        },
        {
          visitorName: 'ณณัชชา จิตรสุวรรณ์',
          childName: 'ณัฐณิชา มรรคาเขต',
          lastVisitDate: 'จ. 26 มิถุนายน 2566',
          lastVisitTime: '17.30',
          visitNumber: 28,
          nextVisitDate: 'จ. 03 กรกฎาคม 2566',
          nextVisitTime: '17.30',
          postponeCount: 2,
          isPostponed: true
        },
        {
          visitorName: 'น.ส.ซารีนา คือเระ',
          childName: 'นิชานันท์ อ่อนเกลี้ยง',
          lastVisitDate: 'จ. 10 กรกฎาคม 2566',
          lastVisitTime: '15.30',
          visitNumber: 28,
          nextVisitDate: 'ส. 15 กรกฎาคม 2566',
          nextVisitTime: '15.30',
          postponeCount: 2,
          isPostponed: true
        }
      ]
    }
  },
  mounted() {
    // Initialize Select2 for dropdowns
    this.$nextTick(() => {
      if (this.$select2) {
        if (this.$refs.teamSelect) {
          this.$select2.init(this.$refs.teamSelect)
          window.$(this.$refs.teamSelect).on('change', () => {
            this.filters.team = window.$(this.$refs.teamSelect).val()
          })
        }
        if (this.$refs.subdistrictSelect) {
          this.$select2.init(this.$refs.subdistrictSelect)
          window.$(this.$refs.subdistrictSelect).on('change', () => {
            this.filters.subdistrict = window.$(this.$refs.subdistrictSelect).val()
          })
        }
        if (this.$refs.visitorSelect) {
          this.$select2.init(this.$refs.visitorSelect)
          window.$(this.$refs.visitorSelect).on('change', () => {
            this.filters.visitor = window.$(this.$refs.visitorSelect).val()
          })
        }
      }
    })
  },
  watch: {
    'filters.team'(newVal) {
      if (this.$refs.teamSelect && window.$) {
        window.$(this.$refs.teamSelect).val(newVal).trigger('change')
      }
    },
    'filters.subdistrict'(newVal) {
      if (this.$refs.subdistrictSelect && window.$) {
        window.$(this.$refs.subdistrictSelect).val(newVal).trigger('change')
      }
    },
    'filters.visitor'(newVal) {
      if (this.$refs.visitorSelect && window.$) {
        window.$(this.$refs.visitorSelect).val(newVal).trigger('change')
      }
    }
  },
  beforeDestroy() {
    // Destroy Select2 instances
    if (this.$select2) {
      if (this.$refs.teamSelect && window.$) {
        window.$(this.$refs.teamSelect).off('change')
        this.$select2.destroy(this.$refs.teamSelect)
      }
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
    viewHistory(item) {
      // Create mock visit history data
      const mockVisits = []
      const totalVisits = item.visitNumber || 8
      
      for (let i = totalVisits; i >= 1; i--) {
        const visitDate = new Date()
        visitDate.setDate(visitDate.getDate() - (totalVisits - i) * 21)
        
        const day = visitDate.getDate()
        const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                           'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
        const month = monthNames[visitDate.getMonth()]
        const year = visitDate.getFullYear() + 543
        
        const times = ['10:00', '14:00', '15:00', '16:00', '17:00']
        const randomTime = times[Math.floor(Math.random() * times.length)]
        
        mockVisits.push({
          visitNumber: i,
          visitorName: item.visitorName,
          date: `พ. ${day} ${month} ${year}`,
          time: randomTime
        })
      }
      
      this.visitHistoryForm = {
        childName: item.childName,
        visitorName: item.visitorName,
        visits: mockVisits
      }
      
      this.showVisitHistoryModal = true
    },
    resetVisitHistoryForm() {
      this.visitHistoryForm = {
        childName: '',
        visitorName: '',
        visits: []
      }
    },
    closeModal() {
      this.showVisitHistoryModal = false
      this.resetVisitHistoryForm()
    },
    async viewSurvey(visit) {
      try {
        this.loadingRecord = true
        this.showRecordModal = true
        this.recordData = null

        // For mock data, use visit data
        const mockActivities = this.generateMockActivities([], 44, 2)
        this.recordData = {
          childName: this.visitHistoryForm.childName,
          visitorName: this.visitHistoryForm.visitorName,
          visitDate: visit.date,
          visitNumber: visit.visitNumber,
          startTime: visit.time,
          monthAge: 44,
          time: 2,
          answers: {
            q1: 1, // Mock: ได้
            q2: 1, // Mock: ได้
            q6: 1, // Mock: แม่
            q8: 3, // Mock: ทำบ้างเป็นบางวัน (3-4 วัน)
            q5: {
              '1': 1, // ทำได้เอง
              '2': 1, // ทำได้เอง
              '3': 1, // ทำได้เอง
              '4': 2, // ทำได้บ้าง
              '5': 1, // ทำได้เอง
              '6': 2, // ทำได้บ้าง
              '7': 1, // ทำได้เอง
              '8': 1, // ทำได้เอง
              '9': 2, // ทำได้บ้าง
              '10': 1 // ทำได้เอง
            }
          },
          q5Activities: mockActivities
        }
      } catch (error) {
        console.error('Error loading record:', error)
        this.$toast.error('ไม่สามารถโหลดข้อมูลได้')
        this.recordData = null
      } finally {
        this.loadingRecord = false
      }
    },
    async viewPhotos(visit) {
      try {
        this.loadingPhotos = true
        this.showPhotoModal = true
        
        // Set basic info
        this.photoModalData = {
          childName: this.visitHistoryForm.childName,
          visitDate: visit.date,
          images: []
        }

        // For mock data, show empty state
        this.photoModalData.images = []
      } catch (error) {
        console.error('Error loading photos:', error)
        this.$toast.error('ไม่สามารถโหลดรูปภาพได้')
        this.photoModalData.images = []
      } finally {
        this.loadingPhotos = false
      }
    },
    closePhotoModal() {
      this.showPhotoModal = false
      this.photoModalData = {
        childName: '',
        visitDate: '',
        images: []
      }
      this.onNestedModalHidden()
    },
    closeRecordModal() {
      this.showRecordModal = false
      this.recordData = null
      this.onNestedModalHidden()
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
    onNestedModalShown() {
      // จัดการ z-index เมื่อ nested modal เปิด
      this.$nextTick(() => {
        // หา nested modal
        const nestedModal = document.getElementById('photoModal') || document.getElementById('recordModal')
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
              backdrops.forEach((backdrop) => {
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
.admin-visit-results {
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

.filters-section {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
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

.note-section {
  margin-bottom: 1rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.table-container {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

::v-deep .admin-table {
  margin-bottom: 0;
}

::v-deep .admin-table .table-header {
  background-color: #3551a4;
  color: white;
  font-weight: 500;
  text-align: center;
  padding: 1rem;
  border: none;
}

::v-deep .admin-table tbody tr {
  border-bottom: 1px solid #e9ecef;
}

::v-deep .admin-table tbody tr:hover {
  background-color: #f8f9fa;
  transition: none;
}

::v-deep .admin-table tbody td {
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

/* Modal Styles */
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

.close-button {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  opacity: 0.8;
}

::v-deep .modal-95percent {
  max-width: 95vw !important;
  width: 95vw !important;
  margin: 2.5vh auto !important;
}

.visit-history-table-container {
  overflow-x: auto;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
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
  width: 10%;
}

.visit-history-table th.col-visitor {
  width: 20%;
}

.visit-history-table th.col-time {
  width: 25%;
}

.visit-history-table th.col-record {
  width: 22.5%;
}

.visit-history-table th.col-photos {
  width: 22.5%;
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

.btn-survey {
  background: #28a745;
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

.btn-survey:hover {
  background: #218838;
}

.btn-survey i {
  font-size: 1rem;
}

.btn-photos {
  background: #6c757d;
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

.btn-photos:hover {
  background: #5a6268;
}

.btn-photos i {
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

@media (max-width: 768px) {
  .admin-visit-results {
    padding: 1rem;
  }

  .filters-section {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

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
}

/* Photo View Modal Styles */
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

/* Visit Record Modal Styles */
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
  font-size: 1.3rem;
  font-weight: 600;
  color: #3551a4;
}

.record-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #3551a4;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
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
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
  white-space: nowrap;
}

.info-value {
  font-size: 0.95rem;
  color: #2c3e50;
  font-weight: 400;
}

.question-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
}

.question-text {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.answer-text {
  font-size: 1rem;
  color: #2c3e50;
  padding-left: 1rem;
}

.activity-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.75rem;
  font-size: 0.9rem;
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

/* Nested Modal Styles */
/* First level modal (visit history) */
::v-deep #visitHistoryModal {
  z-index: 1060 !important;
}

::v-deep #visitHistoryModal .modal-dialog {
  z-index: 1060 !important;
}

/* Second level modals (photo/record - nested) */
::v-deep #photoModal,
::v-deep #recordModal {
  z-index: 1070 !important;
}

::v-deep #photoModal .modal-dialog,
::v-deep #recordModal .modal-dialog {
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
::v-deep body.modal-open #photoModal ~ .modal-backdrop,
::v-deep body.modal-open #recordModal ~ .modal-backdrop {
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

@media (max-width: 768px) {
  .dual-image-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .image-preview-large {
    max-height: 300px;
  }
}
</style>

