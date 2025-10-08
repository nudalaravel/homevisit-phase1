<template>
  <div class="products-page">
    <div class="page-header">
      <h1>จัดการสินค้า</h1>
      <button class="btn btn-primary">
        <i class="fas fa-plus"></i>
        เพิ่มสินค้า
      </button>
    </div>

    <div class="card">
      <div class="card-header">
        <h5 class="card-title">สินค้าทั้งหมด</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อสินค้า</th>
                <th>หมวดหมู่</th>
                <th>ราคา</th>
                <th>สต็อก</th>
                <th>สถานะ</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td>{{ product.id }}</td>
                <td>{{ product.name }}</td>
                <td>{{ product.category }}</td>
                <td>${{ product.price.toFixed(2) }}</td>
                <td>{{ product.stock }}</td>
                <td>
                  <span class="badge" :class="product.status === 'active' ? 'badge-success' : 'badge-danger'">
                    {{ product.status }}
                  </span>
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
      products: [
        { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299.99, stock: 25, status: 'active' },
        { id: 2, name: 'Wireless Mouse', category: 'Accessories', price: 29.99, stock: 100, status: 'active' },
        { id: 3, name: 'Gaming Keyboard', category: 'Accessories', price: 89.99, stock: 0, status: 'inactive' },
        { id: 4, name: 'Monitor 24"', category: 'Electronics', price: 199.99, stock: 15, status: 'active' }
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
</style>

