import { reactive } from '@nuxtjs/composition-api'

/**
 * Composable for managing survey answers
 */
export function useSurveyAnswers() {
  const answers = reactive({
    q1: null,
    q1_des: '',
    q2: null,
    q2_des: '',
    q3: [],
    q3_des: '',
    q4: null,
    q5: {},
    q6: null, // เลือกได้แค่ตัวเลือกเดียว
    q6_other: '',
    q7: null,
    q71: [],
    q71_des: '',
    q8: null,
    q9: {},
    notes: '',
    endHour: null,
    endMinute: null
  })
  
  const toggleMultiSelect = (field, value) => {
    if (!Array.isArray(answers[field])) {
      answers[field] = []
    }
    
    const index = answers[field].indexOf(value)
    if (index > -1) {
      answers[field].splice(index, 1)
    } else {
      answers[field].push(value)
    }
  }
  
  const setActivityAnswer = (questionField, activityId, answer) => {
    if (!answers[questionField]) {
      answers[questionField] = {}
    }
    answers[questionField][activityId] = answer
  }
  
  const clearSkippedAnswers = () => {
    answers.q2 = null
    answers.q2_des = ''
    answers.q3 = []
    answers.q3_des = ''
    answers.q4 = null
    answers.q5 = {}
    answers.q6 = null
    answers.q6_other = ''
    answers.q7 = null
    answers.q71 = []
    answers.q71_des = ''
    answers.q8 = null
    answers.q9 = {}
  }
  
  const convertActivityAnswersToNumber = (activityAnswers) => {
    const converted = {}
    for (const [key, value] of Object.entries(activityAnswers)) {
      converted[key] = value != null ? Number(value) : null
    }
    return converted
  }
  
  const loadAnswers = (existingAnswers) => {
    Object.assign(answers, existingAnswers)
  }
  
  const resetAnswers = () => {
    answers.q1 = null
    answers.q1_des = ''
    answers.q2 = null
    answers.q2_des = ''
    answers.q3 = []
    answers.q3_des = ''
    answers.q4 = null
    answers.q5 = {}
    answers.q6 = null
    answers.q6_other = ''
    answers.q7 = null
    answers.q71 = []
    answers.q71_des = ''
    answers.q8 = null
    answers.q9 = {}
    answers.notes = ''
    answers.endHour = null
    answers.endMinute = null
  }
  
  return {
    answers,
    toggleMultiSelect,
    setActivityAnswer,
    clearSkippedAnswers,
    convertActivityAnswersToNumber,
    loadAnswers,
    resetAnswers
  }
}

