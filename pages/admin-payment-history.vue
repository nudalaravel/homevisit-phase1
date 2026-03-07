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
        <!-- Loading -->
        <div v-if="paymentHistoryData.loading" class="text-center py-4">
          <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
          <p class="mt-2">กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="!paymentHistoryData.records || paymentHistoryData.records.length === 0" class="text-center py-4">
          <p>ไม่พบข้อมูลประวัติการจ่ายเงิน</p>
        </div>

        <!-- Table -->
        <table v-else class="payment-history-table">
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
    
    async viewPaymentHistory(item) {
      this.showPaymentHistoryModal = true
      this.paymentHistoryData = {
        paymentDate: item.paymentDate,
        amount: item.amount,
        records: [],
        loading: true
      }

      try {
        const paymentDate = item.rawPaymentDate || item.paymentDate
        const response = await this.$axios.$get(
          '/api/parenting2025_census/get/homevisit/admin/gethomevisitpayment_history.php',
          { params: { paymentDate } }
        )

        const isSuccess = response.message === 'success' || response.statusCode === 200
        if (isSuccess && response.results && response.results.length > 0) {
          this.paymentHistoryData.records = response.results.map(record => ({
            childName: `${record.fname_ch || ''} ${record.lname_ch || ''}`.trim() || '-',
            visitNumber: record.time_visit || '-',
            visitDate: record.payment_date ? this.formatApiDate(record.payment_date) : '-',
            paymentStatus: record.payment_status || '-'
          }))
        } else {
          this.paymentHistoryData.records = []
        }
      } catch (error) {
        console.error('Error fetching payment history:', error)
        this.$toast?.error('ไม่สามารถโหลดประวัติการจ่ายเงินได้')
        this.paymentHistoryData.records = []
      } finally {
        this.paymentHistoryData.loading = false
      }
    },
    closePaymentHistoryModal() {
      this.showPaymentHistoryModal = false
      this.paymentHistoryData = null
    },
    async downloadExcel(item) {
      try {
        const paymentDate = item.rawPaymentDate || item.paymentDate
        const response = await this.$axios({
          method: 'GET',
          url: '/api/parenting2025_census/get/homevisit/admin/getpayment_history.php',
          params: { paymentDate,mode: 'excel' },
          responseType: 'blob'
        })

        const blob = new Blob([response.data], {
          type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `payment_history_${paymentDate}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading Excel:', error)
        this.$toast?.error('ไม่สามารถดาวน์โหลดไฟล์ได้')
      }
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

