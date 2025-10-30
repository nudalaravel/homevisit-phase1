<template>
  <div class="survey-step">
    <div v-if="activities.length === 0" class="alert alert-info">
      <i class="fas fa-info-circle"></i>
      ไม่พบกิจกรรมสำหรับเดือนที่ {{ monthAge }} ครั้งที่ {{ timeActivity }}
    </div>

    <div v-else-if="currentIndex < activities.length">
      <h4 class="question-title">
        {{ questionNumber }} : {{ title }}
      </h4>
      <p class="question-subtitle">
        กิจกรรมที่ {{ currentIndex + 1 }} / {{ activities.length }}
      </p>
      <div class="activity-description">
        {{ activities[currentIndex].title || 'ไม่มีรายละเอียด' }}
        <i
          class="fas fa-info-circle activity-info-icon"
          @click="$emit('show-detail', activities[currentIndex])"
          title="ดูรายละเอียด"
        ></i>
      </div>

      <div class="options-container">
        <button
          v-for="option in answerOptions"
          :key="option.value"
          class="option-btn"
          :class="{ 'selected': answers[activities[currentIndex].no] === option.value }"
          @click="setAnswer(activities[currentIndex].no, option.value)"
        >
          {{ option.label }}
        </button>
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
  </div>
</template>

<script>
export default {
  name: 'ActivityQuestionStep',
  props: {
    questionNumber: {
      type: [Number, String],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    activities: {
      type: Array,
      required: true
    },
    currentIndex: {
      type: Number,
      required: true
    },
    answers: {
      type: Object,
      required: true
    },
    monthAge: {
      type: Number,
      default: null
    },
    timeActivity: {
      type: Number,
      default: null
    },
    answerOptions: {
      type: Array,
      default: () => [
        { value: 1, label: 'ทำได้ (1)' },
        { value: 2, label: 'ทำได้บ้าง (2)' },
        { value: 3, label: 'ทำไม่ได้ (3)' }
      ]
    }
  },
  methods: {
    setAnswer(activityId, answer) {
      this.$emit('update:answers', {
        ...this.answers,
        [activityId]: answer
      })
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
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.question-title::before {
  content: '';
  width: 6px;
  height: 30px;
  background: linear-gradient(135deg, #3551a4, #2c4088);
  border-radius: 3px;
}

.question-subtitle {
  color: #495057;
  font-size: 1.26rem;
  margin-bottom: 2rem;
  text-align: left;
  padding-left: 0.75rem;
  border-left: 3px solid #17a2b8;
}

.activity-description {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  font-size: 1.32rem;
  line-height: 1.6;
  color: #2c3e50;
  border: 2px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.activity-info-icon {
  color: #17a2b8;
  font-size: 1.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.activity-info-icon:hover {
  color: #138496;
  transform: scale(1.15);
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.option-btn {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border: 2px solid #dee2e6;
  color: #495057;
  padding: 1.25rem 1.75rem;
  border-radius: 0.75rem;
  font-size: 1.26rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.option-btn:hover {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
  border-color: #3551a4;
  box-shadow: 0 4px 12px rgba(53, 81, 164, 0.15);
}

.option-btn.selected {
  background: linear-gradient(135deg, #3551a4, #2c4088);
  border-color: #3551a4;
  color: white;
  box-shadow: 0 4px 16px rgba(53, 81, 164, 0.3);
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

.alert-info i {
  font-size: 1.5rem;
}
</style>

