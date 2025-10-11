import Vue from "vue";
import Toast from "~/components/Toast.vue";

export default ({ app }, inject) => {
  // Create Toast component instance
  const ToastConstructor = Vue.extend(Toast);
  const toastInstance = new ToastConstructor();

  // Mount to body when on client
  if (process.client) {
    toastInstance.$mount();
    document.body.appendChild(toastInstance.$el);
  }

  // Create toast helper methods
  const toast = {
    show(options) {
      if (typeof options === "string") {
        toastInstance.show({ message: options });
      } else {
        toastInstance.show(options);
      }
    },
    success(message, title = "สำเร็จ") {
      toastInstance.show({
        title,
        message,
        variant: "success",
        duration: 3000,
      });
    },
    error(message, title = "ข้อผิดพลาด") {
      toastInstance.show({
        title,
        message,
        variant: "error",
        duration: 4000,
      });
    },
    warning(message, title = "คำเตือน") {
      toastInstance.show({
        title,
        message,
        variant: "warning",
        duration: 3500,
      });
    },
    info(message, title = "ข้อมูล") {
      toastInstance.show({
        title,
        message,
        variant: "info",
        duration: 3000,
      });
    },
    hide() {
      toastInstance.hide();
    },
  };

  // Inject into Vue instance and Nuxt context
  inject("toast", toast);
};
