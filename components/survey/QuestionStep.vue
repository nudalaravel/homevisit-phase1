<template>
  <div class="survey-step">
    <h4 class="question-title">
      {{ questionNumber }}. {{ title }}
    </h4>

    <div class="options-container" :class="{ 'multi-select': multiSelect }">
      <button
        v-for="option in options"
        :key="option.value"
        class="option-btn"
        :class="{ 'selected': isSelected(option.value) }"
        @click="handleSelect(option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Conditional text input -->
    <div v-if="showInput && inputValue !== undefined" class="form-container" style="margin-top: 2rem;">
      <b-form-group :label="inputLabel" :label-for="`${questionNumber}-input`">
        <b-form-input
          :id="`${questionNumber}-input`"
          :value="inputValue"
          :placeholder="inputPlaceholder"
          @input="$emit('update:inputValue', $event)"
        ></b-form-input>
      </b-form-group>
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
  name: 'QuestionStep',
  props: {
    questionNumber: {
      type: [Number, String],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true
    },
    value: {
      type: [Number, Array],
      default: null
    },
    multiSelect: {
      type: Boolean,
      default: false
    },
    showInput: {
      type: Boolean,
      default: false
    },
    inputValue: {
      type: String,
      default: ''
    },
    inputLabel: {
      type: String,
      default: 'โปรดระบุ:'
    },
    inputPlaceholder: {
      type: String,
      default: 'กรอกข้อมูล...'
    }
  },
  methods: {
    isSelected(optionValue) {
      if (this.multiSelect) {
        return Array.isArray(this.value) && this.value.includes(optionValue)
      }
      return this.value === optionValue
    },
    handleSelect(optionValue) {
      if (this.multiSelect) {
        const currentValue = Array.isArray(this.value) ? [...this.value] : []
        const index = currentValue.indexOf(optionValue)
        
        if (index > -1) {
          currentValue.splice(index, 1)
        } else {
          currentValue.push(optionValue)
        }
        
        this.$emit('input', currentValue)
      } else {
        this.$emit('input', optionValue)
      }
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

.options-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.options-container.multi-select {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
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
</style>

