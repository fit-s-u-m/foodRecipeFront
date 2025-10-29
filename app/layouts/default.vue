<script setup lang="ts">
import { ref } from "vue";

const items = ref([
  { label: "Home", icon: "i-lucide-home", to: "/" },
  { label: "Recipes", icon: "i-lucide-utensils", to: "/recipes" },
  { label: "Chefs", icon: "i-lucide-chef-hat", to: "/chiefs" },
]);

const active = ref("0");
const searchTerm = ref("");

defineShortcuts({
  1: () => (active.value = "0"),
  2: () => (active.value = "1"),
  3: () => (active.value = "2"),
});
const groups = ref([
  {
    id: "chefs",
    label: "Chefs",
    items: [
      {
        label: "Benjamin Canac",
        suffix: "benjamincanac",
        avatar: { src: "https://github.com/benjamincanac.png" },
      },
      {
        label: "Sébastien Chopin",
        suffix: "atinux",
        avatar: { src: "https://github.com/atinux.png" },
      },
    ],
  },
  {
    id: "recipes",
    label: "Recipes",
    items: [
      { label: "Spaghetti Carbonara", suffix: "Italian" },
      { label: "Sushi Rolls", suffix: "Japanese" },
      { label: "Chicken Curry", suffix: "Indian" },
    ],
  },
  {
    id: "ingredients",
    label: "Ingredients",
    items: [
      { label: "Tomato" },
      { label: "Garlic" },
      { label: "Olive Oil" },
      { label: "Basil" },
    ],
  },
]);
const isMobile = ref(false);

function checkScreen() {
  isMobile.value = window.innerWidth < 768; // e.g., Tailwind md breakpoint
}

onMounted(() => {
  checkScreen();
  window.addEventListener("resize", checkScreen);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkScreen);
});
const showSlideOver = ref(false);
const showSearch = ref(false);
</script>

<template>
  <div>
    <UDashboardGroup
      v-if="!isMobile" class="flex flex-col overflow-y-auto w-full"
      style="scrollbar-gutter: stable both-edges;"
    >
      <div
        class="flex justify-between items-center mt-3 px-5 fixed top-0 w-full z-100  rounded-xl bg-white/30  dark:bg-gray-800/40 backdrop-blur-lg shadow-lg"
      >
        <UDashboardSearchButton label=" Search chefs / recipes" class="h-fit rounded-2xl" />
        <UNavigationMenu v-model="active" highlight highlight-color="primary" color="secondary" :items="items" />

        <div class="flex gap-5  items-center">
          <UColorModeSwitch />
          <UAvatar src="https://github.com/benjamincanac.png" alt="Benjamin Canac" size="2xl" />
        </div>

        <UDashboardSearch
          v-model:search-term="searchTerm" shortcut="meta_k" :groups="groups" :color-mode="false"
          placeholder="Search for chefs, recipes, or ingredients..." :fuse="{ resultLimit: 42 }"
        />
      </div>
      <slot />
    </UDashboardGroup>

    <!-- Mobile SlideOver -->
    <div v-else>
      <UButton label="Menu" color="neutral" class="m-2" @click="showSlideOver = true" />

      <USlideover v-model:open="showSlideOver" side="left" title="menu">
        <template #content>
          <div class="flex flex-col justify-between p-4 gap-4 h-full">
            <div class="flex gap-5 flex-col">
              <div class="flex gap-5 w-full">
                <UAvatar src="https://github.com/benjamincanac.png" alt="Benjamin Canac" size="xl" />
                <UDashboardSearchButton label=" Search chefs / recipes" class="w-full" @click="showSearch = true" />
                <UDashboardSearch
                  v-model:search-term="searchTerm" v-model:open="showSearch" shortcut="meta_k"
                  :groups="groups" :color-mode="false" placeholder="Search for chefs, recipes, or ingredients..."
                  :fuse="{ resultLimit: 42 }"
                />
              </div>
              <UNavigationMenu
                v-model="active" color="secondary" class="justify-center" :items="items"
                orientation="vertical"
              />
            </div>
            <UColorModeSwitch />
          </div>
        </template>
      </USlideover>
      <slot />
    </div>
  </div>
</template>
