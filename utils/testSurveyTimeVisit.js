/**
 * Test script for verifying time_visit and time recording in surveys
 * Tests 48 visits to ensure correct recording of time_visit (1-48) and time (1-4 cycle)
 */

/**
 * Calculate expected time (1-4 cycle) for a given visit number
 * @param {number} visitNumber - Visit number (1-48)
 * @returns {number} Expected time value (1-4)
 */
export function calculateExpectedTime(visitNumber) {
  // time cycles: 1,2,3,4,1,2,3,4,...
  return ((visitNumber - 1) % 4) + 1
}

/**
 * Calculate expected month_age for a given visit number
 * @param {number} visitNumber - Visit number (1-48)
 * @returns {number} Expected month_age value (1-12)
 */
export function calculateExpectedMonthAge(visitNumber) {
  // month_age increases every 4 visits: 1,1,1,1,2,2,2,2,3,3,3,3,...
  return Math.floor((visitNumber - 1) / 4) + 1
}

/**
 * Simulate saving survey progress (mimics saveProgress logic from survey.vue)
 * @param {Object} indexedDB - IndexedDB instance
 * @param {string} stid - Visitor stid
 * @param {number} time - Time value (1-4)
 * @param {number} monthAge - Month age value (1-12)
 * @param {number} expectedTimeVisit - Expected time_visit value
 * @returns {Promise<Object>} Saved survey data with recorded values
 */
