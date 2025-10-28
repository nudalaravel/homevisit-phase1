import { ref } from "@nuxtjs/composition-api";
import { generateYearOptions } from "~/utils/visitHelpers";

export function useYearOptions() {
  const yearOptions = ref(generateYearOptions());

  return {
    yearOptions,
  };
}
