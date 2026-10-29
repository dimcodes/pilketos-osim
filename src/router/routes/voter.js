import home from "../../views/voter/page/home.vue";
import { load } from "../load";

export default [
  { path: "/", name: "home", component: home, meta: { title: "Beranda" } },
  {
    path: "/login",
    name: "login",
    component: load.login,
    meta: { title: "Login Pemilih" },
  },
  {
    path: "/vote",
    name: "vote",
    component: load.vote,
    meta: { requiresVoter: true, title: "Bilik Suara" },
  },
];
