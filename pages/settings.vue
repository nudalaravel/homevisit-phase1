<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>การตั้งค่า</h1>
    </div>

    <div class="row">
      <div class="col-6">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">การตั้งค่าทั่วไป</h5>
          </div>
          <div class="card-body">
            <form>
              <div class="form-group">
                <label class="form-label">ชื่อเว็บไซต์</label>
                <input type="text" class="form-control" value="Riped Admin" />
              </div>
              <div class="form-group">
                <label class="form-label">คำอธิบายเว็บไซต์</label>
                <textarea class="form-control" rows="3">ระบบจัดการแอดมิน</textarea>
              </div>
              <div class="form-group">
                <label class="form-label">อีเมลผู้ดูแลระบบ</label>
                <input type="email" class="form-control" value="admin@riper.com" />
              </div>
              <button type="submit" class="btn btn-primary">บันทึกการเปลี่ยนแปลง</button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-6">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Security Settings</h5>
          </div>
          <div class="card-body">
            <form>
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <input type="password" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">New Password</label>
                <input type="password" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Confirm Password</label>
                <input type="password" class="form-control" />
              </div>
              <button type="submit" class="btn btn-warning">Change Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'admin'
}
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: #2c3e50;
}

.form-control {
  margin-bottom: 1rem;
}
</style>

