import { ref } from "@nuxtjs/composition-api";
import { convertToWebP } from "~/utils/imageHelpers";
import { validateImageFile } from "~/utils/validators";
import { MAX_FILE_SIZE } from "~/utils/constants";

export function useImageUpload(onSuccess, onError) {
  const uploading = ref(false);

  const handleFileSelect = async (file, maxSize = MAX_FILE_SIZE) => {
    if (!file) return null;

    // Validate file
    const validation = validateImageFile(file, maxSize);
    if (!validation.valid) {
      if (onError) onError(validation.error);
      return null;
    }

    try {
      uploading.value = true;

      // Convert to WebP
      const webpImage = await convertToWebP(file);

      if (onSuccess) onSuccess(webpImage);

      return webpImage;
    } catch (error) {
      if (onError) onError("เกิดข้อผิดพลาดในการประมวลผลรูปภาพ");
      return null;
    } finally {
      uploading.value = false;
    }
  };

  return {
    uploading,
    handleFileSelect,
  };
}
