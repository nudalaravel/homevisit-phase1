<template>
  <div class="admin-document">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">ตรวจสอบเอกสารจ่ายเงิน</h1>
    </div>

    <!-- Data Table -->
    <div class="table-container">
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
          <tr v-for="(item, index) in tableData" :key="index">
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
      tableData: [
        {
          visitorName: 'นางสาววรรณา สนิททอง',
          installment: 19,
          amount: '500.00',
          paymentDate: 'อ. 25 มีนาคม 2568',
          provincialTeam: {
            receipt: false,
            idCard: false
          },
          account: {
            receipt: false,
            idCard: false
          }
        },
        {
          visitorName: 'นางสาววรรณา สนิททอง',
          installment: 18,
          amount: '500.00',
          paymentDate: 'อ. 25 กุมภาพันธ์ 2568',
          provincialTeam: {
            receipt: true,
            idCard: true
          },
          account: {
            receipt: false,
            idCard: false
          }
        },
        {
          visitorName: 'นางสาววรรณา สนิททอง',
          installment: 17,
          amount: '500.00',
          paymentDate: 'อ. 28 มกราคม 2568',
          provincialTeam: {
            receipt: true,
            idCard: true
          },
          account: {
            receipt: false,
            idCard: false
          }
        },
        {
          visitorName: 'นางสาววรรณา สนิททอง',
          installment: 16,
          amount: '500.00',
          paymentDate: 'พฤ. 02 มกราคม 2568',
          provincialTeam: {
            receipt: true,
            idCard: true
          },
          account: {
            receipt: false,
            idCard: false
          }
        },
        {
          visitorName: 'นางสาววรรณา สนิททอง',
          installment: 15,
          amount: '500.00',
          paymentDate: 'อ. 26 พฤศจิกายน 2567',
          provincialTeam: {
            receipt: true,
            idCard: true
          },
          account: {
            receipt: false,
            idCard: false
          }
        },
        {
          visitorName: 'นางสาววรรณา สนิททอง',
          installment: 14,
          amount: '500.00',
          paymentDate: 'อ. 29 ตุลาคม 2567',
          provincialTeam: {
            receipt: true,
            idCard: true
          },
          account: {
            receipt: false,
            idCard: false
          }
        },
        {
          visitorName: 'นางสาววรรณา สนิททอง',
          installment: 13,
          amount: '600.00',
          paymentDate: 'อ. 24 กันยายน 2567',
          provincialTeam: {
            receipt: true,
            idCard: true
          },
          account: {
            receipt: false,
            idCard: false
          }
        },
        {
          visitorName: 'นางสาววรรณา สนิททอง',
          installment: 12,
          amount: '400.00',
          paymentDate: 'อ. 27 สิงหาคม 2567',
          provincialTeam: {
            receipt: true,
            idCard: true
          },
          account: {
            receipt: false,
            idCard: false
          }
        }
      ]
    }
  },
  methods: {
    toggleAccountReceipt(item, event) {
      item.account.receipt = event.target.checked
      this.$toast.info(
        `${item.account.receipt ? 'เลือก' : 'ยกเลิก'}ใบสำคัญรับเงิน - บัญชี: ${item.visitorName} งวด ${item.installment}`
      )
    },
    toggleAccountIdCard(item, event) {
      item.account.idCard = event.target.checked
      this.$toast.info(
        `${item.account.idCard ? 'เลือก' : 'ยกเลิก'}สำเนาบัตรประชาชน - บัญชี: ${item.visitorName} งวด ${item.installment}`
      )
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
  background: white;
  border-radius: 0.5rem;
  overflow-x: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.document-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}

.document-table thead {
  background-color: #3551a4;
  color: white;
}

.document-table .table-header {
  background-color: #3551a4;
  color: white;
  font-weight: 500;
  text-align: center;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  white-space: nowrap;
}

.document-table .sub-header {
  background-color: #3551a4;
  font-size: 0.9rem;
  padding: 0.75rem;
}

.document-table tbody tr {
  border-bottom: 1px solid #e9ecef;
}

.document-table tbody tr:hover {
  background-color: #f8f9fa;
}

.document-table tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}

.document-table tbody tr:nth-child(even):hover {
  background-color: #e9ecef;
}

.document-table tbody td {
  padding: 1rem;
  vertical-align: middle;
  text-align: left;
}

.document-table tbody td.text-center {
  text-align: center;
}

.document-table .text-success {
  color: #28a745;
  font-size: 1.2rem;
}

.document-table input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
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

