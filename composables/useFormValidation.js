import { ref, reactive } from "@nuxtjs/composition-api";
import { validateForm } from "~/utils/validators";

export function useFormValidation(initialData = {}, validators = {}) {
  const formData = reactive({ ...initialData });
  const errors = reactive({});

  const clearError = (field) => {
    if (errors[field]) {
      delete errors[field];
    }
  };

  const clearAllErrors = () => {
    Object.keys(errors).forEach((key) => delete errors[key]);
  };

  const validate = () => {
    clearAllErrors();
    const result = validateForm(formData, validators);

    if (!result.valid) {
      Object.assign(errors, result.errors);
    }

    return result.valid;
  };

  const resetForm = (newData = initialData) => {
    clearAllErrors();
    Object.assign(formData, newData);
  };

  return {
    formData,
    errors,
    clearError,
    clearAllErrors,
    validate,
    resetForm,
  };
}
