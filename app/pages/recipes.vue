<script setup lang="ts">
import { AddRecipe, FilterRecipe } from "#components";
import { format } from "date-fns";
import { ref } from "vue";

import { useAuthQuery } from "~/components/composeable/UseAuthQuery.js";
import { applyRouteFilters, buildWhere } from "~/components/lib/util.js";
// in any page or composable
import { GET_RECIPES, TOTAL_RECIPES } from "~/graphql/queries";

import type { FILTER, GET_RECIPES_QUERY } from "../types/types.ts";

// Toggle Like
function toggleLike(recipe: any) {
  recipe.liked = !recipe.liked;
  recipe.likes += recipe.liked ? 1 : -1;
}

// Toggle Bookmark
function toggleBookmark(recipe: any) {
  recipe.bookmarked = !recipe.bookmarked;
}

interface RECIPE {
  id: number;
  featured_image: string | undefined;
  description: string;
  title: string;
  liked: boolean;
  likes: number;
  comments: { content: string; user_id: string }[];
  bookmarked: boolean;
  prep_time_minutes: number;
  ingredients: string[];
  categories: string[];
  created_at: string;
  chef: { avatar_url: string; username: string; user_id: number };
}

const recipesFromBackEnd = ref<RECIPE[]>([]);
const loading = ref(true);
const filter = ref<FILTER | null>(null);
const route = useRoute();
const page = ref(1);
const itemsPerPage = ref(2);
const totalRecipes = ref(0);
interface TOTAL_RECIPES_TYPE {
  recipes_aggregate: {
    aggregate: {
      count: number;
    };
  };
}
let refetchRecipes: any;
let refetchTotal: any;
const userRole = ref<string | null>(null);
const userId = ref<string | null>(null);
onMounted(() => {
  const query = route.query;
  filter.value = applyRouteFilters(query);
  // eslint-disable-next-line no-console
  console.log("filter on mount", filter.value);
  const user_id = localStorage.getItem("userId") || "";
  userRole.value = localStorage.getItem("userRole");
  userId.value = user_id;
  const where = buildWhere(filter.value, user_id);
  const variables = {
    user_id,
    limit: itemsPerPage,
    offset: (page.value - 1) * itemsPerPage.value,
    where,
  };

  // Calculate the total recipepaginationVars
  const { result: totalRecipesRes, refetch: refetch_total } = useAuthQuery<TOTAL_RECIPES_TYPE>(TOTAL_RECIPES, { where });

  refetchTotal = refetch_total;
  watchEffect(() => {
    if (!totalRecipesRes.value)
      return;
    totalRecipes.value = totalRecipesRes.value.recipes_aggregate.aggregate.count;
  });

  const { result, refetch } = useAuthQuery<GET_RECIPES_QUERY>(GET_RECIPES, variables);

  refetchRecipes = refetch;
  // Watch result directly
  watch(
    result,
    (value) => {
      if (value && value.recipes) {
        const recipes = value.recipes;
        recipesFromBackEnd.value = recipes.map(prevRecipe => ({
          id: prevRecipe.recipe_id,
          featured_image: prevRecipe.recipe_images?.[0]?.url ?? "",
          description: prevRecipe.description,
          title: prevRecipe.title,
          liked: (prevRecipe.recipe_likes?.length ?? 0) > 0,
          likes: prevRecipe.recipe_likes_aggregate?.aggregate?.count ?? 0,
          comments: prevRecipe.recipe_comments ?? [],
          bookmarked: (prevRecipe.recipe_bookmarks?.length ?? 0) > 0,
          prep_time_minutes: prevRecipe.prep_time_minutes,
          ingredients: prevRecipe.recipe_ingredients?.map(i => i.ingredient.name) ?? [],
          categories: prevRecipe.recipe_categories?.map(i => i.category.name) ?? [],
          chef: prevRecipe.user,
          created_at: prevRecipe.created_at,
        }));
        loading.value = false; // finished getting the data
        // eslint-disable-next-line no-console
        console.log("recipes", recipesFromBackEnd.value);
      }
      else {
        console.error("GraphQL query returned no data or failed.");
      }
    },
    { immediate: true },
  );
});
watchEffect(() => {
  const query = route.query;
  onFilter(applyRouteFilters(query));
});
function onRecipeClicked(index: number) {
  navigateTo(`/recipe/${index}`);
}

