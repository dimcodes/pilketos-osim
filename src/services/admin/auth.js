import { supabase } from "../../lib/supabase";
import { useAdminSession } from "./session";

const { setAdmin } = useAdminSession();

export const validateAdminLogin = async (username, password) => {
  try {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("username", cleanUsername)
      .eq("password", cleanPassword)
      .maybeSingle();

    if (error) {
      return { success: false, message: "Terjadi kesalahan pada database." };
    }

    if (!data) {
      return { success: false, message: "Username atau Password salah!" };
    }
    setAdmin({
      token: data.id,
      id: data.id,
      nama: data.nama || data.username,
      username: data.username,
      foto: data.foto,
    });

    return { success: true };
  } catch {
    return { success: false, message: "Gagal memproses login. Coba lagi." };
  }
};
