<script setup lang="ts">
import { UAvatar, UButton, UCarousel, UInput } from "#components";
import { formatDistanceToNow } from "date-fns";
import { onMounted, ref } from "vue";

import { BOOKMARK_RECIPE, COMMENT_RECIPE, GET_RECIPES_BY_ID, LIKE_RECIPE, RATE_RECIPE, UNBOOKMARK_RECIPE, UNLIKE_RECIPE } from "~/graphql/queries";

const route = useRoute();
const recipeId = Number.parseInt(route.params.id);

const hoverRating = ref(0);
const newComment = ref("");
interface RecipieResp {

  recipes: {
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
    recipe_ratings_aggregate: {
      aggregate: {
        avg: {
          rating: null | number;
        };
      };
    };
    recipe_images: { url: string }[];
    recipe_categories: { category: { name: string } }[];
    recipe_ingredients: { ingredient: { name: string } }[];
    recipe_comments: {
      id: string;
      content: string;
      user: {
        username: string;
        avatar_url: string | null;
      };
      created_at: string;
    }[];
    recipe_bookmarks: { id: number }[];
    recipe_likes: { id: number }[];
    recipe_ratings: { rating: number }[];
    recipe_steps: { content: string; step_index: number }[];
  }[];
}
interface Recipe {
  id: string;
  featured_images: string[];
  description: string;
  title: string;
  liked: boolean;
  likes: number;
  comments: {
    content: string;
    id: string;
    user: {
      username: string;
      avatar_url: string | null;
    };
    created_at: string;
  }[];
  bookmarked: boolean;
  prep_time_minutes: number;
  steps: string[];
  categories: string[];
  ingredients: string[];
  rating: number | null;
  avgRating: number;
}

const recipe = ref<Recipe | null>(null);
const loading = ref(true);
const recipeLoading = ref(false);
let refechRecipe;
const user_id = ref("");
onMounted(() => {
  const userId = localStorage.getItem("userId") || "";
  const variables = {
    user_id: userId,
    recipe_id: recipeId,
  };
  recipeLoading.value = true;

  const { result, refetch } = useQuery<RecipieResp>(GET_RECIPES_BY_ID, variables);

  user_id.value = userId;
  refechRecipe = refetch;

  watch(result, (newResult) => {
    if (newResult?.recipes) {
      const recipes = newResult.recipes[0];
      // eslint-disable-next-line no-console
      console.log({ newResult: newResult.recipes[0] });
      if (!recipes)
        return;

      // recipe.value = recipes.map(prevRecipe => ({
      recipe.value = {
        id: recipes.id,
        featured_images: recipes.recipe_images.map(i => i.url),
        description: recipes.description,
        title: recipes.title,
        liked: recipes.recipe_likes.length !== 0,
        likes: recipes.recipe_likes_aggregate.aggregate.count,
        comments: recipes.recipe_comments,
        bookmarked: recipes.recipe_bookmarks.length !== 0,
        prep_time_minutes: recipes.prep_time_minutes,
        ingredients: recipes.recipe_ingredients.map(ing => ing.ingredient.name),
        categories: recipes.recipe_categories.map(cat => cat.category.name),
        steps: recipes.recipe_steps.map(step => step.content),
        avgRating: recipes.recipe_ratings_aggregate.aggregate.avg.rating,
        rating: recipes.recipe_ratings[0]?.rating,
      };

      recipeLoading.value = false;
      console.log("recipes", recipe.value);
    }
    else {
      console.error("GraphQL query returned no data or failed.", newResult);
    }
  }, { immediate: true });
});

const { mutate: bookmarkMutate } = useMutation(BOOKMARK_RECIPE);
const { mutate: unbookmarkMutate } = useMutation(UNBOOKMARK_RECIPE);
const { mutate: likeMutate } = useMutation(LIKE_RECIPE);
const { mutate: unlikeMutate } = useMutation(UNLIKE_RECIPE);
const { mutate: rateMutate } = useMutation(RATE_RECIPE);
const { mutate: commentMutate } = useMutation(COMMENT_RECIPE);

async function setRating(star: number) {
  if (!recipe.value)
    return;
  await rateMutate({
    user_id: user_id.value,
    recipe_id: recipe.value.id,
    rating: star,
  });
  refechRecipe();
}
function hover(star: number) {
  hoverRating.value = star;
}
function resetHover() {
  hoverRating.value = 0;
}
async function toggleLike() {
  if (!recipe.value)
    return;

  loading.value = true;

  try {
    if (recipe.value.liked) {
      await unlikeMutate({ user_id: user_id.value, recipe_id: recipe.value.id });
      refechRecipe();
    }
    else {
      await likeMutate({ user_id: user_id.value, recipe_id: recipe.value.id });
      refechRecipe();
    }
  }
  catch (error) {
    console.error(error);
  }
  finally {
    loading.value = false;
  }
}
async function toggleBookmark() {
  if (!recipe.value)
    return;

  loading.value = true;

  try {
    if (recipe.value.bookmarked) {
      await unbookmarkMutate({ user_id: user_id.value, recipe_id: recipe.value.id });
      refechRecipe();
    }
    else {
      await bookmarkMutate({ user_id: user_id.value, recipe_id: recipe.value.id });
      refechRecipe();
    }
  }
  catch (error) {
    console.error(error);
  }
  finally {
    loading.value = false;
  }
}
async function addComment() {
  if (!newComment.value.trim() || !recipe.value)
    return;
  await commentMutate(({ user_id: user_id.value, recipe_id: recipe.value.id, content: newComment.value }));
  refechRecipe();
}
function timeAgo(dateString: string) {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}
</script>

