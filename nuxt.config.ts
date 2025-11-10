import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxt/eslint", "@nuxt/image", "@nuxt/ui", "@nuxtjs/apollo"],
  ssr: true, // enable server-side rendering
  app: {
    baseURL: "/foodRecipeFront/", // 👈 your repo name here!
  },
  build: {
    transpile: ["apollo3-cache-persist"],
  },
  vite: {
    base: "/foodRecipeFront/",
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      backendVerify: process.env.BACKEND_VERIFY,
      clouldinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
      clouldinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
      clouldinaryApiKey: process.env.CLOUDINARY_API_KEY,
      clouldinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    },
  },
  apollo: {
    clients: {
      default: {
        httpEndpoint: "http://localhost:8080/v1/graphql",
      },
    },
  },
  tailwindcss: {
    content: [
      "./components/**/*.{vue,js,ts}",
      "./pages/**/*.{vue,js,ts}", // dynamic pages are included
      "./layouts/**/*.{vue,js,ts}",
      "./app/app.vue",
    ],
  },
  eslint: {
    config: {
      standalone: false,
    },
  },
});