async function simulateSaveProgress(indexedDB, stid, time, monthAge, expectedTimeVisit) {
  // Get existing survey to check if time_visit exists
  // Use time_visit in surveyId to avoid duplicates (since time cycles 1-4)
  const surveyId = `${stid}_${expectedTimeVisit}`
  const existingSurvey = await indexedDB.getSurveyProgressById(surveyId)
  
  // Calculate time_visit (same logic as saveProgress in survey.vue)
  let timeVisit
  if (existingSurvey && existingSurvey.time_visit) {
    timeVisit = existingSurvey.time_visit
  } else {
    const completedSurveys = await indexedDB.getCompletedSurveysByStid(stid)
    timeVisit = completedSurveys.length + 1
  }
  
  // Validation (same as saveProgress)
  if (!timeVisit || timeVisit < 1) {
    console.error(`⚠️ Invalid time_visit calculated: ${timeVisit} for stid: ${stid}`)
    timeVisit = 1
  }
  
  // Create progress data (mimics progressData structure)
  const progressData = {
    id: surveyId,
    stid: stid,
    time: time,
    time_visit: timeVisit,
    month_age: monthAge,
    recStart: new Date().toISOString().slice(0, 19).replace('T', ' '),
    recEnd: new Date().toISOString().slice(0, 19).replace('T', ' '),
    timeStart: null,
    timeEnd: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} น.`,
    appointmentDate: new Date().toISOString().split('T')[0],
    currentStep: 12,
    currentActivityIndex: 0,
    currentQ5Index: 0,
    answers: {
      q1: 1,
      q2: 1,
      q3: [],
      q4: 1,
      q5: {},
      q6: 1,
      q7: 3,
      q71: [],
      q8: 3,
      q9: {},
      notes: '',
      endHour: '12',
      endMinute: '00'
    },
    note: '',
    newAppointment: {},
    surveyImages: [],
    surveyImageKeys: [],
    q5Activities: [],
    completed: true,
    synced: false,
    approve_status: 0
  }
  
  // Save to IndexedDB
  await indexedDB.saveSurveyProgress(progressData)
  
  // Mark as completed
  await indexedDB.markSurveyCompleted(surveyId, progressData.timeEnd, progressData.recEnd)
  
  // Retrieve saved survey to verify
  const savedSurvey = await indexedDB.getSurveyProgressById(surveyId)
  
  return {
    recorded_time_visit: savedSurvey?.time_visit || null,
    recorded_time: savedSurvey?.time || null,
    recorded_month_age: savedSurvey?.month_age || null,
    survey_id: savedSurvey?.id || null
  }
}

/**
 * Test survey time_visit and time recording for 48 visits
 * @param {string} stid - Visitor stid to test with
 * @param {Object} indexedDB - IndexedDB instance
 * @returns {Promise<Array>} Test results array
 */
export async function testSurveyTimeVisitRecording(stid, indexedDB) {
  console.log('🧪 Starting test: Survey Time Visit Recording (1-48 visits)')
  console.log(`📋 Testing with stid: ${stid}`)
  console.log('')
  
  // Ensure IndexedDB is initialized
  const dbReady = await indexedDB.ensureInitialized()
  if (!dbReady) {
    console.error('❌ IndexedDB is not available')
    return []
  }
  
  // Clean up existing surveys for this stid (optional - comment out if you want to keep existing data)
  try {
    const existingSurveys = await indexedDB.getAllSurveysByStid(stid)
    for (const survey of existingSurveys) {
      await indexedDB.deleteSurveyProgress(survey.id)
    }
    console.log(`🧹 Cleaned up ${existingSurveys.length} existing surveys for ${stid}`)
  } catch (error) {
    console.warn('⚠️ Could not clean up existing surveys:', error.message)
  }
  
  const results = []
  
  // Test 48 visits
  for (let visitNumber = 1; visitNumber <= 48; visitNumber++) {
    // Calculate expected values
    const expectedTime = calculateExpectedTime(visitNumber)
    const expectedMonthAge = calculateExpectedMonthAge(visitNumber)
    const expectedTimeVisit = visitNumber
    
    // Simulate saving survey
    const recorded = await simulateSaveProgress(
      indexedDB,
      stid,
      expectedTime,
      expectedMonthAge,
      expectedTimeVisit
    )
    
    // Verify results
    const timeVisitCorrect = recorded.recorded_time_visit === expectedTimeVisit
    const timeCorrect = recorded.recorded_time === expectedTime
    const monthAgeCorrect = recorded.recorded_month_age === expectedMonthAge
    const allCorrect = timeVisitCorrect && timeCorrect && monthAgeCorrect
    
    // Store result
    results.push({
      visit_number: visitNumber,
      expected_time_visit: expectedTimeVisit,
      expected_time: expectedTime,
      expected_month_age: expectedMonthAge,
      recorded_time_visit: recorded.recorded_time_visit,
      recorded_time: recorded.recorded_time,
      recorded_month_age: recorded.recorded_month_age,
      time_visit_status: timeVisitCorrect ? '✅' : '❌',
      time_status: timeCorrect ? '✅' : '❌',
      month_age_status: monthAgeCorrect ? '✅' : '❌',
      overall_status: allCorrect ? '✅' : '❌',
      survey_id: recorded.survey_id
    })
    
    // Log progress every 12 visits
    if (visitNumber % 12 === 0) {
      console.log(`📊 Progress: ${visitNumber}/48 visits tested`)
    }
  }
  
  // Display results in console.table
  console.log('')
  console.log('📊 Test Results:')
  console.log('')
  console.table(results)
  
  // Summary statistics
  const totalTests = results.length
  const passedTests = results.filter(r => r.overall_status === '✅').length
  const failedTests = totalTests - passedTests
  
  const timeVisitPassed = results.filter(r => r.time_visit_status === '✅').length
  const timePassed = results.filter(r => r.time_status === '✅').length
  const monthAgePassed = results.filter(r => r.month_age_status === '✅').length
  
  console.log('')
  console.log('📈 Summary:')
  console.log(`   Total tests: ${totalTests}`)
  console.log(`   Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`)
  console.log(`   Failed: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`)
  console.log('')
  console.log('📋 Breakdown:')
  console.log(`   time_visit correct: ${timeVisitPassed}/${totalTests} (${((timeVisitPassed / totalTests) * 100).toFixed(1)}%)`)
  console.log(`   time correct: ${timePassed}/${totalTests} (${((timePassed / totalTests) * 100).toFixed(1)}%)`)
  console.log(`   month_age correct: ${monthAgePassed}/${totalTests} (${((monthAgePassed / totalTests) * 100).toFixed(1)}%)`)
  console.log('')
  
  // Show failed tests if any
  if (failedTests > 0) {
    console.log('❌ Failed Tests:')
    const failed = results.filter(r => r.overall_status === '❌')
    console.table(failed)
    console.log('')
  } else {
    console.log('✅ All tests passed!')
    console.log('')
  }
  
  // Check for duplicate time_visit values
  const timeVisits = results.map(r => r.recorded_time_visit).filter(Boolean)
  const uniqueTimeVisits = new Set(timeVisits)
  if (timeVisits.length !== uniqueTimeVisits.size) {
    console.warn('⚠️ Warning: Duplicate time_visit values detected!')
    const duplicates = timeVisits.filter((v, i) => timeVisits.indexOf(v) !== i)
    console.warn(`   Duplicates: ${[...new Set(duplicates)].join(', ')}`)
    console.log('')
  } else {
    console.log('✅ No duplicate time_visit values found')
    console.log('')
  }
  
  return results
}

/**
 * Quick test function that can be called from browser console
 * Usage: testSurveyTimeVisit('TEST_STID_001')
 * @param {string} stid - Visitor stid (default: 'TEST_STID_001')
 */
export async function quickTest(stid = 'TEST_STID_001') {
  // This function should be called from a Vue component context where $indexedDB is available
  // For standalone testing, you would need to pass indexedDB instance
  if (typeof window !== 'undefined' && window.$nuxt && window.$nuxt.$indexedDB) {
    return await testSurveyTimeVisitRecording(stid, window.$nuxt.$indexedDB)
  } else {
    console.error('❌ IndexedDB instance not available. Please call from Vue component context.')
    return []
  }
}

