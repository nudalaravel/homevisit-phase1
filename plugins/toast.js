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
    success(message, titleOrOptions = "สำเร็จ") {
      // รองรับทั้ง string (title) และ object (options)
      const options = {
        message,
        variant: "success",
        duration: 3000,
      };
      
      if (typeof titleOrOptions === "string") {
        options.title = titleOrOptions;
      } else if (typeof titleOrOptions === "object") {
        Object.assign(options, titleOrOptions);
        if (!options.title) options.title = "สำเร็จ";
      }
      
      toastInstance.show(options);
    },
    error(message, titleOrOptions = "ข้อผิดพลาด") {
      // รองรับทั้ง string (title) และ object (options)
      const options = {
        message,
        variant: "error",
        duration: 4000,
      };
      
      if (typeof titleOrOptions === "string") {
        options.title = titleOrOptions;
      } else if (typeof titleOrOptions === "object") {
        Object.assign(options, titleOrOptions);
        if (!options.title) options.title = "ข้อผิดพลาด";
      }
      
      toastInstance.show(options);
    },
    warning(message, titleOrOptions = "คำเตือน") {
      // รองรับทั้ง string (title) และ object (options)
      const options = {
        message,
        variant: "warning",
        duration: 3500,
      };
      
      if (typeof titleOrOptions === "string") {
        options.title = titleOrOptions;
      } else if (typeof titleOrOptions === "object") {
        Object.assign(options, titleOrOptions);
        if (!options.title) options.title = "คำเตือน";
      }
      
      toastInstance.show(options);
    },
    info(message, titleOrOptions = "ข้อมูล") {
      // รองรับทั้ง string (title) และ object (options)
      const options = {
        message,
        variant: "info",
        duration: 3000,
      };
      
      if (typeof titleOrOptions === "string") {
        options.title = titleOrOptions;
      } else if (typeof titleOrOptions === "object") {
        Object.assign(options, titleOrOptions);
        if (!options.title) options.title = "ข้อมูล";
      }
      
      toastInstance.show(options);
    },
    hide() {
      toastInstance.hide();
    },
  };

  // Inject into Vue instance and Nuxt context
  inject("toast", toast);
};
