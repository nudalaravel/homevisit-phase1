<template>
  <div class="admin-payment-history">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">ประวัติการจ่ายเงิน</h1>
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
            <tr v-for="n in 6" :key="'skeleton-' + n" class="skeleton-row">
              <td><div class="skeleton-cell skeleton-text"></div></td>
              <td><div class="skeleton-cell skeleton-button"></div></td>
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
        <template #cell(paymentDate)="row">
          {{ row.item.paymentDate }}
        </template>

        <template #cell(amount)="row">
          <button class="btn-amount" @click="viewPaymentHistory(row.item)">
            {{ row.item.amount }}
          </button>
        </template>

        <template #cell(excel)="row">
          <button class="btn-excel" @click="downloadExcel(row.item)">
            <i class="fas fa-file-excel"></i>
            ดาวน์โหลด
          </button>
        </template>
      </b-table>
    </div>

    <!-- Payment History Modal -->
    <b-modal
      v-model="showPaymentHistoryModal"
      :title="paymentHistoryModalTitle"
      size="lg"
      @hidden="closePaymentHistoryModal"
      header-class="payment-history-modal-header"
      body-class="payment-history-modal-body"
    >
      <div v-if="paymentHistoryData" class="payment-history-table-container">
        <table class="payment-history-table">
          <thead>
            <tr>
              <th class="col-child-name">ชื่อนามสกุลเด็ก</th>
              <th class="col-visit-number">ครั้งที่เยี่ยม</th>
              <th class="col-visit-date">วันที่เยี่ยม</th>
              <th class="col-payment-status">สถานะการจ่าย</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in paymentHistoryData.records" :key="index">
              <td class="col-child-name">{{ record.childName }}</td>
              <td class="col-visit-number">{{ record.visitNumber }}</td>
              <td class="col-visit-date">{{ record.visitDate }}</td>
              <td class="col-payment-status">
                <i class="fas fa-check-circle text-success"></i>
              </td>
            </tr>
          </tbody>
        </table>
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
import { formatApiDate } from '~/utils/dateHelpers'
import { THAI_MONTHS_LONG, THAI_DAYS_SHORT, BUDDHIST_ERA_OFFSET } from '~/utils/constants'

