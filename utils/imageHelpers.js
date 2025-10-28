import { MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, IMAGE_QUALITY } from "./constants";

/**
 * Convert image file to WebP format with size optimization
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width (default from constants)
 * @param {number} maxHeight - Maximum height (default from constants)
 * @param {number} quality - Image quality (0-1, default from constants)
 * @returns {Promise<string>} Base64 WebP image data URL
 */
export function convertToWebP(
  file,
  maxWidth = MAX_IMAGE_WIDTH,
  maxHeight = MAX_IMAGE_HEIGHT,
  quality = IMAGE_QUALITY
) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP
        const webpDataUrl = canvas.toDataURL("image/webp", quality);
        resolve(webpDataUrl);
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Preload images from URLs for caching
 * @param {Array<string>} imageUrls - Array of image URLs
 * @param {number} maxImages - Maximum number of images to preload
 * @returns {Promise<number>} Number of images preloaded
 */
export async function preloadImages(imageUrls, maxImages = 50) {
  if (!navigator.onLine || !imageUrls || imageUrls.length === 0) {
    return 0;
  }

  let count = 0;
  const urlsToPreload = imageUrls.slice(0, maxImages);

  for (const url of urlsToPreload) {
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      const img = new Image();
      img.src = url;
      count++;
    }
  }

  return count;
}

/**
 * Extract image URLs from survey data
 * @param {Array} surveys - Array of survey objects
 * @returns {Array<string>} Array of image URLs
 */
export function extractImageUrls(surveys) {
  const urls = [];

  for (const survey of surveys) {
    if (survey.surveyImages && Array.isArray(survey.surveyImages)) {
      for (const img of survey.surveyImages) {
        if (typeof img === "object" && img?.url) {
          const url = img.url;
          if (url.startsWith("http://") || url.startsWith("https://")) {
            urls.push(url);
          }
        }
      }
    }
  }

  return urls;
}
