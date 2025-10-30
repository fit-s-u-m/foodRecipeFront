<script setup lang="ts">
import { onMounted, ref } from "vue";

// Recipe data
const recipeId = "recipe-1"; // unique per recipe
const recipe = ref({
  title: "Chocolate Cake",
  image: "/images/cake.jpg",
  description:
    "A rich and moist chocolate cake perfect for any occasion. Made with cocoa powder and love.",
  comments: [
    { id: 1, user: "Fitsum", text: "Wow, this looks delicious!" },
    { id: 2, user: "Etsubdink", text: "Tried it yesterday — 10/10!" },
  ],
});

// ⭐ rating logic
const userRating = ref(0);
const hoverRating = ref(0);

// ❤️ like logic
const liked = ref(false);

// 🔖 bookmark logic
const bookmarked = ref(false);

// 💬 new comment input
const newComment = ref("");

// Load saved data from localStorage
onMounted(() => {
  const savedRating = localStorage.getItem(`recipe-rating-${recipeId}`);
  if (savedRating)
    userRating.value = Number(savedRating);

  const savedLike = localStorage.getItem(`recipe-liked-${recipeId}`);
  liked.value = savedLike === "true";

  const savedBookmark = localStorage.getItem(`recipe-bookmark-${recipeId}`);
  bookmarked.value = savedBookmark === "true";
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
  localStorage.setItem(`recipe-liked-${recipeId}`, liked.value ? "true" : "false");
}

function toggleBookmark() {
  bookmarked.value = !bookmarked.value;
  localStorage.setItem(`recipe-bookmark-${recipeId}`, bookmarked.value ? "true" : "false");
}

function addComment() {
  if (newComment.value.trim() === "")
    return;
  recipe.value.comments.push({
    id: Date.now(),
    user: "You",
    text: newComment.value,
  });
  newComment.value = "";
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-4 space-y-6 my-10">
    <!-- Title -->
    <h1 class="text-4xl font-bold text-center">
      {{ recipe.title }}
    </h1>

    <!-- Image -->
    <img :src="recipe.image" alt="Recipe image" class="rounded-2xl object-cover shadow-lg w-full">

    <!-- Action buttons: Like & Bookmark -->
    <div class="flex justify-center space-x-6 mt-4">
      <!-- Like button -->
      <button class="text-3xl focus:outline-none cursor-pointer" @click="toggleLike">
        <span :class="liked ? 'text-red-500' : 'text-gray-400'">{{ liked ? '🤍' : '❤️' }} </span>
      </button>

      <!-- Bookmark button -->
      <button class="text-3xl focus:outline-none cursor-pointer" @click="toggleBookmark">
        <span :class="bookmarked ? 'text-yellow-400' : 'text-gray-400'">{{ bookmarked ? '🔖' : '📑' }} </span>
      </button>
    </div>

    <!-- Description -->
    <p class="text-lg text-gray-700 dark:text-gray-300 mt-4 text-center">
      {{ recipe.description }}
    </p>

    <!-- Rating -->
    <div class="flex justify-center items-center space-x-2 mt-6">
      <span
        v-for="star in 5" :key="star" class="cursor-pointer text-3xl transition-transform transform hover:scale-110"
        @click="setRating(star)" @mouseover="hover(star)" @mouseleave="resetHover"
      >
        <span
          :class="{
            'text-yellow-400': hoverRating >= star || userRating >= star,
            'text-gray-400': hoverRating < star && userRating < star,
          }"
        >
          ★
        </span>
      </span>
    </div>
    <p class="text-center text-gray-500 mt-2">
      {{ userRating ? `You rated this ${userRating}★` : "Tap to rate this recipe" }}
    </p>

    <!-- Comments -->
    <div class="mt-10">
      <h2 class="text-2xl font-semibold mb-4">
        Comments
      </h2>

      <div
        v-for="comment in recipe.comments" :key="comment.id"
        class="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl mb-3"
      >
        <p class="font-semibold">
          {{ comment.user }}
        </p>
        <p class="text-gray-700 dark:text-gray-300">
          {{ comment.text }}
        </p>
      </div>

      <!-- Add Comment -->
      <div class="flex items-center space-x-3 mt-5">
        <UInput v-model="newComment" placeholder="Write a comment..." class="flex-1" />
        <UButton color="primary" @click="addComment">
          Post
        </UButton>
      </div>
    </div>
  </div>
</template>
