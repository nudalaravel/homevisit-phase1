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
      <b-table
        :items="tableData"
        :fields="tableFields"
        striped
        hover
        responsive
        class="supervisor-table"
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
                  <div class="visit-status-badges">
                    <span v-if="!visit.synced" class="badge badge-warning">
                      รอส่งข้อมูล
                    </span>
                    <span v-else-if="!visit.approved" class="badge badge-secondary">
                      รออนุมัติ
                    </span>
                    <span v-else class="badge badge-success">
                      อนุมัติแล้ว
                    </span>
                  </div>
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

    <!-- Visit Result Modal (Survey Answers) -->
    <b-modal
      id="visitResultModal"
      v-model="showVisitResultModal"
      title="ผลการเยี่ยมบ้าน"
      size="xl"
      no-close-on-backdrop
      @hidden="onNestedModalHidden"
      @shown="onNestedModalShown"
      header-class="modal-header-visit"
      :dialog-class="showVisitHistoryModal ? 'nested-modal-dialog nested-modal-level-2' : ''"
      no-enforce-focus
      :static="showVisitHistoryModal"
    >
      <div class="visit-result-header">
        <div class="patient-info-bar">
          <i class="fas fa-user-circle"></i>
          <span class="patient-name-large">{{ visitResultForm.childName }}</span>
          <span class="patient-nickname-badge">ครั้งที่ {{ visitResultForm.visitNumber }}</span>
        </div>
        <div class="visit-date-info">
          <i class="fas fa-calendar-alt"></i>
          <span>{{ visitResultForm.visitDate }} เวลา {{ visitResultForm.visitTime }}</span>
        </div>
      </div>

      <div v-if="visitResultForm.answers && visitResultForm.answers.length > 0" class="survey-answers-list">
        <div v-for="(answer, index) in visitResultForm.answers" :key="index" class="answer-item">
          <div class="answer-question">
            <span class="question-number">{{ answer.questionNumber }}</span>
            <span class="question-text">{{ answer.question }}</span>
          </div>
          <div class="answer-content">
            <div v-if="answer.type === 'text'" class="answer-text">
              {{ answer.answer }}
            </div>
            <div v-else-if="answer.type === 'options'" class="answer-options">
              <span class="answer-option">{{ answer.answer }}</span>
            </div>
            <div v-else-if="answer.type === 'number'" class="answer-number">
              {{ answer.answer }}
            </div>
            <div v-else-if="answer.type === 'list'" class="answer-list">
              <ul>
                <li v-for="(item, idx) in answer.answer" :key="idx">{{ item }}</li>
              </ul>
            </div>
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
      </template>
    </b-modal>
  </div>
</template>

<script>
import { formatVisitDate } from '~/utils/dateHelpers'

