import { useSession } from "../services/voter/session";
import { useAdminSession } from "../services/admin/session";
import { useToast } from "../services/ui/toast";

export const installGuard = (router) => {
  const { voter } = useSession();
  const { admin } = useAdminSession();
  const { showToast } = useToast();

  router.beforeEach((to) => {
    if (to.meta.requiresVoter && !voter.voter?.token) {
      showToast("Akses ditolak! Silakan login terlebih dahulu.", "error");
      return { name: "login" };
    }

    if (to.meta.requiresAdmin && !admin.admin?.token) {
      showToast(
        "Akses ditolak! Silakan login sebagai admin terlebih dahulu.",
        "error",
      );
      return { name: "admin-login" };
    }
  });

  router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} | Pilketom` : "Pilketom";
  });
};
