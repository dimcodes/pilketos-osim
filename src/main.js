import "@fontsource/poppins/300.css"; // Light
import "@fontsource/poppins/400.css"; // Regular
import "@fontsource/poppins/500.css"; // Medium
import "@fontsource/poppins/600.css"; // SemiBold
import "@fontsource/poppins/700.css"; // Bold

import { createApp } from "vue";
import "./assets/style.css";
import App from "./App.vue";
import router from "./router";

createApp(App).use(router).mount("#app");
