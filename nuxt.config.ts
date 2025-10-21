import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxt/eslint", "@nuxt/image", "@nuxt/ui", "@nuxtjs/apollo"],
  vite: {
    plugins: [tailwindcss()],
  },
  apollo: {
    clients: {
      default: {
        // httpEndpoint: "http://localhost:3000",
        httpEndpoint: "http://localhost:8080/v1/graphql",
      },
    },
  },
  eslint: {
    config: {
      standalone: false,
    },
  },
});
