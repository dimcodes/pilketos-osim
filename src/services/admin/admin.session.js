import { reactive, readonly } from "vue";

const KEY = "admin_session";

const load = () => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const state = reactive({ admin: load() });

const setAdmin = (data) => {
  state.admin = data;
  try {
    if (data) sessionStorage.setItem(KEY, JSON.stringify(data));
    else sessionStorage.removeItem(KEY);
  } catch {}
};

const clearAdmin = () => setAdmin(null);

export const useAdminSession = () => ({
  admin: readonly(state),
  setAdmin,
  clearAdmin,
});