function onFilter(filterRecived: FILTER) {
  console.log("applyRouteFilters", filterRecived);
  if (!userId.value)
    return;
  filter.value = filterRecived;
  const where = buildWhere(filter.value, userId.value);

  refetchRecipes({
    where,
  });
  refetchTotal({
    where,
  });
}
function trancateWords(text: string, max: number) {
  if (text.length <= max) {
    return text;
  }

  return `${text.substring(0, max)} ...`;
}
function refetchWhenAddRecipe() {
  refetchTotal();
  refetchRecipes();
}
</script>

<template>
  <UContainer class="py-10 max-w-6xl mx-auto mt-10">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">
        🍽️ Delicious Recipes
      </h1>

      <div class="flex items-center gap-5">
        <!-- Filter Modal -->
        <FilterRecipe :refresh-on-filter="onFilter" />
        <!-- Add recipe -->
        <AddRecipe v-if="userRole === 'chef'" :refetch-recipes="refetchWhenAddRecipe" />
      </div>
    </div>
    <div v-if="loading" class="w-full flex justify-center items.center">
      <Icon name="i-lucide-loader" class="w-5 h-5 mr-5 animate-spin text-blue-500" />
      Loading ...
    </div>

    <!-- Recipes Grid -->
    <div v-if="recipesFromBackEnd && !loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="recipe in recipesFromBackEnd" :key="recipe.id"
        class="flex flex-col shadow-lg hover:shadow-xl transition" @click="() => { onRecipeClicked(recipe.id) }">
        <img :src="recipe.featured_image" alt="Recipe image" class="w-full h-48 object-cover rounded-t-lg">
        <div class="p-4 flex flex-col justify-between flex-1">
          <h2 class="text-xl font-semibold mb-2">
            {{ recipe.title }}
          </h2>
          <div class="flex justify-between items-center">
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {{ trancateWords(recipe.description, 20) }}
            </p>
            <div class="flex gap-3 items-center text-sm text-gray-400 cursor-pointer hover:text-black"
              @click="navigateTo(`/chef/${recipe.chef.user_id}`)">
              <p>{{ recipe.chef.username }}</p>
            </div>
          </div>
          <div class="text-gray-300 text-sm">
            {{ recipe.prep_time_minutes }} mins | Posted on {{ format(recipe.created_at, "dd/MM/yyyy") }}
          </div>

          <div class="flex gap-2 my-3">
            <UBadge v-for="category in recipe.categories" :key="category" class="bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 dark:from-pink-700 dark:via-purple-700 dark:to-indigo-700
           text-gray-800 dark:text-gray-100 rounded-full font-medium transition transform hover:scale-105">
              {{ category }}
            </UBadge>
          </div>

          <div class="flex justify-between items-center mt-auto">
            <button class="flex items-center gap-1 text-sm" @click="toggleLike(recipe)">
              <UIcon name="i-lucide-heart" :class="recipe.liked ? 'text-red-500' : 'text-black'" />
              <span>{{ recipe.likes }}</span>
            </button>

            <button class="flex items-center gap-1 text-sm">
              <UIcon name="i-lucide-message-square-more" />
              <span>{{ recipe.comments.length }}</span>
            </button>

            <button @click="toggleBookmark(recipe)">
              <UIcon :name="recipe.bookmarked ? 'i-lucide-book-marked' : 'i-lucide-bookmark'"
                :class="recipe.bookmarked ? 'text-yellow-500' : 'text-black'" />
            </button>
          </div>
        </div>
      </UCard>
    </div>
    <UPagination v-model:page="page" :items-per-page="itemsPerPage" active-color="primary" active-variant="subtle"
      :total="totalRecipes" class="justify-center mt-10" :ui="{ root: 'flex justify-center items-center' }"
      @update:page="() => { refetchRecipes({ offset: (page - 1) * itemsPerPage }) }" />
  </UContainer>
</template>

<style scoped>
img {
  transition: transform 0.3s ease;
}

img:hover {
  transform: scale(1.05);
}
</style>
