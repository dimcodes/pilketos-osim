import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Vote from "../views/Vote.vue";
import { useAdminSession } from "../services/admin/admin.session";
import NotFound from "../views/404.vue";
import { useSession } from "../services/session";
import { useToast } from "../services/toast";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/login", name: "login", component: Login },
  {
    path: "/vote",
    name: "vote",
    component: Vote,
    meta: { requiresVoter: true },
  },
  {
    path: "/admin/login",
    name: "admin-login",
    component: () => import("../views/admin/Login.vue"),
  },
  {
    path: "/admin/dashboard",
    name: "admin-dashboard",
    component: () => import("../views/admin/Dashboard.vue"),
    meta: { requiresAdmin: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "404",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const { voter } = useSession();
  const { admin } = useAdminSession();
  const { showToast } = useToast();

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

export default router;
