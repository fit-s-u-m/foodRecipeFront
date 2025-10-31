<script setup lang="ts">
import { ref } from "vue";

import { GET_USER_BY_ID } from "~/graphql/queries";

const items = ref([
  { label: "Home", icon: "i-lucide-home", to: "/" },
  { label: "Recipes", icon: "i-lucide-utensils", to: "/recipes" },
  { label: "Chefs", icon: "i-lucide-chef-hat", to: "/chefs" },
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
      { label: "Spaghetti Carbonara", suffix: "Italian", to: "/recipe/1" },
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

interface User {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
  email: string;
  display_name: string;
  created_at: string;
}
interface Recipe {
  recipe_id: number;
  title: string;
  user: {
    username: string;
  };
}
const user = ref<User | null>(null);
const recipes = ref<Recipe[]>([]);
const userLoading = ref(true);
const recipeLoading = ref(true);
const GET_ALL_RECIPES = gql`
  query MyQuery {
    recipes(limit:10) {
      recipe_id
      title
      user{
        username
      }
    }
  }
`;

onMounted(() => {
  checkScreen();
  window.addEventListener("resize", checkScreen);

  const userId = localStorage.getItem("userId") || "";
  const shouldSkip = !userId || userId === "";
  console.log(userId);

  const { result, loading: queryLoading } = useQuery(GET_USER_BY_ID, {
    userId,
    skip: shouldSkip, // ⬅️ The key change: Skip if userId is null/empty
  });
  const { result: allRecepies, loading: recipesLoading } = useQuery(GET_ALL_RECIPES);

  watch(queryLoading, () => {
    if (!queryLoading.value) {
      user.value = result.value.users[0];
      console.log("userId", user.value);
      userLoading.value = false;
    }
  });
  watch(recipesLoading, () => {
    if (!recipesLoading.value) {
      recipes.value = allRecepies.value.recipes;
      console.log("All", recipes.value, Array.isArray(recipes.value));
      recipeLoading.value = false;
    }
  });
  if (shouldSkip) {
    userLoading.value = false;
    console.log("No userId found, skipping query.");
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", checkScreen);
});

const updatedGroup = computed(() => {
  const newGroup = [];
  for (const item of groups.value) {
    if (item.id === "recipes") {
      item.items = recipes.value
        ? recipes.value.map(recipe => ({
            label: recipe.title,
            suffix: `By: ${recipe.user.username}`,
            to: `/recipe/${recipe.recipe_id}`,
          }))
        : [];
    }
    console.log({ item }, recipes.value);
    newGroup.push(item);
  }
  return newGroup;
});
const showSlideOver = ref(false);
const showSearch = ref(false);
</script>

<template>
  <div>
    <UDashboardGroup v-if="!isMobile" class="flex flex-col overflow-y-auto w-full"
      style="scrollbar-gutter: stable both-edges;">
      <div
        class="flex justify-between items-center mt-3 px-5 fixed top-0 w-full z-100  rounded-xl bg-white/30  dark:bg-gray-800/40 backdrop-blur-lg shadow-lg">
        <UDashboardSearchButton label=" Search chefs / recipes" class="h-fit rounded-2xl" />
        <UNavigationMenu v-model="active" highlight highlight-color="primary" color="secondary" :items="items" />

        <div class="flex gap-5  items-center">
          <UColorModeSwitch />
          <UAvatar class="cursor-pointer" :src="user && user.avatar_url ? user.avatar_url : ''"
            :alt="user && user.username ? user.username.toUpperCase() : ''" size="xl" @click="navigateTo('/profile')" />
        </div>

        <UDashboardSearch v-model:search-term="searchTerm" shortcut="meta_k" :groups="updatedGroup" :color-mode="false"
          placeholder="Search for chefs, recipes, or ingredients..." :fuse="{ resultLimit: 42 }" />
      </div>
      <slot />
    </UDashboardGroup>

    <!-- Mobile SlideOver -->
    <div v-else>
      <UButton label="Menu"
        class="m-2 sticky top-1 left-1 z-5 bg-gray-700/30 hover:bg-blue-300 dark:bg-gray-100/40 backdrop-blur-2xl text-black "
        @click="showSlideOver = true" />

      <USlideover v-model:open="showSlideOver" side="left" title="menu">
        <template #content>
          <div class="flex flex-col justify-between p-4 gap-4 h-full">
            <div class="flex gap-5 flex-col">
              <div class="flex gap-5 w-full">
                <UAvatar :src="user ? user.avatar_url : ''" :alt="user ? user.username : ''" size="xl"
                  class="cursor-pointer" @click="navigateTo('/profile')" />
                <UDashboardSearchButton label=" Search chefs / recipes" class="w-full" @click="showSearch = true" />
                <UDashboardSearch v-model:search-term="searchTerm" v-model:open="showSearch" shortcut="meta_k"
                  :groups="groups" :color-mode="false" placeholder="Search for chefs, recipes, or ingredients..."
                  :fuse="{ resultLimit: 42 }" />
              </div>
              <UNavigationMenu v-model="active" color="secondary" class="justify-center" :items="items"
                orientation="vertical" />
            </div>
            <UColorModeSwitch />
          </div>
        </template>
      </USlideover>
      <slot />
    </div>
  </div>
</template>
