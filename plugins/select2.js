export default function ({ app }, inject) {
  if (process.client) {
    // Load jQuery and Select2 only on client side
    const $ = require('jquery')
    require('select2')
    require('select2/dist/css/select2.min.css')
    
    // Make jQuery and Select2 available globally
    window.$ = window.jQuery = $
    
    // Provide helper method to initialize select2
    inject('select2', {
      init(element, options = {}) {
        if (process.client && window.$ && window.$.fn.select2) {
          const defaultOptions = {
            theme: 'default',
            width: '100%',
            language: {
              noResults: () => 'ไม่พบข้อมูล'
            }
          }
          const $element = window.$(element)
          
          // Check if already initialized
          if ($element.data('select2')) {
            $element.select2('destroy')
          }
          
          return $element.select2({ ...defaultOptions, ...options })
        }
      },
      destroy(element) {
        if (process.client && window.$ && window.$.fn.select2) {
          const $element = window.$(element)
          if ($element.data('select2')) {
            $element.select2('destroy')
          }
        }
      },
      update(element) {
        if (process.client && window.$ && window.$.fn.select2) {
          const $element = window.$(element)
          if ($element.data('select2')) {
            $element.trigger('change')
          }
        }
      }
    })
  } else {
    // Server-side: provide empty methods
    inject('select2', {
      init() {},
      destroy() {},
      update() {}
    })
  }
}