<template>
  <div class="mt-10">
    <div v-if="loading" class="w-full flex justify-center items.center">
      <Icon name="i-lucide-loader" class="w-5 h-5 mr-5 animate-spin text-blue-500" />
      Loading ...
    </div>
    <div v-if="recipe" class="max-w-4xl mx-auto py-10 px-4 space-y-10 mt-10">
      <!-- Recipe Title -->
      <h1 class="text-4xl font-extrabold text-center">
        {{ recipe.title }}
      </h1>
      <UCarousel v-slot="{ item }" :items="recipe.featured_images" auto-scroll
        class="w-full max-w-4xl min-w-[300px] mx-auto">
        <img :src="item" class="object-cover w-full aspect-[16/9] rounded-2xl shadow-md" alt="Recipe image">
      </UCarousel>

      <!-- Like & Bookmark -->

      <div class="flex justify-center space-x-8 mt-4">
        <!-- Like button -->
        <div>
          <button class="transition transform hover:scale-110" @click="toggleLike">
            <Icon :name="recipe.liked ? 'i-lucide-heart-pulse' : 'i-lucide-heart'" class="w-10 h-10"
              :class="recipe.liked ? 'text-red-500' : 'text-gray-400 '" />
          </button>
          <span class="text-red-500">{{ recipe.likes }}</span>
        </div>

        <!-- Bookmark button -->
        <button class="transition transform hover:scale-110" @click="toggleBookmark">
          <Icon :name="recipe.bookmarked ? 'i-lucide-book-marked' : 'i-lucide-bookmark'" class="w-10 h-10"
            :class="recipe.bookmarked ? 'text-red-500' : 'text-gray-400 '" />
        </button>
      </div>
      <div class="flex flex-wrap gap-2 items-center justify-center mt-4">
        <span class="font-semibold text-gray-700 dark:text-gray-300 mr-2">Categories:</span>
        <UBadge v-for="category in recipe.categories" :key="category" class="bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 dark:from-pink-700 dark:via-purple-700 dark:to-indigo-700
           text-gray-800 dark:text-gray-100 px-3 py-1 rounded-full font-medium transition transform hover:scale-105">
          {{ category }}
        </UBadge>
      </div>

      <!-- Description -->
      <p class="text-lg text-gray-700 dark:text-gray-300 text-center">
        {{ recipe.description }}
      </p>

      <!-- Ingredients -->
      <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
        <h2 class="text-2xl font-semibold mb-4">
          🧂 Ingredients
        </h2>
        <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li v-for="(ingredient, i) in recipe.ingredients" :key="i">
            {{ ingredient }}
          </li>
        </ul>
      </div>

      <!-- Steps -->
      <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
        <h2 class="text-2xl font-semibold mb-4">
          👩‍🍳 Steps
        </h2>
        <ol class="list-decimal pl-5 space-y-3 text-gray-700 dark:text-gray-300">
          <li v-for="(step, i) in recipe.steps" :key="i" class="whitespace-pre-wrap">
            {{ step }}
          </li>
        </ol>
      </div>

      <!-- Rating -->
      <div class="flex justify-center items-center space-x-2 mt-6">
        <span v-for="star in 5" :key="star" class="cursor-pointer text-4xl transition transform hover:scale-125" :class="{
          'text-yellow-400': hoverRating >= star || recipe.rating >= star,
          'text-gray-400': hoverRating < star && recipe.rating < star,
        }" @click="setRating(star)" @mouseover="hover(star)" @mouseleave="resetHover">
          ★
        </span>
      </div>
      <div class="flex  border-2 border-gray-600/30 rounded-2xl p-3 justify-between">
        <p class="font-bold text-xl">
          Avarage Rating:
        </p>
        <div class="flex justify-center items-center gap-1 mt-3">
          <div v-for="i in 5" :key="i" class="transition-transform duration-200 hover:scale-110">
            <Icon :name="i <= Math.round(recipe.avgRating) ? 'lucide:star' : 'lucide:star-off'" class="w-6 h-6"
              :class="i <= Math.round(recipe.avgRating) ? 'text-yellow-400' : 'text-gray-300'" />
          </div>

          <span class="ml-2 text-lg font-semibold text-yellow-500">
            {{ recipe.avgRating?.toFixed(1) || "0.0" }}
          </span>
        </div>
      </div>

      <!-- Comments -->
      <div class="mt-10">
        <h2 class="text-2xl font-bold mb-6">
          💬 Comments
        </h2>

        <div v-for="comment in recipe.comments" :key="comment.id"
          class="flex space-x-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
          <UAvatar :src="comment.user.avatar_url" size="sm" />
          <div>
            <div>
              <p class="font-semibold">
                {{ comment.user.username }}
              </p>
              <p class="text-gray-500/30">
                {{ timeAgo(comment.created_at) }}
              </p>
            </div>
            <p class="text-gray-700 dark:text-gray-300">
              {{ comment.content }}
            </p>
          </div>
        </div>

        <!-- Add comment -->
        <div class="flex items-center space-x-3 mt-6">
          <UInput v-model="newComment" placeholder="Write a comment..." class="flex-1" />
          <UButton color="primary" @click="addComment">
            Post
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth carousel transitions */
:deep(.u-carousel__item) {
  transition: transform 0.4s ease-in-out;
}
</style>
