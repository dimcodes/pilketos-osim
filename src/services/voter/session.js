import { reactive, readonly } from "vue";
import { clearPaslons } from "./paslon";

const KEY = "voter_session";

const load = () => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const state = reactive({ voter: load() });

const setVoter = (data) => {
  state.voter = data;
  try {
    if (data) sessionStorage.setItem(KEY, JSON.stringify(data));
    else sessionStorage.removeItem(KEY);
  } catch {}
};

const clearVoter = () => {
  clearPaslons();
  setVoter(null);
};

export const useSession = () => ({
  voter: readonly(state),
  setVoter,
  clearVoter,
});
