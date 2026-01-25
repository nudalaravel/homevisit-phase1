<template>
  <div class="admin-document">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">ตรวจสอบเอกสารจ่ายเงิน</h1>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="skeleton-table">
        <table class="document-table">
          <thead>
            <tr>
              <th rowspan="2" class="table-header">รหัส/ชื่อผู้เยี่ยมบ้าน</th>
              <th rowspan="2" class="table-header">งวด</th>
              <th rowspan="2" class="table-header">จำนวน</th>
              <th rowspan="2" class="table-header">วันที่จ่ายเงิน</th>
              <th colspan="2" class="table-header">ทีมจังหวัด</th>
              <th colspan="2" class="table-header">บัญชี</th>
            </tr>
            <tr>
              <th class="table-header sub-header">ใบสำคัญรับเงิน</th>
              <th class="table-header sub-header">สำเนาบัตรประชาชน</th>
              <th class="table-header sub-header">ใบสำคัญรับเงิน</th>
              <th class="table-header sub-header">สำเนาบัตรประชาชน</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in 5" :key="'skeleton-' + n" class="skeleton-row">
              <td><div class="skeleton-cell skeleton-text"></div></td>
              <td><div class="skeleton-cell skeleton-small"></div></td>
              <td><div class="skeleton-cell skeleton-small"></div></td>
              <td><div class="skeleton-cell skeleton-text"></div></td>
              <td><div class="skeleton-cell skeleton-checkbox"></div></td>
              <td><div class="skeleton-cell skeleton-checkbox"></div></td>
              <td><div class="skeleton-cell skeleton-checkbox"></div></td>
              <td><div class="skeleton-cell skeleton-checkbox"></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Actual Table -->
      <table v-else class="document-table">
        <thead>
          <tr>
            <th rowspan="2" class="table-header">รหัส/ชื่อผู้เยี่ยมบ้าน</th>
            <th rowspan="2" class="table-header">งวด</th>
            <th rowspan="2" class="table-header">จำนวน</th>
            <th rowspan="2" class="table-header">วันที่จ่ายเงิน</th>
            <th colspan="2" class="table-header">ทีมจังหวัด</th>
            <th colspan="2" class="table-header">บัญชี</th>
          </tr>
          <tr>
            <th class="table-header sub-header">ใบสำคัญรับเงิน</th>
            <th class="table-header sub-header">สำเนาบัตรประชาชน</th>
            <th class="table-header sub-header">ใบสำคัญรับเงิน</th>
            <th class="table-header sub-header">สำเนาบัตรประชาชน</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="tableData.length === 0">
            <td colspan="8" class="text-center text-muted">ไม่พบข้อมูล</td>
          </tr>
          <tr v-for="(item, index) in tableData" :key="item.no || index">
            <td>{{ item.visitorName }}</td>
            <td class="text-center">{{ item.installment }}</td>
            <td class="text-center">{{ item.amount }}</td>
            <td class="text-center">{{ item.paymentDate }}</td>
            <td class="text-center">
              <i v-if="item.provincialTeam.receipt" class="fas fa-check-circle text-success"></i>
              <span v-else>-</span>
            </td>
            <td class="text-center">
              <i v-if="item.provincialTeam.idCard" class="fas fa-check-circle text-success"></i>
              <span v-else>-</span>
            </td>
            <td class="text-center">
              <input
                type="checkbox"
                :checked="item.account.receipt"
                @change="toggleAccountReceipt(item, $event)"
              />
            </td>
            <td class="text-center">
              <input
                type="checkbox"
                :checked="item.account.idCard"
                @change="toggleAccountIdCard(item, $event)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'admin',
  middleware: 'auth',
  data() {
    return {
      loading: true,
      tableData: []
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
        const response = await this.$axios.$get('/api/parenting2025_census/get/homevisit/gethomevisitpayment.php')
        
        const isSuccess = response.message === 'success' || response.statusCode === 200
        if (isSuccess && response.results) {
          this.tableData = response.results.map(item => ({
            no: item.no,
            visitorName: item.VendorName || '-',
            installment: item.transfIns || '-',
            amount: item.Amount || '0.00',
            paymentDate: this.formatApiDate(item.paymentDate),
            provincialTeam: {
              receipt: item.doc1 === '1',
              idCard: item.doc2 === '1'
            },
            account: {
              receipt: item.doc1_app === '1',
              idCard: item.doc2_app === '1'
            },
            // เก็บข้อมูลดิบไว้
            rawData: item
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
    
    // แปลงวันที่จาก API format (YYYY-MM-DD) เป็น Thai format
    formatApiDate(dateStr) {
      if (!dateStr) return '-'
      try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return dateStr
        
        const thaiMonths = [
          'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
          'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ]
        const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
        
        const day = date.getDate()
        const monthName = thaiMonths[date.getMonth()]
        const year = date.getFullYear() + 543
        const dayName = thaiDays[date.getDay()]
        
        return `${dayName} ${day.toString().padStart(2, '0')} ${monthName} ${year}`
      } catch (e) {
        return dateStr
      }
    },
    
    // Toggle ใบสำคัญรับเงิน - บัญชี (doc1_app)
    async toggleAccountReceipt(item, event) {
      const newValue = event.target.checked
      const originalValue = item.account.receipt
      
      // อัพเดท UI ก่อน
      item.account.receipt = newValue
      
      try {
        // สร้าง datetime ปัจจุบันในรูปแบบ MySQL
        const now = new Date()
        const dateStr = now.toISOString().slice(0, 19).replace('T', ' ')
        
        // ดึง username จาก $offlineAuth หรือ $store
        const username = this.$offlineAuth?.getUser?.()?.username || this.$store?.state?.auth?.user?.username || 'unknown'
        
        const payload = {
          variable: ['doc1_app', 'doc1_app_by', 'doc1_app_date'],
          value: [newValue ? '1' : '0', newValue ? username : null, newValue ? dateStr : null],
          pk: ['no'],
          pkval: [String(item.no)],
          tb: 'homevisitor_payment'
        }
        
        await this.$axios.$put(
          '/api/parenting2025_census/put/homevisit/putdata.php',
          payload
        )
        
        this.$toast.success(
          `${newValue ? 'ยืนยัน' : 'ยกเลิก'}ใบสำคัญรับเงิน (บัญชี): ${item.visitorName} งวด ${item.installment}`
        )
      } catch (error) {
        console.error('Error updating doc1_app:', error)
        // Revert UI
        item.account.receipt = originalValue
        event.target.checked = originalValue
        this.$toast.error('เกิดข้อผิดพลาดในการบันทึก')
      }
    },
    
    // Toggle สำเนาบัตรประชาชน - บัญชี (doc2_app)
    async toggleAccountIdCard(item, event) {
      const newValue = event.target.checked
      const originalValue = item.account.idCard
      
      // อัพเดท UI ก่อน
      item.account.idCard = newValue
      
      try {
        // สร้าง datetime ปัจจุบันในรูปแบบ MySQL
        const now = new Date()
        const dateStr = now.toISOString().slice(0, 19).replace('T', ' ')
        
        // ดึง username จาก $offlineAuth หรือ $store
        const username = this.$offlineAuth?.getUser?.()?.username || this.$store?.state?.auth?.user?.username || 'unknown'
        
        const payload = {
          variable: ['doc2_app', 'doc2_app_by', 'doc2_app_date'],
          value: [newValue ? '1' : '0', newValue ? username : null, newValue ? dateStr : null],
          pk: ['no'],
          pkval: [String(item.no)],
          tb: 'homevisitor_payment'
        }
        
        await this.$axios.$put(
          '/api/parenting2025_census/put/homevisit/putdata.php',
          payload
        )
        
        this.$toast.success(
          `${newValue ? 'ยืนยัน' : 'ยกเลิก'}สำเนาบัตรประชาชน (บัญชี): ${item.visitorName} งวด ${item.installment}`
        )
      } catch (error) {
        console.error('Error updating doc2_app:', error)
        // Revert UI
        item.account.idCard = originalValue
        event.target.checked = originalValue
        this.$toast.error('เกิดข้อผิดพลาดในการบันทึก')
      }
    }
  }
}
</script>

<style scoped>
.admin-document {
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
  overflow-x: auto;
}

.document-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.document-table .table-header {
  background-color: #3551a4;
  color: white;
  font-weight: 500;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  border: 1px solid #2a4082;
}

.document-table .sub-header {
  background-color: #4a67b8;
  padding: 0.75rem;
  font-size: 0.85rem;
}

.document-table tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}

.document-table tbody tr:hover {
  background-color: #e9ecef;
}

.document-table tbody td {
  padding: 1rem;
  vertical-align: middle;
  text-align: left;
  border: 1px solid #dee2e6;
}

.document-table tbody td.text-center {
  text-align: center;
}

.document-table .text-success {
  color: #28a745;
  font-size: 1.2rem;
}

.document-table .text-muted {
  color: #6c757d;
  font-style: italic;
}

.document-table input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

/* Skeleton Loading */
.skeleton-row {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-cell {
  background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
  height: 20px;
}

.skeleton-text {
  width: 80%;
}

.skeleton-small {
  width: 50px;
  margin: 0 auto;
}

.skeleton-checkbox {
  width: 20px;
  height: 20px;
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

@media (max-width: 768px) {
  .admin-document {
    padding: 1rem;
  }

  .table-container {
    overflow-x: scroll;
  }

  .document-table {
    min-width: 800px;
  }
}
</style>
