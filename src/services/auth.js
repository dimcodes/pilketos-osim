import { supabase } from "../supabase";
import { useSession } from "./session";

const { setVoter } = useSession();

export const validateVoterLogin = async (username, tanggalLahir) => {
  try {
    const { data, error } = await supabase.rpc("login_pemilih", {
      p_username: username.trim(),
      p_tanggal_lahir: tanggalLahir.trim(),
    });

    if (error) {
      return { success: false, message: "Terjadi kesalahan pada database." };
    }

    if (!data?.ok) {
      return { success: false, message: data?.message || "Login gagal." };
    }

    setVoter({
      token: data.token,
      nama: data.nama,
      kelas: data.kelas,
      username: data.username,
    });

    return { success: true };
  } catch {
    return { success: false, message: "Gagal memproses login. Coba lagi." };
  }
};
