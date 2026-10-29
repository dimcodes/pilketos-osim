import { supabase } from "../../lib/supabase";

const MISSING_CODES = ["PGRST202", "42883"];

const fetchList = async (fn) => {
  try {
    const { data, error } = await supabase.rpc(fn);
    return error ? null : (data ?? []);
  } catch {
    return null;
  }
};

const callRpc = async (fn, args) => {
  try {
    const { error } = await supabase.rpc(fn, args);
    return { error };
  } catch (error) {
    return { error };
  }
};

export const getPaslons = () => fetchList("get_paslons");

export const getPemilihs = () => fetchList("get_pemilihs");

export const getCounts = async () => {
  try {
    const { data, error } = await supabase.rpc("get_stats");

    if (error) return { missing: MISSING_CODES.includes(error.code) };

    const row = Array.isArray(data) ? data[0] : data;

    return {
      data: {
        total: Number(row?.total) || 0,
        sudah: Number(row?.sudah) || 0,
      },
    };
  } catch {
    return {};
  }
};

export const savePemilih = (form) =>
  callRpc("save_pemilih", {
    p_id: form.id,
    p_nama: form.nama,
    p_kelas: form.kelas,
    p_username: form.username,
    p_tanggal_lahir: form.tanggal_lahir,
    p_sudah_memilih: form.sudah_memilih,
    p_pilih_paslon: form.sudah_memilih ? form.pilih_paslon : null,
  });

export const deletePemilih = (id) => callRpc("delete_pemilih", { p_id: id });

export const savePaslon = (form) => {
  const misi =
    typeof form.misi === "string"
      ? form.misi.split("\n").filter((line) => line.trim() !== "")
      : form.misi;

  return callRpc("save_paslon", {
    p_id: form.id,
    p_nama: form.nama,
    p_nomor_urut: form.nomor_urut,
    p_visi: form.visi,
    p_misi: misi,
  });
};

export const deletePaslon = (id) => callRpc("delete_paslon", { p_id: id });
