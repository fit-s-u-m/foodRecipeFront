import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxt/eslint", "@nuxt/image", "@nuxt/ui", "@nuxtjs/apollo"],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    hasuraAdminSecret: process.env.HASURA_ADMIN_SECRET, // server-only
    public: {
      hasuraAdminSecret: process.env.HASURA_ADMIN_SECRET, // exposed to client
    },
  },
  apollo: {
    clients: {
      default: {
        httpEndpoint: "http://localhost:8080/v1/graphql",
        httpLinkOptions: {
          headers: {
            "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET, // only on server
          },
        },
      },
    },
  },
  tailwindcss: {
    content: [
      "./components/**/*.{vue,js,ts}",
      "./pages/**/*.{vue,js,ts}", // dynamic pages are included
      "./layouts/**/*.{vue,js,ts}",
      "./app.vue",
    ],
  },
  eslint: {
    config: {
      standalone: false,
    },
  },
});
