<template>
  <div class="admin-change-visitor">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">เปลี่ยนผู้ชื่อผู้ดูแลเด็ก</h1>
      <p class="page-subtitle">จัดการการเชื่อมโยงข้อมูลเด็กกับผู้เยี่ยมบ้าน</p>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label class="filter-label">ค้นหาชื่อเด็ก / รหัสเด็ก</label>
        <input
          v-model="filters.search"
          type="text"
          class="filter-input"
          placeholder="พิมพ์ชื่อหรือรหัสเด็ก..."
          @input="filterTableData"
        />
      </div>
      <div class="filter-group">
        <label class="filter-label">ผู้เยี่ยมบ้านปัจจุบัน</label>
        <select
          v-model="filters.visitor"
          class="filter-select"
          @change="filterTableData"
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
            <tr v-for="n in 6" :key="'skeleton-' + n" class="skeleton-row">
              <td><div class="skeleton-cell skeleton-text"></div></td>
              <td><div class="skeleton-cell skeleton-text"></div></td>
              <td><div class="skeleton-cell skeleton-text"></div></td>
              <td><div class="skeleton-cell skeleton-text-short"></div></td>
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
        class="admin-table"
        show-empty
        empty-text="ไม่พบข้อมูล"
      >
        <template #cell(childName)="row">
          <div class="child-info">
            <div class="child-name">{{ row.item.childName }}</div>
            <div class="child-stid text-muted">{{ row.item.stid }}</div>
          </div>
        </template>

        <template #cell(currentVisitor)="row">
          <div class="visitor-info">
            <i class="fas fa-user-circle visitor-icon"></i>
            <span>{{ row.item.currentVisitorName }}</span>
          </div>
          <div class="child-stid text-muted">
            &nbsp;
            <span>{{ row.item.currentVisitor }}</span>
          </div>
        </template>

        <template #cell(hasData)="row">
          <div class="data-status">
            <span v-if="row.item.hasNextApp" class="badge-has-data">
              <i class="fas fa-calendar-check"></i> มีนัดหมาย
            </span>
            <span v-else class="badge-no-data">
              <i class="fas fa-calendar-times"></i> ไม่มีนัดหมาย
            </span>
          </div>
        </template>

        <template #cell(lastVisit)="row">
          <div class="visit-cells">
            <div v-if="row.item.lastTimeVisit" class="last-visit">
              <span class="visit-label">ล่าสุด</span>
              ครั้งที่ {{ row.item.lastTimeVisit }}
              <div class="last-visit-date text-muted">{{ row.item.lastVisitDate }}</div>
            </div>
            <span v-else class="text-muted small">ยังไม่มีผลการเยี่ยม</span>
            <div v-if="row.item.hasNextApp" class="next-visit">
              <span class="visit-label next">ถัดไป</span>
              ครั้งที่ {{ row.item.nextTimeVisit }}
              <div class="last-visit-date text-muted">{{ row.item.nextVisitDate }}</div>
            </div>
          </div>
        </template>

        <template #cell(action)="row">
          <button class="btn-change" @click="openChangeModal(row.item)">
            <i class="fas fa-exchange-alt"></i>
            เปลี่ยนผู้ดูแล
          </button>
        </template>
      </b-table>
    </div>

    <!-- Change Visitor Modal -->
    <b-modal
      id="changeVisitorModal"
      v-model="showChangeModal"
      title="เปลี่ยนผู้ดูแลเด็ก"
      size="lg"
      no-close-on-backdrop
      @hidden="resetChangeForm"
      header-class="modal-header-change"
      no-enforce-focus
    >
      <template #modal-header>
        <div class="modal-header-content">
          <h5 class="modal-title">เปลี่ยนผู้ดูแลเด็ก</h5>
          <div class="child-info-bar">
            <i class="fas fa-child"></i>
            <span class="child-name-large">{{ changeForm.childName }}</span>
            <span class="child-stid-badge">{{ changeForm.stid }}</span>
          </div>
        </div>
      </template>

      <div class="change-form">
        <!-- ประวัติการเปลี่ยนครั้งก่อน -->
        <div class="form-section" v-if="changeForm.hasChanged">
          <div class="alert-warning-box">
            <i class="fas fa-history"></i>
            <div>
              <strong>เคยมีการเปลี่ยนผู้ดูแลมาก่อน</strong>
              <p>เปลี่ยนโดย: <strong>{{ changeForm.prevUpdatedBy }}</strong> เมื่อ {{ changeForm.prevUpdatedAt }}</p>
              <p v-if="changeForm.prevReasonChange">เหตุผล: <em>{{ changeForm.prevReasonChange }}</em></p>
              <p v-if="changeForm.currentVisitorRaw">ผู้ดูแลเดิม (ก่อนเปลี่ยนครั้งล่าสุด): {{ changeForm.currentVisitorRaw }} <span class="username-badge">{{ changeForm.prevVisitor }}</span></p>
            </div>
          </div>
        </div>
        <!-- Current Visitor -->
        <div class="form-section">
          <label class="form-label">ผู้ดูแลปัจจุบัน</label>
          <div class="current-visitor-display">
            <i class="fas fa-user-circle"></i>
            <span>{{ changeForm.currentVisitorName }}</span>
            <span class="username-badge">{{ changeForm.currentVisitor }}</span>
          </div>
        </div>

        <!-- Data Status -->
        <div class="form-section" v-if="changeForm.hasNextApp">
          <div class="alert-info-box">
            <i class="fas fa-info-circle"></i>
            <div>
              <strong>พบนัดหมายครั้งถัดไป</strong>
              <p>ครั้งที่ <strong>{{ changeForm.nextTimeVisit }}</strong> ({{ changeForm.nextVisitDate }}) ยังไม่มีผลการเยี่ยม</p>
              <p>ระบบจะเปลี่ยน <code>recby</code> ในนัดหมายครั้งนี้ด้วย</p>
            </div>
          </div>
        </div>

        <!-- New Visitor Select -->
        <div class="form-section">
          <label class="form-label">
            เลือกผู้ดูแลใหม่ <span class="required">*</span>
          </label>
          <select
            v-model="changeForm.newVisitor"
            class="filter-select w-100"
            @change="onNewVisitorChange"
          >
            <option value="">-- เลือกผู้เยี่ยมบ้าน --</option>
            <option
              v-for="(v, i) in visitorListForChange"
              :key="'nv-' + i"
              :value="v.value"
              :disabled="v.value === changeForm.currentVisitor"
            >
              {{ v.text }}
              <template v-if="v.value === changeForm.currentVisitor"> (ปัจจุบัน)</template>
            </option>
          </select>
        </div>

        <!-- New Visitor Preview -->
        <div v-if="changeForm.newVisitor && changeForm.newVisitor !== changeForm.currentVisitor" class="change-preview">
          <div class="preview-row">
            <div class="preview-from">
              <span class="preview-label">จาก</span>
              <span class="preview-name">{{ changeForm.currentVisitorName }}</span>
            </div>
            <i class="fas fa-long-arrow-alt-right preview-arrow"></i>
            <div class="preview-to">
              <span class="preview-label">เป็น</span>
              <span class="preview-name highlight">{{ changeForm.newVisitorName }}</span>
            </div>
          </div>
          <div v-if="changeForm.hasNextApp" class="preview-note">
            <i class="fas fa-exclamation-triangle"></i>
            นัดหมาย homevisitor_app ครั้งที่ {{ changeForm.nextTimeVisit }} จะถูกอัพเดต recby ด้วย
          </div>
        </div>

        <!-- Reason -->
        <div class="form-section">
          <label class="form-label">หมายเหตุ (ถ้ามี)</label>
          <textarea
            v-model="changeForm.reason"
            class="form-textarea"
            rows="2"
            placeholder="ระบุเหตุผลในการเปลี่ยนผู้ดูแล...เช่น 23/04/2568 - ผยบ ลาออก - admin"
          ></textarea>
          <small class="form-hint">รูปแบบการกรอก: วดป - เหตุผล - โดยใคร</small>
        </div>
      </div>

      <template #modal-footer>
        <b-button variant="secondary" @click="showChangeModal = false">
          <i class="fas fa-times"></i>
          ยกเลิก
        </b-button>
        <b-button
          variant="primary"
          @click="confirmChange"
          :disabled="!changeForm.newVisitor || changeForm.newVisitor === changeForm.currentVisitor || saving"
        >
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          {{ saving ? 'กำลังบันทึก...' : 'ยืนยันการเปลี่ยน' }}
        </b-button>
      </template>
    </b-modal>

    <!-- Confirm Modal -->
    <b-modal
      id="confirmModal"
      v-model="showConfirmModal"
      title="ยืนยันการเปลี่ยนผู้ดูแล"
      size="md"
      no-close-on-backdrop
      no-enforce-focus
      centered
    >
      <div class="confirm-body">
        <i class="fas fa-exclamation-triangle confirm-icon"></i>
        <p>คุณต้องการเปลี่ยนผู้ดูแลเด็ก <strong>{{ changeForm.childName }}</strong> ใช่หรือไม่?</p>
        <ul class="confirm-list">
          <li>ตาราง <code>sample_homevisit_link</code> จะถูกอัพเดต homevisitor</li>
          <li v-if="changeForm.hasNextApp">ตาราง <code>homevisitor_app</code> ครั้งที่ {{ changeForm.nextTimeVisit }} จะถูกอัพเดต recby</li>
        </ul>
      </div>
      <template #modal-footer>
        <b-button variant="secondary" @click="showConfirmModal = false">
          <i class="fas fa-times"></i> ยกเลิก
        </b-button>
        <b-button variant="danger" @click="doChange" :disabled="saving">
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-check"></i>
          {{ saving ? 'กำลังบันทึก...' : 'ยืนยัน' }}
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
      loading: true,
      saving: false,
      showChangeModal: false,
      showConfirmModal: false,
      filters: {
        search: '',
        visitor: 'all'
      },
      visitorOptions: [
        { value: 'all', text: '--ทั้งหมด--' }
      ],
      visitorListForChange: [],
      tableFields: [
        { key: 'childName', label: 'ชื่อเด็ก / รหัส', thClass: 'table-header' },
        { key: 'currentVisitor', label: 'ผู้ดูแลปัจจุบัน', thClass: 'table-header' },
        { key: 'hasData', label: 'สถานะข้อมูล', thClass: 'table-header' },
        { key: 'lastVisit', label: 'ล่าสุด / ถัดไป', thClass: 'table-header' },
        { key: 'action', label: 'จัดการ', thClass: 'table-header' }
      ],
      tableData: [],
      rawTableData: [],
      changeForm: {
        stid: '',
        childName: '',
        currentVisitor: '',
        currentVisitorName: '',
        newVisitor: '',
        newVisitorName: '',
        hasAppData: false,
        lastTimeVisit: null,
        reason: ''
      },

      // ======= MOCK DATA =======
      mockLinkData: [
        { stid: 'S001', childName: 'ด.ช. สมชาย ใจดี',      homevisitor: 'hv001', homevisitor_raw: 'hv001' },
        { stid: 'S002', childName: 'ด.ญ. มาลี สวยงาม',     homevisitor: 'hv002', homevisitor_raw: 'hv002' },
        { stid: 'S003', childName: 'ด.ช. วิชัย รักเรียน',  homevisitor: 'hv001', homevisitor_raw: 'hv001' },
        { stid: 'S004', childName: 'ด.ญ. นภา ฟ้าใส',       homevisitor: 'hv003', homevisitor_raw: 'hv003' },
        { stid: 'S005', childName: 'ด.ช. ธีรพงษ์ มั่นคง', homevisitor: 'hv002', homevisitor_raw: 'hv002' }
      ],

      // _app = นัดหมาย (มีทั้งที่มี _result แล้ว และยังไม่มี)
      mockAppData: [
        // S001: ครั้ง 1,2,3 มี result → ล่าสุด=3, ครั้ง 4 ไม่มี result → ถัดไป=4
        { stid: 'S001', recby: 'hv001', time_visit: 1, date_visit: '2025-01-10' },
        { stid: 'S001', recby: 'hv001', time_visit: 2, date_visit: '2025-02-05' },
        { stid: 'S001', recby: 'hv001', time_visit: 3, date_visit: '2025-03-01' },
        { stid: 'S001', recby: 'hv001', time_visit: 4, date_visit: '2025-04-01' }, // ถัดไป
        // S002: ครั้ง 1,2 มี result → ล่าสุด=2, ไม่มีถัดไป
        { stid: 'S002', recby: 'hv002', time_visit: 1, date_visit: '2025-01-15' },
        { stid: 'S002', recby: 'hv002', time_visit: 2, date_visit: '2025-02-15' },
        // S003: ครั้ง 1-5 มี result → ล่าสุด=5, ครั้ง 6 ไม่มี result → ถัดไป=6
        { stid: 'S003', recby: 'hv001', time_visit: 1, date_visit: '2025-01-05' },
        { stid: 'S003', recby: 'hv001', time_visit: 2, date_visit: '2025-01-20' },
        { stid: 'S003', recby: 'hv001', time_visit: 3, date_visit: '2025-02-10' },
        { stid: 'S003', recby: 'hv001', time_visit: 4, date_visit: '2025-02-25' },
        { stid: 'S003', recby: 'hv001', time_visit: 5, date_visit: '2025-03-10' },
        { stid: 'S003', recby: 'hv001', time_visit: 6, date_visit: '2025-04-05' }, // ถัดไป
        // S004: ไม่มี app เลย
        // S005: มี app ครั้ง 1 แต่ยังไม่มี result → เด็กใหม่ ถัดไป=1
        { stid: 'S005', recby: 'hv002', time_visit: 1, date_visit: '2025-04-10' }
      ],

      // _result = บันทึกผลการเยี่ยมบ้านที่เสร็จแล้ว
      mockResultData: [
        { stid: 'S001', time_visit: 1 },
        { stid: 'S001', time_visit: 2 },
        { stid: 'S001', time_visit: 3 }, // ล่าสุด S001
        { stid: 'S002', time_visit: 1 },
        { stid: 'S002', time_visit: 2 }, // ล่าสุด S002
        { stid: 'S003', time_visit: 1 },
        { stid: 'S003', time_visit: 2 },
        { stid: 'S003', time_visit: 3 },
        { stid: 'S003', time_visit: 4 },
        { stid: 'S003', time_visit: 5 }  // ล่าสุด S003
        // S004: ไม่มี result
        // S005: ไม่มี result → ถัดไป = ครั้ง 1
      ],

      mockVisitors: [
        { value: 'hv001', text: 'นางสาว สมหญิง ดีมาก' },
        { value: 'hv002', text: 'นาย วิโรจน์ เก่งกล้า' },
        { value: 'hv003', text: 'นางสาว รัตนา สุขใจ' },
        { value: 'hv004', text: 'นาย ประเสริฐ ทำดี' }
      ],
      dataAll: []
    }
  },
  async mounted() {
    await this.fetchData()
  },
  methods: {
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
    async fetchData() {
      this.loading = true
      try {
        const response = await this.$axios.$get('/api/parenting2025_census/get/homevisit/admin/gethomevisit_change_visitor.php')
        const isSuccess = response.message === 'success' || response.statusCode === 200
        if (!isSuccess) return

        const linkData = (response.linkData ?? []).map(item => ({
          ...item,
          childName: `${item.prefix || ''}${item.fname || ''} ${item.surname || ''}`.trim()
        }))
        const appData    = response.appData    ?? []
        const resultData = response.resultData ?? []
        await this.fetchVisitorOptions()

        // build visitorMap จาก visitorOptions ที่ได้จาก API จริง
        const visitorMap = {}
        this.visitorOptions.forEach(v => {
          if (v.value !== 'all') {
            visitorMap[v.value] = v.text
          }
        })

        this.visitorListForChange = this.visitorOptions.filter(v => v.value !== 'all')

        // map rawTableData
        this.rawTableData = linkData.map(link => {
          const appRows   = appData.filter(a => a.stid === link.stid)
          const resultSet = new Set(
            resultData.filter(r => r.stid === link.stid).map(r => r.time_visit)
          )

          // ครั้งล่าสุด = app ที่มีใน result ด้วย → time_visit สูงสุด
          const completedRows = appRows.filter(a => resultSet.has(a.time_visit))
          const lastCompleted = completedRows.length > 0
            ? completedRows.reduce((a, b) => (a.time_visit > b.time_visit ? a : b))
            : null

          // ครั้งถัดไป = app ที่ไม่มีใน result และ time_visit > ครั้งล่าสุด
          const lastTV   = lastCompleted ? lastCompleted.time_visit : 0
          const nextRows = appRows.filter(
            a => !resultSet.has(a.time_visit) && a.time_visit > lastTV
          )
          // เอาครั้งที่ใกล้ที่สุด (time_visit น้อยสุดในกลุ่ม)
          const nextApp  = nextRows.length > 0
            ? nextRows.reduce((a, b) => (a.time_visit < b.time_visit ? a : b))
            : null

          return {
            stid: link.stid,
            childName: link.childName,
            prevVisitor: link.homevisitor_raw,
            prevVisitorName: visitorMap[link.homevisitor_raw] || link.homevisitor_raw,
            currentVisitor: link.homevisitor,
            currentVisitorName: visitorMap[link.homevisitor] || link.homevisitor,
            reason_change: link.reason_change,
            // ครั้งล่าสุด (app + result)
            lastTimeVisit: lastCompleted ? lastCompleted.time_visit : null,
            lastVisitDate: lastCompleted ? lastCompleted.date_visit : null,
            // ครั้งถัดไป (นัดหมาย) → recby ตรงนี้ที่ต้องอัพเดต
            hasNextApp:    !!nextApp,
            nextTimeVisit: nextApp ? nextApp.time_visit   : null,
            nextVisitDate: nextApp ? nextApp.date_visit   : null,
            nextRecby:     nextApp ? nextApp.recby        : null
          }
        })

        this.filterTableData()
      } catch (err) {
        console.error('fetchData error:', err)
      } finally {
        this.loading = false
      }
    },

    filterTableData() {
      let filtered = [...this.rawTableData]

      if (this.filters.search) {
        const q = this.filters.search.toLowerCase()
        filtered = filtered.filter(
          item =>
            item.childName.toLowerCase().includes(q) ||
            item.stid.toLowerCase().includes(q)
        )
      }

      if (this.filters.visitor !== 'all') {
        filtered = filtered.filter(item => item.currentVisitor === this.filters.visitor)
      }

      this.tableData = filtered
    },

    openChangeModal(item) {
      console.log(item)
      const hasChanged = !!(item.prevVisitor && item.currentVisitor !== item.prevVisitor)
      this.changeForm = {
        stid: item.stid,
        childName: item.childName,
        currentVisitor: item.currentVisitor,
        currentVisitorName: item.currentVisitorName,
        prevVisitor: item.prevVisitor,
        currentVisitorRaw: item.prevVisitorName ?? null, // ของเดิมก่อนเปลี่ยน
        hasChanged,                                    // ← flag ว่าเคยเปลี่ยนมาก่อน
        prevReasonChange: hasChanged ? (item.reason_change ?? null) : null,
        prevUpdatedBy:    hasChanged ? (item.updated_by   ?? '-') : '-',
        prevUpdatedAt:    hasChanged ? (item.updated_at   ?? '-') : '-',
        newVisitor: '',
        newVisitorName: '',
        lastTimeVisit: item.lastTimeVisit,
        lastVisitDate: item.lastVisitDate,
        hasNextApp: item.hasNextApp,
        nextTimeVisit: item.nextTimeVisit,
        nextVisitDate: item.nextVisitDate,
        reason: ''
      }
      this.showChangeModal = true
    },

    onNewVisitorChange() {
      const found = this.visitorListForChange.find(v => v.value === this.changeForm.newVisitor)
      this.changeForm.newVisitorName = found ? found.text : ''
    },

    confirmChange() {
      if (!this.changeForm.newVisitor || this.changeForm.newVisitor === this.changeForm.currentVisitor) return
      this.showConfirmModal = true
    },

    async doChange() {
      this.saving = true
      try {
        await this.$axios.$post('/api/parenting2025_census/post/homevisit/admin/change_homevisitor.php', {
          stid:             this.changeForm.stid,
          newVisitor:       this.changeForm.newVisitor,
          oldVisitor:       this.changeForm.currentVisitor,  // จะกลายเป็น homevisitor_raw
          reason_change:    this.changeForm.reason,
          hasNextApp:       this.changeForm.hasNextApp,
          nextTimeVisit:    this.changeForm.nextTimeVisit
        })

        this.showConfirmModal = false
        this.showChangeModal  = false
        this.$bvToast?.toast('เปลี่ยนผู้ดูแลเรียบร้อยแล้ว', {
          title: 'สำเร็จ', variant: 'success', solid: true
        })
        await this.fetchData()
      } catch (err) {
        console.error('doChange error:', err)
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
      } finally {
        this.saving = false
      }
    },

    resetChangeForm() {
      this.changeForm = {
        stid: '',
        childName: '',
        currentVisitor: '',
        currentVisitorName: '',
        newVisitor: '',
        newVisitorName: '',
        lastTimeVisit: null,
        lastVisitDate: null,
        hasNextApp: false,
        nextTimeVisit: null,
        nextVisitDate: null,
        reason: ''
      }
    }
  }
}
</script>

