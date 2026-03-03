/**
 * PDF Generation Helpers
 * Shared utility for generating PDFs from HTML content using html2canvas + jsPDF
 */
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

/** A4 PDF constants */
const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const DEFAULT_MARGIN_MM = 10
const DEFAULT_CONTAINER_WIDTH = 680

/**
 * Generate a PDF from an HTML element by cloning it off-screen
 * @param {HTMLElement} sourceElement - The DOM element to capture
 * @param {string} filename - Output PDF filename
 * @param {Object} [options] - Configuration options
 * @param {number} [options.margin=10] - Page margin in mm
 * @param {number} [options.containerWidth=680] - Off-screen container width in px
 * @param {string} [options.fontFamily] - Font family override
 * @param {Function} [options.applyStyles] - Callback to apply inline styles to container before capture
 * @returns {Promise<void>}
 */
export async function generatePDFFromElement(sourceElement, filename, options = {}) {
  const {
    margin = DEFAULT_MARGIN_MM,
    containerWidth = DEFAULT_CONTAINER_WIDTH,
    fontFamily = "'Kanit', 'Sarabun', Arial, sans-serif",
    applyStyles = null
  } = options

  const pdfContainer = document.createElement('div')
  pdfContainer.id = 'pdf-gen-container'
  pdfContainer.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: ${containerWidth}px;
    background: white;
    padding: 20px;
    font-family: ${fontFamily};
    font-size: 14px;
    line-height: 1.6;
    color: #000000;
  `

  pdfContainer.innerHTML = sourceElement.innerHTML
  document.body.appendChild(pdfContainer)

  if (applyStyles) {
    applyStyles(pdfContainer)
  }

  await new Promise(resolve => setTimeout(resolve, 500))

  try {
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: containerWidth,
      windowWidth: containerWidth
    })

    document.body.removeChild(pdfContainer)

    const contentWidth = A4_WIDTH_MM - (margin * 2)
    const imgHeight = (canvas.height * contentWidth) / canvas.width
    const pageHeight = A4_HEIGHT_MM - (margin * 2)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const totalPages = Math.ceil(imgHeight / pageHeight)

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage()

      const sourceY = (page * pageHeight * canvas.width) / contentWidth
      const sourceHeight = Math.min(
        (pageHeight * canvas.width) / contentWidth,
        canvas.height - sourceY
      )

      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = sourceHeight

      const ctx = pageCanvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight)

      const sliceHeight = (sourceHeight * contentWidth) / canvas.width
      pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, contentWidth, sliceHeight)
    }

    pdf.save(filename)
  } catch (error) {
    // Clean up on error
    const container = document.getElementById('pdf-gen-container')
    if (container) document.body.removeChild(container)
    throw error
  }
}

/**
 * Generate a PDF from raw HTML string
 * @param {string} htmlContent - HTML string to render
 * @param {string} filename - Output PDF filename
 * @param {Object} [options] - Same options as generatePDFFromElement
 * @returns {Promise<void>}
 */
export async function generatePDFFromHTML(htmlContent, filename, options = {}) {
  const {
    margin = DEFAULT_MARGIN_MM,
    containerWidth = DEFAULT_CONTAINER_WIDTH,
    fontFamily = "'Kanit', 'Sarabun', sans-serif"
  } = options

  const container = document.createElement('div')
  container.innerHTML = htmlContent
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: ${containerWidth}px;
    background: white;
    font-family: ${fontFamily};
    font-size: 14px;
    line-height: 1.6;
    color: #000000;
  `
  document.body.appendChild(container)

  await new Promise(resolve => setTimeout(resolve, 500))

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: containerWidth,
      windowWidth: containerWidth
    })

    document.body.removeChild(container)

    const contentWidth = A4_WIDTH_MM - (margin * 2)
    const imgHeight = (canvas.height * contentWidth) / canvas.width
    const pageHeight = A4_HEIGHT_MM - (margin * 2)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const totalPages = Math.ceil(imgHeight / pageHeight)

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage()

      const sourceY = (page * pageHeight * canvas.width) / contentWidth
      const sourceHeight = Math.min(
        (pageHeight * canvas.width) / contentWidth,
        canvas.height - sourceY
      )

      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = sourceHeight

      const ctx = pageCanvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight)

      const sliceHeight = (sourceHeight * contentWidth) / canvas.width
      pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, contentWidth, sliceHeight)
    }

    pdf.save(filename)
  } catch (error) {
    const el = document.getElementById('pdf-gen-container')
    if (el) document.body.removeChild(el)
    throw error
  }
}

/**
 * Convert an image URL to base64 data URL
 * @param {string} url - Image URL
 * @returns {Promise<string|null>} Base64 data URL or null on failure
 */
export async function imageToBase64(url) {
  try {
    const response = await fetch(url, { mode: 'cors' })
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error converting image to base64:', error)
    return null
  }
}