export default {
  layout: 'admin',
  middleware: 'auth',
  data() {
    return {
      loading: true,
      tableFields: [
        {
          key: 'paymentDate',
          label: 'วันที่จ่ายเงิน',
          thClass: 'table-header'
        },
        {
          key: 'amount',
          label: 'ประวัติการจ่ายเงิน',
          thClass: 'table-header'
        },
        {
          key: 'excel',
          label: 'Excel',
          thClass: 'table-header'
        }
      ],
      tableData: [],
      // Payment History Modal
      showPaymentHistoryModal: false,
      paymentHistoryData: null
    }
  },
  computed: {
    paymentHistoryModalTitle() {
      if (!this.paymentHistoryData) return 'ประวัติการจ่ายเงิน'
      return `ประวัติการจ่าย ${this.paymentHistoryData.paymentDate}`
    }
  },
  async mounted() {
    await this.fetchTableData()
  },
  methods: {
    // ดึงข้อมูลจาก API
    async fetchTableData() {
      this.loading = true
      try {
        const response = await this.$axios.$get('/api/parenting2025_census/get/homevisit/admin/gethomevisitpayment_groupdate.php')
        
        const isSuccess = response.message === 'success' || response.statusCode === 200
        if (isSuccess && response.results) {
          this.tableData = response.results.map(item => ({
            paymentDate: this.formatApiDate(item.paymentDate),
            rawPaymentDate: item.paymentDate,
            submitDate: this.formatApiDate(item.submitDate),
            amount: item.summation || '0.00'
          }))
        } else {
          this.tableData = []
        }
      } catch (error) {
        console.error('Error fetching table data:', error)
        this.tableData = []
        this.$toast?.error('ไม่สามารถโหลดข้อมูลได้')
      } finally {
        this.loading = false
      }
    },
    
    formatApiDate,
    
    viewPaymentHistory(item) {
      // Mock data for payment history - should be replaced with actual data
      // Generate mock records based on the payment date
      const mockRecords = this.generateMockPaymentHistory(item.paymentDate)
      
      this.paymentHistoryData = {
        paymentDate: item.paymentDate,
        amount: item.amount,
        records: mockRecords
      }
      this.showPaymentHistoryModal = true
    },
    closePaymentHistoryModal() {
      this.showPaymentHistoryModal = false
      this.paymentHistoryData = null
    },
    generateMockPaymentHistory(paymentDate) {
      // Generate mock payment history records
      // In real implementation, this should fetch from API/IndexedDB
      const mockChildren = [
        { name: 'ธีธัช พ่อโคตร', visitNumbers: [117, 116, 115, 114, 113] },
        { name: 'ทิพากร บุญสอน', visitNumbers: [117, 116, 115] },
        { name: 'กฤติน วิไลลักษณ์', visitNumbers: [115, 114, 113] },
        { name: 'กัสฟิยา เอียดวารี', visitNumbers: [112, 111, 110] },
        { name: 'ชลกนก แกล้วกล้าหาญ', visitNumbers: [109, 108, 107] }
      ]
      
      const records = []
      
      // Generate records for each child
      mockChildren.forEach((child, childIndex) => {
        child.visitNumbers.forEach((visitNumber, index) => {
          // Calculate visit date (decreasing from payment date)
          // Each visit is approximately 6 days apart
          const daysBefore = (child.visitNumbers.length - index - 1) * 6 + childIndex
          const visitDate = this.calculateVisitDate(paymentDate, daysBefore)
          
          records.push({
            childName: child.name,
            visitNumber: visitNumber,
            visitDate: visitDate,
            paymentStatus: 'paid'
          })
        })
      })
      
      return records.sort((a, b) => {
        // Sort by child name, then by visit number descending
        if (a.childName !== b.childName) {
          return a.childName.localeCompare(b.childName, 'th')
        }
        return b.visitNumber - a.visitNumber
      })
    },
    calculateVisitDate(paymentDate, daysBefore) {
      // Parse payment date and subtract days
      const parts = paymentDate.split(' ')
      if (parts.length < 4) return paymentDate
      
      const day = parseInt(parts[1])
      const month = parts[2]
      const year = parts[3]
      
      // Find month number from shared constants
      const monthNum = THAI_MONTHS_LONG.indexOf(month) + 1
      if (monthNum === 0) return paymentDate
      
      // Convert BE year to CE year
      const ceYear = parseInt(year) - BUDDHIST_ERA_OFFSET
      
      // Create date object
      const paymentDateObj = new Date(ceYear, monthNum - 1, day)
      paymentDateObj.setDate(paymentDateObj.getDate() - daysBefore)
      
      // Get new date components
      const newDay = paymentDateObj.getDate()
      const newMonthNum = paymentDateObj.getMonth()
      const newYear = paymentDateObj.getFullYear() + BUDDHIST_ERA_OFFSET
      const newDayOfWeek = paymentDateObj.getDay()
      
      const newMonth = THAI_MONTHS_LONG[newMonthNum] || month
      const newDayAbbr = THAI_DAYS_SHORT[newDayOfWeek] || ''
      
      return `${newDayAbbr} ${newDay} ${newMonth} ${newYear}`
    },
    downloadExcel(item) {
      // TODO: Implement Excel download functionality
      this.$toast.info(`ดาวน์โหลด Excel: ${item.paymentDate}`)
    }
  }
}
</script>

<style scoped>
.admin-payment-history {
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
}

::v-deep .admin-table tbody td {
  padding: 1rem;
  vertical-align: middle;
  text-align: center;
}

.btn-amount {
  background-color: #3551a4;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-amount:hover {
  background-color: #2c4088;
}

.btn-excel {
  background-color: #009bd8;
  color: #fff;
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

.btn-excel:hover {
  background-color: #6bb6d6;
}

.btn-excel i {
  font-size: 1rem;
}

/* Payment History Modal Styles */


::v-deep .payment-history-modal-body {
  padding: 0;
  max-height: calc(100vh - 200px);
  overflow: hidden;
}

.payment-history-table-container {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  overflow-x: hidden;
}

.payment-history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.payment-history-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.payment-history-table th {
  background-color: #3551a4;
  color: white;
  font-weight: 500;
  padding: 1rem;
  text-align: center;
  border: none;
  white-space: nowrap;
}

.payment-history-table tbody tr {
  border-bottom: 1px solid #e9ecef;
}

.payment-history-table tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}

.payment-history-table tbody tr:nth-child(odd) {
  background-color: white;
}

.payment-history-table tbody tr:hover {
  background-color: #e9ecef;
}

.payment-history-table td {
  padding: 0.75rem 1rem;
  text-align: center;
  vertical-align: middle;
}

.col-child-name {
  text-align: left;
  min-width: 200px;
}

.col-visit-number {
  min-width: 100px;
}

.col-visit-date {
  min-width: 150px;
}

.col-payment-status {
  min-width: 120px;
}

.payment-history-table .text-success {
  color: #28a745;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .admin-payment-history {
    padding: 1rem;
  }

  .payment-history-table-container {
    max-height: calc(100vh - 250px);
  }

  .payment-history-table {
    font-size: 0.85rem;
  }

  .payment-history-table th,
  .payment-history-table td {
    padding: 0.5rem;
  }

  .col-child-name {
    min-width: 150px;
  }
}

/* Skeleton Loading: uses global styles from ~/assets/css/main.css */
</style>