<style scoped>
.admin-change-visitor {
  padding: 1.5rem 2rem;
  font-family: 'Kanit', sans-serif;
}

/* Header */
.page-header {
  margin-bottom: 1.5rem;
}
.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #3551a4;
  margin: 0;
}
.page-subtitle {
  color: #6c757d;
  font-size: 1rem;
  margin: 0.25rem 0 0;
}

/* Filters */
.filters-section {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 220px;
}
.filter-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
}
.filter-select,
.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.4rem;
  font-size: 0.95rem;
  font-family: 'Kanit', sans-serif;
  background: #fff;
  color: #2c3e50;
  outline: none;
  transition: border-color 0.2s;
}
.filter-select:focus,
.filter-input:focus {
  border-color: #3551a4;
  box-shadow: 0 0 0 2px rgba(53, 81, 164, 0.15);
}
.w-100 { width: 100%; }

/* Table */
.table-container {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 1rem;
  overflow-x: auto;
}
::v-deep .admin-table thead th {
  background: #3551a4;
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  padding: 0.85rem 1rem;
}
::v-deep .admin-table tbody td {
  font-size: 0.9rem;
  vertical-align: middle;
  padding: 0.75rem 1rem;
  color: #2c3e50;
}
::v-deep .admin-table tbody tr:hover {
  background-color: #f0f4ff;
}

