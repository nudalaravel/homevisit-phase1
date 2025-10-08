<template>
  <div class="users-page">
    <div class="page-header">
      <h1>จัดการผู้ใช้</h1>
      <button class="btn btn-primary">
        <i class="fas fa-plus"></i>
        เพิ่มผู้ใช้ใหม่
      </button>
    </div>

    <div class="card">
      <div class="card-header">
        <h5 class="card-title">ผู้ใช้ทั้งหมด</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อ</th>
                <th>อีเมล</th>
                <th>บทบาท</th>
                <th>สถานะ</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge" :class="user.role === 'admin' ? 'badge-primary' : 'badge-secondary'">
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <span class="badge badge-success">ใช้งานได้</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger">
                    <i class="fas fa-trash"></i>
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
      users: [
        { id: 1, name: 'Administrator', email: 'admin@riper.com', role: 'admin' },
        { id: 2, name: 'Regular User', email: 'user@riper.com', role: 'user' },
        { id: 3, name: 'John Doe', email: 'john@example.com', role: 'user' },
        { id: 4, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
      ]
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

.badge-primary {
  color: #fff;
  background-color: #007bff;
}

.badge-secondary {
  color: #fff;
  background-color: #6c757d;
}
</style>

