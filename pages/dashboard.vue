<template>
  <div class="dashboard">
    <!-- Stats Cards -->
    <div class="row">
      <div class="col-3">
        <div class="stats-card">
          <div class="stats-icon text-primary">
            <i class="fas fa-users"></i>
          </div>
          <div class="stats-number">{{ stats.totalUsers.toLocaleString() }}</div>
          <div class="stats-label">ผู้ใช้ทั้งหมด</div>
        </div>
      </div>
      <div class="col-3">
        <div class="stats-card">
          <div class="stats-icon text-success">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="stats-number">{{ stats.totalOrders.toLocaleString() }}</div>
          <div class="stats-label">คำสั่งซื้อทั้งหมด</div>
        </div>
      </div>
      <div class="col-3">
        <div class="stats-card">
          <div class="stats-icon text-warning">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stats-number">${{ stats.totalRevenue.toLocaleString() }}</div>
          <div class="stats-label">รายได้ทั้งหมด</div>
        </div>
      </div>
      <div class="col-3">
        <div class="stats-card">
          <div class="stats-icon text-info">
            <i class="fas fa-box"></i>
          </div>
          <div class="stats-number">{{ stats.totalProducts }}</div>
          <div class="stats-label">สินค้าทั้งหมด</div>
        </div>
      </div>
    </div>

    <!-- Charts and Tables Row -->
    <div class="row">
      <!-- Revenue Chart -->
      <div class="col-8">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">
              <i class="fas fa-chart-line"></i>
              ภาพรวมรายได้
            </h5>
          </div>
          <div class="card-body">
            <canvas ref="revenueChart" width="400" height="200"></canvas>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="col-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">
              <i class="fas fa-bolt"></i>
              การดำเนินการด่วน
            </h5>
          </div>
          <div class="card-body">
            <div class="quick-actions">
              <button class="btn btn-primary btn-block mb-2">
                <i class="fas fa-plus"></i>
                เพิ่มผู้ใช้ใหม่
              </button>
              <button class="btn btn-success btn-block mb-2">
                <i class="fas fa-shopping-cart"></i>
                สร้างคำสั่งซื้อ
              </button>
              <button class="btn btn-info btn-block mb-2">
                <i class="fas fa-box"></i>
                เพิ่มสินค้า
              </button>
              <button class="btn btn-warning btn-block">
                <i class="fas fa-cog"></i>
                ตั้งค่าระบบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">
              <i class="fas fa-list"></i>
              คำสั่งซื้อล่าสุด
            </h5>
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
                  <tr v-for="order in recentOrders" :key="order.id">
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
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js'

export default {
  layout: 'admin',
  data() {
    return {
      stats: {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0
      },
      recentOrders: [],
      chartData: null
    }
  },
  async mounted() {
    await this.loadDashboardData()
    this.initChart()
  },
  methods: {
    async loadDashboardData() {
      try {
        const response = await this.$axios.get('/dashboard')
        this.stats = response.data.stats
        this.recentOrders = response.data.recentOrders
        this.chartData = response.data.chartData
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    },
    initChart() {
      if (!this.chartData) return

      const ctx = this.$refs.revenueChart.getContext('2d')
      new Chart(ctx, {
        type: 'line',
        data: this.chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                callback: function(value) {
                  return '$' + value.toLocaleString()
                }
              }
            }]
          },
          tooltips: {
            callbacks: {
              label: function(tooltipItem, data) {
                return 'Revenue: $' + tooltipItem.yLabel.toLocaleString()
              }
            }
          }
        }
      })
    },
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
.dashboard {
  padding: 0;
}

.stats-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 1.5rem;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.stats-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.stats-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.stats-label {
  color: #6c757d;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.text-primary { color: #0ea5e9 !important; }
.text-success { color: #28a745 !important; }
.text-warning { color: #ffc107 !important; }
.text-info { color: #17a2b8 !important; }

.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
  margin-bottom: 1.5rem;
}

.card-header {
  padding: 1rem 1.5rem;
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.card-title i {
  margin-right: 0.5rem;
  color: #0ea5e9;
}

.card-body {
  padding: 1.5rem;
}

.quick-actions .btn {
  margin-bottom: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.quick-actions .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  margin-bottom: 0;
  color: #212529;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 0.75rem;
  vertical-align: top;
  border-top: 1px solid #dee2e6;
}

.table thead th {
  vertical-align: bottom;
  border-bottom: 2px solid #dee2e6;
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

.badge {
  display: inline-block;
  padding: 0.25em 0.4em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
  text-transform: capitalize;
}

.badge-success {
  color: #fff;
  background-color: #28a745;
}

.badge-warning {
  color: #212529;
  background-color: #ffc107;
}

.badge-danger {
  color: #fff;
  background-color: #dc3545;
}

.badge-info {
  color: #fff;
  background-color: #17a2b8;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.2rem;
  margin-right: 0.25rem;
}

.btn-outline-primary {
  color: #007bff;
  border-color: #007bff;
}

.btn-outline-primary:hover {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.btn-outline-success {
  color: #28a745;
  border-color: #28a745;
}

.btn-outline-success:hover {
  color: #fff;
  background-color: #28a745;
  border-color: #28a745;
}

@media (max-width: 768px) {
  .col-3 {
    flex: 0 0 50%;
    max-width: 50%;
  }
  
  .col-8 {
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .col-4 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>