/* Child Info */
.child-info { line-height: 1.4; }
.child-name { font-weight: 600; }
.child-stid { font-size: 0.82rem; }

/* Visitor Info */
.visitor-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.visitor-icon {
  color: #3551a4;
  font-size: 1.2rem;
}

/* Badges */
.badge-has-data,
.badge-no-data {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
}
.badge-has-data {
  background: #d4edda;
  color: #155724;
}
.badge-no-data {
  background: #f8d7da;
  color: #721c24;
}

/* Visit Cells */
.visit-cells { display: flex; flex-direction: column; gap: 0.4rem; }
.last-visit, .next-visit { line-height: 1.4; }
.last-visit-date { font-size: 0.82rem; }
.visit-label {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: #dee2e6;
  color: #495057;
  margin-right: 0.3rem;
  text-transform: uppercase;
}
.visit-label.next {
  background: #cce5ff;
  color: #004085;
}

/* Button */
.btn-change {
  background: #3551a4;
  color: #fff;
  border: none;
  padding: 0.5rem 1.1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'Kanit', sans-serif;
  transition: background 0.2s;
}
.btn-change:hover {
  background: #2a3f82;
}

/* Skeleton */
.skeleton-row td { padding: 0.75rem 1rem; }
.skeleton-cell {
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.skeleton-text { height: 16px; width: 80%; }
.skeleton-text-short { height: 14px; width: 50%; margin-top: 4px; }
.skeleton-button { height: 32px; width: 100px; border-radius: 6px; }
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Modal Header */
::v-deep .modal-header-change {
  background: #3551a4;
  color: #fff;
  padding: 1rem 1.5rem;
}
::v-deep .modal-header-change .modal-title {
  color: #fff;
  font-weight: 700;
}
.modal-header-content { width: 100%; }
.modal-title { font-size: 1.1rem; margin: 0 0 0.4rem; }
.child-info-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.3rem;
}
.child-name-large {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}
.child-stid-badge {
  background: rgba(255,255,255,0.25);
  color: #fff;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.82rem;
}

