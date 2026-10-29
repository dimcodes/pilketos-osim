export const load = {
  login: () => import("../views/voter/page/login.vue"),
  vote: () => import("../views/voter/page/vote.vue"),
  notFound: () => import("../views/error/404.vue"),
  admin: {
    layout: () => import("../layouts/admin.vue"),
    login: () => import("../views/admin/page/login.vue"),
    dashboard: () => import("../views/admin/page/dashboard.vue"),
    paslon: () => import("../views/admin/page/paslon.vue"),
    pemilih: () => import("../views/admin/page/pemilih.vue"),
    suara: () => import("../views/admin/page/suara.vue"),
  },
};

export const prefetch = (...keys) => {
  const run = () => keys.forEach((key) => load[key]?.().catch(() => {}));

  if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 3000 });
  else setTimeout(run, 1500);
};
