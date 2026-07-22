<template>
  <div class="supervisor-course-manual">
    <div class="page-header">
      <h1 class="page-title">คู่มือหลักสูตรการเยี่ยมบ้าน</h1>
    </div>

    <div v-if="loading" class="loading-text">กำลังโหลด...</div>

    <div v-else class="document-list">
      <div
        v-for="doc in documents"
        :key="doc.name"
        class="document-item"
        :class="{ disabled: !doc.url }"
      >
        <div class="document-info">
          <i class="fas fa-file-pdf document-icon"></i>
          <span class="document-name">{{ doc.name }}</span>
          <span v-if="!doc.url" class="badge-soon">(เร็วๆ นี้)</span>
        </div>
        <button
          v-if="doc.url"
          type="button"
          class="btn-open"
          @click="viewDocument(doc)"
        >
          <i class="fas fa-external-link-alt"></i>
          เปิดเอกสาร
        </button>
        <span v-else class="btn-open btn-open-disabled">
          <i class="fas fa-external-link-alt"></i>
          เปิดเอกสาร
        </span>
      </div>
    </div>

    <b-modal
      v-model="showPreviewModal"
      :title="previewDoc ? previewDoc.name : ''"
      size="xl"
      hide-footer
      @hidden="closePreview"
    >
      <iframe
        v-if="previewDoc"
        :src="previewDoc.url"
        class="pdf-preview-frame"
      ></iframe>
    </b-modal>
  </div>
</template>

<script>
export default {
  layout: 'supervisor',
  middleware: 'auth',
  data() {
    return {
      loading: true,
      documents: [],
      showPreviewModal: false,
      previewDoc: null
    }
  },
  async mounted() {
    try {
      const response = await this.$axios.$get(
        '/api/parenting2025_census/get/homevisit/getdocument.php?part=course'
      )
      const isSuccess = response.message === 'success' || response.statusCode === 200
      if (isSuccess && response.results) {
        this.documents = response.results.map(item => ({
          name: item.name,
          url: item.baseUrl && item.url ? `${item.baseUrl}${item.url}` : null
        }))
      } else {
        this.documents = []
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      this.documents = []
    } finally {
      this.loading = false
    }
  },
  methods: {
    viewDocument(doc) {
      this.previewDoc = doc
      this.showPreviewModal = true
    },
    closePreview() {
      this.showPreviewModal = false
      this.previewDoc = null
    }
  }
}
</script>

<style scoped>
.supervisor-course-manual {
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

.loading-text {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.document-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 0.75rem;
}

.document-item.disabled {
  opacity: 0.5;
}

.document-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.document-icon {
  font-size: 1.5rem;
  color: #d32f2f;
}

.document-name {
  font-size: 1rem;
  color: #2c3e50;
}

.badge-soon {
  font-size: 0.8rem;
  color: #6c757d;
}

.btn-open {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #3551a4;
  color: white;
  border-radius: 0.375rem;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.btn-open:hover {
  background-color: #2c4088;
  color: white;
}

.btn-open-disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-open {
  border: none;
  cursor: pointer;
}

.pdf-preview-frame {
  width: 100%;
  height: 75vh;
  border: none;
}

@media (max-width: 768px) {
  .supervisor-course-manual {
    padding: 1rem;
  }

  .document-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