/* Form */
.change-form { padding: 0.5rem 0; }
.form-section { margin-bottom: 1.25rem; }
.form-label {
  display: block;
  font-weight: 600;
  font-size: 0.92rem;
  color: #495057;
  margin-bottom: 0.4rem;
}
.required { color: #e74c3c; }

.current-visitor-display {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.4rem;
  padding: 0.6rem 0.9rem;
  font-size: 0.95rem;
  color: #2c3e50;
}
.current-visitor-display i {
  color: #6c757d;
  font-size: 1.2rem;
}
.username-badge {
  margin-left: auto;
  background: #e9ecef;
  color: #495057;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
}

/* Alert Info */
.alert-info-box {
  display: flex;
  gap: 0.75rem;
  background: #e8f4fd;
  border: 1px solid #bee5eb;
  border-radius: 0.5rem;
  padding: 0.85rem 1rem;
  color: #0c5460;
  font-size: 0.9rem;
}
.alert-info-box i {
  font-size: 1.2rem;
  color: #17a2b8;
  flex-shrink: 0;
  margin-top: 2px;
}
.alert-info-box p { margin: 0.2rem 0 0; }
.alert-info-box strong { font-weight: 700; }

/* Change Preview */
.change-preview {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 0.85rem 1rem;
  margin-top: 0.75rem;
}
.preview-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.preview-from,
.preview-to {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.preview-label {
  font-size: 0.78rem;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
}
.preview-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
}
.preview-name.highlight { color: #3551a4; }
.preview-arrow {
  color: #3551a4;
  font-size: 1.4rem;
}
.preview-note {
  margin-top: 0.6rem;
  font-size: 0.83rem;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* Textarea */
.form-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.4rem;
  font-size: 0.9rem;
  font-family: 'Kanit', sans-serif;
  resize: vertical;
  outline: none;
}
.form-textarea:focus {
  border-color: #3551a4;
  box-shadow: 0 0 0 2px rgba(53, 81, 164, 0.15);
}

/* Confirm Modal */
.confirm-body {
  text-align: center;
  padding: 1rem 0;
}
.confirm-icon {
  font-size: 3rem;
  color: #f39c12;
  margin-bottom: 1rem;
  display: block;
}
.confirm-body p {
  font-size: 1rem;
  color: #2c3e50;
}
.confirm-list {
  text-align: left;
  display: inline-block;
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: #495057;
}
.confirm-list li { margin-bottom: 0.3rem; }
.confirm-list code {
  background: #e9ecef;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  font-size: 0.85rem;
}
.alert-warning-box {
  display: flex;
  gap: 0.75rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 0.5rem;
  padding: 0.85rem 1rem;
  color: #856404;
  font-size: 0.9rem;
}
.alert-warning-box i {
  font-size: 1.2rem;
  color: #f39c12;
  flex-shrink: 0;
  margin-top: 2px;
}
.alert-warning-box p { margin: 0.2rem 0 0; }
.form-hint {
  color: #6c757d;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}
@media (max-width: 768px) {
  .admin-change-visitor { padding: 1rem; }
  .filters-section { flex-direction: column; }
  .filter-group { width: 100%; }
  .preview-row { flex-direction: column; align-items: flex-start; }
}
</style>