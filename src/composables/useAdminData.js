import { reactive, computed, toRef, onMounted, onBeforeUnmount } from "vue";
import { fetchPaslons, fetchPemilihs } from "../services/admin/admin.api";

const POLL_INTERVAL = 3000;

const state = reactive({
  paslons: [],
  pemilihs: [],
  loaded: { paslons: false, pemilihs: false },
});

const consumers = new Map();
let timer = null;
let inflight = null;

const activeNeeds = () => {
  const needs = { paslons: false, pemilihs: false };

  for (const need of consumers.values()) {
    needs.paslons ||= need.paslons;
    needs.pemilihs ||= need.pemilihs;
  }

  return needs;
};

const runRefresh = async () => {
  const needs = activeNeeds();

  const [paslons, pemilihs] = await Promise.all([
    needs.paslons ? fetchPaslons() : null,
    needs.pemilihs ? fetchPemilihs() : null,
  ]);

  if (paslons) {
    state.paslons = paslons;
    state.loaded.paslons = true;
  }

  if (pemilihs) {
    state.pemilihs = pemilihs;
    state.loaded.pemilihs = true;
  }
};

export const refresh = async ({ force = false } = {}) => {
  if (inflight) {
    if (!force) return inflight;
    await inflight;
  }

  inflight = runRefresh().finally(() => {
    inflight = null;
  });

  return inflight;
};

const onTick = () => {
  if (!document.hidden) refresh();
};

const startPolling = () => {
  if (timer) return;
  timer = setInterval(onTick, POLL_INTERVAL);
  document.addEventListener("visibilitychange", onTick);
};

const stopPolling = () => {
  clearInterval(timer);
  timer = null;
  document.removeEventListener("visibilitychange", onTick);
};

export const useAdminData = ({ paslons = false, pemilihs = false } = {}) => {
  const token = Symbol("admin-data");

  const ready = computed(
    () =>
      (!paslons || state.loaded.paslons) &&
      (!pemilihs || state.loaded.pemilihs),
  );

  onMounted(() => {
    consumers.set(token, { paslons, pemilihs });
    startPolling();
    refresh({ force: true });
  });

  onBeforeUnmount(() => {
    consumers.delete(token);
    if (!consumers.size) stopPolling();
  });

  return {
    paslons: toRef(state, "paslons"),
    pemilihs: toRef(state, "pemilihs"),
    ready,
    refresh,
  };
};
