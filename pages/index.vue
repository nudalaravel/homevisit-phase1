<template>
  <div class="index-page">
    <div class="hero-section">
      <div class="container">
        <h1>Welcome to Riped Admin</h1>
        <p>A modern admin dashboard built with Nuxt.js 2</p>
        <div class="hero-actions">
          <nuxt-link to="/login" class="btn btn-primary btn-lg">
            <i class="fas fa-sign-in-alt"></i>
            Get Started
          </nuxt-link>
          <nuxt-link to="/dashboard" class="btn btn-outline-primary btn-lg">
            <i class="fas fa-tachometer-alt"></i>
            View Dashboard
          </nuxt-link>
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="container">
        <h2>Features</h2>
        <div class="row">
          <div class="col-4">
            <div class="feature-card">
              <i class="fas fa-shield-alt"></i>
              <h3>Secure Authentication</h3>
              <p>Built-in authentication system with JWT tokens</p>
            </div>
          </div>
          <div class="col-4">
            <div class="feature-card">
              <i class="fas fa-chart-bar"></i>
              <h3>Analytics Dashboard</h3>
              <p>Beautiful charts and statistics for your data</p>
            </div>
          </div>
          <div class="col-4">
            <div class="feature-card">
              <i class="fas fa-mobile-alt"></i>
              <h3>Responsive Design</h3>
              <p>Works perfectly on all devices and screen sizes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'default'
}
</script>

<style scoped>
.index-page {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
  color: white;
  padding: 6rem 0;
  text-align: center;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.hero-section p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: white;
  color: #0ea5e9;
  border: 2px solid white;
}

.btn-primary:hover {
  background: transparent;
  color: white;
  border-color: white;
}

.btn-outline-primary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-outline-primary:hover {
  background: white;
  color: #0ea5e9;
}

.features-section {
  padding: 4rem 0;
  background: #f8f9fa;
}

.features-section h2 {
  text-align: center;
  margin-bottom: 3rem;
  color: #2c3e50;
  font-size: 2.5rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card i {
  font-size: 3rem;
  color: #0ea5e9;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.feature-card p {
  color: #6c757d;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .col-4 {
    flex: 0 0 100%;
    max-width: 100%;
    margin-bottom: 2rem;
  }
}
</style>

