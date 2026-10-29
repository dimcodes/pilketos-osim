import { supabase } from "../../lib/supabase";
import { paslonFoto } from "../../lib/storage";

const KEY = "paslon_cache";
const TTL = 5 * 60 * 1000;

let pending = null;

const readCache = () => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;

    const { at, data } = JSON.parse(raw);
    return Date.now() - at < TTL ? data : null;
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {}
};

const preloadFoto = (rows) => {
  for (const row of rows) {
    const img = new Image();
    img.src = paslonFoto(row.nomor_urut);
  }
};

const fetchRows = async (token) => {
  try {
    const { data, error } = await supabase.rpc("get_paslons", {
      p_token: token,
    });

    if (error) return { data: null, error };

    const rows = data ?? [];
    writeCache(rows);
    preloadFoto(rows);

    return { data: rows, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getPaslons = async (token, { force = false } = {}) => {
  if (!force) {
    const cached = readCache();
    if (cached) return { data: cached, error: null };
  }

  if (!pending) {
    pending = fetchRows(token).finally(() => {
      pending = null;
    });
  }

  return pending;
};

export const warmPaslons = (token) => {
  getPaslons(token);
};

export const clearPaslons = () => {
  pending = null;

  try {
    sessionStorage.removeItem(KEY);
  } catch {}
};
