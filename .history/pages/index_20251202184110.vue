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
                'disabled-appointment': !visitor.canEditAppointment,
                'needs-appointment': visitor.needsNextAppointment
              }"
              @click="visitor.canEditAppointment ? scheduleAppointment(visitor) : null"
              :style="{ cursor: visitor.canEditAppointment ? 'pointer' : 'not-allowed' }"
            >
              <!-- กรณีต้องการสร้างนัดหมายใหม่ -->
              <div v-if="visitor.needsNextAppointment" class="appointment-missing">
                <div class="warning-text">
                  <i class="fas fa-exclamation-triangle warning-icon"></i>
                  <span>ต้องสร้างนัดหมาย</span>
                </div>
                <button @click.stop="createMissingAppointment(visitor)" class="btn-create-appointment">
                  <i class="fas fa-plus"></i> สร้างนัดหมาย
                </button>
              </div>
              <!-- กรณีมีนัดหมายแล้ว -->
              <div v-else-if="visitor.appointmentDate" class="appointment-date">
                <div class="appointment-date">{{ formatAppointmentDateShort(visitor.appointmentDate) }}</div>
                <div class="appointment-time">{{ visitor.appointmentTime }}  <template v-if="visitor.month_age && visitor.time">
                  ({{ visitor.month_age }}/{{ visitor.time }})
                </template></div>
               
              </div>
              <!-- กรณียังไม่ได้กำหนดวันนัดหมาย -->
              <div v-else class="appointment-placeholder">
                ยังไม่ได้กำหนดวันนัดหมาย

              </div>
            </div>

            <div 
              class="card-col card-col-visit"
              :class="{
                'visit-ready': visitor.appointmentDate && !(visitor.currentSurveyCompleted && visitor.currentSurveySynced),
                'visit-disabled': !visitor.appointmentDate || (visitor.currentSurveyCompleted && !visitor.currentSurveySynced)
              }"
              @click="visitor.appointmentDate && !(visitor.currentSurveyCompleted && visitor.currentSurveySynced) ? recordVisit(visitor) : null"
              :style="{ cursor: visitor.appointmentDate && !(visitor.currentSurveyCompleted && visitor.currentSurveySynced) ? 'pointer' : 'not-allowed' }"
            >
              <!-- กรณีบันทึกเสร็จและซิงค์แล้ว (เท่านั้นที่ disabled) -->
              <div v-if="visitor.currentSurveyCompleted && visitor.currentSurveySynced" class="visit-text-success">
                บันทึกเรียบร้อย<br>ซิงค์แล้ว
              </div>
              <!-- กรณีมีนัดหมายและพร้อมบันทึก (รวมกรณีเริ่มทำแล้วหรือยังไม่เสร็จ) -->
              <div v-else-if="visitor.appointmentDate" class="visit-text">
                บันทึกเยี่ยมบ้าน
              </div>
              <!-- กรณีไม่มีนัดหมาย -->
              <div v-else class="visit-text-disabled">
                ยังไม่ได้กำหนด<br>วันนัดหมาย
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
                v-model="appointmentForm.appointmentDay"
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
                v-model="appointmentForm.appointmentMonth"
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
                v-model="appointmentForm.appointmentYear"
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
          :invalid-feedback="appointmentFormErrors.appointmentTime"
          :state="appointmentFormErrors.appointmentTime ? false : null"
        >
          <b-form-select
            id="appointment-time"
            v-model="appointmentForm.appointmentTime"
            :options="timeOptions"
            :state="appointmentFormErrors.appointmentTime ? false : null"
            @change="clearAppointmentError('appointmentTime')"
          ></b-form-select>
        </b-form-group>

        <div v-if="appointmentForm.appointmentMonthAge !== null && appointmentForm.timeActivity !== null" class="appointment-info">
          <p class="font-weight-bold">(เดือนที่ {{ appointmentForm.appointmentMonthAge }} / ครั้งที่ {{ appointmentForm.timeActivity }})</p>
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
          ไม่พบข้อมูลกิจกรรมสำหรับเดือนที่ {{ appointmentForm.appointmentMonthAge }} ครั้งที่ {{ appointmentForm.timeActivity }}
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
            <h6>รูปภาพที่ 1: รูปของเล่น สื่ออุปกรณ์ที่ใช้ในครั้งนี้</h6>
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
              <b-button variant="warning" @click="openCameraModal(0)">
                <i class="fas fa-camera"></i>
                แก้ไขรูปที่ 1
              </b-button>
            </div>
          </div>

          <!-- Image 2 -->
          <div class="image-section">
            <h6>รูปภาพที่ 2: รูปขณะที่เด็กและผู้ปกครองทำกิจกรรม</h6>
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
              <b-button variant="warning" @click="openCameraModal(1)">
                <i class="fas fa-camera"></i>
                แก้ไขรูปที่ 2
              </b-button>
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

    <!-- Camera Modal -->
    <b-modal
      v-model="cameraModalVisible"
      :title="`อัพโหลดรูปภาพที่ ${currentImageIndex + 1}`"
      size="lg"
      hide-footer
      @hide="closeCameraModal"
      class="camera-modal"
    >
      <div class="camera-container">
        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileInput"
          style="display: none"
        />

        <!-- Choice Mode: เลือกวิธีการอัพโหลด -->
        <div v-if="!uploadMode && !useFileInput" class="upload-choice-container">
          <div class="upload-choice-content">
            <h5 class="mb-4">เลือกวิธีการอัพโหลดรูปภาพ</h5>
            <div class="upload-choice-buttons">
              <b-button
                variant="primary"
                size="lg"
                @click="handleSelectFile"
                class="choice-btn"
              >
                <i class="fas fa-folder-open fa-2x mb-2"></i>
                <span>เลือกรูป</span>
              </b-button>
              <b-button
                variant="warning"
                size="lg"
                @click="selectUploadMode('camera')"
                class="choice-btn"
              >
                <i class="fas fa-camera fa-2x mb-2"></i>
                <span>ถ่ายภาพ</span>
              </b-button>
            </div>
            <b-button
              variant="secondary"
              size="lg"
              @click="closeCameraModal"
              class="choice-btn-cancel mt-3"
            >
              <i class="fas fa-times"></i> ยกเลิก
            </b-button>
          </div>
        </div>
        
        <!-- Camera Mode -->
        <template v-else-if="uploadMode === 'camera'">
          <!-- Video Preview -->
          <div v-if="!capturedImage" class="camera-preview">
            <video
              ref="videoElement"
              autoplay
              playsinline
              muted
              class="camera-video"
            ></video>
            <div v-if="!videoStream" class="camera-loading">
              <b-spinner variant="primary"></b-spinner>
              <p>กำลังเปิดกล้อง...</p>
            </div>
          </div>
          
          <!-- Captured Image Preview -->
          <div v-else class="captured-preview">
            <img :src="capturedImage" alt="ภาพที่ถ่าย" class="captured-image" />
          </div>

          <!-- Camera Controls -->
          <div class="camera-controls">
            <template v-if="!capturedImage">
              <b-button
                variant="danger"
                size="lg"
                @click="closeCameraModal"
                class="control-btn"
              >
                <i class="fas fa-times"></i> ยกเลิก
              </b-button>
              <b-button
                variant="warning"
                size="lg"
                @click="capturePhoto"
                :disabled="!videoStream"
                class="control-btn capture-btn"
              >
                <i class="fas fa-camera"></i> ถ่ายภาพ
              </b-button>
            </template>
            
            <template v-else>
              <b-button
                variant="secondary"
                size="lg"
                @click="retakePhoto"
                class="control-btn"
              >
                <i class="fas fa-redo"></i> ถ่ายใหม่
              </b-button>
              <b-button
                variant="success"
                size="lg"
                @click="usePhoto"
                class="control-btn"
              >
                <i class="fas fa-check"></i> ใช้รูปนี้
              </b-button>
            </template>
          </div>
        </template>
      </div>
    </b-modal>

  </div>
</template>

<script>
import { MONTH_OPTIONS, TIME_OPTIONS } from '~/utils/constants'
import { 
  getThaiMonthShort, 
  getThaiMonthFull, 
  getDaysInMonth, 
  generateDayOptions,
  formatAppointmentDateShort,
  formatVisitDate,
  toBuddhistYear,
  toGregorianYear,
  calculateMonthAge,
  toMySQLDateTime
} from '~/utils/dateHelpers'
import { validatePhoneNumber, validateAddress, validateAppointmentDate } from '~/utils/validators'
import { canRecordVisit as checkCanRecordVisit, prepareVisitorData, generateYearOptions, calculateMonthAgeAndTime } from '~/utils/visitHelpers'
import { convertToWebP, extractImageUrls, preloadImages } from '~/utils/imageHelpers'
import EditPatientModal from '~/components/EditPatientModal.vue'
import PatientListItem from '~/components/PatientListItem.vue'
import VisitRecordModal from '~/components/VisitRecordModal.vue'

