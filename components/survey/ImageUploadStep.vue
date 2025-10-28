<template>
  <div class="survey-step">
    <h4 class="question-title">{{ title }}</h4>

    <div class="upload-container">
      <div v-if="!imagePreview" class="upload-placeholder">
        <i class="fas fa-image"></i>
        <p>ยังไม่มีรูปภาพ</p>
      </div>
      <div v-else class="image-preview">
        <img :src="imagePreview" :alt="title" />
        <button class="remove-image-btn" @click="handleRemove">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <input
        :ref="fileInputRef"
        type="file"
        accept="image/*"
        capture="environment"
        style="display: none"
        @change="handleFileChange"
      />

      <b-button
        variant="warning"
        size="lg"
        class="upload-btn"
        @click="$refs[fileInputRef].click()"
      >
        <i class="fas fa-camera"></i>
        {{ imagePreview ? 'เลือกรูปใหม่' : buttonText }}
      </b-button>
    </div>

    <div class="navigation-buttons">
      <b-button variant="primary" size="lg" @click="$emit('prev')">
        ย้อนกลับ
      </b-button>
      <b-button variant="info" size="lg" @click="$emit('next')">
        ถัดไป
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageUploadStep',
  props: {
    title: {
      type: String,
      required: true
    },
    imagePreview: {
      type: String,
      default: null
    },
    buttonText: {
      type: String,
      default: 'อัพโหลดรูปภาพ'
    },
    fileInputRef: {
      type: String,
      default: 'fileInput'
    }
  },
  methods: {
    handleFileChange(event) {
      this.$emit('file-select', event)
    },
    handleRemove() {
      this.$emit('remove')
    }
  }
}
</script>

<style scoped>
.survey-step {
  max-width: 900px;
  margin: 2rem auto;
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(53, 81, 164, 0.15);
}

.question-title {
  color: #2c3e50;
  font-size: 1.62rem;
  font-weight: 500;
  margin-bottom: 2rem;
  text-align: left;
  padding-bottom: 1rem;
  border-bottom: 3px solid #3551a4;
}

.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.upload-placeholder {
  width: 100%;
  max-width: 600px;
  height: 300px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  border: 3px dashed rgba(255, 255, 255, 0.3);
}

.upload-placeholder i {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.5);
}

.upload-placeholder p {
  font-size: 1.32rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.image-preview {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 300px;
  background: #000;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.remove-image-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 45px;
  height: 45px;
  background: rgba(220, 53, 69, 0.95);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.56rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.remove-image-btn:hover {
  background: rgba(220, 53, 69, 1);
  transform: scale(1.1);
}

.upload-btn {
  font-size: 1.26rem;
  font-weight: 500;
  padding: 1rem 2.5rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
  transition: all 0.3s ease;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 193, 7, 0.4);
}

.upload-btn i {
  font-size: 1.56rem;
}

.navigation-buttons {
  display: flex;
  gap: 1.25rem;
  justify-content: space-between;
  padding-top: 1.5rem;
  border-top: 2px solid #e9ecef;
}

.navigation-buttons .btn {
  min-width: 160px;
  font-weight: 500;
  padding: 1rem 2.25rem;
  font-size: 1.26rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navigation-buttons .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.alert-info {
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: #e3f2fd;
  border: 2px solid #2196f3;
  color: #1565c0;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.26rem;
}
</style>

