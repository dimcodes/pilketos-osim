import { load } from "../load";

export default [
  {
    path: "/admin/login",
    name: "admin-login",
    component: load.admin.login,
    meta: { title: "Login Admin" },
  },
  {
    path: "/admin",
    component: load.admin.layout,
    meta: { requiresAdmin: true },
    redirect: { name: "admin-dashboard" },
    children: [
      {
        path: "dashboard",
        name: "admin-dashboard",
        component: load.admin.dashboard,
        meta: { title: "Dashboard" },
      },
      {
        path: "paslon",
        name: "admin-paslon",
        component: load.admin.paslon,
        meta: { title: "Manajemen Paslon" },
      },
      {
        path: "pemilih",
        name: "admin-pemilih",
        component: load.admin.pemilih,
        meta: { title: "Data Pemilih" },
      },
      {
        path: "suara",
        name: "admin-suara",
        component: load.admin.suara,
        meta: { title: "Pemilih per Kandidat" },
      },
    ],
  },
];
