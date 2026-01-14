<template>
  <div class="supervisor-document">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">การจัดการเอกสารรับเงิน</h1>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label class="filter-label">ผู้เยี่ยมบ้าน</label>
        <select
          v-model="filters.visitor"
          class="filter-select select2"
          ref="visitorSelect"
        >
          <option
            v-for="option in visitorOptions"
            :key="option.value"
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
              <td><div class="skeleton-cell skeleton-text-short"></div></td>
              <td><div class="skeleton-cell skeleton-text"></div></td>
              <td><div class="skeleton-cell skeleton-text"></div></td>
              <td><div class="skeleton-cell skeleton-badge"></div></td>
              <td><div class="skeleton-cell skeleton-checkbox"></div></td>
              <td><div class="skeleton-cell skeleton-checkbox"></div></td>
              <td><div class="skeleton-cell skeleton-badge"></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Actual Table -->
      <b-table
        v-else
        :items="filteredTableData"
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

        <template #cell(visitorName)="row">
          {{ row.item.visitorName }}
        </template>

        <template #cell(latestPayment)="row">
          <div class="payment-info">
            {{ row.item.paymentDate }}<br />
            งวดที่ {{ row.item.installment }}<br />
            {{ row.item.amount }} บาท
          </div>
        </template>

        <template #cell(receipt)="row">
          <button class="btn btn-primary" @click="viewReceipt(row.item)">
            ใบสำคัญรับเงิน
          </button>
        </template>

        <template #cell(sendReceipt)="row">
          <input
            type="checkbox"
            :checked="row.item.sendReceipt"
            @change="toggleSendReceipt(row.item, $event)"
          />
        </template>

        <template #cell(sendIdCard)="row">
          <input
            type="checkbox"
            :checked="row.item.sendIdCard"
            @change="toggleSendIdCard(row.item, $event)"
          />
        </template>

        <template #cell(complete)="row">
          <i
            v-if="row.item.sendReceipt && row.item.sendIdCard"
            class="fas fa-check-circle text-success"
          ></i>
          <i
            v-else
            class="fas fa-times-circle text-danger"
          ></i>
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
            ได้รับเงินจากโครงการ Parenting
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
                <td colspan="2" style="font-size: 14px;">ค่าตอบแทนผู้เยี่ยมบ้าน หรือ home visitor เพื่อทำกิจกรรมเยี่ยมบ้าน</td>
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

