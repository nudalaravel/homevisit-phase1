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
            :class="getRecordButtonClass(row.item)"
            @click="viewRecord(row.item)"
            :title="getRecordButtonTitle(row.item)"
          >
            <i
              class="fas"
              :class="getRecordButtonIcon(row.item)"
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
            <template v-else>
              <button 
                v-if="row.item.approveStatus !== -1 && row.item.approveStatus !== -2"
                class="btn-request-correction" 
                @click="openCorrectionModal(row.item)"
                title="แจ้งให้แก้ไข"
              >
                <i class="fas fa-edit"></i>
                แจ้งให้แก้ไข
              </button>
              <span v-if="row.item.approveStatus === -1" class="badge-correction-pending">
                <i class="fas fa-clock"></i> รอแก้ไข
              </span>
              <input
                v-else
                type="checkbox"
                :checked="selectedItems.includes(row.item)"
                @change="toggleConfirm(row.item, $event)"
              />
            </template>
          </div>
        </template>
      </b-table>
    </div>

    <!-- Color Legend -->
    <div class="color-legend">
      <span class="legend-item">
        <span class="legend-color legend-pending"></span>
        รอตรวจสอบ
      </span>
      <span class="legend-item">
        <span class="legend-color legend-approved"></span>
        อนุมัติแล้ว
      </span>
      <span class="legend-item">
        <span class="legend-color legend-correction"></span>
        แจ้งให้แก้ไข
      </span>
      <span class="legend-item">
        <span class="legend-color legend-edited"></span>
        แก้ไขแล้ว รอตรวจ
      </span>
    </div>

    <!-- Action Buttons -->
    <div v-if="selectedItems.length > 0" class="action-buttons-section">
      <div class="action-buttons">
        <button class="btn-action btn-approve btn-approve-wide" @click="handleApprove">
          <i class="fas fa-check"></i>
          อนุมัติ
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
          :fields="approvalHistoryFields"
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
                <!--img :src="photoModalData.images[0]" alt="รูปของเล่น สื่ออุปกรณ์"-->
                <img :src="getImageUrl(photoModalData.images[0])" alt="รูปของเล่น สื่ออุปกรณ์">
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
                <!--img :src="photoModalData.images[1]" alt="รูปขณะที่เด็กและผู้ปกครองทำกิจกรรม"-->
                <img :src="getImageUrl(photoModalData.images[1])" alt="รูปขณะที่เด็กและผู้ปกครองทำกิจกรรม">
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

    <!-- Correction Request Modal -->
    <b-modal
      v-model="showCorrectionModal"
      title="ยืนยันการทำรายการนี้ใช่หรือไม่"
      size="md"
      centered
      no-close-on-backdrop
      header-class="modal-header-correction"
    >
      <div class="correction-modal-content">
        <div class="correction-info" v-if="correctionItem">
          <p><strong>ชื่อเด็ก:</strong> {{ correctionItem.childName }}</p>
          <p><strong>ผู้เยี่ยมบ้าน:</strong> {{ correctionItem.visitorName }}</p>
          <p><strong>วันที่เยี่ยม:</strong> {{ correctionItem.visitDate }}</p>
        </div>
        <div class="correction-reason-input">
          <label for="correctionReason">เหตุผลที่ต้องแก้ไข:</label>
          <textarea 
            id="correctionReason" 
            v-model="correctionReason" 
            class="form-control"
            maxlength="255"
            rows="3"
            placeholder="กรุณาระบุเหตุผลที่ต้องแก้ไข..."
          ></textarea>
          <small class="text-muted">{{ correctionReason.length }}/255 ตัวอักษร</small>
        </div>
      </div>
      <template #modal-footer>
        <b-button variant="secondary" @click="closeCorrectionModal">
          <i class="fas fa-times"></i>
          ยกเลิก
        </b-button>
        <b-button variant="danger" @click="submitCorrectionRequest" :disabled="!correctionReason.trim()">
          <i class="fas fa-check"></i>
          ยืนยัน
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
      body-class="record-modal-body"
    >
      <div v-if="recordData" class="visit-record-wrapper">
        <div id="visit-record-content" class="visit-record-content">
        <!-- Header Section -->
        <div class="record-header">
          <div class="record-title">แบบบันทึกข้อมูลเด็ก สำหรับผู้เยี่ยมบ้าน</div>
        </div>

        <!-- Basic Info Section -->
        <div class="plain-text-section">
          <p>ชื่อ-นามสกุลของเด็ก : {{ recordData.childName || '-' }} <span style="margin-left: 3rem;">วันที่ {{ formatThaiDate(recordData.visitDate) }}</span></p>
          <p>ชื่อ-นามสกุลของผู้เยี่ยมบ้าน : {{ recordData.visitorName || '-' }} <span style="margin-left: 3rem;">การเยี่ยมบ้านครั้งที่ {{ recordData.visitNumber || '-' }} (กิจกรรมการเยี่ยมบ้าน เดีอนที่ {{ recordData.monthAge || '-' }} ครั้งที่ {{ recordData.time || '-' }})</span></p>
          <p>เวลาเริ่มต้นการเยี่ยมบ้าน {{ recordData.startTime || '-' }}</p>
        </div>

        <!-- Home Visit Section -->
        <div class="plain-text-section">
          <p class="section-header-text">การเยี่ยมบ้าน</p>
          <p>1 : ผู้ปกครองสามารถเข้าร่วมกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</p>
          <p class="indent-answer">{{ getParticipationAnswer(recordData.answers?.q1) }}</p>
          <p v-if="recordData.answers?.q1_des" class="indent-answer text-muted"><em>เหตุผล: {{ recordData.answers.q1_des }}</em></p>
          <p>2 : เด็กสามารถเข้าร่วมกิจกรรมการเยี่ยมบ้านครั้งนี้ได้หรือไม่</p>
          <p class="indent-answer">{{ getParticipationAnswer(recordData.answers?.q2) }}</p>
          <p v-if="recordData.answers?.q2_des" class="indent-answer text-muted"><em>เหตุผล: {{ recordData.answers.q2_des }}</em></p>
        </div>

        <!-- Review Previous Visit Section -->
        <div class="plain-text-section">
          <p class="section-header-text underline">ทบทวนการเยี่ยมบ้านครั้งที่ผ่านมา</p>
          <p>3 : ในสัปดาห์ที่ผ่านมา ใครเป็นคนทำกิจกรรมที่ได้จากการเยี่ยมบ้านร่วมกับเด็ก</p>
          <p class="indent-answer">{{ parseInt(recordData.visitNumber) === 1 ? '-' : getQ6Answer(recordData.answers?.q6) }}</p>
          <p v-if="parseInt(recordData.visitNumber) !== 1 && recordData.answers?.q3_des" class="indent-answer text-muted"><em>อื่นๆ ระบุ: {{ recordData.answers.q3_des }}</em></p>
          <p>4 : ในสัปดาห์ที่ผ่านมา ผู้ปกครองร่วมทำกิจกรรมกับเด็กบ่อยแค่ไหน ?</p>
          <p class="indent-answer">{{ parseInt(recordData.visitNumber) === 1 ? '-' : getQ8Answer(recordData.answers?.q8) }}</p>
          <p>5 : ให้ผู้เยี่ยมบ้าน <strong>สังเกต</strong> หรือ <strong>ทบทวน</strong> กิจกรรมการเยี่ยมบ้านครั้งที่ผ่านมา โดยขอให้ผู้ปกครองสาธิตการทำกิจกรรมร่วมกับเด็ก</p>
          <p v-if="parseInt(recordData.visitNumber) === 1" class="indent-answer">-</p>
        </div>

        <!-- Activity Review Table -->
        <div v-if="parseInt(recordData.visitNumber) !== 1" class="plain-text-section">
          <p class="section-header-text underline">ทบทวนกิจกรรมการเยี่ยมบ้าน : เดือนที่ {{ recordData.monthAgePrev || '-' }} ครั้งที่ {{ recordData.timePrev || '-' }}</p>
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
          <p v-if="recordData.answers?.q6_des" class="indent-answer text-muted"><em>อื่นๆ ระบุ: {{ recordData.answers.q6_des }}</em></p>
          <p>7 : มีผู้อื่นร่วมทำกิจกรรมด้วยหรือไม่ (มากกว่า 20 นาที)</p>
          <p class="indent-answer">{{ recordData.answers?.q7 === 1 ? 'มี' : recordData.answers?.q7 === 3 ? 'ไม่มี' : '-' }}</p>
          <!-- ซ่อน q71_des ไม่ต้องแสดง -->
          <p>8 : มีเด็กคนอื่นร่วมทำกิจกรรมไปพร้อมกับเด็กกลุ่มตัวอย่างด้วยหรือไม่ (เด็กอายุไม่เกิน 5 ขวบ)</p>
          <p class="indent-answer">{{ recordData.answers?.q8 === 1 ? 'มี' : recordData.answers?.q8 === 3 ? 'ไม่มี' : '-' }}</p>
        </div>

        <!-- Current Visit Activities Section (Q9) -->
        <div v-if="recordData.q9Activities && recordData.q9Activities.length > 0" class="plain-text-section">
          <p>9 : ให้ผู้เยี่ยมบ้าน <strong>สังเกต</strong> หรือ <strong>ทบทวน</strong> กิจกรรมการเยี่ยมบ้าน เดือนที่ {{ recordData.monthAge || '-' }} ครั้งที่ {{ recordData.time || '-' }}</p>
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
          <p>10 : นัดหมายการเยี่ยมบ้านครั้งต่อไป วันที่ {{ recordData.appointment?.date || '-' }} เวลา {{ recordData.appointment?.time || '-' }}</p>
          <p>เวลาสิ้นสุดการเยี่ยมบ้าน {{ recordData.endTime || '-' }}</p>
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
        <b-button variant="primary" @click="downloadPDF" :disabled="!recordData || loadingPDF">
          <i class="fas fa-download"></i>
          {{ loadingPDF ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF' }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { PARTICIPANT_OPTIONS, ACTIVITY_ANSWER_OPTIONS } from '~/utils/surveyHelpers'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export default {
  layout: 'supervisor',
  middleware: 'auth',
  data() {
    return {
      loading: true,
      loadingPDF: false,
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
      latestApprovalsData: [],
      approvalHistoryFields: [
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
        }
      ],
      // Correction Modal
      showCorrectionModal: false,
      correctionItem: null,
      correctionReason: ''
    }
  },
  async mounted() {
    // jsPDF and html2canvas imported directly, no need for CDN

    // Load data from APIs
    // await this.fetchAmphoeOptions()
    await this.fetchTambonOptions()
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
    }
    // level 1 → อยู่หน้านี้ได้เลย
  },
  methods: {
    getImageUrl(img) {
      if (!img) return ''

      // 🔥 ถ้าเป็น base64 (data:image)
      if (img.startsWith('data:image')) {
        return img
      }

      // 🔥 ถ้าเป็น URL ปกติ
      return `${img}?t=${Date.now()}`
    },
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

    // ดึงข้อมูลอำเภอ/ตำบลสำหรับ dropdown
    async fetchTambonOptions() {
      try {
        const response = await this.$axios.$get('/api/parenting2025_census/get/homevisit/gettambon.php')
        const isSuccess = response.message === 'success' || response.statusCode === 200
        if (isSuccess && response.results) {
          this.subdistrictOptions = [
            { value: 'all', text: '--ทั้งหมด--' },
            ...response.results.map(item => ({
              value: item.tambon_code || item.code,
              text: item.tambon_nameT || item.tambon
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
      this.selectedItems = [] // เคลียร์รายการที่เลือกเมื่อรีเฟรสข้อมูล
      try {
        const params = new URLSearchParams()
        if (this.filters.subdistrict && this.filters.subdistrict !== 'all') {
          params.append('amp_code', this.filters.subdistrict)
        }
        if (this.filters.visitor && this.filters.visitor !== 'all') {
          params.append('user_id', this.filters.visitor)
        }
        
        // ดึงข้อมูลจาก 2 API พร้อมกัน
        const [resultDataResponse, resultListResponse] = await Promise.all([
          // API หลัก - ข้อมูลผลการเยี่ยมบ้าน
          this.$axios.$get(`/api/parenting2025_census/get/homevisit/sup/gethomevisit_result_data.php${params.toString() ? '?' + params.toString() : ''}`),
          // API เสริม - ข้อมูล approve_status และ approve_comment
          this.$axios.$get(`/api/parenting2025_census/get/homevisit/sup/gethomevisit_resultlist.php${params.toString() ? '?' + params.toString() : ''}`)
        ])
        // สร้าง lookup map สำหรับ approve_status และ approve_comment จาก resultlist API
        // key = stid_time_visit
        const approveStatusMap = {}
        if (resultDataResponse?.results) {
          resultDataResponse.results.forEach(item => {
            const key = `${item.stid}_${item.time_visit}`
            approveStatusMap[key] = {
              approve_status: item.approve_status !== null && item.approve_status !== undefined 
                ? parseInt(item.approve_status) 
                : null,
              approve_comment: item.approve_comment || null,
              approve_date: item.approve_date || null,
              approve_by: item.approve_by || null
            }
          })
        }
        const isSuccess = resultDataResponse.message === 'success' || resultDataResponse.statusCode === 200
        if (isSuccess && resultDataResponse.results) {
          // สร้าง lookup map: username -> ชื่อเต็ม จาก visitorOptions
          const visitorNameMap = {}
          this.visitorOptions.forEach(opt => {
            if (opt.value !== 'all') {
              visitorNameMap[opt.value] = opt.text
            }
          })
          
          // Filter ข้อมูลฝั่ง client ตามผู้เยี่ยมบ้านที่เลือก
          let filteredResults = resultDataResponse.results
          if (this.filters.visitor && this.filters.visitor !== 'all') {
            filteredResults = resultDataResponse.results.filter(item => item.recby === this.filters.visitor)
          }
          this.tableData = filteredResults.map((item, index) => {
            // ดึง approve status จาก resultlist API โดยใช้ stid และ time_visit เป็น key
            const approveKey = `${item.stid}_${item.time_visit}`
            const approveData = approveStatusMap[approveKey] || {}
            const approveStatus = approveData.approve_status
            
            // แปลง approve_status เป็น confirmStatus
            // 0 || null = ยังไม่ตรวจสอบ (pending)
            // -1 = แจ้งให้แก้ไข (correction_requested)
            // -2 = แก้ไขแล้ว (edited)
            // 1 = อนุมัติ (confirmed)
            let confirmStatus = 'pending'
            if (approveStatus === 1) {
              confirmStatus = 'confirmed'
            } else if (approveStatus === -1) {
              confirmStatus = 'correction_requested'
            } else if (approveStatus === -2) {
              confirmStatus = 'edited'
            }
            
            return {
              id: `${item.stid}-${item.time_visit}-${index}`,
              stid: item.stid,
              visitDate: `${this.formatThaiDate(item.date_visit)} (${item.time_visit || '-'})`,
              // visitorName: visitorNameMap[item.recby] || item.recby || '-',
              visitorName: visitorNameMap[item.recby] || item.recby || item.fullname_visit || '-',
              childName: `${item.fname_ch || ''} ${item.lname_ch || ''}`.trim() || '-',
              recordStatus: item.recStatus === '1' ? 'completed' : 'pending',
              hasPhotos: !!(item.pic1 || item.pic2),
              confirmStatus: confirmStatus,
              approveStatus: approveStatus, // เก็บค่าดิบไว้ด้วย
              approveComment: approveData.approve_comment,
              approveDate: approveData.approve_date,
              approveBy: approveData.approve_by,
              surveyId: item.stid,
              recby: item.recby,
              tamCode: item.tam_code,
              timeVisit: item.time_visit,
              // เก็บ response ดิบไว้สำหรับ modal
              rawData: item
            }
          })
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

    // Helper methods สำหรับปุ่ม "แบบเยี่ยมบ้าน" แสดง approve_status
    getRecordButtonClass(item) {
      // approve_status: 0/null=รอตรวจ, -1=แจ้งแก้ไข, -2=แก้ไขแล้ว, 1=อนุมัติ
      const approveStatus = item.approveStatus
      if (approveStatus === 1) {
        return 'btn-approved' // อนุมัติแล้ว - สีเขียว
      } else if (approveStatus === -1) {
        return 'btn-correction-requested' // แจ้งให้แก้ไข - สีแดง
      } else if (approveStatus === -2) {
        return 'btn-edited' // แก้ไขแล้ว - สีฟ้า
      } else {
        // 0 หรือ null - ยังไม่ตรวจสอบ - สีเหลือง
        return 'btn-pending'
      }
    },
    
    getRecordButtonIcon(item) {
      const approveStatus = item.approveStatus
      if (approveStatus === 1) {
        return 'fa-check-circle' // อนุมัติแล้ว
      } else if (approveStatus === -1) {
        return 'fa-exclamation-triangle' // แจ้งให้แก้ไข
      } else if (approveStatus === -2) {
        return 'fa-clock' // แก้ไขแล้ว - ไอคอนนาฬิกา
      } else {
        return 'fa-clock' // รอตรวจสอบ - ไอคอนนาฬิกา
      }
    },
    
    getRecordButtonTitle(item) {
      const approveStatus = item.approveStatus
      const comment = item.approveComment || ''
      if (approveStatus === 1) {
        return 'อนุมัติแล้ว'
      } else if (approveStatus === -1) {
        return `แจ้งให้แก้ไข: ${comment}`
      } else if (approveStatus === -2) {
        return `แก้ไขแล้ว รอตรวจสอบ: ${comment}`
      } else {
        return 'รอตรวจสอบ'
      }
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
            childName: item.childName,
            visitorName: raw.fullname_visit || item.visitorName,
            visitDate: raw.date_visit || item.visitDate,
            visitNumber: raw.time_visit || 1,
            startTime: raw.timeStart || '16:00 น.',
            endTime: raw.timeEnd || '-',
            time_visit: raw.time_visit,
            monthAge: raw.month_age,
            time: raw.time,
            monthAgePrev: raw.prev_month_age,
            timePrev: raw.prev_time,
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
      // ใช้ข้อมูลกิจกรรมจริงจาก IndexedDB เท่านั้น (ไม่ใช้ mock)

      this.recordData = {
        childName: item.childName,
        visitorName: survey.fullname_visit || item.visitorName,
        visitDate: visitDate,
        visitNumber: visitNumber,
        startTime: startTime,
        monthAge: survey.month_age,
        time: survey.time,
        answers: survey.answers || {},
        q5Activities: q5Activities
      }
    },
    extractVisitNumber(visitDateStr) {
      // Extract visit number from string like "อ. 20 มิถุนายน 2566 (27)"
      const match = visitDateStr.match(/\((\d+)\)/)
      return match ? match[1] : '-'
    },
    /**
     * แปลงค่าตอบ 1/2/3 เป็น ได้/ทำบ้าง/ไม่ได้ (ใช้ได้กับ Q1 และ Q2)
     */
    getParticipationAnswer(value) {
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
      if (!this.recordData) {
        this.$toast.error('ไม่พบข้อมูลที่จะสร้าง PDF')
        return
      }

      try {
        this.loadingPDF = true
        
        await this.$nextTick()
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const originalElement = document.getElementById('visit-record-content')
        if (!originalElement) {
          this.$toast.error('ไม่พบข้อมูลที่จะสร้าง PDF')
          return
        }

        const A4_WIDTH_MM = 210
        const A4_HEIGHT_MM = 297
        const MARGIN_MM = 15
        const CONTENT_WIDTH_MM = A4_WIDTH_MM - (MARGIN_MM * 2)
        
        const pdfContainer = document.createElement('div')
        pdfContainer.id = 'pdf-gen-container'
        pdfContainer.style.cssText = `
          position: absolute;
          left: -9999px;
          top: 0;
          width: 680px;
          background: white;
          padding: 30px;
          font-family: 'Kanit', 'Sarabun', Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #000000;
        `
        
        pdfContainer.innerHTML = originalElement.innerHTML
        document.body.appendChild(pdfContainer)
        
        const applyStyles = (container) => {
          const recordHeader = container.querySelector('.record-header')
          if (recordHeader) recordHeader.style.cssText = 'text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #3551a4;'
          const recordTitle = container.querySelector('.record-title')
          if (recordTitle) recordTitle.style.cssText = 'font-size: 18px; font-weight: bold; color: #3551a4; margin: 0;'
          container.querySelectorAll('p').forEach(p => { p.style.cssText = 'margin: 6px 0; font-size: 14px; line-height: 1.6; color: #000000;' })
          container.querySelectorAll('.section-header-text').forEach(h => { h.style.cssText = 'font-weight: bold; color: #000000; margin-top: 15px; margin-bottom: 10px;' })
          container.querySelectorAll('.indent-answer').forEach(a => { a.style.cssText = 'padding-left: 30px; color: #333333; margin: 6px 0;' })
          container.querySelectorAll('table').forEach(table => { table.style.cssText = 'width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px;' })
          container.querySelectorAll('th').forEach(th => { th.style.cssText = 'border: 1px solid #333; padding: 8px; text-align: left; font-weight: bold; background-color: #f0f0f0;' })
          container.querySelectorAll('td').forEach(td => { td.style.cssText = 'border: 1px solid #333; padding: 8px; text-align: left;' })
          container.querySelectorAll('.plain-text-section').forEach(section => { section.style.cssText = 'margin-bottom: 15px;' })
        }
        
        applyStyles(pdfContainer)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const canvas = await html2canvas(pdfContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 680,
          windowWidth: 680
        })
        
        document.body.removeChild(pdfContainer)
        
        const imgWidth = CONTENT_WIDTH_MM
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        const pageHeight = A4_HEIGHT_MM - (MARGIN_MM * 2)
        
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const totalPages = Math.ceil(imgHeight / pageHeight)
        
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) pdf.addPage()
          const sourceY = (page * pageHeight * canvas.width) / imgWidth
          const sourceHeight = Math.min((pageHeight * canvas.width) / imgWidth, canvas.height - sourceY)
          const pageCanvas = document.createElement('canvas')
          pageCanvas.width = canvas.width
          pageCanvas.height = sourceHeight
          const ctx = pageCanvas.getContext('2d')
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
          ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight)
          const sliceHeight = (sourceHeight * imgWidth) / canvas.width
          pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', MARGIN_MM, MARGIN_MM, imgWidth, sliceHeight)
        }
        
        const filename = `แบบบันทึกข้อมูลเด็ก_${this.recordData.childName}_${this.recordData.visitDate}.pdf`
        pdf.save(filename)
        
        this.$toast.success('ดาวน์โหลด PDF สำเร็จ')
      } catch (error) {
        console.error('Error generating PDF:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการสร้าง PDF: ' + (error.message || 'Unknown error'))
        const container = document.getElementById('pdf-gen-container')
        if (container) document.body.removeChild(container)
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
      // กรอง items ที่มี approveStatus === -1 ออก (defense-in-depth)
      const validItems = this.selectedItems.filter(item => item.approveStatus !== -1)
      if (validItems.length === 0) {
        this.$toast.warning('ไม่มีรายการที่สามารถอนุมัติได้')
        return
      }

      const result = await this.$swal.fire({
        title: 'ยืนยันการอนุมัติ',
        text: `คุณกำลังจะอนุมัติจำนวน ${this.selectedItems.length} รายการใช่หรือไม่`,
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
          // Get supervisor username
          const user = this.$offlineAuth?.getUser?.()
          const supervisorUsername = user?.username || 'supervisor'
          
          // Format current date to MySQL format (YYYY-MM-DD HH:MM:SS)
          const now = new Date()
          const mysqlDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
          
          let successCount = 0
          let failCount = 0
          
          // Process each selected item
          const approvedItems = []
          
          for (const item of this.selectedItems) {
            try {
              const stid = item.stid || item.rawData?.stid
              const timeVisit = item.rawData?.time_visit || '1'
              const recBy = item.recby || item.rawData?.recby
              
              const payload = {
                variable: [
                  'approve_status',
                  'approve_date',
                  'approve_comment',
                  'approve_by'
                ],
                value: [
                  '1',                           // approve_status = 1 (อนุมัติ)
                  mysqlDate,                     // approve_date
                  '',                            // approve_comment (ไม่มี comment สำหรับการอนุมัติ)
                  supervisorUsername             // approve_by
                ],
                pk: ['stid', 'time_visit', 'recby'],
                pkval: [stid, String(timeVisit), recBy],
                tb: 'homevisitor_app'
              }
              
              await this.$axios.$put(
                '/api/parenting2025_census/put/homevisit/putdata.php',
                payload
              )
              
              // Add to approved items for history
              approvedItems.push({
                ...item,
                confirmStatus: 'approved',
                approvedAt: mysqlDate,
                approvedBy: supervisorUsername
              })
              
              successCount++
            } catch (itemError) {
              console.error('Error approving item:', item, itemError)
              failCount++
            }
          }
          
          // Add approved items to latestApprovalsData (history)
          if (approvedItems.length > 0) {
            this.latestApprovalsData = [...approvedItems, ...this.latestApprovalsData]
          }
          
          if (successCount > 0) {
            this.$toast.success(`อนุมัติ ${successCount} รายการสำเร็จ`)
          }
          if (failCount > 0) {
            this.$toast.warning(`อนุมัติล้มเหลว ${failCount} รายการ`)
          }
          
          this.selectedItems = []
          
          // Refresh table data
          await this.fetchTableData()
        } catch (error) {
          console.error('Error in handleApprove:', error)
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
    
    // Correction Modal Methods
    openCorrectionModal(item) {
      this.correctionItem = item
      this.correctionReason = ''
      this.showCorrectionModal = true
    },
    
    closeCorrectionModal() {
      this.showCorrectionModal = false
      this.correctionItem = null
      this.correctionReason = ''
    },
    
    async submitCorrectionRequest() {
      if (!this.correctionItem || !this.correctionReason.trim()) {
        return
      }
      
      try {
        // Get supervisor username
        const user = this.$offlineAuth?.getUser?.()
        const supervisorUsername = user?.username || 'supervisor'
        
        // Format current date to MySQL format (YYYY-MM-DD HH:MM:SS)
        const now = new Date()
        const mysqlDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        
        // Get stid and time_visit from correctionItem
        const stid = this.correctionItem.stid || this.correctionItem.rawData?.stid
        const timeVisit = this.correctionItem.rawData?.time_visit || '1'
        // เพิ่ม pk จาก stid,time_visit, เป็น recby
        const recBy = this.correctionItem.recby || this.correctionItem.rawData?.recby
        
        const payload = {
          variable: [
            'approve_status',
            'approve_date',
            'approve_comment',
            'approve_by'
          ],
          value: [
            '-1',                            // approve_status = -1 (ขอแก้ไข)
            mysqlDate,                       // approve_date
            this.correctionReason.trim(),    // approve_comment (reason)
            supervisorUsername               // approve_by
          ],
          // เพิ่ม pk จาก stid,time_visit, เป็น recby
          pk: ['stid', 'time_visit', 'recby'],
          pkval: [stid, String(timeVisit), recBy],
          tb: 'homevisitor_app'
        }
        
        console.log('Correction Request Payload:', payload)
        
        // Call API to update correction status
        await this.$axios.$put(
          '/api/parenting2025_census/put/homevisit/putdata.php',
          payload
        )
        
        this.$toast.success('แจ้งให้แก้ไขเรียบร้อยแล้ว')
        this.closeCorrectionModal()
        
        // Refresh table data
        await this.fetchTableData()
      } catch (error) {
        console.error('Error submitting correction request:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการแจ้งให้แก้ไข')
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
    },
    
    // Format date to Thai format
    formatThaiDate(dateString) {
      if (!dateString || dateString === '-') return '-'
      
      // If already in Thai format, return as-is
      const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                         'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
      
      if (typeof dateString === 'string') {
        for (const month of thaiMonths) {
          if (dateString.includes(month)) return dateString
        }
      }
      
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString
        
        const day = date.getDate()
        const month = thaiMonths[date.getMonth()]
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

.btn-approve-wide {
  justify-content: center;
}

.btn-edit {
  background-color: #007bff;
  color: white;
}

.btn-edit:hover {
  background-color: #0056b3;
}

/* Correction Request Button */
.btn-request-correction {
  background-color: #721c24;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 0.5rem;
  transition: all 0.2s;
}

.btn-request-correction:hover {
  background-color: #5a151d;
  opacity: 0.9;
}

.btn-request-correction i {
  font-size: 0.85rem;
}

.badge-correction-pending {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background-color: #fff3cd;
  color: #856404;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 500;
  white-space: nowrap;
}

.confirm-status input[type="checkbox"]:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Status Badges */
.correction-badge {
  background-color: #f0ad4e !important;
  color: #212529 !important;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 0.375rem;
}

.correction-badge i {
  font-size: 0.8rem;
}

.edited-badge {
  background-color: #17a2b8 !important;
  color: white !important;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 0.375rem;
}

.edited-badge i {
  font-size: 0.8rem;
}

/* Record Button States based on approve_status */
.btn-record.btn-approved {
  background-color: #28a745 !important;
  color: white !important;
}

.btn-record.btn-approved:hover {
  background-color: #218838 !important;
}

.btn-record.btn-correction-requested {
  background-color: #dc3545 !important;
  color: white !important;
}

.btn-record.btn-correction-requested:hover {
  background-color: #c82333 !important;
}

.btn-record.btn-edited {
  background-color: #17a2b8 !important;
  color: white !important;
}

.btn-record.btn-edited:hover {
  background-color: #138496 !important;
}

.btn-record.btn-pending {
  background-color: #ffc107 !important;
  color: #212529 !important;
}

.btn-record.btn-pending:hover {
  background-color: #e0a800 !important;
}

/* Color Legend */
.color-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #495057;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-pending {
  background-color: #ffc107;
}

.legend-approved {
  background-color: #28a745;
}

.legend-correction {
  background-color: #dc3545;
}

.legend-edited {
  background-color: #17a2b8;
}

/* Correction Modal Styles */
.modal-header-correction {
  background-color: #721c24;
  color: white;
}

.correction-modal-content {
  padding: 0.5rem;
}

.correction-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.correction-info p {
  margin: 0.25rem 0;
  font-size: 0.95rem;
}

.correction-reason-input {
  margin-top: 1rem;
}

.correction-reason-input label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.correction-reason-input textarea {
  width: 100%;
  resize: vertical;
}

.correction-reason-input small {
  display: block;
  text-align: right;
  margin-top: 0.25rem;
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
  margin-bottom: 1.5rem;
}

.plain-text-section p {
  margin: 0.5rem 0;
  font-size: 14px;
  line-height: 1.8;
  color: #2c3e50;
}

.section-header-text {
  font-weight: 600;
  color: #2c3e50;
  margin-top: 1rem !important;
  margin-bottom: 0.75rem !important;
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
  margin-top: 0.75rem;
  margin-bottom: 1rem;
  font-size: 13px;
}

.plain-table thead {
  background: transparent;
}

.plain-table th {
  padding: 0.6rem 0.5rem;
  text-align: left;
  font-weight: 600;
  border: 1px solid #2c3e50;
  color: #2c3e50;
  line-height: 1.6;
}

.plain-table td {
  padding: 0.6rem 0.5rem;
  border: 1px solid #2c3e50;
  vertical-align: top;
  color: #2c3e50;
  line-height: 1.6;
}

/* Page Break Control for PDF */
.plain-text-section {
  page-break-inside: avoid;
  break-inside: avoid;
}

.plain-table {
  page-break-inside: avoid;
  break-inside: avoid;
}

.plain-table tr {
  page-break-inside: avoid;
  break-inside: avoid;
}

.record-header {
  page-break-after: avoid;
  break-after: avoid;
}

.page-break-before {
  page-break-before: always;
  break-before: page;
}

.page-break-after {
  page-break-after: always;
  break-after: page;
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
</style>

