<template>
  <div class="admin-payment">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">การจ่ายเงิน</h1>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <!-- Skeleton Loading -->
      <div v-if="loading" class="skeleton-table">
        <table class="admin-table-skeleton">
          <thead>
            <tr>
              <th v-for="field in tableFields" :key="field.key" class="table-header">{{ field.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in 5" :key="'skeleton-' + n" class="skeleton-row">
              <td><div class="skeleton-cell skeleton-text"></div></td>
              <td><div class="skeleton-cell skeleton-small"></div></td>
              <td><div class="skeleton-cell skeleton-small"></div></td>
              <td><div class="skeleton-cell skeleton-text"></div></td>
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
        <template #cell(visitorName)="row">
          {{ row.item.visitorName }}
        </template>

        <template #cell(installment)="row">
          {{ row.item.installment }}
        </template>

        <template #cell(amount)="row">
          {{ row.item.amount }}
        </template>

        <template #cell(previousDocs)="row">
          <div class="previous-docs-cell" :class="{ 'has-docs': row.item.hasPreviousDocs }">
            <i v-if="row.item.hasPreviousDocs" class="fas fa-check-circle text-success"></i>
            <span v-if="row.item.hasPreviousDocs">เอกสารครบ</span>
            <span v-else>-</span>
          </div>
        </template>
      </b-table>
      <!-- Summary Row -->
      <div class="summary-row-wrapper">
        <div class="summary-row">
          <div class="summary-cell"></div>
          <div class="summary-cell summary-label">จำนวนรวม</div>
          <div class="summary-cell summary-amount">{{ totalAmount }}</div>
          <div class="summary-cell"></div>
        </div>
      </div>
    </div>

    <!-- Date Selection Section -->
    <div class="date-selection-section text-center">
      <label class="date-label">วันที่จ่าย (วันที่เงินเข้าบัญชีผู้รับ)</label>
      <div class="date-dropdowns text-center">
        <select
          v-model="paymentDate.day"
          class="date-select"
        >
          <option value="">-เลือกวันที่-</option>
          <option
            v-for="day in dayOptions"
            :key="day"
            :value="day"
          >
            {{ day }}
          </option>
        </select>
        <select
          v-model="paymentDate.month"
          class="date-select"
        >
          <option value="">-เลือกเดือน-</option>
          <option
            v-for="(month, index) in monthOptions"
            :key="index"
            :value="index + 1"
          >
            {{ month }}
          </option>
        </select>
        <select
          v-model="paymentDate.year"
          class="date-select"
        >
          <option value="">-เลือกปี-</option>
          <option
            v-for="year in yearOptions"
            :key="year"
            :value="year"
          >
            {{ year }}
          </option>
        </select>
      </div>
      <div v-if="dateError" class="date-error">
        กรุณาระบุวันที่จ่าย
      </div>
    </div>

    <!-- Action Button -->
    <div class="action-section text-center">
      <button class="btn-save-export" @click="handleSaveAndExport">
        บันทึกและส่งออก
      </button>
    </div>

  
  </div>
</template>

<script>
export default {
  layout: 'admin',
  middleware: 'auth',
  data() {
    return {
      loading: false,
      tableFields: [
        {
          key: 'visitorName',
          label: 'ชื่อผู้เยี่ยมบ้าน',
          thClass: 'table-header'
        },
        {
          key: 'installment',
          label: 'งวด',
          thClass: 'table-header'
        },
        {
          key: 'amount',
          label: 'จำนวนเงิน',
          thClass: 'table-header'
        },
        {
          key: 'previousDocs',
          label: 'เอกสารงวดที่แล้ว',
          thClass: 'table-header previous-docs-header'
        }
      ],
      tableData: [
        {
          visitorName: 'น.ส.ลีเยาะ กาลาแต',
          installment: 12,
          amount: '50.00',
          hasPreviousDocs: true
        }
      ],
      paymentDate: {
        day: '',
        month: '',
        year: ''
      },
      monthOptions: [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ],
      yearOptions: Array.from({ length: 10 }, (_, i) => 2567 + i),
      dateError: false
    }
  },
  computed: {
    totalAmount() {
      return this.tableData.reduce((sum, item) => {
        return sum + parseFloat(item.amount || 0)
      }, 0).toFixed(2)
    },
    dayOptions() {
      if (!this.paymentDate.month || !this.paymentDate.year) {
        return Array.from({ length: 31 }, (_, i) => i + 1)
      }
      
      const daysInMonth = this.getDaysInMonth(
        parseInt(this.paymentDate.month),
        parseInt(this.paymentDate.year)
      )
      
      return Array.from({ length: daysInMonth }, (_, i) => i + 1)
    }
  },
  watch: {
    'paymentDate.month'() {
      this.adjustDayIfNeeded()
    },
    'paymentDate.year'() {
      this.adjustDayIfNeeded()
    }
  },
  methods: {
    // Convert Buddhist Era (BE) to Common Era (CE)
    beToCe(beYear) {
      return beYear - 543
    },
    // Check if year is leap year
    isLeapYear(year) {
      const ceYear = this.beToCe(year)
      return (ceYear % 4 === 0 && ceYear % 100 !== 0) || (ceYear % 400 === 0)
    },
    // Get number of days in a month
    getDaysInMonth(month, year) {
      if (!month || !year) {
        return 31
      }
      
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      
      // February - check for leap year
      if (month === 2) {
        return this.isLeapYear(year) ? 29 : 28
      }
      
      return daysInMonth[month - 1]
    },
    // Adjust day if it exceeds days in selected month
    adjustDayIfNeeded() {
      if (!this.paymentDate.day || !this.paymentDate.month || !this.paymentDate.year) {
        return
      }
      
      const selectedDay = parseInt(this.paymentDate.day)
      const maxDays = this.getDaysInMonth(
        parseInt(this.paymentDate.month),
        parseInt(this.paymentDate.year)
      )
      
      if (selectedDay > maxDays) {
        this.paymentDate.day = maxDays.toString()
      }
    },
    handleSaveAndExport() {
      // Validate date
      if (!this.paymentDate.day || !this.paymentDate.month || !this.paymentDate.year) {
        this.dateError = true
        this.$toast.error('กรุณาระบุวันที่จ่าย')
        return
      }

      this.dateError = false
      // TODO: Implement save and export functionality
      this.$toast.success('บันทึกและส่งออกข้อมูลสำเร็จ')
    }
  }
}
</script>

<style scoped>
.admin-payment {
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
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

::v-deep .admin-table .previous-docs-header {
  background-color: #3551a4;
}

::v-deep .admin-table tbody tr {
  border-bottom: 1px solid #e9ecef;
}

::v-deep .admin-table tbody tr:hover {
  background-color: #f8f9fa;
}

::v-deep .admin-table tbody td {
  padding: 1rem;
  vertical-align: middle;
  text-align: center;
}


.previous-docs-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.previous-docs-cell.has-docs {
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.previous-docs-cell .text-success {
  color: #28a745;
  font-size: 1.2rem;
}

.date-selection-section {
  margin-bottom: 2rem;
}

.date-label {
  display: block;
  font-weight: 500;
  color: #495057;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.date-dropdowns {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  justify-content: center;
}

.date-select {
  min-width: 120px;
  min-height: 40px;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
}

.date-select:focus {
  border-color: #3551a4;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(53, 81, 164, 0.25);
}

.date-error {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.action-section {
  margin-bottom: 1rem;
}

.btn-save-export {
  background-color: #3551a4;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-save-export:hover {
  background-color: #2c4088;
}

.info-text {
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 500;
  margin-top: 2rem;
}

.summary-row-wrapper {
  border-top: 2px solid #e9ecef;
  background-color: #f8f9fa;
}

.summary-row {
  display: flex;
  width: 100%;
}

.summary-cell {
  flex: 1;
  padding: 1rem;
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid #e9ecef;
}

.summary-label {
  font-weight: 500;
  color: #2c3e50;
}

.summary-amount {
  font-weight: 600;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .admin-payment {
    padding: 1rem;
  }

  .date-dropdowns {
    flex-direction: column;
  }

  .date-select {
    width: 100%;
  }
}

/* Skeleton Loading */
.skeleton-table {
  width: 100%;
}

.admin-table-skeleton {
  width: 100%;
  border-collapse: collapse;
}

.admin-table-skeleton th {
  background-color: #3551a4;
  color: white;
  font-weight: 500;
  text-align: center;
  padding: 1rem;
  border: none;
}

.skeleton-row {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-row td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

.skeleton-cell {
  background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
  height: 20px;
}

.skeleton-text {
  width: 150px;
  margin: 0 auto;
}

.skeleton-small {
  width: 60px;
  margin: 0 auto;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>

