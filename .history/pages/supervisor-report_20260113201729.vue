<template>
  <div class="supervisor-report">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">รายงานการสังเกตการเยี่ยมบ้าน</h1>
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
              <td><div class="skeleton-cell skeleton-text-short"></div></td>
              <td><div class="skeleton-cell skeleton-badge"></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Actual Table -->
      <b-table
        v-else
        :items="filteredTableData"
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

        <template #cell(homevisitor)="row">
          {{ row.item.homevisitorName }}
        </template>

        <template #cell(stid)="row">
          {{ row.item.stid }}
        </template>

        <template #cell(dateVisit)="row">
          {{ row.item.dateVisitFormatted }}
        </template>

        <template #cell(sumall)="row">
          <span 
            class="badge"
            :class="getSumallBadgeClass(row.item.sumall)"
          >
            {{ row.item.sumall }}
          </span>
        </template>
      </b-table>
    </div>

    <!-- Children Detail Modal -->
    <b-modal
      id="childrenDetailModal"
      v-model="showChildrenModal"
      :title="`การเยี่ยมบ้านของ ${childrenForm.visitorName}`"
      size="lg"
      no-close-on-backdrop
      @hidden="resetChildrenForm"
      header-class="modal-header-visit"
    >
      <div v-if="childrenForm.children && childrenForm.children.length > 0" class="children-table-container">
        <table class="children-table">
          <thead>
            <tr>
              <th class="col-child-name">ชื่อ-นามสกุลเด็ก</th>
              <th class="col-last-visit">วันบันทึกการเยี่ยมบ้านล่าสุด</th>
              <th class="col-observation-count">จำนวนการสังเกต</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(child, index) in childrenForm.children" :key="index" class="children-table-row">
              <td class="col-child-name">{{ child.childName }}</td>
              <td class="col-last-visit">{{ child.lastVisitDate || '-' }}</td>
              <td class="col-observation-count">
                <button 
                  class="btn-observation-count"
                  :class="{
                    'btn-observation-primary': child.observationCount > 0,
                    'btn-observation-light': child.observationCount === 0
                  }"
                  @click="viewChildObservations(child, childrenForm.visitorName)"
                >
                  {{ child.observationCount }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-children">
        <i class="fas fa-folder-open"></i>
        <p>ยังไม่มีข้อมูลเด็ก</p>
      </div>

      <template #modal-footer="{ cancel }">
        <b-button variant="secondary" @click="cancel()">
          <i class="fas fa-times"></i>
          ปิด
        </b-button>
      </template>
    </b-modal>

    <!-- Observations Detail Modal -->
    <b-modal
      id="observationsDetailModal"
      v-model="showObservationsModal"
      :title="`การสังเกตของ ${observationsForm.visitorName}`"
      size="xl"
      no-close-on-backdrop
      @hidden="resetObservationsForm"
      header-class="modal-header-visit"
      no-enforce-focus
    >
      <div v-if="observationsForm.observations && observationsForm.observations.length > 0" class="observations-table-container">
        <table class="observations-table">
          <thead>
            <tr>
              <th class="col-child-name">ชื่อ-นามสกุลเด็ก</th>
              <th class="col-visit-date">วันที่เยี่ยมบ้าน</th>
              <th class="col-visit-number">ครั้งที่</th>
              <th class="col-action">ดูแบบสังเกตฯ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(observation, index) in observationsForm.observations" :key="index" class="observations-table-row">
              <td class="col-child-name">{{ observation.childName }}</td>
              <td class="col-visit-date">{{ observation.visitDate }}</td>
              <td class="col-visit-number">ครั้งที่ {{ observation.visitNumber }}</td>
              <td class="col-action">
                <button 
                  class="btn-view-observation"
                  @click="viewObservationDetail(observation)"
                >
                  <i class="fas fa-eye"></i>
                  ดูแบบสังเกตฯ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-observations">
        <i class="fas fa-clipboard-question"></i>
        <p>ยังไม่มีข้อมูลการสังเกต</p>
      </div>

      <template #modal-footer="{ cancel }">
        <b-button variant="secondary" @click="cancel()">
          <i class="fas fa-times"></i>
          ปิด
        </b-button>
      </template>
    </b-modal>

    <!-- Visit Result Modal (Nested) - Survey Answers -->
    <b-modal
      id="visitResultModal"
      v-model="showVisitResultModal"
      title="ผลการเยี่ยมบ้าน"
      size="xl"
      no-close-on-backdrop
      @hidden="onNestedModalHidden"
      @shown="onNestedModalShown"
      header-class="modal-header-visit"
      :dialog-class="showObservationsModal ? 'nested-modal-dialog nested-modal-level-2' : ''"
      no-enforce-focus
      :static="showObservationsModal"
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
export default {
  layout: 'supervisor',
  middleware: 'auth',
  data() {
    return {
      tableFields: [
        {
          key: 'visitorName',
          label: 'ชื่อผู้เยี่ยมบ้าน',
          thClass: 'table-header'
        },
        {
          key: 'childCount',
          label: 'จำนวนเด็ก',
          thClass: 'table-header'
        },
        {
          key: 'observationCount',
          label: 'จำนวนการสังเกตฯ',
          thClass: 'table-header'
        }
      ],
      tableData: [
        {
          visitorName: 'น.ส.ลีเยาะ กาลาแต',
          childCount: 4,
          observationCount: 3
        },
        {
          visitorName: 'น.ส.อิสริญาภรณ์ พรหมสีทอง',
          childCount: 4,
          observationCount: 0
        },
        {
          visitorName: 'น.ส.สูฮัยนิ สาเระ',
          childCount: 5,
          observationCount: 6
        },
        {
          visitorName: 'นางสาวยูเด๊าะ กายียุ',
          childCount: 4,
          observationCount: 2
        },
        {
          visitorName: 'วิลาวัณย์ จุลพงค์',
          childCount: 4,
          observationCount: 2
        },
        {
          visitorName: 'นางสาวมาริยา อะลิสะ',
          childCount: 5,
          observationCount: 5
        },
        {
          visitorName: 'น.ส.สารภี ธรรมพิทักษ์',
          childCount: 3,
          observationCount: 5
        },
        {
          visitorName: 'ณณัชชา จิตรสุวรรณ์',
          childCount: 3,
          observationCount: 2
        },
        {
          visitorName: 'น.ส.อารี เด็นอาเร๊ะ',
          childCount: 7,
          observationCount: 7
        },
        {
          visitorName: 'น.ส.นาตยา แก้วดำาไกร',
          childCount: 3,
          observationCount: 0
        },
        {
          visitorName: 'นางสาวรอมือละ กะเส็มมิ',
          childCount: 1,
          observationCount: 1
        },
        {
          visitorName: 'น.ส.นูไอนี สมาน',
          childCount: 4,
          observationCount: 5
        }
      ],
      showChildrenModal: false,
      showObservationsModal: false,
      showVisitResultModal: false,
      childrenForm: {
        visitorName: '',
        children: []
      },
      observationsForm: {
        visitorName: '',
        observations: []
      },
      visitResultForm: {
        childName: '',
        visitorName: '',
        visitNumber: null,
        visitDate: '',
        visitTime: '',
        answers: []
      }
    }
  },
  methods: {
    viewChildren(item) {
      // สร้างข้อมูลจำลองสำหรับรายชื่อเด็ก
      const mockChildren = []
      const childNames = [
        'ณัฐบดินทร์ สมฆ้อง',
        'กานต์พิชชา ใจดี',
        'ปิยะวัฒน์ แก้วใส',
        'สุชาดา รักธรรม',
        'ธีรพงษ์ เกียรติสูง',
        'อารียา สุขใจ',
        'พงศ์ศิริ มั่นคง'
      ]
      
      for (let i = 0; i < item.childCount; i++) {
        const visitDate = new Date()
        visitDate.setDate(visitDate.getDate() - Math.floor(Math.random() * 30))
        
        const day = visitDate.getDate()
        const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                           'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
        const month = monthNames[visitDate.getMonth()]
        const year = visitDate.getFullYear() + 543
        
        mockChildren.push({
          childName: childNames[i] || `เด็ก ${i + 1}`,
          lastVisitDate: `${day} ${month} ${year}`,
          observationCount: Math.floor(Math.random() * 5)
        })
      }
      
      this.childrenForm = {
        visitorName: item.visitorName,
        children: mockChildren
      }
      
      this.showChildrenModal = true
    },
    viewChildObservations(child, visitorName) {
      // สร้างข้อมูลจำลองสำหรับการสังเกตของเด็กคนนี้
      const mockObservations = []
      const observationCount = child.observationCount || 0
      
      for (let i = 0; i < observationCount; i++) {
        const visitDate = new Date()
        visitDate.setDate(visitDate.getDate() - i * 21) // ห่างกัน 21 วัน
        
        const day = visitDate.getDate()
        const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                           'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
        const month = monthNames[visitDate.getMonth()]
        const year = visitDate.getFullYear() + 543
        
        mockObservations.push({
          childName: child.childName,
          visitDate: `${day} ${month} ${year}`,
          visitNumber: observationCount - i,
          visitTime: '15:00 น.'
        })
      }
      
      this.observationsForm = {
        visitorName: visitorName,
        observations: mockObservations
      }
      
      this.showChildrenModal = false
      this.showObservationsModal = true
    },
    viewObservations(item) {
      // สร้างข้อมูลจำลองสำหรับการสังเกตทั้งหมด
      const mockObservations = []
      const observationCount = item.observationCount || 0
      const childNames = [
        'ณัฐบดินทร์ สมฆ้อง',
        'กานต์พิชชา ใจดี',
        'ปิยะวัฒน์ แก้วใส',
        'สุชาดา รักธรรม'
      ]
      
      for (let i = 0; i < observationCount; i++) {
        const visitDate = new Date()
        visitDate.setDate(visitDate.getDate() - i * 21)
        
        const day = visitDate.getDate()
        const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                           'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
        const month = monthNames[visitDate.getMonth()]
        const year = visitDate.getFullYear() + 543
        
        mockObservations.push({
          childName: childNames[i % childNames.length],
          visitDate: `${day} ${month} ${year}`,
          visitNumber: observationCount - i,
          visitTime: '15:00 น.'
        })
      }
      
      this.observationsForm = {
        visitorName: item.visitorName,
        observations: mockObservations
      }
      
      this.showObservationsModal = true
    },
    viewObservationDetail(observation) {
      // สร้างข้อมูลจำลองสำหรับผลการเยี่ยมบ้าน (เหมือนใน dashboard)
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
        childName: observation.childName,
        visitorName: this.observationsForm.visitorName,
        visitNumber: observation.visitNumber,
        visitDate: observation.visitDate,
        visitTime: observation.visitTime,
        answers: mockAnswers
      }
      
      this.showVisitResultModal = true
    },
    resetChildrenForm() {
      this.childrenForm = {
        visitorName: '',
        children: []
      }
    },
    resetObservationsForm() {
      this.observationsForm = {
        visitorName: '',
        observations: []
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
          
          // ถ้ายังมี parent modal เปิดอยู่ (observations modal)
          if (this.showObservationsModal) {
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
            const parentModal = document.getElementById('observationsDetailModal')
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
.supervisor-report {
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

.btn-count {
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  min-width: 60px;
  transition: opacity 0.2s;
}

.btn-count-primary {
  background-color: #3551a4;
  color: white;
}

.btn-count-light {
  background-color: #87ceeb;
  color: #2c3e50;
}

.btn-count:hover {
  opacity: 0.9;
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
  font-size: 1.5rem !important;
  font-weight: 400 !important;
}

/* Children Table */
.children-table-container {
  overflow-x: auto;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}

.children-table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.children-table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.children-table-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.children-table-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.children-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  overflow: hidden;
}

.children-table thead {
  background: #3551a4;
  color: white;
}

.children-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 500;
  font-size: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.children-table th.col-child-name {
  width: 40%;
}

.children-table th.col-last-visit {
  width: 35%;
}

.children-table th.col-observation-count {
  width: 25%;
  text-align: center;
}

.children-table tbody tr {
  border-bottom: 1px solid #e9ecef;
  transition: none;
}

.children-table tbody tr:hover {
  background-color: #f8f9fa;
}

.children-table tbody tr:last-child {
  border-bottom: none;
}

.children-table td {
  padding: 1rem 1.5rem;
  vertical-align: middle;
}

.children-table td.col-child-name {
  width: 40%;
}

.children-table td.col-last-visit {
  width: 35%;
}

.children-table td.col-observation-count {
  width: 25%;
  text-align: center;
}

.btn-observation-count {
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  min-width: 50px;
  transition: opacity 0.2s;
}

.btn-observation-primary {
  background-color: #3551a4;
  color: white;
}

.btn-observation-light {
  background-color: #87ceeb;
  color: #2c3e50;
}

.btn-observation-count:hover {
  opacity: 0.9;
}

/* Observations Table */
.observations-table-container {
  overflow-x: auto;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}

.observations-table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.observations-table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.observations-table-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.observations-table-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.observations-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  overflow: hidden;
}

.observations-table thead {
  background: #3551a4;
  color: white;
}

.observations-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 500;
  font-size: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.observations-table th.col-child-name {
  width: 30%;
}

.observations-table th.col-visit-date {
  width: 30%;
}

.observations-table th.col-visit-number {
  width: 20%;
  text-align: center;
}

.observations-table th.col-action {
  width: 20%;
  text-align: center;
}

.observations-table tbody tr {
  border-bottom: 1px solid #e9ecef;
  transition: none;
}

.observations-table tbody tr:hover {
  background-color: #f8f9fa;
}

.observations-table tbody tr:last-child {
  border-bottom: none;
}

.observations-table td {
  padding: 1rem 1.5rem;
  vertical-align: middle;
}

.observations-table td.col-child-name {
  width: 30%;
}

.observations-table td.col-visit-date {
  width: 30%;
}

.observations-table td.col-visit-number {
  width: 20%;
  text-align: center;
}

.observations-table td.col-action {
  width: 20%;
  text-align: center;
}

.btn-view-observation {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-view-observation:hover {
  background: #138496;
}

.btn-view-observation i {
  font-size: 0.9rem;
}

/* Empty States */
.empty-children,
.empty-observations {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.empty-children i,
.empty-observations i {
  font-size: 5rem;
  color: #dee2e6;
  margin-bottom: 1.5rem;
}

.empty-children p,
.empty-observations p {
  font-size: 1.25rem;
  font-weight: 300;
  margin: 0;
}

/* Nested Modal Styles */
/* Base z-index for modals */
::v-deep .modal {
  z-index: 1050;
}

/* First level modal (observations) */
::v-deep #observationsDetailModal {
  z-index: 1060 !important;
}

::v-deep #observationsDetailModal .modal-dialog {
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

/* When observations modal is open */
::v-deep body.modal-open #observationsDetailModal ~ .modal-backdrop {
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

/* Fix for static nested modal */
::v-deep .modal-static {
  z-index: 1070 !important;
}

::v-deep .modal-static .modal-dialog {
  z-index: 1070 !important;
}

/* Visit Result Modal Styles (from dashboard) */
.visit-result-header {
  margin-bottom: 2rem;
}

.patient-info-bar {
  background: rgba(53, 81, 164, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #3551a4;
  border: 1px solid rgba(53, 81, 164, 0.2);
  margin-bottom: 1rem;
}

.patient-info-bar i {
  font-size: 1.5rem;
  color: #3551a4;
}

.patient-name-large {
  font-size: 1.25rem;
  font-weight: 500;
  color: #2c3e50;
}

.patient-nickname-badge {
  font-size: 1.05rem;
  font-weight: 400;
  color: #6c757d;
  margin-left: 0.5rem;
}

.visit-date-info {
  background: #e3f2fd;
  padding: 1rem 1.35rem;
  border-radius: 0.5rem;
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
  font-size: 5rem;
  color: #dee2e6;
  margin-bottom: 1.5rem;
}

.empty-answers p {
  font-size: 1.25rem;
  font-weight: 300;
  margin: 0;
}

@media (max-width: 768px) {
  .supervisor-report {
    padding: 1rem;
  }

  .children-table,
  .observations-table {
    font-size: 0.9rem;
  }

  .children-table th,
  .children-table td,
  .observations-table th,
  .observations-table td {
    padding: 0.75rem 1rem;
  }

  .btn-view-observation {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .answer-question {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>

