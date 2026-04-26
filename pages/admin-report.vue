<template>
  <div class="supervisor-report">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">สรุปการสังเกตจากทีมพื้นที่</h1>
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
              <td><div class="skeleton-cell skeleton-badge"></div></td>
              <td><div class="skeleton-cell skeleton-badge"></div></td>
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

        <template #cell(childCount)="row">
          <button 
            class="btn-count btn-count-primary"
            @click="viewChildren(row.item)"
          >
            {{ row.item.childCount }}
          </button>
        </template>

        <template #cell(observationCount)="row">
          <button
            class="btn-count"
            :class="{
              'btn-count-primary': row.item.observationCount > 0,
              'btn-count-light': row.item.observationCount === 0
            }"
            @click="viewObservations(row.item)"
          >
            {{ row.item.observationCount }}
          </button>
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
              <th class="col-observation-count">จำนวนการเยี่ยมบ้าน</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(child, index) in childrenForm.children" :key="index" class="children-table-row">
              <td class="col-child-name">{{ child.childName }}</td>
              <td class="col-last-visit">{{ formatThaiDate(child.lastVisitDate) }}</td>
              <td class="col-observation-count">
                <span 
                  class="observation-count-badge"
                  :class="{
                    'observation-count-primary': child.observationCount > 0,
                    'observation-count-light': child.observationCount === 0
                  }"
                >
                  {{ child.observationCount }}
                </span>
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
              <td class="col-visit-date">{{ formatThaiDate(observation.visitDate) }}</td>
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
      title="แบบสังเกตผู้เยี่ยมบ้าน"
      size="xl"
      no-close-on-backdrop
      @hidden="onNestedModalHidden"
      @shown="onNestedModalShown"
      header-class="modal-header-visit"
      :dialog-class="showObservationsModal ? 'nested-modal-dialog nested-modal-level-2 record-modal-dialog' : 'record-modal-dialog'"
      no-enforce-focus
      :static="showObservationsModal"
      body-class="record-modal-body"
    >
      <div v-if="observationData && !loadingObservation" class="visit-record-wrapper">
        <div id="observation-record-content" class="visit-record-content">
         

          <!-- Basic Info Section -->
          <div class="plain-text-section">
            <p>ชื่อ-นามสกุลของเด็ก : {{ visitResultForm.childName || '-' }} <span style="margin-left: 3rem;">วันที่ {{ formatThaiDate(observationData?.date_visit) }}</span></p>
            <p>ชื่อ-นามสกุลของผู้เยี่ยมบ้าน : {{ visitResultForm.visitorName || '-' }} <span style="margin-left: 3rem;">การสังเกตครั้งที่ {{ observationData?.time_visit || '-' }}</span></p>
            <p>เวลาเริ่มต้นการสังเกต {{ observationData?.timeStart || '-' }}</p>
          </div>

          <!-- การสังเกต Section -->
          <div class="plain-text-section">
            <p class="section-header-text underline">การสังเกต</p>
            <p>ผู้ดูแลหลัก : {{ getQ0Label(observationData?.q0) }}</p>
          </div>

          <!-- ทบทวนกิจกรรมการเยี่ยมบ้าน Section -->
          <div class="plain-text-section">
            <p class="section-header-text underline">ทบทวนกิจกรรมการเยี่ยมบ้าน : เดือนที่ {{ observationData?.month_age || '-' }} ครั้งที่ {{ observationData?.time || '-' }}</p>
          </div>

          <!-- Questions Section -->
          <div class="plain-text-section">
            <div v-for="(answer, index) in visitResultForm.answers" :key="index" class="question-answer-item">
              <p>{{ answer.questionNumber }} : {{ answer.question }}</p>
              <p class="indent-answer">{{ answer.answer }}</p>
            </div>
            <div v-if="!visitResultForm.answers || visitResultForm.answers.length === 0" class="text-muted">
              ไม่มีข้อมูลการสังเกต
            </div>
          </div>

          <!-- End Time Section -->
          <div class="plain-text-section">
            <p>เวลาสิ้นสุดการสังเกต {{ observationData?.timeEnd || '-' }} น.</p>
            <p v-if="observationData?.note">บันทึกผู้สังเกต - {{ observationData.note }}</p>
          </div>

          <!-- Images Section - 2 columns -->
          <div v-if="observationData?.pic1 || observationData?.pic2" class="plain-text-section">
            <p class="section-header-text">รูปภาพ</p>
            <div class="observation-images-grid">
              <div v-if="observationData?.pic1" class="image-preview-grid">
                <img :src="observationData.pic1" alt="รูปภาพที่ 1" @error="handleImageError">
              </div>
              <div v-if="observationData?.pic2" class="image-preview-grid">
                <img :src="observationData.pic2" alt="รูปภาพที่ 2" @error="handleImageError">
              </div>
            </div>
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
        <b-button variant="primary" @click="downloadObservationPDF" :disabled="!observationData || loadingPDF">
          <i class="fas" :class="loadingPDF ? 'fa-spinner fa-spin' : 'fa-download'"></i>
          {{ loadingPDF ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF' }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { generatePDFFromHTML, imageToBase64 } from '~/utils/pdfHelpers'
import { CAREGIVER_LABELS } from '~/utils/constants'

export default {
  layout: 'admin',
  middleware: 'auth',
  data() {
    return {
      loading: true,
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
      tableData: [],
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
      },
      surveyQuestions: [],
      loadingPDF: false,
      loadingObservation: false,
      observationData: null
    }
  },
  async mounted() {
    await this.fetchTableData()
  },
  beforeMount() {
    // แหล่งที่ 1: store
    let userLevel = this.$store.state.auth?.user?.level

    // แหล่งที่ 2: offlineAuth
    if (userLevel === undefined && this.$offlineAuth) {
      userLevel = this.$offlineAuth.getUser()?.level
    }

    // แหล่งที่ 3: localStorage
    if (userLevel === undefined) {
      try {
        const raw = localStorage.getItem('offline_auth_data')
        if (raw) {
          userLevel = JSON.parse(raw)?.user?.level
        }
      } catch (e) {}
    }

    // console.log('userLevel:', userLevel)

    if (userLevel === 3) {
      this.$router.replace('/')
    } else if (userLevel === 2) {
      this.$router.replace('/supervisor-dashboard')
    }
    // level 1 → อยู่หน้านี้ได้เลย
  },
  methods: {
    // ดึงข้อมูลตารางจาก API
    async fetchTableData() {
      this.loading = true
      try {
        const url = '/api/parenting2025_census/get/homevisit/sup/gethomevisit_dashboard.php'
        const response = await this.$axios.$get(url)

        const isSuccess = response.ok === true
        if (isSuccess && response.results) {
          // Map ข้อมูลจาก API response โดยตรง
          this.tableData = response.results.map(item => ({
            visitorName: item.fullname || item.fname || item.homevisitor || 'Unknown',
            homevisitor: item.homevisitor,
            childCount: item.cnt_visit || 0,
            observationCount: item.cnt_obs || 0,
            homeVisitRecord: item.homeVisitRecord || [],
            classroomObsRecord: item.classroomObsRecord || []
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

    async viewChildren(item) {
      try {
        // เรียก API เพื่อดึงข้อมูลรายละเอียด
        const url = `/api/parenting2025_census/get/homevisit/sup/gethomevisit_dashboard.php?homevisitor=${encodeURIComponent(item.homevisitor)}`
        const response = await this.$axios.$get(url)
        
        const isSuccess = response.message === 'success' || response.statusCode === 200
        
        if (isSuccess && response.results && response.results.length > 0) {
          const visitorData = response.results[0]
          const homeVisitRecords = visitorData.homeVisitRecord || []
          
          // Map ข้อมูลจาก homeVisitRecord
          const children = homeVisitRecords.map(record => ({
            stid: record.stid,
            childName: record.fullname_child || `${record.fname || ''} ${record.surname || ''}`.trim() || '-',
            lastVisitDate: record.date_visit_last,
            observationCount: parseInt(record.count_obs) || 0
          }))
          
          this.childrenForm = {
            visitorName: item.visitorName,
            homevisitor: item.homevisitor,
            children: children
          }
        } else {
          // ถ้าไม่มีข้อมูลจาก API ให้ใช้ข้อมูลที่มีอยู่แล้ว (ถ้ามี)
          const homeVisitRecords = item.homeVisitRecord || []
          
          const children = homeVisitRecords.map(record => ({
            stid: record.stid,
            childName: record.fullname_child || `${record.fname || ''} ${record.surname || ''}`.trim() || '-',
            lastVisitDate: record.date_visit_last,
            observationCount: parseInt(record.count_obs) || 0
          }))
          
          this.childrenForm = {
            visitorName: item.visitorName,
            homevisitor: item.homevisitor,
            children: children
          }
        }
        
        this.showChildrenModal = true
      } catch (error) {
        console.error('Error fetching children data:', error)
        this.$toast.error('ไม่สามารถดึงข้อมูลเด็กได้')
        
        // Fallback ใช้ข้อมูลที่มีอยู่แล้ว
        const homeVisitRecords = item.homeVisitRecord || []
        
        const children = homeVisitRecords.map(record => ({
          stid: record.stid,
          childName: record.fullname_child || `${record.fname || ''} ${record.surname || ''}`.trim() || '-',
          lastVisitDate: record.date_visit_last,
          observationCount: parseInt(record.count_obs) || 0
        }))
        
        this.childrenForm = {
          visitorName: item.visitorName,
          homevisitor: item.homevisitor,
          children: children
        }
        
        this.showChildrenModal = true
      }
    },
    viewChildObservations(child, visitorName) {
      // ไม่ใช้แล้ว - เก็บไว้เผื่อต้องการในอนาคต
      console.log('viewChildObservations called but not used')
    },
    async viewObservations(item) {
      try {
        // เรียก API เพื่อดึงข้อมูลรายละเอียด
        const url = `/api/parenting2025_census/get/homevisit/sup/gethomevisit_dashboard.php?homevisitor=${encodeURIComponent(item.homevisitor)}`
        const response = await this.$axios.$get(url)
        
        const isSuccess = response.message === 'success' || response.statusCode === 200
        
        if (isSuccess && response.results && response.results.length > 0) {
          const visitorData = response.results[0]
          const classroomObsRecords = visitorData.classroomObsRecord || []
          
          // Map ข้อมูลจาก classroomObsRecord
          const observations = classroomObsRecords.map(record => ({
            rowNo: record.row_no,
            stid: record.stid,
            recby: record.recby,
            homevisitor: record.homevisitor,
            childName: record.fullname_child || `${record.fname || ''} ${record.surname || ''}`.trim() || '-',
            visitDate: record.date_visit,
            visitNumber: record.time_visit || 1,
            visitTime: '-'
          }))
          
          this.observationsForm = {
            visitorName: item.visitorName,
            homevisitor: item.homevisitor,
            observations: observations
          }
        } else {
          // ถ้าไม่มีข้อมูลจาก API ให้ใช้ข้อมูลที่มีอยู่แล้ว (ถ้ามี)
          const classroomObsRecords = item.classroomObsRecord || []
          
          const observations = classroomObsRecords.map(record => ({
            rowNo: record.row_no,
            stid: record.stid,
            recby: record.recby,
            homevisitor: record.homevisitor,
            childName: record.fullname_child || `${record.fname || ''} ${record.surname || ''}`.trim() || '-',
            visitDate: record.date_visit,
            visitNumber: record.time_visit || 1,
            visitTime: '-'
          }))
          
          this.observationsForm = {
            visitorName: item.visitorName,
            homevisitor: item.homevisitor,
            observations: observations
          }
        }
        
        this.showObservationsModal = true
      } catch (error) {
        console.error('Error fetching observations data:', error)
        this.$toast.error('ไม่สามารถดึงข้อมูลการสังเกตได้')
        
        // Fallback ใช้ข้อมูลที่มีอยู่แล้ว
        const classroomObsRecords = item.classroomObsRecord || []
        
        const observations = classroomObsRecords.map(record => ({
          rowNo: record.row_no,
          stid: record.stid,
          recby: record.recby,
          homevisitor: record.homevisitor,
          childName: record.fullname_child || `${record.fname || ''} ${record.surname || ''}`.trim() || '-',
          visitDate: record.date_visit,
          visitNumber: record.time_visit || 1,
          visitTime: '-'
        }))
        
        this.observationsForm = {
          visitorName: item.visitorName,
          homevisitor: item.homevisitor,
          observations: observations
        }
        
        this.showObservationsModal = true
      }
    },
    async viewObservationDetail(observation) {
      this.observationData = null
      this.loadingObservation = true
      
      this.visitResultForm = {
        childName: observation.childName,
        visitorName: this.observationsForm.visitorName,
        visitNumber: observation.visitNumber,
        visitDate: observation.visitDate,
        visitTime: observation.visitTime,
        answers: []
      }
      
      this.showVisitResultModal = true
      
      try {
        // Fetch survey questions if not loaded
        if (this.surveyQuestions.length === 0) {
          await this.fetchSurveyQuestions()
        }
        
        // Fetch observation data from API
        const url = `/api/parenting2025_census/get/homevisit/sup/gethomevisit_observation_data.php?homevisitor=${encodeURIComponent(observation.homevisitor)}&stid=${encodeURIComponent(observation.stid)}&time_visit=${encodeURIComponent(observation.visitNumber)}`
        const response = await this.$axios.$get(url)
        
        const isSuccess = response.message === 'success' || response.statusCode === 200
        
        if (isSuccess && response.results && response.results.length > 0) {
          const data = response.results[0]
          this.observationData = data
          
          // Map observation data to answers using surveyQuestions
          const answers = this.mapObservationToAnswers(data)
          this.visitResultForm.answers = answers
          
          // Update header info
          this.visitResultForm.childName = observation.childName
          this.visitResultForm.visitDate = data.date_visit || observation.visitDate
          this.visitResultForm.visitTime = data.timeStart || '-'
          this.visitResultForm.visitNumber = data.time_visit || observation.visitNumber
          this.visitResultForm.timeStart = data.timeStart || '-'
          this.visitResultForm.timeEnd = data.timeEnd || '-'
          this.visitResultForm.note = data.note || ''
          this.visitResultForm.q0 = data.q0 || ''
          this.visitResultForm.monthAge = data.month_age || ''
          this.visitResultForm.time = data.time || ''
          this.visitResultForm.pic1 = data.pic1 || ''
          this.visitResultForm.pic2 = data.pic2 || ''
        }
      } catch (error) {
        console.error('Error fetching observation data:', error)
        this.$toast?.error?.('ไม่สามารถโหลดข้อมูลการสังเกตได้')
      } finally {
        this.loadingObservation = false
      }
    },
    
    // Fetch survey questions from API
    async fetchSurveyQuestions() {
      try {
        const url = '/api/parenting2025_census/get/homevisit/sup/gethomevisit_observations_question.php'
        const response = await this.$axios.$get(url)
        
        const isSuccess = response.message === 'success' || response.statusCode === 200
        
        if (isSuccess && response.results) {
          this.surveyQuestions = response.results
        }
      } catch (error) {
        console.error('Error fetching survey questions:', error)
      }
    },
    
    // Map observation data to answer display format (1-based numbering: q0=1, q1=2, etc.)
    mapObservationToAnswers(data) {
      const answers = []
      let questionNumber = 1
      
      // Get q0 answer label (now numbered as 1)
      const q0Labels = CAREGIVER_LABELS
      
      if (data.q0) {
        answers.push({
          questionNumber: questionNumber,
          question: 'ผู้ปกครองสามารถเข้าร่วมกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่',
          type: 'options',
          answer: q0Labels[data.q0] || data.q0,
          section: 'homevisit'
        })
        questionNumber++
      }
      
      // Map q1-q30 using surveyQuestions (numbered sequentially)
      for (let i = 1; i <= 30; i++) {
        const qCode = `q${i}`
        const qValue = data[qCode]
        
        if (qValue !== undefined && qValue !== null && qValue !== '') {
          const question = this.surveyQuestions.find(q => q.question_code === qCode)
          
          if (question) {
            let answerLabel = qValue
            
            // Find choice label
            if (question.choices && question.choices.length > 0) {
              const choice = question.choices.find(c => String(c.value) === String(qValue))
              if (choice) {
                answerLabel = choice.label
              }
            }
            
            answers.push({
              questionNumber: questionNumber,
              question: question.question_text || `คำถามที่ ${questionNumber}`,
              type: 'options',
              answer: answerLabel,
              section: question.section || 'general'
            })
            questionNumber++
          }
        }
      }
      
      return answers
    },
    
    // Get home visit section answers (first 2 questions)
    getHomeVisitAnswers() {
      return this.visitResultForm.answers.filter((_, index) => index < 2)
    },
    
    // Get review section answers (questions 3-5)
    getReviewAnswers() {
      return this.visitResultForm.answers.filter((_, index) => index >= 2 && index < 5)
    },
    
    // Check if activity review data exists
    hasActivityReviewData() {
      // For now, return false as activity data structure needs to be defined
      return false
    },
    
    // Get activity review data
    getActivityReviewData() {
      // For now, return empty array - can be populated from API later
      return []
    },
    
    async downloadObservationPDF() {
      this.loadingPDF = true
      
      try {
        // รอให้ fonts โหลดเสร็จ
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready
        }
        
        const data = this.observationData
        
        let pic1Base64 = null
        let pic2Base64 = null
        if (data?.pic1) pic1Base64 = await imageToBase64(data.pic1)
        if (data?.pic2) pic2Base64 = await imageToBase64(data.pic2)
        
        let html = `
          <div style="font-family: 'Kanit', 'Sarabun', sans-serif; padding: 20px; max-width: 680px; font-size: 14px; color: #1a5276; line-height: 1.6;">
            <h2 style="text-align: center; margin-bottom: 30px; font-size: 20px; font-weight: bold; color: #1a5276;">แบบสังเกตผู้เยี่ยมบ้าน</h2>
            
            <div style="margin-bottom: 15px;">
              <p style="margin: 5px 0;">ชื่อ-นามสกุลของเด็ก : ${this.visitResultForm.childName || '-'} <span style="margin-left: 3rem;">วันที่ ${this.formatThaiDate(data?.date_visit) || '-'}</span></p>
              <p style="margin: 5px 0;">ชื่อ-นามสกุลของผู้เยี่ยมบ้าน : ${this.visitResultForm.visitorName || '-'} <span style="margin-left: 3rem;">การสังเกตครั้งที่ ${data?.time_visit || '-'}</span></p>
              <p style="margin: 5px 0;">เวลาเริ่มต้นการสังเกต ${data?.timeStart || '-'}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="font-weight: bold; text-decoration: underline; margin-bottom: 10px;">การสังเกต</p>
              <p>ผู้ดูแลหลัก : ${CAREGIVER_LABELS[data?.q0] || data?.q0 || '-'}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <p style="font-weight: bold; text-decoration: underline; margin-bottom: 10px;">ทบทวนกิจกรรมการเยี่ยมบ้าน : เดือนที่ ${data?.month_age || '-'} ครั้งที่ ${data?.time || '-'}</p>
            </div>
        `
        
        this.visitResultForm.answers.forEach(answer => {
          html += `
            <div style="margin-bottom: 8px;">
              <p style="margin: 2px 0;">${answer.questionNumber} : ${answer.question}</p>
              <p style="margin: 2px 0; margin-left: 2rem;">${answer.answer}</p>
            </div>
          `
        })
        
        html += `
            <div style="margin-top: 20px;">
              <p style="margin: 5px 0;">เวลาสิ้นสุดการสังเกต ${data?.timeEnd || '-'} น.</p>
              ${data?.note ? `<p style="margin: 5px 0;">บันทึกผู้สังเกต - ${data.note}</p>` : ''}
            </div>
        `
        
        if (pic1Base64 || pic2Base64) {
          html += `<div style="margin-top: 20px;"><p style="font-weight: bold; margin-bottom: 10px;">รูปภาพ</p><div style="display: flex; gap: 15px; flex-wrap: wrap;">`
          if (pic1Base64) html += `<div style="flex: 1; min-width: 40%; max-width: 48%;"><img src="${pic1Base64}" style="width: 100%; max-height: 280px; object-fit: contain; border: 1px solid #ccc; border-radius: 4px;" alt="รูปภาพที่ 1"></div>`
          if (pic2Base64) html += `<div style="flex: 1; min-width: 40%; max-width: 48%;"><img src="${pic2Base64}" style="width: 100%; max-height: 280px; object-fit: contain; border: 1px solid #ccc; border-radius: 4px;" alt="รูปภาพที่ 2"></div>`
          html += `</div></div>`
        }
        
        html += `</div>`
        
        const filename = `แบบสังเกตผู้เยี่ยมบ้าน_${this.visitResultForm.childName || 'observation'}_${data?.date_visit || 'pdf'}.pdf`
        await generatePDFFromHTML(html, filename)
        
        this.$toast?.success?.('ดาวน์โหลด PDF สำเร็จ')
      } catch (error) {
        console.error('Error generating PDF:', error)
        this.$toast?.error?.('ไม่สามารถสร้าง PDF ได้: ' + (error.message || 'Unknown error'))
      } finally {
        this.loadingPDF = false
      }
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
    },
    
    // Get Q0 label for caregiver
    getQ0Label(value) {
      return CAREGIVER_LABELS[value] || value || '-'
    },
    
    // Handle image load error
    handleImageError(event) {
      event.target.style.display = 'none'
    },
    
    // Format date to Thai format
    formatThaiDate(dateString) {
      if (!dateString) return '-'
      
      // If already in Thai format, return as-is
      if (typeof dateString === 'string' && dateString.includes('มกราคม') || 
          dateString.includes('กุมภาพันธ์') || dateString.includes('มีนาคม') ||
          dateString.includes('เมษายน') || dateString.includes('พฤษภาคม') ||
          dateString.includes('มิถุนายน') || dateString.includes('กรกฎาคม') ||
          dateString.includes('สิงหาคม') || dateString.includes('กันยายน') ||
          dateString.includes('ตุลาคม') || dateString.includes('พฤศจิกายน') ||
          dateString.includes('ธันวาคม')) {
        return dateString
      }
      
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString
        
        const day = date.getDate()
        const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                           'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
        const month = monthNames[date.getMonth()]
        const year = date.getFullYear() + 543
        
        return `${day} ${month} ${year}`
      } catch (error) {
        return dateString
      }
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

/* Skeleton Loading: uses global styles from ~/assets/css/main.css */

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

/* Observation Count Badge (non-clickable) */
.observation-count-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 50px;
  text-align: center;
}

.observation-count-primary {
  background-color: #3551a4;
  color: white;
}

.observation-count-light {
  background-color: #87ceeb;
  color: #2c3e50;
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

/* 2-Column Image Grid for Observation */
.observation-images-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
}

.image-preview-grid {
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.image-preview-grid img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  display: block;
}

@media (max-width: 576px) {
  .observation-images-grid {
    grid-template-columns: 1fr;
  }
}
</style>

