<template>
  <div class="visit-audit">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">ตรวจสอบความถูกต้อง (month/time)</h1>
          <p class="page-subtitle">ตรวจสอบความถูกต้องของข้อมูลการคำนวณในระบบเยี่ยมบ้าน</p>
        </div>
        <span class="badge-admin">
          <i class="fas fa-lock"></i> เฉพาะผู้ได้รับสิทธิ์
        </span>
      </div>

      <!-- Stats -->
      <div class="stats">
        <div class="stat total">
          <div class="stat-num">{{ allRows.length || '—' }}</div>
          <div class="stat-label">รายการทั้งหมด</div>
        </div>
        <div class="stat ok">
          <div class="stat-num">{{ stats.ok }}</div>
          <div class="stat-label">ถูกต้อง</div>
        </div>
        <div class="stat warn">
          <div class="stat-num">{{ stats.warn }}</div>
          <div class="stat-label">ต่างเล็กน้อย</div>
        </div>
        <div class="stat err">
          <div class="stat-num">{{ stats.err }}</div>
          <div class="stat-label">ผิดพลาด</div>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls">
        <div class="filter-group">
          <span class="filter-label">STATUS:</span>
          <select v-model="filterStatus">
            <option value="all">ทั้งหมด</option>
            <option value="ok">ถูกต้อง</option>
            <option value="warn">ต่างเล็กน้อย</option>
            <option value="err">ผิดพลาด</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">ผล survey:</span>
          <select v-model="filterSurvey">
            <option value="all">ทั้งหมด</option>
            <option value="has">มีข้อมูลแล้ว</option>
            <option value="none">ยังไม่มี</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">approve:</span>
          <select v-model="filterApprove">
            <option value="all">ทั้งหมด</option>
            <option value="approved">อนุมัติ</option>
            <option value="wait">รอแก้ไข</option>
            <option value="rejected">แจ้งแก้ไข</option>
            <option value="none">ยังไม่มี</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">payment:</span>
          <select v-model="filterPayment">
            <option value="all">ทั้งหมด</option>
            <option value="paid">จ่ายแล้ว</option>
            <option value="unpaid">ยังไม่จ่าย</option>
            <option value="none">ยังไม่มี</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">ค้นหา:</span>
          <input v-model="search" type="text" placeholder="ชื่อเด็ก / stid / รหัสผยบ…" style="width:220px" />
        </div>
        <button class="btn secondary" @click="resetFilters">↺ รีเซ็ต</button>
        <button class="btn secondary" style="margin-left:auto" @click="exportCSV">⬇ Export CSV</button>
      </div>

      <!-- Table -->
      <div class="table-container">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          รอโหลดข้อมูล...
        </div>
        <template v-else>
          <div v-if="!filteredRows.length" class="empty">ไม่พบข้อมูลที่ตรงเงื่อนไข</div>
          <table v-else>
            <thead>
              <tr>
                <th>ชื่อ / stid</th>
                <th>วันเกิด</th>
                <th>วันนัด (ที่บันทึก)</th>
                <th>time_visit</th>
                <th>ผล survey</th>
                <th>approve</th>
                <th>payment</th>
                <th>บันทึก (month/time)</th>
                <th>คำนวณได้ (month/time)</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(r, i) in filteredRows">
                <tr :key="'row-' + i">
                  <td>
                    <div class="name">{{ r.name }}</div>
                    <div class="stid">{{ r.stid }}</div>
                  </td>
                  <td class="mono">{{ formatBirth(r) }}</td>
                  <td class="mono">{{ r.appointmentDate }}</td>
                  <td class="mono" style="text-align:center">{{ r.time_visit }}</td>
                  <!-- ผล survey -->
                  <td style="text-align:center">
                    <span v-if="r.recStart" class="pill ok"><span class="dot"></span>มีข้อมูล</span>
                    <span v-else class="pill warn"><span class="dot"></span>ยังไม่มี</span>
                    <div v-if="r.visitor" class="stid" style="margin-top:.3rem">{{ r.visitor }}</div>
                  </td>
                  <!-- approve_status -->
                  <td style="text-align:center">
                    <span v-if="Number(r.approve_status) === 1" class="pill ok"><span class="dot"></span>อนุมัติ</span>
                    <span v-else-if="Number(r.approve_status) === -1" class="pill warn"><span class="dot"></span>รอแก้ไข</span>
                    <span v-else-if="Number(r.approve_status) === -2" class="pill err"><span class="dot"></span>แจ้งแก้ไข</span>
                    <span v-else-if="r.approve_status === null && r.recStart" class="pill warn"><span class="dot"></span>ยังไม่ตรวจ</span>
                    <span v-else class="pill" style="background:#f0f0f0;color:#aaa;border-color:#ddd"><span class="dot"></span>-</span>
                  </td>
                  <!-- payment_status -->
                  <td style="text-align:center">
                    <span v-if="Number(r.payment_status) === 1" class="pill ok"><span class="dot"></span>จ่ายแล้ว</span>
                    <span v-else-if="r.approve_status && !r.payment_status && r.recStart" class="pill warn"><span class="dot"></span>ยังไม่จ่าย</span>
                    <span v-else class="pill" style="background:#f0f0f0;color:#aaa;border-color:#ddd"><span class="dot"></span>-</span>
                  </td>
                  <td>
                    <div class="diff">
                      <div class="diff-row">
                        <span class="diff-label">month</span>
                        <span class="val-stored">{{ r.month_age_stored }}</span>
                      </div>
                      <div class="diff-row">
                        <span class="diff-label">time</span>
                        <span class="val-stored">{{ r.time_stored }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="diff">
                      <div class="diff-row">
                        <span class="diff-label">month</span>
                        <span :class="['val-calc', r.monthMatch ? 'match' : 'mismatch']">{{ r.calcMonth }}</span>
                        <template v-if="!r.monthMatch">
                          <span class="arrow">←</span>
                          <span style="color:var(--err);font-family:var(--mono);font-size:.72rem">ควรเป็น {{ r.calcMonth }}</span>
                        </template>
                      </div>
                      <div class="diff-row">
                        <span class="diff-label">time</span>
                        <span :class="['val-calc', r.timeMatch ? 'match' : 'mismatch']">{{ r.calcTime }}</span>
                        <template v-if="!r.timeMatch">
                          <span class="arrow">←</span>
                          <span style="color:var(--err);font-family:var(--mono);font-size:.72rem">ควรเป็น {{ r.calcTime }}</span>
                        </template>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span :class="['pill', r.status]">
                      <span class="dot"></span>
                      {{ pillText(r.status) }}
                    </span>
                  </td>
                  <td>
                    <button class="expand-btn" @click="toggleDetail(i)">
                      {{ expandedRows[i] ? '▾ ซ่อน' : '▸ ดูรายละเอียด' }}
                    </button>
                  </td>
                </tr>
                <!-- Detail row -->
                <tr v-if="expandedRows[i]" :key="'detail-' + i" class="detail-row">
                  <td colspan="8">
                    <div class="detail-grid">
                      <div class="detail-card">
                        <h4>ข้อมูลเด็ก</h4>
                        <div class="detail-item"><span class="dk">stid</span><span class="dv">{{ r.stid }}</span></div>
                        <div class="detail-item"><span class="dk">วันเกิด</span><span class="dv">{{ r.day_birth }}/{{ r.month_birth }}/{{ r.year_birth }}</span></div>
                        <div class="detail-item"><span class="dk">วันนัด</span><span class="dv">{{ r.appointmentDate }}</span></div>
                        <div class="detail-item"><span class="dk">date_visit</span><span class="dv">{{ r.date_visit || '-' }}</span></div>
                        <div class="detail-item"><span class="dk">recStart</span><span class="dv">{{ r.recStart || '-' }}</span></div>
                        <div class="detail-item"><span class="dk">time_visit</span><span class="dv">{{ r.time_visit }}</span></div>
                      </div>
                      <div class="detail-card">
                        <h4>ข้อมูล prev (existingBooking)</h4>
                        <template v-if="r.prev">
                          <div class="detail-item"><span class="dk">appointmentDate</span><span class="dv">{{ r.prev.appointmentDate }}</span></div>
                          <div class="detail-item"><span class="dk">month_age</span><span class="dv">{{ r.prev.month_age }}</span></div>
                          <div class="detail-item"><span class="dk">time</span><span class="dv">{{ r.prev.time }}</span></div>
                          <div class="detail-item"><span class="dk">ห่างกัน</span><span class="dv">{{ daysText(r) }}</span></div>
                        </template>
                        <div v-else style="color:var(--muted);font-size:.8rem">ครั้งแรก — ไม่มี prev</div>
                      </div>
                      <div class="detail-card">
                        <h4>ผลการตรวจสอบ</h4>
                        <div class="detail-item">
                          <span class="dk">บันทึก month</span>
                          <span class="dv" :style="{ color: r.monthMatch ? '#155724' : '#721c24' }">{{ r.month_age_stored }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="dk">คำนวณ month</span>
                          <span class="dv" :style="{ color: r.monthMatch ? '#155724' : '#721c24' }">{{ r.calcMonth }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="dk">บันทึก time</span>
                          <span class="dv" :style="{ color: r.timeMatch ? '#155724' : '#721c24' }">{{ r.time_stored }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="dk">คำนวณ time</span>
                          <span class="dv" :style="{ color: r.timeMatch ? '#155724' : '#721c24' }">{{ r.calcTime }}</span>
                        </div>
                        <div v-if="r.note" class="note">💡 {{ r.note }}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </template>
      </div>

  </div>
</template>

<script>
const MAX_AGE_MONTHS = 48
const MAX_VISIT_TIME = 4
const DAYS_THRESHOLD = 21

function calculateMonthAgeAndTime(birthMonth, birthYear, birthDay, selectedDate, existingBooking = null) {
  const by = parseInt(birthYear) - 543
  const bm = parseInt(birthMonth)
  const bd = parseInt(birthDay) || 1
  const sy = selectedDate.getFullYear()
  const sm = selectedDate.getMonth() + 1
  const sd = selectedDate.getDate()

  let monthAge = (sy - by) * 12 + (sm - bm)
  if (sd < bd) monthAge--
  monthAge = Math.max(0, Math.min(monthAge, MAX_AGE_MONTHS))

  let timeActivity = 1

  if (existingBooking && existingBooking.appointmentDate) {
    const last = new Date(existingBooking.appointmentDate)
    const days = Math.floor((selectedDate - last) / 86400000)

    if (days > DAYS_THRESHOLD) {
      timeActivity = 1
    } else if (days >= 0) {
      if (existingBooking.time === MAX_VISIT_TIME) {
        timeActivity = 1
        monthAge = Math.min((existingBooking.month_age || 0) + 1, MAX_AGE_MONTHS)
      } else {
        monthAge = existingBooking.month_age || monthAge
        timeActivity = Math.min((existingBooking.time || 0) + 1, MAX_VISIT_TIME)
      }
    } else {
      monthAge = existingBooking.month_age || monthAge
      timeActivity = existingBooking.time || 1
    }
  }

  return { monthAge, timeActivity }
}

function daysBetween(d1, d2) {
  return Math.floor((new Date(d2) - new Date(d1)) / 86400000)
}

function auditRow(rec) {
  const selectedDate = new Date(rec.appointmentDate)
  const existingBooking = rec.prev ? {
    appointmentDate: new Date(rec.prev.appointmentDate),
    month_age: rec.prev.month_age,
    time: rec.prev.time
  } : null

  const { monthAge: calcMonth, timeActivity: calcTime } = calculateMonthAgeAndTime(
    rec.month_birth, rec.year_birth, rec.day_birth,
    selectedDate, existingBooking
  )

  const monthMatch = calcMonth === rec.month_age_stored
  const timeMatch  = calcTime  === rec.time_stored
  const ok = monthMatch && timeMatch

  let status = 'ok'
  if (!ok) {
    const diff = Math.abs(calcMonth - rec.month_age_stored) + Math.abs(calcTime - rec.time_stored)
    status = diff <= 1 ? 'warn' : 'err'
  }

  let note = ''
  if (!ok && existingBooking) {
    const days = daysBetween(rec.prev.appointmentDate, rec.appointmentDate)
    note = days > DAYS_THRESHOLD
      ? `ห่างกัน ${days} วัน (> 21) → reset time=1, คำนวณ month_age จากวันเกิด`
      : `ห่างกัน ${days} วัน (≤ 21) → time+1 จาก prev.time=${rec.prev.time}`
  } else if (!ok && !existingBooking) {
    note = 'ครั้งแรก existingBooking=null → month_age จากวันเกิด, time=1'
  }

  return { ...rec, calcMonth, calcTime, monthMatch, timeMatch, status, note }
}

// ─── Cascade: ผลครั้งที่ N → prev ของครั้งที่ N+1 ────────────────────────────
// ไม่ใช้ time_stored/month_age_stored จาก DB เป็น prev
// เพราะถ้าครั้งก่อนผิด จะทำให้ครั้งถัดไปผิดตามด้วย
function auditRowsCascade(records) {
  const grouped = {}
  records.forEach(r => {
    if (!grouped[r.stid]) grouped[r.stid] = []
    grouped[r.stid].push(r)
  })

  const result = []
  Object.values(grouped).forEach(visits => {
    let prevCalculated = null  // ← ค่าที่คำนวณถูก ส่งต่อเป็น prev ครั้งถัดไป

    visits.forEach(rec => {
      // override prev ด้วยผลที่คำนวณถูกต้องจากครั้งก่อน
      const recWithPrev = prevCalculated
        ? { ...rec, prev: prevCalculated }
        : rec

      const audited = auditRow(recWithPrev)
      result.push(audited)

      // อัปเดต prevCalculated ด้วยผลที่คำนวณถูกต้อง
      if (rec.appointmentDate) {
        prevCalculated = {
          appointmentDate: rec.appointmentDate,  // date_visit ของครั้งนี้
          month_age: audited.calcMonth,           // ← ค่าที่คำนวณถูก
          time: audited.calcTime,                 // ← ค่าที่คำนวณถูก
        }
      }
    })
  })
  return result
}

function getMockData() {
  return [
    {
      stid: 'ST001', name: 'ด.ช.ณัฐนนท์ สมบูรณ์',
      day_birth: 8, month_birth: 9, year_birth: 2567,
      appointmentDate: '2026-04-08',
      date_visit: '2026-04-08', recStart: '2026-04-08 09:00:00',
      month_age_stored: 19, time_stored: 1, time_visit: 1,
      prev: null
    },
    {
      stid: 'ST001', name: 'ด.ช.ณัฐนนท์ สมบูรณ์',
      day_birth: 8, month_birth: 9, year_birth: 2567,
      appointmentDate: '2026-05-01',
      date_visit: '2026-05-01', recStart: '2026-05-01 10:15:00',
      month_age_stored: 19, time_stored: 2, time_visit: 2,
      prev: { appointmentDate: '2026-04-08', month_age: 19, time: 1 }
    },
    {
      stid: 'ST002', name: 'ด.ญ.พิมพ์ลภัส วงศ์ดี',
      day_birth: 11, month_birth: 12, year_birth: 2567,
      appointmentDate: '2026-04-16',
      date_visit: '2026-04-16', recStart: '2026-04-16 08:30:00',
      month_age_stored: 16, time_stored: 1, time_visit: 1,
      prev: null
    },
    {
      stid: 'ST002', name: 'ด.ญ.พิมพ์ลภัส วงศ์ดี',
      day_birth: 11, month_birth: 12, year_birth: 2567,
      appointmentDate: '2026-04-30',
      date_visit: '2026-04-30', recStart: '2026-04-30 09:45:00',
      month_age_stored: 16, time_stored: 2, time_visit: 2,
      prev: { appointmentDate: '2026-04-16', month_age: 16, time: 1 }
    },
    {
      stid: 'ST003', name: 'ด.ช.ภูวนัตถ์ แก้วมณี',
      day_birth: 4, month_birth: 8, year_birth: 2567,
      appointmentDate: '2026-03-24',
      date_visit: '2026-03-24', recStart: '2026-03-24 10:00:00',
      month_age_stored: 19, time_stored: 1, time_visit: 1,
      prev: null
    },
    {
      stid: 'ST003', name: 'ด.ช.ภูวนัตถ์ แก้วมณี',
      day_birth: 4, month_birth: 8, year_birth: 2567,
      appointmentDate: '2026-04-11',
      date_visit: '2026-04-11', recStart: '2026-04-11 11:20:00',
      month_age_stored: 19, time_stored: 3, time_visit: 2, // ← ผิด ควรเป็น 2
      prev: { appointmentDate: '2026-03-24', month_age: 19, time: 1 }
    },
    {
      stid: 'ST004', name: 'ด.ญ.กัญญาณัฐ ทองดี',
      day_birth: 15, month_birth: 3, year_birth: 2567,
      appointmentDate: '2026-04-20',
      date_visit: '2026-04-20', recStart: '2026-04-20 08:00:00',
      month_age_stored: 13, time_stored: 1, time_visit: 1,
      prev: null
    },
    {
      stid: 'ST004', name: 'ด.ญ.กัญญาณัฐ ทองดี',
      day_birth: 15, month_birth: 3, year_birth: 2567,
      appointmentDate: '2026-05-05',
      date_visit: '2026-05-05', recStart: '2026-05-05 09:30:00',
      month_age_stored: 14, time_stored: 1, time_visit: 2,
      prev: { appointmentDate: '2026-04-20', month_age: 13, time: 1 }
    },
    {
      stid: 'ST005', name: 'ด.ช.ปัณณทัต รุ่งเรือง',
      day_birth: 20, month_birth: 6, year_birth: 2566,
      appointmentDate: '2026-04-25',
      date_visit: '2026-04-25', recStart: '2026-04-25 10:00:00',
      month_age_stored: 22, time_stored: 4, time_visit: 4,
      prev: { appointmentDate: '2026-04-10', month_age: 22, time: 3 }
    },
    {
      stid: 'ST005', name: 'ด.ช.ปัณณทัต รุ่งเรือง',
      day_birth: 20, month_birth: 6, year_birth: 2566,
      appointmentDate: '2026-05-03',
      date_visit: '2026-05-03', recStart: '2026-05-03 08:45:00',
      month_age_stored: 22, time_stored: 1, time_visit: 5,
      prev: { appointmentDate: '2026-04-25', month_age: 22, time: 4 }
    },
  ]
}

export default {
  layout: 'admin',
  middleware: 'auth',
  name: 'VisitAudit',

  data() {
    return {
      DEV: false,  // ← true = mock data | false = เรียก API จริง
      API_ENDPOINT: '/api/parenting2025_census/get/homevisit/admin/audit_visit.php',
      loading: false,
      allRows: [],
      filterStatus: 'all',
      filterSurvey: 'all',
      filterApprove: 'all',
      filterPayment: 'all',
      search: '',
      expandedRows: {},
    }
  },

  computed: {
    stats() {
      return {
        ok:   this.allRows.filter(r => r.status === 'ok').length,
        warn: this.allRows.filter(r => r.status === 'warn').length,
        err:  this.allRows.filter(r => r.status === 'err').length,
      }
    },
    filteredRows() {
      const q = this.search.toLowerCase()
      return this.allRows.filter(r => {
        const matchStatus = this.filterStatus === 'all' || r.status === this.filterStatus
        const matchSurvey = this.filterSurvey === 'all'
          || (this.filterSurvey === 'has'  &&  r.recStart)
          || (this.filterSurvey === 'none' && !r.recStart)

        const matchApprove = this.filterApprove === 'all'
          || (this.filterApprove === 'approved' && r.approve_status === 1)
          || (this.filterApprove === 'wait'     && r.approve_status === -1)
          || (this.filterApprove === 'rejected' && r.approve_status !== null && r.approve_status !== 1 && r.approve_status !== -1)
          || (this.filterApprove === 'none'     && r.approve_status === null)

        const matchPayment = this.filterPayment === 'all'
          || (this.filterPayment === 'paid'   && r.payment_status === 1)
          || (this.filterPayment === 'unpaid' && r.payment_status !== null && r.payment_status !== 1)
          || (this.filterPayment === 'none'   && r.payment_status === null)

        const matchSearch = !q
          || r.name.toLowerCase().includes(q)
          || r.stid.toLowerCase().includes(q)
          || (r.visitor && r.visitor.toLowerCase().includes(q))

        return matchStatus && matchSurvey && matchApprove && matchPayment && matchSearch
      })
    }
  },

  mounted() {
    this.DEV ? this.loadMockData() : this.loadFromAPI()
  },

  methods: {
    resetFilters() {
      this.filterStatus  = 'all'
      this.filterSurvey  = 'all'
      this.filterApprove = 'all'
      this.filterPayment = 'all'
      this.search        = ''
    },

    loadMockData() {
      this.loading = true
      this.expandedRows = {}
      setTimeout(() => {
        this.allRows = auditRowsCascade(getMockData())
        this.loading = false
      }, 400)
    },

    async loadFromAPI() {
      this.loading = true
      this.expandedRows = {}
      try {
        const res = await this.$axios.$get(this.API_ENDPOINT)
        this.allRows = auditRowsCascade(res.records || res)
      } catch (e) {
        alert('โหลด API ไม่สำเร็จ: ' + (e.message || e))
      } finally {
        this.loading = false
      }
    },

    toggleDetail(i) {
      this.$set(this.expandedRows, i, !this.expandedRows[i])
    },

    pillText(status) {
      return status === 'ok' ? '✓ ถูกต้อง' : status === 'warn' ? '⚠ ต่างเล็กน้อย' : '✕ ผิดพลาด'
    },

    formatBirth(r) {
      return `${String(r.day_birth).padStart(2,'0')}/${String(r.month_birth).padStart(2,'0')}/${r.year_birth}`
    },

    daysText(r) {
      if (!r.prev) return 'ครั้งแรก'
      const days = daysBetween(r.prev.appointmentDate, r.appointmentDate)
      return `${days} วัน ${days > 21 ? '(> 21 → reset)' : '(≤ 21 → ต่อเนื่อง)'}`
    },

    exportCSV() {
      if (!this.allRows.length) { alert('ยังไม่มีข้อมูล'); return }
      const headers = ['stid','ชื่อ','วันเกิด','วันนัด','time_visit','month_บันทึก','time_บันทึก','month_คำนวณ','time_คำนวณ','สถานะ','หมายเหตุ']
      const rows = this.allRows.map(r => [
        r.stid, r.name,
        `${r.day_birth}/${r.month_birth}/${r.year_birth}`,
        r.appointmentDate, r.time_visit,
        r.month_age_stored, r.time_stored,
        r.calcMonth, r.calcTime,
        r.status, r.note || ''
      ])
      const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
      const a = document.createElement('a')
      a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv)
      a.download = `visit-audit-${new Date().toISOString().slice(0,10)}.csv`
      a.click()
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&display=swap');

/* ─── Page ─────────────────────────────────── */
.visit-audit {
  padding: 1.5rem 2rem;
  font-family: 'Kanit', sans-serif;
}

/* ─── Header ────────────────────────────────── */
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
.badge-admin {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
}

/* ─── Filters / Config ──────────────────────── */
.filters-section {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: flex-end;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 200px;
}
.filter-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
}
.filter-group input[type=text],
.filter-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.4rem;
  font-size: 0.95rem;
  font-family: 'Kanit', sans-serif;
  background: #fff;
  color: #2c3e50;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.filter-group input[type=text]:focus,
.filter-group select:focus {
  border-color: #3551a4;
  box-shadow: 0 0 0 2px rgba(53,81,164,0.15);
}
.filter-group input[type=text]::placeholder { color: #adb5bd; }

/* ─── Buttons ───────────────────────────────── */
.btn {
  background: #3551a4;
  color: #fff;
  border: none;
  font-family: 'Kanit', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 1.1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn:hover { background: #2a3f82; }
.btn.secondary {
  background: #fff;
  color: #495057;
  border: 1px solid #ced4da;
}
.btn.secondary:hover { background: #f8f9fa; border-color: #3551a4; color: #3551a4; }
.tag-mock {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  margin-left: 0.25rem;
}

/* ─── Stats ─────────────────────────────────── */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 0.75rem;
  padding: 1.1rem 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.stat::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
}
.stat.total::before { background: #3551a4; }
.stat.ok::before    { background: #28a745; }
.stat.warn::before  { background: #ffc107; }
.stat.err::before   { background: #dc3545; }
.stat-num {
  font-size: 2rem;
  font-weight: 600;
  line-height: 1;
}
.stat.total .stat-num { color: #3551a4; }
.stat.ok .stat-num    { color: #28a745; }
.stat.warn .stat-num  { color: #856404; }
.stat.err .stat-num   { color: #dc3545; }
.stat-label { font-size: 0.85rem; color: #6c757d; margin-top: 0.4rem; }

/* ─── Controls ──────────────────────────────── */
.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
}
.controls .filter-group { flex-direction: row; align-items: center; gap: 0.5rem; min-width: unset; }
.controls .filter-label { font-size: 0.85rem; white-space: nowrap; margin-bottom: 0; }
.controls select,
.controls input[type=text] {
  padding: 0.4rem 0.7rem;
  border: 1px solid #ced4da;
  border-radius: 0.4rem;
  font-size: 0.9rem;
  font-family: 'Kanit', sans-serif;
  background: #fff;
  color: #2c3e50;
  outline: none;
  transition: border-color 0.2s;
}
.controls select:focus,
.controls input[type=text]:focus { border-color: #3551a4; }

/* ─── Table ─────────────────────────────────── */
.table-container {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 1rem;
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
thead tr { background: #3551a4; }
th {
  font-size: 0.88rem;
  font-weight: 600;
  color: #fff;
  padding: 0.85rem 1rem;
  text-align: left;
  border: none;
  white-space: nowrap;
}
td {
  font-size: 0.9rem;
  vertical-align: middle;
  padding: 0.75rem 1rem;
  color: #2c3e50;
  border-bottom: 1px solid #f0f0f0;
}
tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: #f0f4ff; }

.name { font-weight: 600; color: #2c3e50; }
.stid { font-size: 0.78rem; color: #6c757d; }
.mono { font-family: 'Courier New', monospace; font-size: 0.85rem; }

/* ─── Diff ──────────────────────────────────── */
.diff { display: flex; flex-direction: column; gap: 0.2rem; }
.diff-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
.diff-label { color: #6c757d; width: 3.5rem; font-size: 0.8rem; }
.val-stored { color: #2c3e50; }
.val-calc.match   { color: #28a745; font-weight: 600; }
.val-calc.mismatch { color: #dc3545; font-weight: 700; }
.arrow { color: #adb5bd; }

/* ─── Pill / Badge ──────────────────────────── */
.pill {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: 0.8rem; font-weight: 600;
  padding: 0.3rem 0.7rem; border-radius: 999px;
}
.pill.ok   { background: #d4edda; color: #155724; }
.pill.warn { background: #fff3cd; color: #856404; }
.pill.err  { background: #f8d7da; color: #721c24; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

/* ─── Expand button ─────────────────────────── */
.expand-btn {
  background: none;
  border: 1px solid #ced4da;
  color: #6c757d;
  font-family: 'Kanit', sans-serif;
  font-size: 0.8rem;
  padding: 0.3rem 0.65rem;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: all 0.15s;
}
.expand-btn:hover { border-color: #3551a4; color: #3551a4; background: #f0f4ff; }

/* ─── Detail row ────────────────────────────── */
.detail-row td { background: #f8f9fa; padding: 1rem 1.5rem; }
.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.detail-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.detail-card h4 {
  font-size: 0.78rem;
  font-weight: 700;
  color: #3551a4;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #e9ecef;
}
.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
}
.detail-item .dk { color: #6c757d; }
.detail-item .dv { font-family: 'Courier New', monospace; color: #2c3e50; font-size: 0.82rem; }
.note {
  font-size: 0.82rem;
  color: #856404;
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #fff3cd;
  border-radius: 0.4rem;
  border-left: 3px solid #ffc107;
}

/* ─── Loading / Empty ───────────────────────── */
.loading {
  text-align: center;
  padding: 4rem;
  color: #6c757d;
  font-size: 0.9rem;
}
.spinner {
  width: 32px; height: 32px;
  border: 3px solid #e9ecef;
  border-top-color: #3551a4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  font-size: 0.9rem;
}

/* ─── Skeleton ──────────────────────────────── */
.skeleton-cell {
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.skeleton-text { height: 16px; width: 70%; }
.skeleton-text-short { height: 14px; width: 40%; margin-top: 4px; }
.skeleton-button { height: 32px; width: 100px; border-radius: 6px; }
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ─── Responsive ────────────────────────────── */
@media (max-width: 768px) {
  .visit-audit { padding: 1rem; }
  .stats { grid-template-columns: repeat(2, 1fr); }
  .detail-grid { grid-template-columns: 1fr; }
  .filters-section { flex-direction: column; }
}
</style>