import { createRouter, createWebHistory } from "vue-router";
import { load } from "./load";
import { installGuard } from "./guard";
import voterRoutes from "./routes/voter";
import adminRoutes from "./routes/admin";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...voterRoutes,
    ...adminRoutes,
    {
      path: "/:pathMatch(.*)*",
      name: "404",
      component: load.notFound,
      meta: { title: "Halaman Tidak Ditemukan" },
    },
  ],
});

installGuard(router);

export default router;
