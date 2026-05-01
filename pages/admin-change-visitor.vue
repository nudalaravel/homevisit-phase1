<template>
  <div class="admin-change-visitor">
    <!-- Page Header -->
    <div class="page-header" style="display:flex; align-items:center; gap:0.75rem;">
      <h1 class="page-title" style="margin:0;">เปลี่ยนผู้ดูแลเด็ก</h1>
      <span class="badge-no-data">
        <i class="fas fa-lock"></i> เฉพาะผู้ได้รับสิทธิ์
      </span>
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
        <label class="filter-label">ผู้เยี่ยมบ้าน</label>
        <div style="display:flex; gap:0.5rem; align-items:center;">
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
          <!-- ปุ่มแสดงเมื่อเลือก ผยบ แล้ว -->
          <button
            v-if="filters.visitor && filters.visitor !== 'all'"
            class="btn-check"
            @click="openEditVisitorModal"
            title="ข้อมูลผู้เยี่ยมบ้าน"
          >
            <i class="fas fa-user-edit"></i>
          </button>
        </div>
      </div>
      <!-- ปุ่มชิดขวาสุด -->
      <div class="filter-group" style="justify-content:flex-end; margin-left:auto;">
        <label class="filter-label">&nbsp;</label>
        <button class="btn-add-visitor" @click="openAddVisitorModal">
          <i class="fas fa-user-plus"></i>
          เพิ่มผู้เยี่ยมบ้านใหม่
        </button>
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
            <div v-if="row.item.lastTimeVisit">
              <span class="visit-label">ล่าสุด</span>ครั้งที่ {{ row.item.lastTimeVisit }} ({{ row.item.lastVisitDate }})
            </div>
            <span v-else class="text-muted small">ยังไม่มีผลการเยี่ยม</span>
            <div v-if="row.item.hasNextApp">
              <span class="visit-label next">ถัดไป</span>ครั้งที่ {{ row.item.nextTimeVisit }} ({{ row.item.nextVisitDate }})
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
              <p>ครั้งล่าสุด เปลี่ยนโดย: <strong>{{ changeForm.prevUpdatedBy }}</strong> เมื่อ {{ changeForm.prevUpdatedAt }}</p>
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
              <p>ระบบจะเปลี่ยน <code>รหัสผู้เยี่ยมบ้าน</code> ในนัดหมายครั้งนี้ด้วย</p>
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
            class="filter-select w-100 select2"
            ref="newVisitorSelect"
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
        <p>
          ยืนยันเปลี่ยนผู้ดูแล <strong>{{ changeForm.childName }}</strong> เป็น<br />
          <strong class="text-new">{{ changeForm.newVisitorName }}</strong> ใช่หรือไม่?
        </p>
        <!-- รายละเอียดเล็กๆ สำหรับ dev -->
        <div class="confirm-detail">
          <span>homevisitor_sample_students: homevisitor → {{ changeForm.newVisitor }}</span>
          <span v-if="changeForm.hasNextApp">
            homevisitor_app: ครั้งที่ {{ changeForm.nextTimeVisit }} → recby = {{ changeForm.newVisitor }}
          </span>
        </div>
      </div>
      <!-- dry_run preview -->
      <div v-if="dryRunResult" class="dryrun-preview">
        <p class="dryrun-title"><i class="fas fa-eye"></i> ตัวอย่างข้อมูลที่จะเปลี่ยน</p>
        <table class="dryrun-table">
          <tr>
            <td>ตาราง</td>
            <td>homevisitor_sample_students</td>
          </tr>
          <tr>
            <td>homevisitor (เดิม)</td>
            <td>{{ dryRunResult.old_homevisitor }}</td>
          </tr>
          <tr>
            <td>homevisitor (ใหม่)</td>
            <td class="text-new">{{ dryRunResult.new_homevisitor }}</td>
          </tr>
          <tr>
            <td>homevisitor_raw</td>
            <td>{{ dryRunResult.homevisitor_raw }}</td>
          </tr>
          <tr v-if="dryRunResult.app_updated">
            <td>homevisitor_app ครั้งที่</td>
            <td class="text-new">{{ dryRunResult.app_time_visit }} → recby = {{ dryRunResult.new_homevisitor }}</td>
          </tr>
          <tr v-else>
            <td>homevisitor_app</td>
            <td class="text-muted">ไม่มีนัดหมายถัดไป</td>
          </tr>
        </table>
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

    <!-- Add Visitor Modal -->
    <b-modal
      id="addVisitorModal"
      v-model="showAddVisitorModal"
      title="เพิ่มผู้เยี่ยมบ้านใหม่"
      size="lg"
      no-close-on-backdrop
      @hidden="resetAddVisitorForm"
      header-class="modal-header-change"
      no-enforce-focus
    >
      <template #modal-header>
        <div class="modal-header-content">
          <h5 class="modal-title">
            {{ addForm.mode === 'edit' ? 'แก้ไขข้อมูลผู้เยี่ยมบ้าน' : 'เพิ่มผู้เยี่ยมบ้านใหม่' }}
          </h5>
          <p style="color:rgba(255,255,255,0.8); font-size:0.85rem; margin:0.25rem 0 0;">
            ข้อมูลจะถูกบันทึกลง spa.user_sup และ spa.username_login
          </p>
        </div>
      </template>

      <div class="change-form">
        <!-- Step 1: กรอกเบอร์โทรก่อน -->
        <div v-if="addForm.mode !== 'edit'" class="form-section">
          <label class="form-label">เบอร์โทร (username/password) <span class="required">*</span></label>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <input
              v-model="addForm.tel"
              type="text"
              class="filter-input w-100"
              placeholder="0812345678"
              maxlength="10"
            />
            <i v-if="checkingUsername" class="fas fa-spinner fa-spin" style="color:#3551a4; font-size:1.2rem;"></i>
            <i v-else-if="addForm.checkResult && !addForm.checkResult.exists" class="fas fa-check-circle" style="color:#27ae60; font-size:1.2rem;"></i>
            <i v-else-if="addForm.checkResult && addForm.checkResult.exists" class="fas fa-times-circle" style="color:#e74c3c; font-size:1.2rem;"></i>
          </div>
          <small v-if="!addForm.tel" class="form-hint">กรอกเบอร์โทรก่อน เพื่อตรวจสอบสิทธิ์</small>
          <small v-else-if="addForm.tel.length < 9" class="form-hint">กรอกเบอร์ให้ครบ</small>
          <small v-else-if="checkingUsername" class="form-hint">กำลังตรวจสอบ...</small>
          <small v-else-if="addForm.checkResult && addForm.checkResult.exists" class="form-hint" style="color:#e74c3c;">มี username นี้ในระบบแล้ว ไม่สามารถเพิ่มได้</small>
          <small v-else-if="addForm.checkResult && !addForm.checkResult.exists" class="form-hint" style="color:#27ae60;">✓ username นี้ยังไม่มีในระบบ กรอกข้อมูลต่อได้เลย</small>
        </div>
        <!-- ตอน edit แสดง username แบบ readonly -->
        <div v-if="addForm.mode === 'edit'" class="form-section">
          <label class="form-label">username</label>
          <input :value="addForm.username" class="filter-input w-100" readonly style="background:#f8f9fa; color:#6c757d;" />
        </div>

        <!-- Step 2: ฟอร์มส่วนที่เหลือ แสดงเมื่อผ่านการเช็คแล้ว -->
        <template v-if="addForm.mode === 'edit' || (addForm.checkResult && !addForm.checkResult.exists)">

          <!-- ข้อมูลส่วนตัว -->
          <div class="form-section-title">ข้อมูลส่วนตัว</div>

          <div class="form-row-2">
            <div class="form-section">
              <label class="form-label">คำนำหน้า</label>
              <select v-model="addForm.prefix" class="filter-select w-100">
                <option value="">-- เลือก --</option>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>
            <div class="form-section">
              <label class="form-label">เลขบัตรประชาชน (PID)</label>
              <input v-model="addForm.PID" type="text" class="filter-input w-100" maxlength="13" placeholder="13 หลัก" />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-section">
              <label class="form-label">ชื่อ <span class="required">*</span></label>
              <input v-model="addForm.fname" type="text" class="filter-input w-100" placeholder="ชื่อ" />
            </div>
            <div class="form-section">
              <label class="form-label">นามสกุล <span class="required">*</span></label>
              <input v-model="addForm.lname" type="text" class="filter-input w-100" placeholder="นามสกุล" />
            </div>
          </div>

          <div class="form-section">
            <label class="form-label">อีเมล</label>
            <input v-model="addForm.Email" type="email" class="filter-input w-100" placeholder="example@email.com" />
          </div>

          <div class="form-section">
            <label class="form-label">ที่อยู่</label>
            <textarea v-model="addForm.Address" class="form-textarea" rows="2" placeholder="ที่อยู่..."></textarea>
          </div>

          <!-- ข้อมูลบัญชีธนาคาร -->
          <div class="form-section-title">ข้อมูลบัญชีธนาคาร</div>

          <div class="form-row-2">
            <div class="form-section">
              <label class="form-label">ธนาคาร</label>
              <select v-model="addForm.accBank" class="filter-select w-100 select2" ref="accBankSelect">
                <option value="">-- เลือกธนาคาร --</option>
                <option v-for="(b, i) in bankList" :key="'bank-'+i" :value="b.name">
                  {{ b.fnameT }}
                </option>
              </select>
            </div>
            <div class="form-section">
              <label class="form-label">รหัสสาขา (accCode)</label>
              <input v-model="addForm.accCode" type="text" class="filter-input w-100" placeholder="รหัสสาขา" />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-section">
              <label class="form-label">เลขบัญชี (accNumber)</label>
              <input v-model="addForm.accNumber" type="text" class="filter-input w-100" placeholder="เลขบัญชี" />
            </div>
            <div class="form-section">
              <label class="form-label">ชื่อบัญชี (accName)</label>
              <input v-model="addForm.accName" type="text" class="filter-input w-100" placeholder="ชื่อบัญชี" />
            </div>
          </div>

          <!-- fixed values -->
          <div class="form-section">
            <div class="fixed-values-box">
              <span><i class="fas fa-lock"></i> level = <strong>staff</strong></span>
              <span><i class="fas fa-lock"></i> activehv2026 = <strong>1</strong></span>
              <span><i class="fas fa-lock"></i> projectid = <strong>15</strong></span>
              <span><i class="fas fa-lock"></i> level_input = <strong>1</strong></span>
            </div>
          </div>

        </template>

      </div>

      <template #modal-footer>
        <b-button variant="secondary" @click="showAddVisitorModal = false">
          <i class="fas fa-times"></i> ยกเลิก
        </b-button>
        <b-button variant="success" @click="doAddVisitor" :disabled="!canSubmitAdd || savingAdd">
          <i v-if="savingAdd" class="fas fa-spinner fa-spin"></i>
          <i v-else :class="addForm.mode === 'edit' ? 'fas fa-save' : 'fas fa-user-plus'"></i>
          {{ savingAdd ? 'กำลังบันทึก...' : addForm.mode === 'edit' ? 'บันทึกการแก้ไข' : 'เพิ่มผู้เยี่ยมบ้าน' }}
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
      dryRunResult: null,
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
      dataAll: [],
      showAddVisitorModal: false,
      checkingUsername: false,
      savingAdd: false,
      bankList: [],
      addForm: {
        username: '',
        password: '',
        prefix: '',
        fname: '',
        lname: '',
        tel: '',
        Email: '',
        PID: '',
        Address: '',
        accBank: '',
        accCode: '',
        accNumber: '',
        accName: '',
        checkResult: null
      }
    }
  },
  beforeDestroy() {
    if (this.$select2 && this.$refs.visitorSelect && window.$) {
      window.$(this.$refs.visitorSelect).off('change')
      this.$select2.destroy(this.$refs.visitorSelect)
    }
    if (this.$refs.newVisitorSelect && window.$) {
      window.$(this.$refs.newVisitorSelect).off('change')
      this.$select2.destroy(this.$refs.newVisitorSelect)
    }
  },
  async mounted() {
    await this.fetchData()

    this.$nextTick(() => {
      if (this.$select2 && this.$refs.visitorSelect) {
        this.$select2.init(this.$refs.visitorSelect)
        window.$(this.$refs.visitorSelect).on('change', () => {
          const newVal = window.$(this.$refs.visitorSelect).val()
          if (this.filters.visitor !== newVal) {
            this.filters.visitor = newVal
            this.filterTableData()
          }
        })
      }
    })
  },
  watch: {
    'addForm.tel'(val) {
      this.addForm.checkResult = null
      clearTimeout(this._telTimer)
      if (val && val.length >= 9) {
        this._telTimer = setTimeout(() => {
          this.checkUsername()  // เช็คอัตโนมัติหลังหยุดพิมพ์ 600ms
        }, 600)
      }
    }
  },
  computed: {
    canSubmitAdd() {
      if (this.addForm.mode === 'edit') {
        return this.addForm.fname && this.addForm.lname
      }
      return (
        this.addForm.fname &&
        this.addForm.lname &&
        this.addForm.tel &&
        this.addForm.checkResult &&
        !this.addForm.checkResult.exists
      )
    }
  },
  methods: {
    initNewVisitorSelect2() {
      this.$nextTick(() => {
        if (this.$select2 && this.$refs.newVisitorSelect) {
          this.$select2.init(this.$refs.newVisitorSelect)
          window.$(this.$refs.newVisitorSelect).on('change', () => {
            const newVal = window.$(this.$refs.newVisitorSelect).val()
            this.changeForm.newVisitor = newVal
            this.onNewVisitorChange()
          })
        }
      })
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
            updated_by: link.updated_by,
            updated_at: link.updated_at,
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
        prevUpdatedBy:    item.updated_by   ?? '-',
        prevUpdatedAt:    item.updated_at   ?? '-',
        newVisitor: '',
        newVisitorName: '',
        lastTimeVisit: item.lastTimeVisit,
        lastVisitDate: item.lastVisitDate,
        hasNextApp: item.hasNextApp,
        nextTimeVisit: item.nextTimeVisit,
        nextVisitDate: item.nextVisitDate,
        reason: item.reason_change ?? ''
      }
      this.showChangeModal = true
      this.initNewVisitorSelect2() // ← เพิ่มตรงนี้
    },

    onNewVisitorChange() {
      const found = this.visitorListForChange.find(v => v.value === this.changeForm.newVisitor)
      this.changeForm.newVisitorName = found ? found.text : ''
    },

    async confirmChange() {
      if (!this.changeForm.newVisitor || this.changeForm.newVisitor === this.changeForm.currentVisitor) return
      
      // dry_run ดูผลก่อน
      /*
      try {
        const res = await this.$axios.$post('/api/parenting2025_census/post/homevisit/admin_change_homevisitor.php', {
          dry_run:       true,
          stid:          this.changeForm.stid,
          newVisitor:    this.changeForm.newVisitor,
          oldVisitor:    this.changeForm.currentVisitor,
          reason_change: this.changeForm.reason,
          hasNextApp:    this.changeForm.hasNextApp,
          nextTimeVisit: this.changeForm.nextTimeVisit
        })
        
        // เก็บผล dry_run ไว้แสดงใน confirm modal
        this.dryRunResult = res.preview ?? null
      } catch (err) {
        console.error(err)
      }
      */
      
      this.showConfirmModal = true
    },
    async doChange() {
      this.saving = true
      try {
        await this.$axios.$post('/api/parenting2025_census/post/homevisit/admin_change_homevisitor.php', {
          dry_run:          false,
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

    // ===== ADD VISITOR =====
    openAddVisitorModal() {
      this.resetAddVisitorForm()
      // โหลด bankList ถ้ายังไม่มี
      if (this.bankList.length === 0) this.fetchBankList()
      this.showAddVisitorModal = true

      setTimeout(() => {
        if (this.$select2 && this.$refs.accBankSelect) {
          try { this.$select2.destroy(this.$refs.accBankSelect) } catch (e) {}
          this.$select2.init(this.$refs.accBankSelect)
          window.$(this.$refs.accBankSelect).on('change', () => {
            this.addForm.accBank = window.$(this.$refs.accBankSelect).val()
          })
        }
      }, 300)
    },

     async fetchBankList() {
      try {
        const res = await this.$axios.$get('/api/parenting2025_census/get/homevisit/admin/getbanklist.php')
        if (res.results) this.bankList = res.results
      } catch (err) {
        console.error('fetchBankList error:', err)
      }
    },
 
    async checkUsername() {
      if (!this.addForm.tel) return
      this.checkingUsername = true
      this.addForm.checkResult = null
      try {
        const res = await this.$axios.$post('/api/parenting2025_census/post/homevisit/admin_add_visitor.php', {
          action: 'check',
          username: this.addForm.tel
        })
        this.addForm.checkResult = { exists: res.exists }
      } catch (err) {
        console.error('checkUsername error:', err)
      } finally {
        this.checkingUsername = false
      }
    },

    async doAddVisitor() {
      if (!this.canSubmitAdd) return
      this.savingAdd = true
      try {
        console.log(this.addForm)
        const action = this.addForm.mode === 'edit' ? 'edit' : 'insert'
        const res = await this.$axios.$post('/api/parenting2025_census/post/homevisit/admin_add_visitor.php', {
          action,
          prefix:     this.addForm.prefix,
          fname:      this.addForm.fname,
          lname:      this.addForm.lname,
          tel:        this.addForm.tel,
          Email:      this.addForm.Email,
          PID:        this.addForm.PID,
          Address:    this.addForm.Address,
          accBank:    this.addForm.accBank,
          accCode:    this.addForm.accCode,
          accNumber:  this.addForm.accNumber,
          accName:    this.addForm.accName,
          // insert only
          username:   this.addForm.tel,
          password:   this.addForm.tel,
          level:      'staff',
          activehv2026: '1',
          projectid:  '15',
          level_input: '1'
        })
        // console.log(res)
        if (res.message === 'success') {
          this.showAddVisitorModal = false
          this.$bvToast?.toast(
            this.addForm.mode === 'edit'
              ? `แก้ไขข้อมูล ${this.addForm.fname} เรียบร้อยแล้ว`
              : `เพิ่มผู้เยี่ยมบ้าน ${this.addForm.fname} เรียบร้อยแล้ว`,
            { title: 'สำเร็จ', variant: 'success', solid: true }
          )
          // this.$bvToast?.toast(`เพิ่มผู้เยี่ยมบ้าน ${this.addForm.fname} ${this.addForm.lname} เรียบร้อยแล้ว`, {
          //   title: 'สำเร็จ', variant: 'success', solid: true
          // })
          // refresh visitor list
          await this.fetchVisitorOptions()
          // ถ้า edit อยู่ ให้ reset filter แล้ว filterTableData ใหม่
          if (this.addForm.mode === 'edit') {
            await this.fetchData()  // โหลดตารางเด็กใหม่ด้วย เผื่อชื่อ ผยบ เปลี่ยน
          }

        } else {
          alert(res.message || 'เกิดข้อผิดพลาด')
        }
      } catch (err) {
        console.error('doAddVisitor error:', err)
        console.error('response:', err.response?.data)
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
      } finally {
        this.savingAdd = false
      }
    },

    async openEditVisitorModal() {
      if (!this.filters.visitor || this.filters.visitor === 'all') return
      try {
        const res = await this.$axios.$get(
          `/api/parenting2025_census/get/homevisit/getuser.php?username=${this.filters.visitor}`
        )
        const user = res.results?.[0] ?? {}
        const fname = user.fname ?? ''
        const prefixList = ['นาย', 'นางสาว', 'นาง']
        let extractedPrefix = ''
        let extractedFname = fname

        for (const p of prefixList) {
          if (fname.startsWith(p)) {
            extractedPrefix = p
            extractedFname = fname.slice(p.length)
            break
          }
        }
        this.addForm = {
          mode:      'edit',
          username:  user.username  ?? '',
          prefix:    extractedPrefix,   // ← แยกออกมา
          fname:     extractedFname,    // ← เหลือแค่ชื่อ
          lname:     user.lname     ?? '',
          tel:       user.tel       ?? '',
          Email:     user.Email     ?? '',
          PID:       user.PID       ?? '',
          Address:   user.Address   ?? '',
          accBank:   user.accBank   ?? '',
          accCode:   user.accCode   ?? '',
          accNumber: user.accNumber ?? '',
          accName:   user.accName   ?? '',
          checkResult: { exists: false } // ข้าม step เช็ค
        }
        this.showAddVisitorModal = true
      } catch (err) {
        console.error('openEditVisitorModal error:', err)
      }
    },

    resetAddVisitorForm() {
      this.addForm = {
        username: '',
        password: '',
        prefix: '',
        fname: '',
        lname: '',
        tel: '',
        Email: '',
        PID: '',
        Address: '',
        accBank: '',
        accCode: '',
        accNumber: '',
        accName: '',
        checkResult: null
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
    },

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

.dryrun-preview {
  margin-top: 1rem;
  text-align: left;
}
.dryrun-title {
  font-weight: 600;
  color: #3551a4;
  margin-bottom: 0.5rem;
}
.dryrun-table {
  width: 100%;
  font-size: 0.88rem;
  border-collapse: collapse;
}
.dryrun-table td {
  padding: 0.4rem 0.6rem;
  border: 1px solid #dee2e6;
}
.dryrun-table td:first-child {
  font-weight: 600;
  color: #495057;
  width: 45%;
  background: #f8f9fa;
}
.text-new { color: #155724; font-weight: 700; }
.confirm-icon {
  font-size: 2.5rem;
  color: #3551a4;
  margin-bottom: 0.75rem;
  display: block;
  text-align: center;
}
.confirm-body p {
  font-size: 1rem;
  text-align: center;
}
.text-new { color: #3551a4; }
.confirm-detail {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #f8f9fa;
  border-radius: 0.4rem;
  font-size: 0.75rem;
  color: #6c757d;
  text-align: left;
}
.visit-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.visit-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.visit-separator {
  color: #dee2e6;
  font-size: 1rem;
}

/* Add Visitor Button */
.btn-add-visitor {
  background: #27ae60;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Kanit', sans-serif;
  white-space: nowrap;
}
.btn-add-visitor:hover { background: #219a52; }
 
/* Check button */
.btn-check {
  background: #3551a4;
  color: #fff;
  border: none;
  padding: 0.5rem 0.85rem;
  border-radius: 0.4rem;
  font-size: 0.88rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: 'Kanit', sans-serif;
  white-space: nowrap;
}
.btn-check:disabled { opacity: 0.6; cursor: not-allowed; }
 
@media (max-width: 768px) {
  .admin-change-visitor { padding: 1rem; }
  .filters-section { flex-direction: column; }
  .filter-group { width: 100%; }
  .preview-row { flex-direction: column; align-items: flex-start; }
}
</style>