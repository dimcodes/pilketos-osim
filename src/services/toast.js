import { reactive, readonly } from "vue";

const state = reactive({
  show: false,
  message: "",
  type: "success",
});

let timer = null;

const showToast = (message, type = "success", duration = 3500) => {
  state.message = message;
  state.type = type;
  state.show = true;

  if (timer) clearTimeout(timer);

  timer = setTimeout(() => {
    state.show = false;
  }, duration);
};

export const useToast = () => {
  return {
    toastState: readonly(state),
    showToast,
  };
};
