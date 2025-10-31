<script setup lang="ts">
import { UAvatar, UButton, UCarousel, UInput } from "#components";
import { onMounted, ref } from "vue";

const recipeId = "recipe-1";

const recipe = ref({
  title: "Chocolate Cake",
  description:
    "A rich and moist chocolate cake perfect for any occasion. Made with cocoa powder and love.",
  images: [
    "/images/cake.jpg",
    "/images/food10.jpg",
    "/images/food11.jpg",
    "/images/food12.jpg",
  ],
  chef: {
    name: "Chef Fitsum",
    avatar: "/images/chef2.jpg",
    followers: 1250,
    recipes: 12,
    likes: 840,
    user_id: 1,
    following: false,
  },
  ingredients: [
    "2 cups all-purpose flour",
    "1 and 1/2 cups sugar",
    "3/4 cup cocoa powder",
    "2 tsp baking powder",
    "1 tsp baking soda",
    "1 cup milk",
    "2 large eggs",
    "1/2 cup butter, melted",
  ],
  steps: [
    "Preheat the oven to 180°C (350°F) and grease a baking pan.",
    "Mix dry ingredients in a large bowl.",
    "Whisk wet ingredients in another bowl and combine with the dry mixture.",
    "Pour the batter into the pan and bake for 30–35 minutes.",
    "Let cool, then frost or dust with sugar as desired.",
  ],
  comments: [
    { id: 1, user: "Fitsum", avatar: "/images/chef1.jpg", text: "Wow, this looks delicious!" },
    { id: 2, user: "Etsubdink", avatar: "/images/chef2.jpg", text: "Tried it yesterday — 10/10!" },
  ],
});

const userRating = ref(0);
const hoverRating = ref(0);
const liked = ref(false);
const bookmarked = ref(false);
const newComment = ref("");

onMounted(() => {
  const savedRating = localStorage.getItem(`recipe-rating-${recipeId}`);
  if (savedRating)
    userRating.value = Number(savedRating);

  liked.value = localStorage.getItem(`recipe-liked-${recipeId}`) === "true";
  bookmarked.value = localStorage.getItem(`recipe-bookmark-${recipeId}`) === "true";
});

function setRating(star: number) {
  userRating.value = star;
  localStorage.setItem(`recipe-rating-${recipeId}`, String(star));
}
function hover(star: number) {
  hoverRating.value = star;
}
function resetHover() {
  hoverRating.value = 0;
}
function toggleLike() {
  liked.value = !liked.value;
  localStorage.setItem(`recipe-liked-${recipeId}`, String(liked.value));
}
function toggleBookmark() {
  bookmarked.value = !bookmarked.value;
  localStorage.setItem(`recipe-bookmark-${recipeId}`, String(bookmarked.value));
}
function addComment() {
  if (!newComment.value.trim())
    return;
  recipe.value.comments.push({
    id: Date.now(),
    user: "You",
    avatar: "/images/you.jpg",
    text: newComment.value,
  });
  newComment.value = "";
}
function goToChefPage(index: number) {
  navigateTo(`/chef/${index}`);
}
const followStatus = ref(recipe.value.chef.following);
function changeFollowingStatus() {
  followStatus.value = !followStatus.value;
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-10 px-4 space-y-10 mt-10">
    <!-- Chef Header -->
    <div class="flex items-center justify-between bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-lg">
      <div class="flex items-center space-x-4" @click="goToChefPage(recipe.chef.user_id)">
        <UAvatar :src="recipe.chef.avatar" size="lg" />
        <div>
          <h2 class="text-2xl font-bold">
            {{ recipe.chef.name }}
          </h2>
          <div class="flex gap-4 text-sm text-gray-500 mt-1">
            <span>👨‍🍳 {{ recipe.chef.recipes }} Recipes</span>
            <span>❤️ {{ recipe.chef.likes }} Likes</span>
            <span>👥 {{ recipe.chef.followers }} Followers</span>
          </div>
        </div>
      </div>
      <UButton color="primary" :variant="followStatus ? 'solid' : 'outline'" @click="changeFollowingStatus()">
        {{ followStatus ? "follow" : "unfollow" }}
      </UButton>
    </div>

    <!-- Recipe Title -->
    <h1 class="text-4xl font-extrabold text-center">
      {{ recipe.title }}
    </h1>
    <UCarousel v-slot="{ item }" :items="recipe.images" auto-scroll class="w-full max-w-4xl min-w-[300px] mx-auto">
      <img :src="item" class="object-cover w-full aspect-[16/9] rounded-2xl shadow-md" alt="Recipe image">
    </UCarousel>

    <!-- Like & Bookmark -->
    <div class="flex justify-center space-x-8 text-3xl mt-4">
      <button class="transition transform hover:scale-125"
        :class="liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'" @click="toggleLike">
        ❤️
      </button>
      <button class="transition transform hover:scale-125"
        :class="bookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'" @click="toggleBookmark">
        🔖
      </button>
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
        <li v-for="(step, i) in recipe.steps" :key="i">
          {{ step }}
        </li>
      </ol>
    </div>

    <!-- Rating -->
    <div class="flex justify-center items-center space-x-2 mt-6">
      <span v-for="star in 5" :key="star" class="cursor-pointer text-4xl transition transform hover:scale-125" :class="{
        'text-yellow-400': hoverRating >= star || userRating >= star,
        'text-gray-400': hoverRating < star && userRating < star,
      }" @click="setRating(star)" @mouseover="hover(star)" @mouseleave="resetHover">
        ★
      </span>
    </div>
    <p class="text-center text-gray-500">
      {{ userRating ? `You rated this ${userRating}★` : "Rate this recipe" }}
    </p>

    <!-- Comments -->
    <div class="mt-10">
      <h2 class="text-2xl font-bold mb-6">
        💬 Comments
      </h2>

      <div v-for="comment in recipe.comments" :key="comment.id"
        class="flex space-x-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
        <UAvatar :src="comment.avatar" size="sm" />
        <div>
          <p class="font-semibold">
            {{ comment.user }}
          </p>
          <p class="text-gray-700 dark:text-gray-300">
            {{ comment.text }}
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
</template>

<style scoped>
/* Smooth carousel transitions */
:deep(.u-carousel__item) {
  transition: transform 0.4s ease-in-out;
}
</style>