export default {
  layout: 'supervisor',
  middleware: 'auth',
  data() {
    return {
      loading: false,
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
      tableData: []
    }
  },
  async mounted() {
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
        
        const url = `/api/parenting2025_census/get/homevisit/sup/gethomevisit_result.php${params.toString() ? '?' + params.toString() : ''}`
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
          
          // Filter ข้อมูลฝั่ง client ตามผู้เยี่ยมบ้านที่เลือก (กรณี API ไม่ filter ให้)
          let filteredResults = response.results
          if (this.filters.visitor && this.filters.visitor !== 'all') {
            filteredResults = response.results.filter(item => item.recby === this.filters.visitor)
          }
          
          this.tableData = filteredResults.map(item => ({
            id: item.stid,
            stid: item.stid,
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
    
    viewHistory(item) {
      // สร้างข้อมูลจำลองสำหรับประวัติการเยี่ยมบ้าน
      const mockVisits = []
      const totalVisits = item.visitNumber || 8
      
      // สร้างข้อมูลการเยี่ยมบ้านย้อนหลัง
      for (let i = totalVisits; i >= 1; i--) {
        const visitDate = new Date()
        visitDate.setDate(visitDate.getDate() - (totalVisits - i) * 21) // ห่างกัน 21 วัน
        
        const day = visitDate.getDate()
        const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                           'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
        const month = monthNames[visitDate.getMonth()]
        const year = visitDate.getFullYear() + 543
        
        const times = ['10:00 น.', '14:00 น.', '15:00 น.', '16:00 น.']
        const randomTime = times[Math.floor(Math.random() * times.length)]
        
        mockVisits.push({
          id: i,
          visitNumber: i,
          date: `${day} ${month} ${year}`,
          time: randomTime,
          synced: i <= totalVisits - 2, // 2 ครั้งล่าสุดยังไม่ sync
          approved: i <= totalVisits - 3, // 3 ครั้งล่าสุดยังไม่ approve
          surveyId: `survey_${item.childName}_${i}`
        })
      }
      
      this.visitHistoryForm = {
        childName: item.childName,
        visitorName: item.visitorName,
        visits: mockVisits
      }
      
      this.showVisitHistoryModal = true
    },
    viewVisitResult(visit) {
      // สร้างข้อมูลจำลองสำหรับผลการเยี่ยมบ้าน
      const mockAnswers = [
        {
          questionNumber: 'Q1',
          question: 'กิจกรรมที่ทำในครั้งนี้',
          type: 'list',
          answer: [
            'กิจกรรมที่ 1: เล่นของเล่น',
            'กิจกรรมที่ 2: อ่านหนังสือ',
            'กิจกรรมที่ 3: วาดรูป'
          ]
        },
        {
          questionNumber: 'Q2',
          question: 'จุดประสงค์ของกิจกรรม',
          type: 'text',
          answer: 'เพื่อพัฒนาทักษะการสื่อสารและความคิดสร้างสรรค์ของเด็ก'
        },
        {
          questionNumber: 'Q3',
          question: 'พฤติกรรมของเด็กขณะทำกิจกรรม',
          type: 'options',
          answer: 'ให้ความร่วมมือดี'
        },
        {
          questionNumber: 'Q4',
          question: 'การมีส่วนร่วมของผู้ปกครอง',
          type: 'options',
          answer: 'มีส่วนร่วมอย่างเต็มที่'
        },
        {
          questionNumber: 'Q5',
          question: 'ความพึงพอใจของเด็ก',
          type: 'number',
          answer: '8/10'
        },
        {
          questionNumber: 'Q6',
          question: 'ปัญหาหรืออุปสรรคที่พบ',
          type: 'text',
          answer: 'ไม่มีปัญหาที่สำคัญ'
        },
        {
          questionNumber: 'Q7',
          question: 'ข้อเสนอแนะ',
          type: 'text',
          answer: 'ควรเพิ่มกิจกรรมที่ใช้การเคลื่อนไหวมากขึ้น'
        },
        {
          questionNumber: 'Q8',
          question: 'ความพร้อมสำหรับการเยี่ยมครั้งถัดไป',
          type: 'options',
          answer: 'พร้อม'
        },
        {
          questionNumber: 'Q9',
          question: 'เวลาที่ใช้ในการเยี่ยมบ้าน',
          type: 'text',
          answer: '45 นาที'
        },
        {
          questionNumber: 'Q10',
          question: 'นัดหมายครั้งถัดไป',
          type: 'text',
          answer: 'วันที่ 15 กุมภาพันธ์ 2566 เวลา 15:00 น.'
        }
      ]
      
      this.visitResultForm = {
        childName: this.visitHistoryForm.childName,
        visitorName: this.visitHistoryForm.visitorName,
        visitNumber: visit.visitNumber,
        visitDate: visit.date,
        visitTime: visit.time,
        answers: mockAnswers
      }
      
      // ไม่ปิด visitHistoryModal แต่เปิด visitResultModal ซ้อนกัน
      this.showVisitResultModal = true
    },
    resetVisitHistoryForm() {
      this.visitHistoryForm = {
        childName: '',
        visitorName: '',
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
        answers: []
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
  background: rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.patient-info-bar i {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.patient-name-large {
  font-size: 1.25rem;
  font-weight: 400;
  color: white;
}

.patient-nickname-badge {
  font-size: 1.05rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.85);
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
</style>