export default {
  layout: 'supervisor',
  middleware: 'auth',
  data() {
    return {
      loading: true,
      filters: {
        visitor: 'all'
      },
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
          key: 'visitorName',
          label: 'ชื่อผู้เยี่ยมบ้าน',
          thClass: 'table-header'
        },
        {
          key: 'latestPayment',
          label: 'จ่ายงวดล่าสุด(บาท)',
          thClass: 'table-header'
        },
        {
          key: 'receipt',
          label: 'ใบสำคัญรับเงิน',
          thClass: 'table-header'
        },
        {
          key: 'sendReceipt',
          label: 'ส่งใบสำคัญรับเงิน',
          thClass: 'table-header'
        },
        {
          key: 'sendIdCard',
          label: 'ส่งสำเนาบัตรประชาชน',
          thClass: 'table-header'
        },
        {
          key: 'complete',
          label: 'เอกสารล่าสุดครบ',
          thClass: 'table-header'
        }
      ],
      tableData: [],
      showReceiptModal: false,
      receiptData: null,
      loadingPDF: false
    }
  },
  computed: {
    filteredTableData() {
      if (!this.filters.visitor || this.filters.visitor === 'all') {
        return this.tableData
      }
      return this.tableData.filter(item => item.username === this.filters.visitor)
    }
  },
  async mounted() {
    // Load html2pdf.js from CDN
    if (process.client && !window.html2pdf) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      script.onload = () => {
        console.log('html2pdf.js loaded')
      }
      document.head.appendChild(script)
    }

    // Fetch data from API
    await this.fetchVisitorOptions()
    await this.fetchTableData()

    // Initialize Select2 for dropdowns
    this.$nextTick(() => {
      if (this.$select2 && this.$refs.visitorSelect) {
        this.$select2.init(this.$refs.visitorSelect)
        window.$(this.$refs.visitorSelect).on('change', () => {
          this.filters.visitor = window.$(this.$refs.visitorSelect).val()
        })
      }
    })
  },
  watch: {
    'filters.visitor'(newVal) {
      if (this.$refs.visitorSelect && window.$) {
        window.$(this.$refs.visitorSelect).val(newVal).trigger('change')
      }
    }
  },
  beforeDestroy() {
    // Destroy Select2 instances
    if (this.$select2 && this.$refs.visitorSelect && window.$) {
      window.$(this.$refs.visitorSelect).off('change')
      this.$select2.destroy(this.$refs.visitorSelect)
    }
  },
  methods: {
    // ดึงข้อมูลผู้เยี่ยมบ้านสำหรับ dropdown
    async fetchVisitorOptions() {
      try {
        const response = await this.$axios.$get('/api/parenting2025_census/get/homevisit/getuser.php')
        const isSuccess = response.message === 'success' || response.statusCode === 200
        if (isSuccess && response.results) {
          this.visitorOptions = [
            { value: 'all', text: '--ทั้งหมด--' },
            ...response.results.map(item => ({
              value: item.username,
              text: `${item.fname || ''} ${item.lname || ''}`.trim() || item.username
            }))
          ]
        }
      } catch (error) {
        console.error('Error fetching visitor options:', error)
      }
    },

    // ดึงข้อมูลการจ่ายเงินจาก API
    async fetchTableData() {
      this.loading = true
      try {
        const url = '/api/parenting2025_census/get/homevisit/gethomevisitpayment.php'
        const response = await this.$axios.$get(url)

        const isSuccess = response.message === 'success' || response.statusCode === 200
        if (isSuccess && response.results) {
          this.tableData = response.results.map((item, index) => ({
            id: item.no || index,
            username: item.VendorID,
            visitorName: item.VendorName || `${item.fname || ''} ${item.lname || ''}`.trim(),
            paymentDate: this.formatApiDate(item.paymentDate),
            installment: item.transfIns || '-',
            amount: item.Amount || '0.00',
            idCard: item.PID || '-',
            address: item.Address || '-',
            sendReceipt: item.doc1 === '1' || item.doc1 === 'true' || !!item.doc1_date,
            sendIdCard: item.doc2 === '1' || item.doc2 === 'true' || !!item.doc2_date,
            isComplete: (item.doc1 === '1' || !!item.doc1_date) && (item.doc2 === '1' || !!item.doc2_date),
            rawData: item
          }))
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

    parsePaymentDate(paymentDate) {
      // Parse date from format "พ. 01 พฤศจิกายน 2566"
      const parts = paymentDate.trim().split(/\s+/)
      if (parts.length >= 4) {
        const day = parseInt(parts[1])
        const monthName = parts[2]
        const year = parseInt(parts[3])
        
        // Find month index - full Thai month names
        const thaiMonths = [
          'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
          'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ]
        const monthIndex = thaiMonths.findIndex(m => m === monthName)
        
        if (monthIndex >= 0) {
          return { day, month: monthIndex + 1, monthName, year }
        }
      }
      return null
    },
    formatReceiptDate(paymentDate) {
      const dateInfo = this.parsePaymentDate(paymentDate)
      if (dateInfo) {
        return `${dateInfo.day} ${dateInfo.monthName} ${dateInfo.year}`
      }
      // Fallback: remove day abbreviation if parsing fails
      return paymentDate.replace(/^[ก-ฮ]\.\s*/, '')
    },
    getAmountInWords(amount) {
      if (!amount) return ''
      const numAmount = parseFloat(amount)
      if (isNaN(numAmount)) return ''
      return numberToThaiWords(numAmount) + 'บาทถ้วน'
    },
    viewReceipt(item) {
      const dateInfo = this.parsePaymentDate(item.paymentDate)
      const amount = parseFloat(item.amount)
      
      this.receiptData = {
        visitorName: item.visitorName,
        idCard: item.idCard || '3940500242204',
        address: item.address || '69/16 หมู่ที่ 3 ต.สะบ้าย้อย อ.สะบ้าย้อย จ.สงขลา',
        paymentDate: item.paymentDate,
        formattedDate: this.formatReceiptDate(item.paymentDate),
        installment: item.installment,
        amount: item.amount
      }
      
      this.showReceiptModal = true
    },
    closeReceiptModal() {
      this.showReceiptModal = false
      this.receiptData = null
    },
    async downloadPDF() {
      if (!this.receiptData || !window.html2pdf) {
        this.$toast.error('ไม่สามารถสร้าง PDF ได้ กรุณารอสักครู่แล้วลองอีกครั้ง')
        return
      }

      try {
        this.loadingPDF = true
        const element = document.getElementById('receipt-content')
        if (!element) {
          this.$toast.error('ไม่พบข้อมูลที่จะสร้าง PDF')
          return
        }

        const opt = {
          margin: [5, 5, 5, 5],
          filename: `ใบสำคัญรับเงิน_${this.receiptData.visitorName}_${this.receiptData.formattedDate}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }

        await window.html2pdf().set(opt).from(element).save()
        this.$toast.success('ดาวน์โหลด PDF สำเร็จ')
      } catch (error) {
        console.error('Error generating PDF:', error)
        this.$toast.error('เกิดข้อผิดพลาดในการสร้าง PDF')
      } finally {
        this.loadingPDF = false
      }
    },
  
    toggleSendReceipt(item, event) {
      // TODO: Implement toggle send receipt functionality
      item.sendReceipt = event.target.checked
      this.$toast.info(
        `${item.sendReceipt ? 'ส่ง' : 'ยกเลิกการส่ง'}ใบสำคัญรับเงิน: ${item.visitorName}`
      )
    },
    toggleSendIdCard(item, event) {
      // TODO: Implement toggle send ID card functionality
      item.sendIdCard = event.target.checked
      this.$toast.info(
        `${item.sendIdCard ? 'ส่ง' : 'ยกเลิกการส่ง'}สำเนาบัตรประชาชน: ${item.visitorName}`
      )
    }
  }
}
</script>

<style scoped>
.supervisor-document {
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

.payment-info {
  text-align: left;
  line-height: 1.6;
  font-size: 0.9rem;
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
  width: 130px;
}

.btn-receipt:hover {
  background-color: #2c4088;
}

.btn-receipt i {
  font-size: 0.9rem;
}

input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.text-success {
  color: #28a745;
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .supervisor-document {
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
.receipt-content *{
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

.receipt-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}
.bottom-line{
  border-bottom: 1px dotted;
    width: 200px;
    display: inline-block;
}
/* Print styles for A4 */
@media print {
  @page {
    size: A4;
    margin: 20mm;
  }
  
  body {
    margin: 0;
    padding: 0;
    background: white;
  }
  
  .receipt-wrapper {
    display: block;
  }
  
  .receipt-content {
    width: 170mm;
    margin: 0 auto;
    box-shadow: none;
    background: white;
    font-family: Tahoma, sans-serif !important;
    font-size: 16px;
    color: #000;
  }
  
  .receipt-content * {
    font-family: Tahoma, sans-serif !important;
    font-size: 16px;
  }
  
  .receipt-actions {
    display: none !important;
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
}
</style>

