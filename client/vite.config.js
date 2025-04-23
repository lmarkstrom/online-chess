/* eslint-disable */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __VUE_PROD_DEVTOOLS__: true,
  },
  mode: "development",
  plugins: [vue()],
  preview: {
    port: 8989,
  },
  server: {
    port: 8989,
  },
});
