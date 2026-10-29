import { reactive, computed, toRef, onMounted, onBeforeUnmount } from "vue";
import { getPaslons, getPemilihs, getCounts } from "../../services/admin/api";

const TICK = 3000;
const LIST_MAX_AGE = 60000;
const LIST_FALLBACK_EVERY = 10000;

const state = reactive({
  paslons: [],
  pemilihs: [],
  counts: { total: 0, sudah: 0 },
  loaded: { paslons: false, pemilihs: false, counts: false },
});

const consumers = new Map();
const signatures = { paslons: "", pemilihs: "" };

let timer = null;
let inflight = null;
let countsMissing = false;
let listAt = 0;
let listSig = "";

const activeNeeds = () => {
  const needs = { paslons: false, pemilihs: false, counts: false };

  for (const need of consumers.values()) {
    needs.paslons ||= need.paslons;
    needs.pemilihs ||= need.pemilihs;
    needs.counts ||= need.counts;
  }

  return needs;
};

const assign = (key, rows) => {
  const signature = JSON.stringify(rows);

  if (signature !== signatures[key]) {
    signatures[key] = signature;
    state[key] = rows;
  }

  state.loaded[key] = true;
};

const setCounts = (counts) => {
  if (counts.total !== state.counts.total || counts.sudah !== state.counts.sudah) {
    state.counts = counts;
  }

  state.loaded.counts = true;
};

const countsOf = (rows) => ({
  total: rows.length,
  sudah: rows.reduce((n, p) => n + (p.sudah_memilih ? 1 : 0), 0),
});

const pullPaslons = async () => {
  const rows = await getPaslons();
  if (rows) assign("paslons", rows);
};

const pullList = async () => {
  const rows = await getPemilihs();
  if (!rows) return;

  assign("pemilihs", rows);
  setCounts(countsOf(rows));

  listAt = Date.now();
  listSig = `${state.counts.total}:${state.counts.sudah}`;
};

const syncVoters = async (needs, force) => {
  if (!countsMissing) {
    const result = await getCounts();

    if (result.data) {
      setCounts(result.data);

      const signature = `${result.data.total}:${result.data.sudah}`;
      const stale = Date.now() - listAt > LIST_MAX_AGE;
      const changed = signature !== listSig;

      if (needs.pemilihs && (force || !state.loaded.pemilihs || changed || stale)) {
        await pullList();
      }
      return;
    }

    if (!result.missing) return;
    countsMissing = true;
  }

  const due = Date.now() - listAt > LIST_FALLBACK_EVERY;

  if (force || !state.loaded.pemilihs || due) await pullList();
};

const runRefresh = async (force) => {
  const needs = activeNeeds();
  const jobs = [];

  if (needs.paslons) jobs.push(pullPaslons());
  if (needs.pemilihs || needs.counts) jobs.push(syncVoters(needs, force));

  await Promise.all(jobs);
};

export const refresh = async ({ force = false } = {}) => {
  if (inflight) {
    if (!force) return inflight;
    await inflight;
  }

  inflight = runRefresh(force).finally(() => {
    inflight = null;
  });

  return inflight;
};

const onTick = () => {
  if (!document.hidden) refresh();
};

const startPolling = () => {
  if (timer) return;
  timer = setInterval(onTick, TICK);
  document.addEventListener("visibilitychange", onTick);
};

const stopPolling = () => {
  clearInterval(timer);
  timer = null;
  document.removeEventListener("visibilitychange", onTick);
};

export const useData = ({ paslons = false, pemilihs = false, counts = false } = {}) => {
  const token = Symbol("admin-data");

  const ready = computed(
    () =>
      (!paslons || state.loaded.paslons) &&
      (!pemilihs || state.loaded.pemilihs) &&
      (!counts || state.loaded.counts),
  );

  onMounted(() => {
    consumers.set(token, { paslons, pemilihs, counts });
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
    counts: toRef(state, "counts"),
    ready,
    refresh,
  };
};
