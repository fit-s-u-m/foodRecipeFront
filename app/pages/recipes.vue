<script setup lang="ts">
import { AddRecipe, FilterRecipe } from "#components";
import { ref } from "vue";

// in any page or composable
import { GET_RECIPES } from "~/graphql/queries";

import type { FILTER } from "../types/types.ts";

// Mock recipe data
const recipes = ref([
  {
    id: 1,
    title: "Spaghetti Carbonara",
    description: "Classic Italian pasta with eggs, cheese, and pancetta.",
    featured_image: "/images/food6.jpeg",
    prepare_time_minutes: 10,
    likes: 42,
    liked: false,
    bookmarked: false,
    comments: [],
  },
  {
    id: 2,
    title: "Avocado Toast",
    description: "Simple and healthy avocado toast with lemon and chili flakes.",
    featured_image: "/images/food7.jpg",
    likes: 15,
    liked: true,
    bookmarked: true,
    comments: [],
  },
  {
    id: 3,
    title: "Chicken Curry",
    description: "Rich and flavorful Indian curry with coconut milk.",
    featured_image: "/images/food8.jpg",
    likes: 27,
    liked: false,
    bookmarked: false,
    comments: [],
  },
  {
    id: 4,
    title: "Beef Stir Fry",
    description: "Quick and easy stir fry with tender beef and vegetables.",
    featured_image: "/images/food9.jpg",
    likes: 33,
    liked: false,
    bookmarked: false,
    comments: [],
  },
  {
    id: 5,
    title: "Pancakes with Maple Syrup",
    description: "Fluffy pancakes topped with butter and maple syrup.",
    featured_image: "/images/food10.jpg",
    likes: 50,
    liked: true,
    bookmarked: false,
    comments: [],
  },
  {
    id: 6,
    title: "Caprese Salad",
    description: "Fresh tomatoes, mozzarella, and basil drizzled with olive oil.",
    featured_image: "/images/food11.jpg",
    likes: 28,
    liked: false,
    bookmarked: true,
    comments: [],
  },
  {
    id: 7,
    title: "Shrimp Tacos",
    description: "Spicy grilled shrimp with fresh slaw and creamy sauce.",
    featured_image: "/images/food12.jpg",
    likes: 36,
    liked: false,
    bookmarked: false,
    comments: [],
  },
]);
const isFilterModalOpen = ref(false);
const recipesFromBackEnd = ref(null);
const loading = ref(true);

// Toggle Like
function toggleLike(recipe: any) {
  recipe.liked = !recipe.liked;
  recipe.likes += recipe.liked ? 1 : -1;
}

// Toggle Bookmark
function toggleBookmark(recipe: any) {
  recipe.bookmarked = !recipe.bookmarked;
}

interface RecipieResp {
  title: string;
  created_at: string;
  description: string;
  featured_image: string | null;
  id: string;
  recipe_id: number;
  prep_time_minutes: number;
  recipe_likes_aggregate: {
    aggregate: {
      count: number;
    };
  };
  recipe_images: { url: string }[];
  recipe_categoies: { category: { name: string } }[];
  recipe_ingredients: { ingredient: { name: string } }[];
  recipe_comments: { content: string; user_id: string }[];
  recipe_bookmarks: { id: number }[];
  recipe_likes: { id: number }[];
}

onMounted(() => {
  const userId = localStorage.getItem("userId") || "";
  const variables = {
    limit: 10,
    user_id: userId,
  };
  const { result, loading: queryLoading } = useQuery(GET_RECIPES, variables);
  watch(queryLoading, () => {
    if (!queryLoading.value) {
      // Check if result.value is truthy AND if it has the 'recipes' property
      if (result.value && result.value.recipes) {
        const recipes = result.value.recipes as RecipieResp[];
        // recipesFromBackEnd should hold an ARRAY of recipes, not just the first one
        recipesFromBackEnd.value = recipes.map(prevRecipe => ({
          id: prevRecipe.recipe_id,
          featured_image: prevRecipe.recipe_images[0]?.url,
          description: prevRecipe.description,
          title: prevRecipe.title,
          liked: (prevRecipe.recipe_likes.length !== 0),
          likes: prevRecipe.recipe_likes_aggregate.aggregate.count,
          comments: prevRecipe.recipe_comments,
          bookmarked: (prevRecipe.recipe_bookmarks.length !== 0),
          prep_time_minutes: prevRecipe.prep_time_minutes,
        }));
        console.log("recipes", recipesFromBackEnd.value);
      }
      else {
        console.error("GraphQL query returned no data or failed.");
      }
      loading.value = false;
    }
  });
});

const recipesAll = computed(() => {
  let combined = [...recipes.value];
  if (recipesFromBackEnd.value) {
    combined = [...recipesFromBackEnd.value, ...combined];
  }
  return combined;
});

function onRecipeClicked(index: number) {
  navigateTo(`/recipe/${index}`);
}

// TODO:Filtering recipes
function onFilter(filters: FILTER) {
  console.log("Filters applied:", filters);
  isFilterModalOpen.value = false;
  // Implement filtering logic here
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
        <FilterRecipe :on-filter="onFilter" />
        <!-- Add recipe -->
        <AddRecipe />
      </div>
    </div>
    <!-- TODO:Loading -->
    <div v-if="loading" class="text-gray-500 dark:text-gray-400 text-lg animate-spin mt-10" />

    <!-- Recipes Grid -->
    <div v-if="recipesFromBackEnd && !loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="recipe in recipesFromBackEnd" :key="recipe.id"
        class="flex flex-col shadow-lg hover:shadow-xl transition" @click="() => { onRecipeClicked(recipe.id) }">
        <img :src="recipe.featured_image" alt="Recipe image" class="w-full h-48 object-cover rounded-t-lg">
        <div class="p-4 flex flex-col justify-between flex-1">
          <h2 class="text-xl font-semibold mb-2">
            {{ recipe.title }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {{ recipe.description }}
          </p>

          <div class="flex justify-between items-center mt-auto">
            <button class="flex items-center gap-1 text-sm" @click="toggleLike(recipe)">
              <UIcon name="i-lucide-heart" class="recipe.liked ? 'text-red-500' : 'text-white' " />
              <span>{{ recipe.likes }}</span>
            </button>

            <button class="flex items-center gap-1 text-sm">
              <UIcon name="i-lucide-message-square-more" />
              <span>{{ recipe.comments.length }}</span>
            </button>

            <button @click="toggleBookmark(recipe)">
              <UIcon :name="recipe.bookmarked ? 'i-lucide-bookmark' : 'i-lucide-bookmark'" class="text-yellow-500" />
            </button>
          </div>
        </div>
      </UCard>
    </div>
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
