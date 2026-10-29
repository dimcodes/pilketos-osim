import { supabase } from "./supabase";

const urls = new Map();

export const paslonFoto = (nomor) => {
  let url = urls.get(nomor);

  if (!url) {
    url = supabase.storage.from("paslon").getPublicUrl(`${nomor}.jpg`).data
      .publicUrl;
    urls.set(nomor, url);
  }

  return url;
};