export default {
  name: 'IndexPage',
  components: {
    EditPatientModal,
    PatientListItem,
    VisitRecordModal
  },
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
        appointmentMonth: null,
        appointmentDay: null,
        appointmentYear: null,
        appointmentTime: '16:00 น.',
        appointmentMonthAge: null,
        timeActivity: null,
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
      // Camera modal
      cameraModalVisible: false,
      currentImageIndex: 0, // เก็บ index ของรูปที่กำลังถ่าย (0 หรือ 1)
      videoStream: null,
      capturedImage: null, // เก็บ base64 ของภาพที่ถ่าย
      videoElement: null,
      useFileInput: false, // fallback mode เมื่อ browser ไม่รองรับกล้อง
      uploadMode: null, // 'select' | 'camera' | null - โหมดการอัพโหลดที่ผู้ใช้เลือก
      cameraStarting: false, // flag เพื่อป้องกันการเรียก startCamera() ซ้ำ
      addForm: {
        name: '',
        nickname: '',
        tel: '',
        address: ''
      },
      addFormErrors: {},
      monthOptions: [],
      yearOptions: [],
      timeOptions: []
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
      const month = this.appointmentForm.appointmentMonth
      const year = this.appointmentForm.appointmentYear
      
      if (!month || !year) {
        // คืนค่าทุกวันถ้ายังไม่ได้เลือกเดือนหรือปี
        return generateDayOptions(31)
      }
      
      const daysInMonth = getDaysInMonth(month, year)
      return generateDayOptions(daysInMonth)
    }
  },
  beforeMount() {
   
  },
  async mounted() {
   
        const user = this.$offlineAuth.getUser()
       let userLevel = user?.level
     
      
      if (userLevel === 1) {
        console.log('Admin (Level 1) accessing index page, redirecting to /admin-payment')
        this.$router.push('/admin-payment')
      } else if (userLevel === 2) {
        console.log('Supervisor (Level 2) accessing index page, redirecting to /supervisor-dashboard')
        this.$router.push('/supervisor-dashboard')
      }else{
           // Initialize options from constants
    this.monthOptions = MONTH_OPTIONS
    this.timeOptions = TIME_OPTIONS
    this.yearOptions = generateYearOptions()
    this.updateVisitorsCount()
    
    // เริ่มต้นระบบ
    await this.initializeSystem()
    
    // รอรับการแจ้งเตือนเมื่อซิงค์เสร็จ
    this.$nuxt.$on('sync-completed', this.handleSyncCompleted)
    
    // รอรับการแจ้งเตือนเมื่อสถานะออนไลน์เปลี่ยน
    window.addEventListener('online', this.handleOnlineStatusChange)
    window.addEventListener('offline', this.handleOnlineStatusChange) 
      }
  

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
    // Watch only visitors.length instead of deep watch (optimization: ลด unnecessary re-renders)
    'visitors.length'() {
      this.updateVisitorsCount()
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
          // ตรวจสอบสถานะ offline ก่อน sync
          if (!this.$store.state.isOnline) {
            return
          }
          
          // ซิงค์ข้อมูลผู้รับบริการจากคิว
          await this.processSyncQueue()
          
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
              
              // Preload รูปภาพจาก S3 เพื่อให้ Service Worker cache ไว้
              this.preloadSurveyImages() // ไม่ await เพื่อไม่ block UI
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
        
        // โหลดข้อมูลจาก IndexedDB ก่อนเสมอ (ทำงานได้ทั้ง online/offline)
        this.loadingMessage = 'กำลังโหลดข้อมูลผู้รับบริการ...'
        await this.loadVisitors()
        
        // ซิงค์ในพื้นหลังถ้าออนไลน์ (ไม่ block UI)
        const username = this.$offlineAuth?.getUser?.()?.username
        if (this.$store.state.isOnline && username) {
          this.syncDataInBackground(username)
        }
        
        this.loading = false
      } catch (error) {
        this.loading = false
        this.$toast.error('เกิดข้อผิดพลาดในการเริ่มต้นระบบ')
      }
    },
    async syncDataInBackground(username) {
      try {
        // ซิงค์ข้อมูลในพื้นหลัง (ไม่แสดง loading overlay)
        
        // ซิงค์ผู้รับบริการ
        await this.$systemInit.syncVisitors(username)
        
        // ซิงค์การนัดหมาย
        await this.$systemInit.syncBookings(username)
        
        // ส่งข้อมูลที่ยังไม่ซิงค์แบบ parallel (optimization: push operations เป็น independent)
        await Promise.all([
          this.$systemInit.pushBookingsToAPI(),
          this.$systemInit.pushSurveyResultsToAPI()
        ])
        
        // ซิงค์ผลการบันทึกเยี่ยมบ้าน
        await this.$systemInit.syncSurveyResults(username)
        
        // โหลดข้อมูลใหม่หลังซิงค์เสร็จ
        await this.loadVisitors()
        
        // Preload รูปภาพจาก S3 เพื่อให้ Service Worker cache ไว้
        this.preloadSurveyImages() // ไม่ await เพื่อไม่ block
        
        this.$toast.success('ซิงค์ข้อมูลเสร็จสิ้น')
      } catch (error) {
        console.error('Background sync failed:', error)
        // ไม่แสดง error toast เพราะเป็น background task
        // ผู้ใช้ยังสามารถใช้งานได้ปกติจากข้อมูลใน IndexedDB
      }
    },
    async handleSyncCompleted() {
      try {
        await this.loadVisitors()
      } catch (error) {
        this.$toast.error('ไม่สามารถโหลดข้อมูลใหม่ได้')
      }
    },
    async preloadSurveyImages() {
      // 🎯 Preload รูปภาพจาก S3 URL เพื่อให้ Service Worker cache ไว้
      try {
        const allSurveys = await this.$indexedDB.getAllSurveyProgress()
        const imageUrls = extractImageUrls(allSurveys)
        await preloadImages(imageUrls, 50)
      } catch (error) {
        // Silent fail - ไม่แสดง error เพราะเป็น background task
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
        
        // ดึง surveys ทั้งหมดครั้งเดียวแล้วจัดกลุ่มตาม stid (optimization: ลด database queries)
        const allSurveysData = await this.$indexedDB.getAll("survey_progress")
        const surveysByStidMap = new Map()
        
        // จัดกลุ่ม surveys ตาม stid (logic เดิม: s.stid === stid)
        allSurveysData.forEach(survey => {
          const stid = survey.stid
          if (!surveysByStidMap.has(stid)) {
            surveysByStidMap.set(stid, [])
          }
          surveysByStidMap.get(stid).push(survey)
        })
        
        // Sort แต่ละกลุ่มตาม timeStart descending (newest first) - logic เดิมจาก getAllSurveysByStid
        surveysByStidMap.forEach((surveys, stid) => {
          surveys.sort((a, b) => new Date(b.timeStart) - new Date(a.timeStart))
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
          
          // ดึงแบบสอบถามทั้งหมด (รวม completed และไม่ completed) จาก grouped data
          const allSurveys = surveysByStidMap.get(visitor.stid) || []
          
          // คำนวณว่าสามารถแก้ไขนัดหมายได้หรือไม่
          const timeVisit = booking?.time_visit || 1
          let canEdit = true
          
          // ดึงแบบสอบถามที่ completed เท่านั้น (สำหรับแสดงสถานะ)
          const completedSurveys = allSurveys
            .filter(s => s.completed)
            .sort((a, b) => {
              // เรียงตาม time_visit จากมากไปน้อย
              const timeA = parseInt(a.time_visit) || 0
              const timeB = parseInt(b.time_visit) || 0
              return timeB - timeA
            })
          
          // ดึง survey ของครั้งที่แล้ว (time - 1) สำหรับเช็คการอนุมัติ
          const previousTimeVisit = parseInt(timeVisit) - 1
          const previousCompletedSurvey = completedSurveys.find(s => 
            String(s.time_visit) === String(previousTimeVisit)
          )
          
          // ตรวจสอบว่ามี survey_progress ของครั้งนี้หรือไม่ (ไม่ว่า completed จะเป็นอะไร)
          const currentVisitSurvey = allSurveys.find(s => String(s.time_visit) === String(timeVisit))
          
     
          
          if (currentVisitSurvey) {
            // ถ้ามี survey_progress ของครั้งนี้แล้ว
            // ถ้า approve_status = 1 แล้ว ให้ปลดล็อคเพื่อแก้ไขนัดหมายครั้งถัดไปได้
            if (currentVisitSurvey.approve_status === 1) {
              canEdit = true
            } else {
              canEdit = false
            }
          }
          
          // ตรวจสอบว่า time_visit >= 2 แต่ไม่มีข้อมูลครั้งที่แล้ว
          const needsPreviousVisit = parseInt(timeVisit) >= 2 && !previousCompletedSurvey
          
          return prepareVisitorData(visitor, booking, completedSurveys, allSurveys)
        })
        
        this.visitors = await Promise.all(visitorPromises)
      } catch (error) {
        this.$toast.error('ไม่สามารถโหลดข้อมูลผู้รับบริการได้')
      }
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
      
      if (!this.appointmentForm.appointmentMonth || !this.appointmentForm.appointmentYear || !this.appointmentForm.appointmentDay) {
        return
      }
      
      // Get visitor data for birth day (appointmentForm stores patient id, need to get stid)
      const patient = this.visitors.find(v => v.id === this.appointmentForm.id)
      if (!patient) return
      
      const visitor = await this.$indexedDB.getVisitor(patient.stid)
      const visitorBirthDay = visitor?.day_birth || 1
      
      let monthAge, timeActivity
      
      // คำนวณวันที่ที่เลือก
      const selectedYear = this.appointmentForm.appointmentYear - 543
      const selectedMonth = this.appointmentForm.appointmentMonth
      const selectedDay = this.appointmentForm.appointmentDay
      const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay)
      
      // 🔄 ใช้ completed survey ครั้งก่อนหน้า (time_visit - 1) เป็น existingBooking เสมอ
      // เพื่อให้คำนวณถูกต้องตาม logic 21 วัน ไม่ว่าจะแก้ไขกี่ครั้ง
      const existingBooking = this.appointmentForm.existingBooking
      
      if (existingBooking && existingBooking.time_visit > 1) {
        // มี booking และไม่ใช่ครั้งแรก → หา survey ครั้งก่อนหน้า
        const completedSurveys = await this.$indexedDB.getCompletedSurveysByStid(patient.stid)
        const previousTimeVisit = existingBooking.time_visit - 1
        const previousSurvey = completedSurveys.find(s => 
          String(s.time_visit) === String(previousTimeVisit) && s.completed
        )
        
        if (previousSurvey && previousSurvey.appointmentDate) {
          // ใช้ previousSurvey เป็น existingBooking เพื่อคำนวณ
          const previousBooking = {
            appointmentDate: new Date(previousSurvey.appointmentDate),
            month_age: Number(previousSurvey.month_age),
            time: Number(previousSurvey.time)
          }
          
          const result = calculateMonthAgeAndTime(
            this.appointmentForm.visitorBirthMonth,
            this.appointmentForm.visitorBirthYear,
            visitorBirthDay,
            selectedDate,
            previousBooking
          )
          
          monthAge = result.monthAge
          timeActivity = result.timeActivity
   
        } else {
          // ไม่พบ previousSurvey → คำนวณจากวันเกิด
          const result = calculateMonthAgeAndTime(
            this.appointmentForm.visitorBirthMonth,
            this.appointmentForm.visitorBirthYear,
            visitorBirthDay,
            selectedDate,
            null
          )
          monthAge = result.monthAge
          timeActivity = result.timeActivity
        }
      } else {
        // ไม่มี booking หรือเป็นครั้งแรก = คำนวณจากวันเกิด
        const result = calculateMonthAgeAndTime(
          this.appointmentForm.visitorBirthMonth,
          this.appointmentForm.visitorBirthYear,
          visitorBirthDay,
          selectedDate,
          null
        )
        monthAge = result.monthAge
        timeActivity = result.timeActivity
      }
      
      // ตรวจสอบว่าวันนัดหมายมาก่อนวันเกิดหรือ month_age <= 0
      // ใช้ selectedDate ที่คำนวณไว้แล้วข้างบน
      const birthYear = parseInt(this.appointmentForm.visitorBirthYear) - 543
      const birthMonth = parseInt(this.appointmentForm.visitorBirthMonth)
      const birthDate = new Date(birthYear, birthMonth - 1, visitorBirthDay)
      
      // ตรวจสอบว่าวันนัดหมายมาก่อนวันเกิดหรือไม่
      if (selectedDate < birthDate) {
        this.$toast.error('ไม่สามารถสร้างนัดหมายได้ เนื่องจากวันนัดหมายมาก่อนวันเกิด')
        this.appointmentForm.appointmentMonthAge = null
        this.appointmentForm.timeActivity = null
        this.appointmentForm.activities = []
        return
      }
      
      // ตรวจสอบว่า month_age <= 0 หรือไม่
      if (monthAge <= 0) {
        this.$toast.error('ไม่สามารถสร้างนัดหมายได้ เนื่องจากอายุเดือนน้อยกว่าหรือเท่ากับ 0')
        this.appointmentForm.appointmentMonthAge = null
        this.appointmentForm.timeActivity = null
        this.appointmentForm.activities = []
        return
      }
      
      // อัพเดทอายุเดือนและครั้งที่เยี่ยม
      this.appointmentForm.appointmentMonthAge = monthAge
      this.appointmentForm.timeActivity = timeActivity
      
      // ดึงกิจกรรมใหม่
      const activities = await this.$indexedDB.getActivityByMonthAgeAndTime(
        monthAge,
        timeActivity
      )
      this.appointmentForm.activities = activities || []
    },
    // จัดการเมื่อเปลี่ยนเดือน
    async onMonthChange() {
      this.clearAppointmentError('month')
      
      // ตรวจสอบว่าวันที่เลือกใช้ได้กับเดือนใหม่หรือไม่
      if (this.appointmentForm.appointmentDay && this.appointmentForm.appointmentYear) {
        const daysInMonth = getDaysInMonth(
          this.appointmentForm.appointmentMonth,
          this.appointmentForm.appointmentYear
        )
        
        // ถ้าวันที่เลือกเกินจำนวนวันในเดือน ปรับเป็นวันสุดท้ายของเดือน
        if (this.appointmentForm.appointmentDay > daysInMonth) {
          this.appointmentForm.appointmentDay = daysInMonth
        }
      }
      
      // คำนวณอายุเดือนและกิจกรรมใหม่
      await this.recalculateMonthAgeAndActivities()
    },
    // จัดการเมื่อเปลี่ยนปี
    async onYearChange() {
      this.clearAppointmentError('year')
      
      // ตรวจสอบว่าวันที่เลือกใช้ได้กับปีใหม่หรือไม่ มีผลกับกุมภาพันธ์ในปีอธิกสุรทิน
      if (this.appointmentForm.appointmentDay && this.appointmentForm.appointmentMonth === 2) {
        const daysInMonth = getDaysInMonth(2, this.appointmentForm.appointmentYear)
        
        // ถ้าวันที่เลือกเกินจำนวนวันในกุมภาพันธ์ ปรับเป็นวันสุดท้าย
        if (this.appointmentForm.appointmentDay > daysInMonth) {
          this.appointmentForm.appointmentDay = daysInMonth
        }
      }
      
      // คำนวณอายุเดือนและกิจกรรมใหม่
      await this.recalculateMonthAgeAndActivities()
    },
    // ตรวจสอบความถูกต้องของฟอร์มแก้ไขผู้รับบริการ
    validateEditTel() {
      const result = validatePhoneNumber(this.editForm.tel)
      if (!result.valid) {
        this.editFormErrors.tel = result.error
        return false
      }
      delete this.editFormErrors.tel
      return true
    },
    validateEditAddress() {
      const result = validateAddress(this.editForm.address)
      if (!result.valid) {
        this.editFormErrors.address = result.error
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
                '/api/parenting2025_census/put/homevisit/putdata_arr.php',
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
      const result = validateAppointmentDate(
        this.appointmentForm.appointmentDay,
        this.appointmentForm.appointmentMonth,
        this.appointmentForm.appointmentYear,
        getDaysInMonth
      )
      
      if (!result.valid) {
        Object.assign(this.appointmentFormErrors, result.errors)
        return false
      }
      
      delete this.appointmentFormErrors.month
      delete this.appointmentFormErrors.day
      delete this.appointmentFormErrors.year
      return true
    },
    validateAppointmentTime() {
      if (!this.appointmentForm.appointmentTime) {
        this.appointmentFormErrors.appointmentTime = 'กรุณาเลือกเวลา'
        return false
      }
      delete this.appointmentFormErrors.appointmentTime
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
            appointmentMonth: month,
            appointmentDay: day,
            appointmentYear: year,
            appointmentTime: patient.appointmentTime || '16:00 น.',
            appointmentMonthAge: null,
            timeActivity: 1,
            activities: []
          }
          this.appointmentFormErrors = {}
          this.showAppointmentModal = true
          return
        }
        
        // ดึงข้อมูลการนัดหมายเดิมเพื่อคำนวณตาม logic 21 วัน
        const existingBooking = await this.$indexedDB.getBooking(patient.stid)
        
        let monthAge, timeActivity
        
        // 🔄 ใช้ completed survey ครั้งก่อนหน้า (time_visit - 1) เป็น existingBooking เสมอ
        if (existingBooking && existingBooking.time_visit > 1) {
          // มี booking และไม่ใช่ครั้งแรก → หา survey ครั้งก่อนหน้า
          const completedSurveys = await this.$indexedDB.getCompletedSurveysByStid(patient.stid)
          const previousTimeVisit = existingBooking.time_visit - 1
          const previousSurvey = completedSurveys.find(s => 
            String(s.time_visit) === String(previousTimeVisit) && s.completed
          )
          
          if (previousSurvey && previousSurvey.appointmentDate) {
            // ใช้ previousSurvey เป็น existingBooking เพื่อคำนวณ
            const selectedYear = year - 543
            const selectedDate = new Date(selectedYear, month - 1, day)
            
            const previousBooking = {
              appointmentDate: new Date(previousSurvey.appointmentDate),
              month_age: Number(previousSurvey.month_age),
              time: Number(previousSurvey.time)
            }
            
            const result = calculateMonthAgeAndTime(
              parseInt(visitor.month_birth),
              parseInt(visitor.year_birth),
              parseInt(visitor.day_birth) || 1,
              selectedDate,
              previousBooking
            )
            monthAge = result.monthAge
            timeActivity = result.timeActivity
  
          } else {
            // ไม่พบ previousSurvey → คำนวณจากวันเกิด
            const selectedYear = year - 543
            const selectedDate = new Date(selectedYear, month - 1, day)
            
            const result = calculateMonthAgeAndTime(
              parseInt(visitor.month_birth),
              parseInt(visitor.year_birth),
              parseInt(visitor.day_birth) || 1,
              selectedDate,
              null
            )
            monthAge = result.monthAge
            timeActivity = result.timeActivity
          }
        } else {
          // ไม่มี booking หรือเป็นครั้งแรก = คำนวณจากวันเกิด
          const selectedYear = year - 543
          const selectedDate = new Date(selectedYear, month - 1, day)
          
          const result = calculateMonthAgeAndTime(
            parseInt(visitor.month_birth),
            parseInt(visitor.year_birth),
            parseInt(visitor.day_birth) || 1,
            selectedDate,
            null
          )
          monthAge = result.monthAge
          timeActivity = result.timeActivity
        }
        
        // ตรวจสอบว่าวันนัดหมายมาก่อนวันเกิดหรือ month_age <= 0
        const selectedYear = year - 543
        const selectedDate = new Date(selectedYear, month - 1, day)
        const birthYear = parseInt(visitor.year_birth) - 543
        const birthMonth = parseInt(visitor.month_birth)
        const birthDay = parseInt(visitor.day_birth) || 1
        const birthDate = new Date(birthYear, birthMonth - 1, birthDay)
        
        // ตรวจสอบว่าวันนัดหมายมาก่อนวันเกิดหรือไม่
        if (selectedDate < birthDate) {
          this.$toast.error('ไม่สามารถสร้างนัดหมายได้ เนื่องจากวันนัดหมายมาก่อนวันเกิด')
          return
        }
        
        // ตรวจสอบว่า month_age <= 0 หรือไม่
        if (monthAge <= 0) {
          this.$toast.error('ไม่สามารถสร้างนัดหมายได้ เนื่องจากอายุเดือนน้อยกว่าหรือเท่ากับ 0')
          return
        }
        
        // ดึงข้อมูลกิจกรรมทั้งหมดจาก IndexedDB
        const activities = await this.$indexedDB.getActivityByMonthAgeAndTime(monthAge, timeActivity)
        
        // ตั้งค่าฟอร์มนัดหมายพร้อมข้อมูลทั้งหมด
        this.appointmentForm = {
          id: patient.id,
          name: `${patient.name} (${patient.nickname})`,
          appointmentMonth: month,
          appointmentDay: day,
          appointmentYear: year,
          appointmentTime: patient.appointmentTime || '16:00 น.',
          appointmentMonthAge: monthAge,
          timeActivity: timeActivity,
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

        // ดึงข้อมูล visitor จาก IndexedDB เพื่อตรวจสอบวันเกิด
        const visitorData = await this.$indexedDB.getVisitor(visitor.stid)
        
        if (!visitorData || !visitorData.month_birth || !visitorData.year_birth) {
          this.$toast.error('ไม่พบข้อมูลวันเกิดของผู้รับบริการ')
          return
        }
        
        // แปลงปีพุทธศักราชเป็นคริสต์ศักราช
        const christianYear = this.appointmentForm.appointmentYear - 543
        const appointmentDate = `${christianYear}-${String(this.appointmentForm.appointmentMonth).padStart(2, '0')}-${String(this.appointmentForm.appointmentDay).padStart(2, '0')}`
        const appointmentTime = this.appointmentForm.appointmentTime
        
        // ตรวจสอบว่าวันนัดหมายมาก่อนวันเกิดหรือไม่
        const selectedDate = new Date(christianYear, this.appointmentForm.appointmentMonth - 1, this.appointmentForm.appointmentDay)
        const birthYear = parseInt(visitorData.year_birth) - 543
        const birthMonth = parseInt(visitorData.month_birth)
        const birthDay = parseInt(visitorData.day_birth) || 1
        const birthDate = new Date(birthYear, birthMonth - 1, birthDay)
        
        if (selectedDate < birthDate) {
          this.$toast.error('ไม่สามารถบันทึกนัดหมายได้ เนื่องจากวันนัดหมายมาก่อนวันเกิด')
          return
        }

        this.loading = true
        this.loadingMessage = 'กำลังบันทึกนัดหมาย...'
        
        const completedSurveys = await this.$indexedDB.getCompletedSurveysByStid(visitor.stid)
        const timeVisit = completedSurveys.length + 1 // จำนวนครั้งที่ completed แล้ว + 1
        
        // หา survey ที่เกี่ยวข้องกับ booking นี้เพื่อดึง recStart
        let recStart = null
        try {
          const relatedSurvey = await this.$indexedDB.getSurveyProgress(
            visitor.stid,
            timeVisit
          )
          if (relatedSurvey && relatedSurvey.timeStart) {
            recStart = relatedSurvey.timeStart
          }
        } catch (error) {
        }
        
        // ถ้าไม่มี survey หรือไม่มี timeStart ให้สร้าง recStart ใหม่
        if (!recStart) {
          const now = new Date()
          recStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        }
        
        // ดึง activity IDs จาก activities array (q1_name ถึง q5_name)
        const activityIds = []
        for (let i = 0; i < 5; i++) {
          if (this.appointmentForm.activities[i]) {
            activityIds.push(this.appointmentForm.activities[i].no || '')
          } else {
            activityIds.push('')
          }
        }
        
        // หาวันที่ทำ survey ล่าสุด (ถ้ามี) สำหรับ last_visit_date
        let lastVisitDate = null
        if (completedSurveys.length > 0) {
          // เรียงตาม timeStart จากล่าสุดไปเก่าสุด
          const sortedSurveys = [...completedSurveys].sort((a, b) => {
            return new Date(b.timeStart) - new Date(a.timeStart)
          })
          const latestSurvey = sortedSurveys[0]
          if (latestSurvey.timeStart) {
            lastVisitDate = latestSurvey.timeStart.split(' ')[0] // เอาเฉพาะวันที่
          }
        }
        // ถ้าไม่มี survey ที่ completed ให้ใช้วันที่ปัจจุบัน (กรณีนัดครั้งแรก)
        if (!lastVisitDate) {
          lastVisitDate = new Date().toISOString().split('T')[0]
        }
        
        // 🔄 คำนวณ month_age และ time อีกครั้งก่อนบันทึก เพื่อรองรับการแก้ไขวันนัดหลายครั้ง
        let finalMonthAge = this.appointmentForm.appointmentMonthAge
        let finalTime = this.appointmentForm.timeActivity
        
        // หา survey ครั้งก่อนหน้า (time_visit - 1) เพื่อใช้เป็น existingBooking
        const previousTimeVisit = timeVisit - 1
        if (previousTimeVisit >= 1) {
          const previousSurvey = completedSurveys.find(s => 
            String(s.time_visit) === String(previousTimeVisit) && s.completed
          )
          
          if (previousSurvey && previousSurvey.appointmentDate) {
            // มี survey ก่อนหน้า → คำนวณใหม่ตาม logic 21 วัน
            const previousDate = new Date(previousSurvey.appointmentDate)
            const newSelectedDate = new Date(appointmentDate)
            
            const { monthAge, timeActivity } = calculateMonthAgeAndTime(
              parseInt(visitor.month_birth),
              parseInt(visitor.year_birth),
              parseInt(visitor.day_birth || 1),
              newSelectedDate,
              {
                appointmentDate: previousDate,
                month_age: Number(previousSurvey.month_age),
                time: Number(previousSurvey.time)
              }
            )
            
            finalMonthAge = monthAge
            finalTime = timeActivity
            
            // ตรวจสอบว่า month_age <= 0 หรือไม่
            if (finalMonthAge <= 0) {
              this.loading = false
              this.$toast.error('ไม่สามารถบันทึกนัดหมายได้ เนื่องจากอายุเดือนน้อยกว่าหรือเท่ากับ 0')
              return
            }

          }
        }
        
        // ตรวจสอบอีกครั้งก่อนบันทึก (กรณีที่ไม่มี previousSurvey)
        if (finalMonthAge <= 0) {
          this.loading = false
          this.$toast.error('ไม่สามารถบันทึกนัดหมายได้ เนื่องจากอายุเดือนน้อยกว่าหรือเท่ากับ 0')
          return
        }
        
        // อัพเดทการแสดงผล
        visitor.appointmentDate = appointmentDate
        visitor.appointmentTime = appointmentTime
        visitor.month_age = finalMonthAge
        visitor.time = finalTime
        visitor.time_visit = timeVisit
        
        // บันทึกลงตารางการนัดหมาย (IndexedDB) - cnt_app จะอัพเดทหลังจาก sync กับ API
        await this.$indexedDB.addBooking({
          stid: visitor.stid,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          month_age: finalMonthAge,
          time: finalTime,
          time_visit: timeVisit,
          last_visit_date: lastVisitDate, // ใช้วันที่ทำ survey จริงล่าสุด
          dataSource: 'local',
          lastSyncedAt: new Date().toISOString()
        })
        
        // 🔄 อัพเดท survey ครั้งก่อนหน้า (time_visit - 1) ถ้ามีการแก้ไขนัดหมาย
        // เพื่อให้ q10_appDate และ q10_appTime ใน survey ตรงกับ booking
        if (previousTimeVisit >= 1) {
          try {
            // หา completed survey ของครั้งก่อนหน้า
            const previousSurvey = completedSurveys.find(s => 
              String(s.time_visit) === String(previousTimeVisit) && s.completed
            )
            
            if (previousSurvey) {
          
              // อัพเดท q10_appDate และ q10_appTime ใน survey
              const updatedAnswers = {
                ...previousSurvey.answers,
                q10_appDate: appointmentDate,
                q10_appTime: appointmentTime
              }
              
              // อัพเดท newAppointment ด้วย (ถ้ามี) เพื่อให้ sync ถูกต้อง
              let updatedNewAppointment = previousSurvey.newAppointment
              if (updatedNewAppointment) {
                // ใช้ค่า finalMonthAge และ finalTime ที่คำนวณไว้แล้วข้างบน
                // เพื่อให้ booking และ survey ใช้ค่าเดียวกัน
                
                // แปลงวันที่จาก appointmentDate (YYYY-MM-DD) เป็น day, month, year
                const appointmentDateObj = new Date(appointmentDate)
                const day = appointmentDateObj.getDate()
                const month = appointmentDateObj.getMonth() + 1
                const year = appointmentDateObj.getFullYear() + 543 // แปลงเป็นปีพุทธศักราช
                
                updatedNewAppointment = {
                  ...updatedNewAppointment,
                  appointmentDay: day,
                  appointmentMonth: month,
                  appointmentYear: year,
                  appointmentTime: appointmentTime,
                  appointmentMonthAge: finalMonthAge,
                  monthAge: finalMonthAge,
                  timeActivity: finalTime
                }
            
              }
              
              await this.$indexedDB.update('survey_progress', {
                ...previousSurvey,
                answers: updatedAnswers,
                newAppointment: updatedNewAppointment,
                synced: false, // ตั้ง synced = false เพื่อให้ซิงค์ใหม่
                lastUpdated: new Date().toISOString()
              })
              
              
              // 🔄 Trigger auto sync เพื่อส่งข้อมูล survey ที่อัพเดทขึ้น API
              if (this.$store.state.isOnline && this.$systemInit) {
                // ไม่ await เพื่อไม่ block UI
                this.$systemInit.pushSurveyResultsToAPI().then(() => {
                }).catch((error) => {
                  console.error('[ERROR] Survey auto sync failed:', error)
                })
              }
            } else {
            }
          } catch (error) {
            console.error('❌ [ERROR] Failed to update previous survey:', error)
            // ไม่ throw error เพื่อไม่ให้การบันทึก booking ล้มเหลว
          }
        }
        
        // เรียก API เพื่อบันทึกนัดหมาย
        if (this.$store.state.isOnline) {
          try {
            const username = this.$offlineAuth?.getUser?.()?.username
            
            // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่ (ใช้ time_visit เป็น unique key)
            const checkResponse = await this.$axios.$get(
              '/api/parenting2025_census/get/homevisit/getchildsample_app.php',
              {
                params: {
                  homevisitor: username,
                  stid: visitor.stid
                }
              }
            )
            
            // ตรวจสอบว่ามีรายการที่ตรงกับ stid และ time_visit หรือไม่
            const existingRecord = checkResponse?.results?.find(record => 
              record.stid === visitor.stid && 
              String(record.time_visit) === String(timeVisit)
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
                    String(this.appointmentForm.appointmentMonthAge),
                    String(this.appointmentForm.timeActivity),
                    activityIds[0],
                    activityIds[1],
                    activityIds[2],
                    activityIds[3],
                    activityIds[4]
                  ],
                  pk: ['stid', 'time_visit'],
                  pkval: [visitor.stid, String(timeVisit)],
                  tb: 'homevisitor_app'
                }
              )
              
              // อัพเดท booking status เป็น synced
              await this.$indexedDB.updateBooking({
                stid: visitor.stid,
                appointmentDate: appointmentDate,
                appointmentTime: appointmentTime,
                month_age: this.appointmentForm.appointmentMonthAge,
                time: this.appointmentForm.timeActivity,
                time_visit: timeVisit,
                cnt_app: newCntApp,
                dataSource: 'api',
                lastSyncedAt: new Date().toISOString()
              })
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
                    'time_visit',
                    'fname_ch',
                    'lname_ch',
                    'month_age',
                    'time',
                    'time_app_first',
                    'date_app_first',
                    'time_app_curr',
                    'date_app_curr',
                    'q1_name',
                    'q2_name',
                    'q3_name',
                    'q4_name',
                    'q5_name',
                    'cnt_app',
                  ],
                  value: [
                    username || '',
                    visitor.stid,
                    '15',
                    recStart,
                    String(timeVisit),  // time_visit - จำนวนครั้งทั้งหมดที่เยี่ยมบ้าน
                    visitorData?.fname || '',
                    visitorData?.lname || '',
                    String(this.appointmentForm.appointmentMonthAge),
                    String(this.appointmentForm.timeActivity),
                    appointmentTime,  // time_app_first
                    appointmentDate,  // date_app_first
                    appointmentTime,  // time_app_curr
                    appointmentDate,  // date_app_curr
                    activityIds[0],
                    activityIds[1],
                    activityIds[2],
                    activityIds[3],
                    activityIds[4],
                    '1'
                  ],
                  tb: 'homevisitor_app'
                }
              )
              
              // ⚠️ สำคัญ: อัพเดท booking status เป็น synced หลัง POST สำเร็จ
              await this.$indexedDB.updateBooking({
                stid: visitor.stid,
                appointmentDate: appointmentDate,
                appointmentTime: appointmentTime,
                month_age: this.appointmentForm.appointmentMonthAge,
                time: this.appointmentForm.timeActivity,
                time_visit: timeVisit,
                cnt_app: 1,
                dataSource: 'api',
                lastSyncedAt: new Date().toISOString()
              })
            }
            this.loading = false
            this.$toast.success('บันทึกนัดหมายและซิงค์กับเซิร์ฟเวอร์สำเร็จ')
          } catch (apiError) {
            this.loading = false
            this.$toast.warning('บันทึกนัดหมายสำเร็จ แต่ยังไม่ได้ซิงค์กับเซิร์ฟเวอร์')
          }
        } else {
          this.loading = false
          this.$toast.success('บันทึกนัดหมายสำเร็จ (จะซิงค์เมื่อออนไลน์)')
        }
        
        // โหลดข้อมูล visitors ใหม่เพื่ออัพเดทหน้าจอ
        await this.loadVisitors()
        
        this.$nextTick(() => {
          this.showAppointmentModal = false
        })
      } catch (error) {
        this.loading = false
        this.$toast.error('ไม่สามารถบันทึกนัดหมายได้')
      }
    },
    async createMissingAppointment(visitor) {
      try {
        this.loading = true
        this.loadingMessage = 'กำลังคำนวณนัดหมาย...'
        
        // คำนวณข้อมูลนัดหมายถัดไปจาก completed surveys
        const { calculateNextAppointment } = await import('../utils/visitHelpers')
        const appointmentData = await calculateNextAppointment(visitor.stid, this.$indexedDB)
        
        // แปลงวันที่เป็นรูปแบบที่ฟอร์มต้องการ
        const appointmentDate = new Date(appointmentData.appointmentDate)
        const month = appointmentDate.getMonth() + 1
        const day = appointmentDate.getDate()
        const year = appointmentDate.getFullYear() + 543 // แปลงเป็นปีพุทธศักราช
        
        // ดึงข้อมูล visitor จาก IndexedDB
        const visitorData = await this.$indexedDB.getVisitor(visitor.stid)
        
        // ตั้งค่าฟอร์มนัดหมายพร้อมข้อมูลที่คำนวณแล้ว
        this.appointmentForm = {
          id: visitor.id,
          name: `${visitor.name} (${visitor.nickname})`,
          appointmentMonth: month,
          appointmentDay: day,
          appointmentYear: year,
          appointmentTime: appointmentData.appointmentTime,
          appointmentMonthAge: appointmentData.month_age,
          timeActivity: appointmentData.time,
          activities: appointmentData.activities || [],
          visitorBirthMonth: parseInt(visitorData.month_birth),
          visitorBirthYear: parseInt(visitorData.year_birth),
          existingBooking: null
        }
        
        this.appointmentFormErrors = {}
        this.loading = false
        this.showAppointmentModal = true
      } catch (error) {
        this.loading = false
        if (error.message === 'No completed surveys found') {
          this.$toast.error('ไม่พบข้อมูลการเยี่ยมบ้านที่เสร็จสมบูรณ์')
        } else if (error.message === 'Visitor birth date not found') {
          this.$toast.error('ไม่พบข้อมูลวันเกิดของผู้รับบริการ')
        } else {
          this.$toast.error('ไม่สามารถสร้างนัดหมายได้')
        }
      }
    },
    resetAppointmentForm() {
      this.appointmentForm = {
        id: null,
        name: '',
        appointmentMonth: null,
        appointmentDay: null,
        appointmentYear: null,
        appointmentTime: '16:00 น.',
        appointmentMonthAge: null,
        timeActivity: null,
        activities: [],
        visitorBirthMonth: null,
        visitorBirthYear: null,
        existingBooking: null
      }
      this.appointmentFormErrors = {}
    },
    async recordVisit(patient) {
      // ใช้วันที่นัดหมายแทนวันที่ปัจจุบัน
      let day, month, thaiYear
      
      if (patient.appointmentDate) {
        // มีวันนัดหมาย ใช้วันที่นัดหมาย
        const appointmentDate = new Date(patient.appointmentDate)
        day = appointmentDate.getDate()
        month = this.getThaiMonth(appointmentDate.getMonth())
        thaiYear = appointmentDate.getFullYear() + 543
      } else {
        // ไม่มีวันนัดหมาย ใช้วันที่ปัจจุบัน
        const now = new Date()
        day = now.getDate()
        month = this.getThaiMonth(now.getMonth())
        thaiYear = now.getFullYear() + 543
      }
      
      // ดึงข้อมูล booking เพื่อเอา appointmentTime ที่ถูกต้อง
      const booking = await this.$indexedDB.getBooking(patient.stid)
      
      this.visitForm = {
        id: patient.id,
        patientName: patient.name,
        nickname: patient.nickname,
        visitDate: `${day} ${month} ${thaiYear}`,
        // เวลาเริ่มบันทึก (user กรอกเอง) - default เป็นเวลานัดหมาย หรือ 16:00
        startTime: booking?.appointmentTime || patient.appointmentTime || '16:00 น.',
        // เก็บเวลานัดหมายไว้ด้วย
        appointmentTime: booking?.appointmentTime || patient.appointmentTime || '16:00 น.'
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
        // ใช้ข้อมูลจาก patient object เป็นหลัก (มี time, time_visit, month_age อยู่แล้ว)
        // และดึง booking เป็น fallback สำหรับ appointmentDate และ appointmentTime
        const booking = await this.$indexedDB.getBooking(patient.stid)

        console.log('booking', booking)
        
        // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่
        // ใช้ข้อมูลจาก patient object เป็นหลัก (ถูกต้องกว่า booking)
        const month_age = patient.month_age
        const time = patient.time
        const time_visit = patient.time_visit
        
        if (!month_age || !time) {
          this.$toast.error('ไม่พบข้อมูลการนัดหมาย กรุณากำหนดนัดหมายก่อน')
          return
        }
        
        // ลองดึง survey_progress ที่ยังไม่ completed สำหรับ time_visit นี้ (ถ้ามี)
        // เพื่อให้ได้ข้อมูลที่ถูกต้องที่สุด
        let existingSurvey = null
        if (time_visit) {
          try {
            existingSurvey = await this.$indexedDB.getSurveyProgress(patient.stid, time_visit)
          } catch (error) {
            // Silent fail - ใช้ข้อมูลจาก patient แทน
          }
        }
        
        // ใช้ข้อมูลจาก existingSurvey ถ้ามี (ถูกต้องที่สุด)
        // ถ้าไม่มี ให้ใช้ข้อมูลจาก patient object
        // และใช้ booking เป็น fallback สำหรับ appointmentDate และ appointmentTime
        const finalMonthAge = existingSurvey?.month_age || month_age
        const finalTime = existingSurvey?.time || time
        const finalTimeVisit = existingSurvey?.time_visit || time_visit
        const finalAppointmentDate = existingSurvey?.appointmentDate || patient.appointmentDate || booking?.appointmentDate
        const finalAppointmentTime = this.visitForm.appointmentTime || existingSurvey?.appointmentTime || patient.appointmentTime || booking?.appointmentTime || '16:00 น.'
        const finalStartTime = this.visitForm.startTime || '16:00 น.' // เวลาเริ่มบันทึกที่ user กรอก
        
        // Store complete survey data
        // แยก appointmentTime (เวลานัดหมาย) กับ startTime (เวลาเริ่มบันทึก)
        const surveyData = {
          ...patient,
          month_age: finalMonthAge,
          time: finalTime,
          time_visit: finalTimeVisit,
          appointmentDate: finalAppointmentDate,
          appointmentTime: finalAppointmentTime,
          startTime: finalStartTime
        }
    
        localStorage.setItem('surveyPatient', JSON.stringify(surveyData))
        
        // Navigate to survey page
        this.$router.push('/survey')
      } catch (error) {
        console.error('Error in goToSurvey:', error)
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
      return checkCanRecordVisit(visitor)
    },
    
    // แสดงประวัติการเยี่ยมบ้าน
    async showVisitHistory(patient) {
      try {
        // ดึงแบบสอบถามที่เสร็จแล้วทั้งหมดของผู้รับบริการคนนี้ (filter ตาม stid)
        const surveys = await this.$indexedDB.getCompletedSurveysByStid(patient.stid)
        
        // แปลงข้อมูลแบบสอบถามเป็นประวัติการเยี่ยม
        const visits = surveys.map((survey, index) => {
          const visitDate = survey.appointmentDate || survey.timeStart?.split(' ')[0] || ''
          const visitTimeOfDay = survey.appointmentTime || survey.timeStart?.split(' ')[1] || ''
          
          return {
            id: survey.id,
            surveyId: survey.id,
            date: visitDate,
            appointmentTime: visitTimeOfDay,
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
      return formatVisitDate(dateStr)
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
              // ⚠️ Offline Mode: ใช้ base64 เมื่อ offline เพื่อให้แสดงได้
              // ใช้ store state แทน navigator.onLine เพื่อความแม่นยำ
              const isOffline = !this.$store.state.isOnline
              const imageData = (isOffline && img.base64) ? img.base64 : (img.url || img.base64)
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
        const webpImage = await convertToWebP(file)
        
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
    
    // Camera modal methods
    openCameraModal(index) {
      this.currentImageIndex = index
      this.capturedImage = null
      this.uploadMode = null
      this.useFileInput = false
      this.videoStream = null
      this.cameraModalVisible = true
    },

    selectUploadMode(mode) {
      this.uploadMode = mode
      
      if (mode === 'camera') {
        // เริ่มเปิดกล้องเมื่อผู้ใช้เลือกถ่ายภาพ
        this.startCamera()
      }
    },

    handleSelectFile() {
      // เปิด file picker เลย
      this.$nextTick(() => {
        if (this.$refs.fileInput) {
          this.$refs.fileInput.click()
        }
      })
    },

    resetUploadMode() {
      this.uploadMode = null
      this.stopCameraStream()
      this.capturedImage = null
    },

    // Method สำหรับปิด camera stream (ใช้ซ้ำได้)
    stopCameraStream() {
      // หยุด video stream ถ้ามี
      if (this.videoStream) {
        try {
          if (this.videoStream.getTracks) {
            this.videoStream.getTracks().forEach(track => {
              track.stop()
              track.enabled = false
            })
          } else if (this.videoStream.stop) {
            this.videoStream.stop()
          }
        } catch (error) {
          console.warn('Error stopping video stream:', error)
        }
        this.videoStream = null
      }
      
      // ล้าง video element
      if (this.videoElement) {
        try {
          if ('srcObject' in this.videoElement) {
            this.videoElement.srcObject = null
          } else if (this.videoElement.src) {
            this.videoElement.src = ''
          }
          this.videoElement.pause()
        } catch (error) {
          console.warn('Error clearing video element:', error)
        }
        this.videoElement = null
      }
      
      // รอสักครู่เพื่อให้ stream ปิดสมบูรณ์ (สำคัญสำหรับ Chrome Android)
      return new Promise(resolve => setTimeout(resolve, 100))
    },

    async startCamera() {
      // ป้องกันการเรียกซ้ำ
      if (this.cameraStarting) {
        return
      }
      
      // ปิด stream เก่าก่อนเปิดใหม่ (ป้องกัน NotReadableError)
      await this.stopCameraStream()
      
      this.cameraStarting = true
      
      // รอให้ modal แสดงก่อน
      await this.$nextTick()
      
      try {
        // ตรวจสอบว่า browser รองรับ getUserMedia หรือไม่
        let stream = null
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // Modern API - ลอง constraints หลายแบบเพื่อความเข้ากันได้
          const constraintsList = [
            // 1. ลอง constraints ที่ต้องการสูงสุดก่อน
            {
              video: {
                facingMode: 'environment',
                width: { ideal: 1920, min: 640 },
                height: { ideal: 1080, min: 480 }
              }
            },
            // 2. ลอง constraints ที่ยืดหยุ่นกว่า
            {
              video: {
                facingMode: 'environment',
                width: { min: 640 },
                height: { min: 480 }
              }
            },
            // 3. ลองแค่ facingMode
            {
              video: {
                facingMode: 'environment'
              }
            },
            // 4. ลองแค่ video: true (fallback สุดท้าย)
            {
              video: true
            }
          ]
          
          // ลอง constraints แต่ละแบบจนกว่าจะสำเร็จ
          let lastError = null
          for (const constraints of constraintsList) {
            try {
              stream = await navigator.mediaDevices.getUserMedia(constraints)
              if (stream) break
            } catch (err) {
              lastError = err
              // ถ้าเป็น NotReadableError หรือ NotAllowedError ให้หยุดทันที
              if (err.name === 'NotReadableError' || err.name === 'NotAllowedError' || 
                  err.name === 'NotFoundError' || err.name === 'PermissionDeniedError') {
                throw err
              }
              // ถ้าเป็น constraint error ให้ลองแบบถัดไป
              continue
            }
          }
          
          if (!stream && lastError) {
            throw lastError
          }
        } else if (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia) {
          // Legacy API (fallback) - ใช้ constraints แบบเก่า
          const getUserMedia = navigator.getUserMedia || 
                              navigator.webkitGetUserMedia || 
                              navigator.mozGetUserMedia || 
                              navigator.msGetUserMedia
          
          stream = await new Promise((resolve, reject) => {
            // Legacy API ใช้ constraints แบบ boolean หรือ object ง่ายๆ
            getUserMedia.call(
              navigator,
              { video: true }, // Legacy API ไม่รองรับ facingMode และ constraints ซับซ้อน
              resolve,
              reject
            )
          })
        } else {
          throw new Error('Browser does not support camera access')
        }
        
        if (!stream) {
          throw new Error('Failed to get camera stream')
        }
        
        this.videoStream = stream
        
        // รอให้ video element พร้อม
        await this.$nextTick()
        
        const videoElement = this.$refs.videoElement
        if (videoElement) {
          // ใช้ srcObject สำหรับ video stream (รองรับทั้ง modern และ legacy browser ที่มี getUserMedia)
          if ('srcObject' in videoElement) {
            videoElement.srcObject = stream
            // เรียก play() เพื่อให้วิดีโอเล่น (สำคัญสำหรับบางเบราว์เซอร์)
            try {
              await videoElement.play()
            } catch (playError) {
              console.warn('Video play() failed:', playError)
              // ไม่ critical - autoplay อาจจะทำงานอยู่แล้ว
            }
          } else {
            // Fallback: สำหรับ browser เก่าที่ไม่มี srcObject (หายากมาก)
            console.warn('srcObject not supported, video may not display')
            // Browser ที่ไม่มี srcObject มักจะไม่มี getUserMedia ด้วย
          }
          this.videoElement = videoElement
        }
        
        this.cameraStarting = false
      } catch (error) {
        this.cameraStarting = false
        // Log error details สำหรับ debug (โดยเฉพาะ Chrome Android)
        console.error('Error accessing camera:', {
          name: error.name,
          message: error.message,
          code: error.code,
          constraint: error.constraint,
          fullError: error
        })
        
        let errorMessage = 'ไม่สามารถเข้าถึงกล้องได้'
        
        // ตรวจสอบ error name และ message (รองรับทั้ง standard และ Chrome Android)
        const errorName = (error.name || '').toLowerCase()
        const errorMsg = (error.message || '').toLowerCase()
        const errorCode = error.code || ''
        
        // ตรวจสอบ NotReadableError (กล้องถูกใช้งาน) - รองรับหลายรูปแบบ
        if (errorName === 'notreadableerror' || 
            errorName === 'trackstarterror' ||
            errorCode === 'NotReadableError' ||
            errorMsg.includes('not readable') ||
            errorMsg.includes('could not start') ||
            errorMsg.includes('device in use') ||
            errorMsg.includes('busy') ||
            errorMsg.includes('already in use') ||
            errorMsg.includes('could not start video source') ||
            errorMsg.includes('failed to start') ||
            errorMsg.includes('cannot start') ||
            errorMsg.includes('unable to start')) {
          // ลองปิด stream อีกครั้งและ retry (อาจมี stream เก่าค้างอยู่)
          await this.stopCameraStream()
          // รอสักครู่แล้วลองอีกครั้ง
          await new Promise(resolve => setTimeout(resolve, 500))
          
          try {
            // ลองเปิดกล้องอีกครั้งด้วย constraints ง่ายๆ
            const retryStream = await navigator.mediaDevices.getUserMedia({ video: true })
            if (retryStream) {
              this.videoStream = retryStream
              await this.$nextTick()
              const videoElement = this.$refs.videoElement
              if (videoElement && 'srcObject' in videoElement) {
                videoElement.srcObject = retryStream
                try {
                  await videoElement.play()
                } catch (playError) {
                  console.warn('Video play() failed on retry:', playError)
                }
                this.videoElement = videoElement
                this.cameraStarting = false
                return // สำเร็จแล้ว ไม่ต้องแสดง error
              }
            }
          } catch (retryError) {
            console.log('Retry failed:', retryError)
            // ถ้า retry ไม่สำเร็จ ให้แสดง error message
          }
          
          errorMessage = 'กล้องถูกใช้งานโดยแอปพลิเคชันอื่น กรุณาปิดแอปอื่นแล้วลองอีกครั้ง'
        } else if (errorName === 'notallowederror' || errorName === 'permissiondeniederror' || 
                   errorCode === 'NotAllowedError' ||
                   errorMsg.includes('permission') || errorMsg.includes('denied')) {
          errorMessage = 'กรุณาอนุญาตให้เข้าถึงกล้องในเบราว์เซอร์'
        } else if (errorName === 'notfounderror' || errorName === 'devicesnotfounderror' ||
                   errorCode === 'NotFoundError' ||
                   errorMsg.includes('not found') || errorMsg.includes('no device')) {
          errorMessage = 'ไม่พบกล้องในอุปกรณ์'
        } else if (errorName === 'notsupportederror' || errorName === 'constraintnotsatisfiederror' || 
                   errorName === 'overconstrainederror' ||
                   errorCode === 'NotSupportedError' ||
                   errorMsg.includes('not supported') || errorMsg.includes('constraint')) {
          errorMessage = 'เบราว์เซอร์ไม่รองรับการเข้าถึงกล้องหรือ constraints ที่กำหนด'
        } else if (errorName === 'aborterror' || errorCode === 'AbortError' || errorMsg.includes('abort')) {
          errorMessage = 'การเข้าถึงกล้องถูกยกเลิก'
        } else if (errorName === 'securityerror' || errorCode === 'SecurityError' ||
                   errorMsg.includes('security') || errorMsg.includes('https') || 
                   errorMsg.includes('secure context')) {
          errorMessage = 'ไม่สามารถเข้าถึงกล้องได้เนื่องจากปัญหาด้านความปลอดภัย (ต้องใช้ HTTPS)'
        } else if (errorMsg.includes('not support') || errorMsg.includes('not available')) {
          errorMessage = 'เบราว์เซอร์ไม่รองรับการเข้าถึงกล้อง'
        }
        
        // ถ้า browser ไม่รองรับ ให้ใช้ file input fallback
        if (error.message && error.message.includes('not support')) {
          this.useFileInput = true
          this.$toast.warning('เบราว์เซอร์ไม่รองรับการเข้าถึงกล้อง ใช้การอัพโหลดไฟล์แทน')
          // เปิด file picker เลย
          this.$nextTick(() => {
            if (this.$refs.fileInput) {
              this.$refs.fileInput.click()
            }
          })
        } else {
          this.$toast.error(errorMessage)
          // กลับไปหน้าเลือก
          this.resetUploadMode()
        }
      }
    },
    
    closeCameraModal() {
      // หยุด video stream
      if (this.videoStream) {
        if (this.videoStream.getTracks) {
          this.videoStream.getTracks().forEach(track => track.stop())
        } else if (this.videoStream.stop) {
          // Legacy API
          this.videoStream.stop()
        }
        this.videoStream = null
      }
      
      if (this.videoElement) {
        if ('srcObject' in this.videoElement) {
          this.videoElement.srcObject = null
        } else if (this.videoElement.src) {
          // Legacy: clear src
          this.videoElement.src = ''
        }
        this.videoElement = null
      }
      
      this.capturedImage = null
      this.uploadMode = null
      this.useFileInput = false
      this.cameraModalVisible = false
    },
    
    // Handle file input fallback
    async handleFileInput(event) {
      const file = event.target.files?.[0]
      if (!file) return
      
      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        this.$toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
        return
      }
      
      // ตรวจสอบขนาดไฟล์ สูงสุด 10MB
      if (file.size > 10 * 1024 * 1024) {
        this.$toast.error('ไฟล์รูปภาพมีขนาดใหญ่เกินไป (สูงสุด 10MB)')
        return
      }
      
      this.loading = true
      this.loadingMessage = 'กำลังประมวลผลรูปภาพ...'
      
      try {
        // ใช้ convertToWebP เพื่อแปลงเป็น WebP และปรับขนาด
        const webpImage = await convertToWebP(file, 1000, 1000, 0.90)
        
        // บันทึกรูปภาพ
        const index = this.currentImageIndex
        this.$set(this.editPhotoForm.newImages, index, webpImage)
        this.$set(this.editPhotoForm.newImagePreviews, index, webpImage)
        
        // Update current image preview immediately
        this.$set(this.editPhotoForm.currentImages, index, webpImage)
        
        this.$toast.success(`อัพโหลดรูปภาพที่ ${index + 1} สำเร็จ`)
        
        // Reset และปิด modal
        this.resetUploadMode()
        this.closeCameraModal()
      } catch (error) {
        console.error('Error processing file:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ')
      } finally {
        this.loading = false
        // Reset file input
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = ''
        }
      }
    },
    
    capturePhoto() {
      const videoElement = this.$refs.videoElement
      if (!videoElement || !videoElement.videoWidth) return
      
      try {
        // สร้าง canvas เพื่อจับภาพจาก video
        const canvas = document.createElement('canvas')
        const video = videoElement
        
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // แปลงเป็น base64
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        this.capturedImage = imageData
      } catch (error) {
        console.error('Error capturing photo:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการถ่ายภาพ')
      }
    },
    
    retakePhoto() {
      this.capturedImage = null
    },
    
    async usePhoto() {
      if (!this.capturedImage) return
      
      this.loading = true
      this.loadingMessage = 'กำลังประมวลผลรูปภาพ...'
      
      try {
        // แปลง base64 เป็น Blob
        const response = await fetch(this.capturedImage)
        const blob = await response.blob()
        
        // สร้าง File object จาก Blob
        const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' })
        
        // ใช้ convertToWebP เพื่อแปลงเป็น WebP และปรับขนาด
        const webpImage = await convertToWebP(file, 1000, 1000, 0.90)
        
        // บันทึกรูปภาพ
        const index = this.currentImageIndex
        this.$set(this.editPhotoForm.newImages, index, webpImage)
        this.$set(this.editPhotoForm.newImagePreviews, index, webpImage)
        
        // Update current image preview immediately
        this.$set(this.editPhotoForm.currentImages, index, webpImage)
        
        this.$toast.success(`บันทึกรูปภาพที่ ${index + 1} สำเร็จ`)
        
        // Reset และปิด modal
        this.resetUploadMode()
        this.closeCameraModal()
      } catch (error) {
        console.error('Error processing photo:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ')
      } finally {
        this.loading = false
      }
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
    clearAddError(field) {
      if (this.addFormErrors[field]) {
        delete this.addFormErrors[field]
      }
    },
    validateAddForm() {
      // Simplified - validation would be handled by component or manually checking
      this.addFormErrors = {}
      return true
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
    formatAppointmentDateShort(dateStr) {
      return formatAppointmentDateShort(dateStr)
    },
    getThaiMonth(monthIndex) {
      return getThaiMonthShort(monthIndex)
    },
    getThaiMonthFull(monthIndex) {
      return getThaiMonthFull(monthIndex)
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

/* Missing Appointment Warning */
.card-col-appointment.needs-appointment {
  background: #fff3cd;
  border-color: #ffc107;
  border-width: 3px;
}

.appointment-missing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.warning-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #856404;
  font-size: 1.2rem;
  font-weight: 500;
}

.warning-icon {
  color: #ff9800;
  font-size: 1.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.btn-create-appointment {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 1.1rem;
  transition: background 0.3s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-create-appointment:hover {
  background: #218838;
  transform: translateY(-2px);
}

.btn-create-appointment:active {
  transform: translateY(0);
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
  cursor: default;
}

.card-col-visit.visit-completed:hover {
  background: #218838;
  border-color: #1e7e34;
}

.card-col-visit.visit-pending {
  background: #ffc107;
  color: #333;
  border-color: #ff9800;
  cursor: default;
}

.card-col-visit.visit-pending:hover {
  background: #e0a800;
  border-color: #d39e00;
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

.visit-text-success {
  font-size: 1.4rem;
  line-height: 1.6;
  font-weight: 400;
  color: white;
}

.visit-text-completed {
  font-size: 1.4rem;
  line-height: 1.6;
  font-weight: 400;
  color: #333;
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

.upload-new-section {
  margin-top: 1rem;
}

.upload-new-section .btn {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: 500;
  min-height: 50px;
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
  width: auto;
  height: 200px;
  display: block;
  object-fit: contain;
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
  
  .image-section .image-preview-large img {
    height: 200px;
    width: auto;
  }
}

/* Camera Modal Styles */
::v-deep .camera-modal .modal-content {
  border-radius: 1rem;
  overflow: hidden;
}

::v-deep .camera-modal .modal-header {
  background: linear-gradient(135deg, #3551a4, #2c4088);
  color: white;
  border-bottom: none;
  padding: 1.5rem 2rem;
}

::v-deep .camera-modal .modal-title {
  font-size: 1.5rem;
  font-weight: 500;
}

::v-deep .camera-modal .modal-body {
  padding: 0;
}

.camera-container {
  display: flex;
  flex-direction: column;
  background: #000;
  min-height: 400px;
}

.upload-choice-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.upload-choice-content {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.upload-choice-content h5 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.upload-choice-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.choice-btn {
  flex: 1;
  min-width: 180px;
  max-width: 220px;
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.2rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.choice-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.choice-btn i {
  display: block;
}

.choice-btn-cancel {
  min-width: 160px;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.file-input-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.file-input-container {
  text-align: center;
  max-width: 400px;
}

.file-input-container i {
  color: #6c757d;
}

.file-input-container p {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.file-input-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.camera-preview {
  position: relative;
  width: 100%;
  max-height: calc(100vh - 300px);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
}

.camera-video {
  width: auto;
  max-width: 100%;
  max-height: calc(100vh - 300px);
  height: auto;
  display: block;
  object-fit: contain;
}

.camera-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  z-index: 10;
}

.camera-loading p {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
}

.captured-preview {
  width: 100%;
  max-height: calc(100vh - 300px);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  padding: 1rem;
  overflow: hidden;
}

.captured-image {
  width: auto;
  height: 200px;
  object-fit: contain;
  border-radius: 0.5rem;
}

.camera-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-top: 2px solid #dee2e6;
}

.control-btn {
  min-width: 160px;
  font-size: 1.2rem;
  font-weight: 500;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.capture-btn {
  background: linear-gradient(135deg, #ffc107, #ff9800);
  border: none;
  color: white;
  font-size: 1.4rem;
  min-width: 200px;
}

.capture-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff9800, #f57c00);
}

@media (max-width: 768px) {
  .camera-preview,
  .captured-preview {
    max-height: calc(100vh - 250px);
    min-height: 250px;
  }

  .camera-video {
    max-height: calc(100vh - 250px);
  }
  
  .captured-image {
    height: 200px;
    width: auto;
  }
  
  .camera-controls {
    flex-direction: column;
    padding: 1.5rem;
  }
  
  .control-btn {
    width: 100%;
    min-width: auto;
  }
  
  .capture-btn {
    min-width: auto;
  }

  .upload-choice-buttons {
    flex-direction: column;
  }

  .choice-btn {
    width: 100%;
    max-width: 100%;
  }
}

</style>
