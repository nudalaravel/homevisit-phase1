<template>
  <div class="admin-receipt">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">ใบสำคัญรับเงิน</h1>
    </div>

    <!-- Filters -->
    <!-- <div class="filters-section">
      <div class="filter-group">
        <label class="filter-label">ทีม</label>
        <select
          v-model="filters.team"
          class="filter-select select2"
          ref="teamSelect"
        >
          <option
            v-for="option in teamOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.text }}
          </option>
        </select>
      </div>
    </div> -->

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
              <td><div class="skeleton-cell skeleton-small"></div></td>
              <td><div class="skeleton-cell skeleton-small"></div></td>
              <td><div class="skeleton-cell skeleton-text"></div></td>
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
        <template #cell(visitorName)="row">
          {{ row.item.visitorName }}
        </template>

        <template #cell(installment)="row">
          {{ row.item.installment }}
        </template>

        <template #cell(amount)="row">
          {{ row.item.amount }}
        </template>

        <template #cell(paymentDate)="row">
          {{ row.item.paymentDate }}
        </template>

        <template #cell(document)="row">
          <button class="btn-receipt" @click="viewReceipt(row.item)">
            <i class="fas fa-file-alt"></i>
            ใบสำคัญรับเงิน
          </button>
        </template>
      </b-table>
    </div>

    <!-- Receipt Modal -->
    <b-modal
      v-model="showReceiptModal"
      title="ใบสำคัญรับเงิน"
      size="xl"
      no-close-on-backdrop
      @hidden="closeReceiptModal"
      header-class="receipt-modal-header"
      body-class="receipt-modal-body"
    >
      <div v-if="receiptData" class="receipt-wrapper">
        <div id="receipt-content" class="receipt-content">
          <!-- Title Box -->
          <div class="title-box">
            ใบสำคัญรับเงิน
          </div>
          <div class="date-top-right">วันที่ {{ receiptData.formattedDate }}</div>
          <!-- Top Info Row -->
          <div class="info-row">
            <div class="info-left">
              <div class="recipient-line">ข้าพเจ้า {{ receiptData.visitorName }}</div>
              <div class="address-line">ที่อยู่ {{ receiptData.address }}</div>
            </div>
            <div class="info-right">
              <div class="date-line">เลขประจำตัวประชาชน {{ receiptData.idCard }}</div>
              <div class="id-card-line"></div>
            </div>
          </div>

          <!-- Section Label -->
          <div class="section-label">
            ได้รับเงินจาก parenting2025
มหาวิทยาลัยหอการค้าไทย 126/1 ถ.วิภาวดีรังสิต แขวงรัชดาภิเษก เขตดินแดง กทม. 10400<br>
เลขที่ผู้เสียภาษี 0-99-40-00196-01-6
          </div>

          <!-- Payment Table -->
          <table class="receipt-table">
            <thead>
              <tr>
                <th class="col-sequence">ลำดับ</th>
                <th class="col-description" colspan="2">รายการ</th>
                <th class="col-amount">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center" style="font-size: 14px;">1</td>
                <td colspan="2" style="font-size: 14px;">ค่าตอบแทนผู้เยี่ยมบ้าน หรือ home visitor <br>เพื่อทำกิจกรรมเยี่ยมบ้าน
