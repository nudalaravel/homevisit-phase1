import { ref } from '@nuxtjs/composition-api'

export function useSurveyNavigation(initialStep = 1) {
  const currentStep = ref(initialStep)
  const currentActivityIndex = ref(0)
  const currentQ5Index = ref(0)
  const currentImageSubStep = ref(1)
  
  const nextStep = () => {
    currentStep.value++
    currentActivityIndex.value = 0
    currentQ5Index.value = 0
  }
  
  const prevStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }
  
  const goToStep = (step) => {
    currentStep.value = step
    currentActivityIndex.value = 0
    currentQ5Index.value = 0
  }
  
  const nextActivity = () => {
    currentActivityIndex.value++
  }
  
  const prevActivity = () => {
    if (currentActivityIndex.value > 0) {
      currentActivityIndex.value--
    }
  }
  
  const nextQ5Activity = () => {
    currentQ5Index.value++
  }
  
  const prevQ5Activity = () => {
    if (currentQ5Index.value > 0) {
      currentQ5Index.value--
    }
  }
  
  const nextImageSubStep = () => {
    currentImageSubStep.value = 2
  }
  
  const prevImageSubStep = () => {
    currentImageSubStep.value = 1
  }
  
  const resetImageSubStep = () => {
    currentImageSubStep.value = 1
  }
  
  return {
    currentStep,
    currentActivityIndex,
    currentQ5Index,
    currentImageSubStep,
    nextStep,
    prevStep,
    goToStep,
    nextActivity,
    prevActivity,
    nextQ5Activity,
    prevQ5Activity,
    nextImageSubStep,
    prevImageSubStep,
    resetImageSubStep
  }
}

