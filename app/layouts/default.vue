<script setup lang="ts">
import { ref } from "vue";

import type { NameId } from "~/types/types";

import { buildWhere } from "~/components/lib/util";
import { GET_CATEGORIES, GET_CHEFS_AND_ID, GET_INGREDIENTS, GET_USER_BY_ID } from "~/graphql/queries";

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
    items: [],
  },
  {
    id: "recipes",
    label: "Recipes",
    items: [],
  },
  {
    id: "categories",
    label: "Categories",
    items: [],
  },
  {
    id: "ingredients",
    label: "Ingredients",
    items: [],
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
  query MyQuery($where:recipes_bool_exp,$limit: Int) {
    recipes(limit:$limit,where:$where) {
      recipe_id
      title
      user{
        username
      }
    }
  }
`;
const ingredientOptions = ref<NameId[]>([]);
const categoryOptions = ref<NameId[]>([]);
const loading = ref(false);

let refetchChefs: any;
let refetchRecipes: any;
let refetchIngredients: any;
let refetchCategories: any;

const chefsOption = ref<{ avatar_url: string; username: string; user_id: number }[]>([]);

onMounted(() => {
  loading.value = true;
  checkScreen();
  window.addEventListener("resize", checkScreen);

  const userId = localStorage.getItem("userId") || "";
  const shouldSkip = !userId || userId === "";

  const { result } = useQuery(GET_USER_BY_ID, {
    user_id: userId,
  });
  const where = {};
  const { result: chefsResult, loading: chefsLoading, refetch: refetch_chefs } = useQuery(GET_CHEFS_AND_ID, { limit: 2, where });
  const { result: allRecepies, loading: recipesLoading, refetch: refetch_recipes } = useQuery(GET_ALL_RECIPES, { limit: 5, where });
  const { result: ingredientsRes, loading: ingredientsLoadingRes, refetch: refetch_ingredients } = useQuery(GET_INGREDIENTS, { limit: 5, where });
  const { result: categoriesRes, loading: categoriesLoadingRes, refetch: refetch_categories } = useQuery(GET_CATEGORIES, { limit: 5, where });
  refetchCategories = refetch_categories;
  refetchRecipes = refetch_recipes;
  refetchIngredients = refetch_ingredients;
  refetchChefs = refetch_chefs;
  watchEffect(() => {
    if (!ingredientsLoadingRes.value && ingredientsRes.value) {
      ingredientOptions.value = ingredientsRes.value.ingredients.map(i => i.name);
      loading.value = false;
    }
    if (!categoriesLoadingRes.value && categoriesRes.value) {
      categoryOptions.value = categoriesRes.value.categories.map(i => i.name);
      loading.value = false;
    }
    if (!chefsLoading.value && chefsResult.value) {
      chefsOption.value = chefsResult.value.users.map((u: any) => ({
        avatar_url: u.avatar_url,
        user_id: u.user_id,
        username: u.username,
        email: u.email,
      }));
      console.log("chefs", chefsOption.value);
      loading.value = false;
    }
  });

  watch(result, (newValue) => {
    console.log("userId", newValue);
    user.value = newValue.users[0];
    userLoading.value = false;
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
async function logout() {
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("accessToken");
  await navigateTo("/login");
}
watch(searchTerm, async () => {
  if (refetchCategories && refetchChefs && refetchIngredients && refetchRecipes) {
    const filter = { searchTerm: searchTerm.value };
    // Await all refetches and update the reactive data sources
    const [categoriesRes, chefsRes, ingredientsRes, recipesRes] = await Promise.all([
      refetchCategories({ limit: 5, where: buildWhere({ ...filter, searchItem: "category" }) }),
      refetchChefs({ limit: 5, where: buildWhere({ ...filter, searchItem: "chef" }) }),
      refetchIngredients({ limit: 5, where: buildWhere({ ...filter, searchItem: "ingredients" }) }),
      refetchRecipes({ limit: 5, where: buildWhere({ ...filter, searchItem: "recipe" }) }),
    ]);
    console.log("Refetched Results:", { categoriesRes, chefsRes, ingredientsRes, recipesRes });

    if (categoriesRes.data) {
      categoryOptions.value = categoriesRes.data.categories.map(c => c.name);
    }
    if (chefsRes.data) {
      chefsOption.value = chefsRes.data.users.map(u => ({
        avatar_url: u.avatar_url,
        username: u.username,
        email: u.email,
        user_id: u.user_id,
      }));
    }
    if (ingredientsRes.data) {
      ingredientOptions.value = ingredientsRes.data.ingredients.map(i => i.name);
    }
    if (recipesRes.data) {
      recipes.value = recipesRes.data.recipes;
      console.log("recipes", recipes.value);
    }
  }
});
watch(
  [recipes, ingredientOptions, categoryOptions, chefsOption],
  () => {
    groups.value = groups.value.map((item) => {
      if (item.id === "recipes") {
        return {
          ...item,
          items: recipes.value
            ? recipes.value.map(recipe => ({
                label: recipe.title,
                suffix: `By: ${recipe.user.username}`,
                to: `/recipe/${recipe.recipe_id}`,
              }))
            : [],
        };
      }

      if (item.id === "ingredients") {
        return {
          ...item,
          items: ingredientOptions.value
            ? ingredientOptions.value.map(i => ({
                label: i,
                to: `/recipes?ingredients=${i}`,
              }))
            : [],
        };
      }

      if (item.id === "categories") {
        return {
          ...item,
          items: categoryOptions.value
            ? categoryOptions.value.map(i => ({
                label: i,
                to: `/recipes?categories=${i}`,
              }))
            : [],
        };
      }

      if (item.id === "chefs") {
        return {
          ...item,
          items: chefsOption.value
            ? chefsOption.value.map(i => ({
                label: i.username,
                suffix: i.email,
                avatar: { src: i.avatar_url },
                to: `/chef/${i.user_id}`,
              }))
            : [],
        };
      }
    });
  },
);
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
          <UButton variant="outline" size="sm" class="cursor-pointer" @click="logout">
            Logout
          </UButton>
          <UAvatar class="cursor-pointer" :src="user && user.avatar_url ? user.avatar_url : ''"
            :alt="user && user.username ? user.username.toUpperCase() : ''" size="xl" @click="navigateTo('/profile')" />
        </div>

        <UDashboardSearch v-model:search-term="searchTerm" shortcut="meta_k" :groups="groups" :color-mode="false"
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
            <div>
              <UColorModeSwitch />
              <UButton variant="outline" @click="logout">
                Logout
              </UButton>
            </div>
          </div>
        </template>
      </USlideover>
      <slot />
    </div>
  </div>
</template>
