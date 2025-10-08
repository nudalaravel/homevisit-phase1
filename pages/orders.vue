<template>
  <div class="orders-page">
    <div class="page-header">
      <h1>จัดการคำสั่งซื้อ</h1>
      <button class="btn btn-primary">
        <i class="fas fa-plus"></i>
        สร้างคำสั่งซื้อ
      </button>
    </div>

    <div class="card">
      <div class="card-header">
        <h5 class="card-title">คำสั่งซื้อทั้งหมด</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>รหัสคำสั่งซื้อ</th>
                <th>ลูกค้า</th>
                <th>จำนวนเงิน</th>
                <th>สถานะ</th>
                <th>วันที่</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td>#{{ order.id }}</td>
                <td>{{ order.customer }}</td>
                <td>${{ order.amount.toFixed(2) }}</td>
                <td>
                  <span class="badge" :class="getStatusClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>
                <td>{{ formatDate(order.date) }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-success">
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'admin',
  data() {
    return {
      orders: [
        { id: 1, customer: 'John Doe', amount: 299.99, status: 'completed', date: '2024-01-15' },
        { id: 2, customer: 'Jane Smith', amount: 149.50, status: 'pending', date: '2024-01-14' },
        { id: 3, customer: 'Bob Johnson', amount: 89.99, status: 'shipped', date: '2024-01-13' },
        { id: 4, customer: 'Alice Brown', amount: 199.99, status: 'completed', date: '2024-01-12' },
        { id: 5, customer: 'Charlie Wilson', amount: 79.99, status: 'cancelled', date: '2024-01-11' }
      ]
    }
  },
  methods: {
    getStatusClass(status) {
      const statusClasses = {
        completed: 'badge-success',
        pending: 'badge-warning',
        shipped: 'badge-info',
        cancelled: 'badge-danger'
      }
      return statusClasses[status] || 'badge-secondary'
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: #2c3e50;
}
</style>