</td>
                <td class="text-right" style="font-size: 14px;">{{ receiptData.amount }} บาท</td>
              </tr>
              <tr class="summary-row">
                <td colspan="2" class="total-words-cell">{{ getAmountInWords(receiptData.amount) }}</td>
                <td> <div class="text-right">รวมทั้งสิ้น</div></td>
                <td class="total-numbers-cell">
                  <div>{{ receiptData.amount }} บาท</div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Remark/Certification -->
          <div class="remark">
            ข้าพเจ้าขอรับรองว่ารายจ่ายข้างต้นได้จ่ายไปในงานโครงการที่ได้รับทุนสนับสนุน<br/>
            จากกองทุนเพื่อความเสมอภาคทางการศึกษา (กสศ.) โดยแท้จริง<br/>
            ทั้งนี้ไม่สามารถเรียกใบเสร็จรับเงินได้
          </div>

          <!-- Signatures -->
          <div class="signature-section">
            <div class="signature-block">
              <div class="signature-line-wrapper">
                ลงชื่อ<span class="sig-line"></span><br>ผู้รับเงิน
              </div>
              <div class="signature-name-small">
                ( {{ receiptData.visitorName }} )
              </div>
            </div>
            <div class="signature-block">
              <div class="signature-line-wrapper">
                ลงชื่อ<span class="sig-line"></span><br>ผู้จ่ายเงิน
              </div>
              <div class="signature-name-small">
                ( รศ.ดร.วีระชาติ กิเลนทอง )
              </div>
            </div>
          </div>

          <!-- Bottom Review/Approve -->
          <div class="bottom-section">
            <div class="bottom-block text-center">
              <div class="bottom-label">
                ตรวจสอบโดย <span class="bottom-line"></span>
              </div>
              <div class="bottom-date">
                วันที่ ( ____ / ____ / ____ )
              </div>
            </div>
            <div class="bottom-block text-center">
              <div class="bottom-label">
                อนุมัติโดย <span class="bottom-line"></span>
              </div>
              <div class="bottom-date">
                วันที่ ( ____ / ____ / ____ )
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #modal-footer="{ cancel }">
        <b-button variant="secondary" @click="cancel()">
          <i class="fas fa-times"></i>
          ปิด
        </b-button>
        <b-button variant="primary" @click="downloadPDF" :disabled="loadingPDF">
          <i class="fas fa-download"></i>
          {{ loadingPDF ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด' }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { numberToThaiWords } from '~/utils/helpers'
import { formatApiDate } from '~/utils/dateHelpers'
import { generatePDFFromElement } from '~/utils/pdfHelpers'

export default {
  layout: 'admin',
  middleware: 'auth',
  data() {
    return {
      loading: true,
      filters: {
        team: 'songkhla'
      },
      teamOptions: [
        { value: 'songkhla', text: 'สงขลา' },
        { value: 'all', text: '--ทั้งหมด--' }
      ],
      tableFields: [
        {
          key: 'visitorName',
          label: 'รหัส/ชื่อผู้เยี่ยมบ้าน',
          thClass: 'table-header'
        },
        {
          key: 'installment',
          label: 'งวด',
          thClass: 'table-header'
        },
        {
          key: 'amount',
          label: 'จำนวน',
          thClass: 'table-header'
        },
        {
          key: 'paymentDate',
          label: 'วันที่จ่ายเงิน',
          thClass: 'table-header'
        },
        {
          key: 'document',
          label: 'เอกสาร',
          thClass: 'table-header'
        }
      ],
      tableData: [],
      // Receipt Modal
      showReceiptModal: false,
      receiptData: null,
      loadingPDF: false
    }
  },
  async mounted() {
    // โหลดข้อมูลจาก API
    await this.fetchTableData()

    // Initialize Select2 for dropdowns
    this.$nextTick(() => {
      if (this.$select2 && this.$refs.teamSelect) {
        this.$select2.init(this.$refs.teamSelect)
        window.$(this.$refs.teamSelect).on('change', () => {
          this.filters.team = window.$(this.$refs.teamSelect).val()
        })
      }
    })
  },
  watch: {
    'filters.team'(newVal) {
      if (this.$refs.teamSelect && window.$) {
        window.$(this.$refs.teamSelect).val(newVal).trigger('change')
      }
    }
  },
  beforeDestroy() {
    // Destroy Select2 instances
    if (this.$select2 && this.$refs.teamSelect && window.$) {
      window.$(this.$refs.teamSelect).off('change')
      this.$select2.destroy(this.$refs.teamSelect)
    }
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
            idCard: item.PID || '',
            address: item.Address || '',
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
    
    formatApiDate,
    
    // Receipt Methods
    getAmountInWords(amount) {
      if (!amount) return ''
      const numAmount = parseFloat(amount)
      if (isNaN(numAmount)) return ''
      return numberToThaiWords(numAmount) + 'บาทถ้วน'
    },
    viewReceipt(item) {
      // Parse payment date to extract formatted date
      const paymentDateStr = item.paymentDate || ''
      // Extract date part (remove day abbreviation like "อ." or "พ.")
      const formattedDate = paymentDateStr.replace(/^[^\d]*\s*/, '').trim() || '1 พฤศจิกายน 2566'
      
      // Mock data for receipt - should be replaced with actual data
      this.receiptData = {
        visitorName: item.visitorName || 'ตัวอย่าง',
        idCard: item.idCard || '1234567890123',
        address: item.address || 'ที่อยู่ตัวอย่าง',
        paymentDate: paymentDateStr,
        formattedDate: formattedDate,
        amount: item.amount || '0.00'
      }
      this.showReceiptModal = true
    },
    closeReceiptModal() {
      this.showReceiptModal = false
      this.receiptData = null
    },
    async downloadPDF() {
      if (!this.receiptData) {
        this.$toast.error('ไม่พบข้อมูลที่จะสร้าง PDF')
        return
      }

      try {
        this.loadingPDF = true
        
        await this.$nextTick()
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const element = document.getElementById('receipt-content')
        if (!element) {
          this.$toast.error('ไม่พบข้อมูลที่จะสร้าง PDF')
          return
        }

        const filename = `ใบสำคัญรับเงิน_${this.receiptData.visitorName}_${this.receiptData.formattedDate}.pdf`
        await generatePDFFromElement(element, filename)
        
        this.$toast.success('ดาวน์โหลด PDF สำเร็จ')
      } catch (error) {
        console.error('Error generating PDF:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการสร้าง PDF: ' + (error.message || 'Unknown error'))
      } finally {
        this.loadingPDF = false
      }
    }
  }
}
</script>

<style scoped>
.admin-receipt {
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

.btn-receipt {
  background-color: #3551a4;
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

.btn-receipt:hover {
  background-color: #2c4088;
}

.btn-receipt i {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .admin-receipt {
    padding: 1rem;
  }

  .filters-section {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }
}

/* Receipt Modal Styles */
::v-deep .receipt-modal-header {
  background-color: #3551a4;
  color: white;
  border-bottom: none;
}

::v-deep .receipt-modal-body {
  padding: 0;
  max-height: calc(100vh - 200px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.receipt-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.receipt-content {
  width: 170mm;
  margin: 20px auto;
  background: white;
  font-family: Tahoma, sans-serif !important;
  font-size: 16px;
  color: #000;
  box-sizing: border-box;
  overflow-y: auto;
  max-height: calc(100vh - 250px);
  padding: 10px;
}

.receipt-content * {
  font-family: Tahoma, sans-serif !important;
  font-size: 16px;
}

.title-box {
  border: 1px solid #000;
  text-align: center;
  padding: 8mm 0;
  margin-bottom: 6mm;
  font-size: 18pt;
  font-weight: bold;
}

.date-top-right {
  text-align: right;
  font-size: 16px;
  margin-bottom: 2mm;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2mm;
  align-items: flex-start;
}

.info-left,
.info-right {
  width: 50%;
  font-size: 16px;
  line-height: 1.8;
}

.info-right {
  text-align: right;
}

.recipient-line {
  margin-bottom: 3mm;
}

.address-line {
  margin-bottom: 3mm;
}

.date-line {
  margin-bottom: 3mm;
}

.id-card-line {
  margin-bottom: 0;
}

.section-label {
  margin-top: 2mm;
  margin-bottom: 4mm;
  font-size: 16px;
}

.receipt-table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 3mm;
  font-size: 16px;
}

.receipt-table th,
.receipt-table td {
  border: 1px solid #000;
  padding: 10px;
  vertical-align: top;
  font-size: 16px;
}

.receipt-table th {
  text-align: center;
  font-weight: bold;
}

.col-sequence {
  width: 6%;
}

.col-description {
  width: 68%;
}

.col-amount {
  width: 30%;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.summary-row td {
  font-weight: bold;
}

.total-words-cell {
  text-align: left;
  padding-left: 2mm;
}

.total-numbers-cell {
  text-align: right;
  padding-right: 2mm;
}

.total-numbers-cell > div {
  line-height: 1.6;
}

.remark {
  margin-top: 6mm;
  font-size: 16px;
  line-height: 1.4;
  text-align: justify;
}

.signature-section {
  margin-top: 18mm;
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}

.signature-block {
  width: 48%;
  text-align: center;
}

.signature-line-wrapper {
  margin-bottom: 4mm;
  line-height: 1.8;
}

.sig-line {
  display: inline-block;
  border-bottom: 1px solid #000;
  min-width: 60mm;
  margin: 0 2mm;
  height: 6mm;
  vertical-align: middle;
}

.signature-name-small {
  font-size: 16px;
  margin-top: 2mm;
}

.bottom-section {
  margin-top: 14mm;
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}

.bottom-block {
  width: 48%;
  text-align: left;
}

.bottom-label {
  margin-bottom: 3mm;
  line-height: 1.8;
}

.bottom-date {
  font-size: 16px;
  line-height: 1.8;
  text-align: center;
}

.bottom-line {
  border-bottom: 1px dotted;
  width: 200px;
  display: inline-block;
}

/* Skeleton Loading: uses global styles from ~/assets/css/main.css */
</style>

