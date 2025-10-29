<script setup lang="ts">
import { ref } from "vue";

// Mock recipe data
const recipes = ref([
  {
    id: 1,
    title: "Spaghetti Carbonara",
    description: "Classic Italian pasta with eggs, cheese, and pancetta.",
    image: "/images/food6.jpeg",
    likes: 42,
    liked: false,
    bookmarked: false,
    comments: [],
  },
  {
    id: 2,
    title: "Avocado Toast",
    description: "Simple and healthy avocado toast with lemon and chili flakes.",
    image: "/images/food7.jpg",
    likes: 15,
    liked: true,
    bookmarked: true,
    comments: [],
  },
  {
    id: 3,
    title: "Chicken Curry",
    description: "Rich and flavorful Indian curry with coconut milk.",
    image: "/images/food8.jpg",
    likes: 27,
    liked: false,
    bookmarked: false,
    comments: [],
  },
  {
    id: 4,
    title: "Beef Stir Fry",
    description: "Quick and easy stir fry with tender beef and vegetables.",
    image: "/images/food9.jpg",
    likes: 33,
    liked: false,
    bookmarked: false,
    comments: [],
  },
  {
    id: 5,
    title: "Pancakes with Maple Syrup",
    description: "Fluffy pancakes topped with butter and maple syrup.",
    image: "/images/food10.jpg",
    likes: 50,
    liked: true,
    bookmarked: false,
    comments: [],
  },
  {
    id: 6,
    title: "Caprese Salad",
    description: "Fresh tomatoes, mozzarella, and basil drizzled with olive oil.",
    image: "/images/food11.jpg",
    likes: 28,
    liked: false,
    bookmarked: true,
    comments: [],
  },
  {
    id: 7,
    title: "Shrimp Tacos",
    description: "Spicy grilled shrimp with fresh slaw and creamy sauce.",
    image: "/images/food12.jpg",
    likes: 36,
    liked: false,
    bookmarked: false,
    comments: [],
  },
]);

// Toggle Like
function toggleLike(recipe: any) {
  recipe.liked = !recipe.liked;
  recipe.likes += recipe.liked ? 1 : -1;
}

// Toggle Bookmark
function toggleBookmark(recipe: any) {
  recipe.bookmarked = !recipe.bookmarked;
}
</script>

<template>
  <UContainer class="py-10 my-10">
    <h1 class="text-3xl font-bold mb-8 text-center">
      🍽️ Delicious Recipes
    </h1>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="recipe in recipes" :key="recipe.id"
        class="flex flex-col justify-between shadow-lg hover:shadow-xl transition"
      >
        <img :src="recipe.image" alt="Recipe image" class="w-full h-48 object-cover rounded-t-lg">

        <div class="p-4">
          <h2 class="text-xl font-semibold mb-2">
            {{ recipe.title }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {{ recipe.description }}
          </p>

          <div class="flex justify-between items-center">
            <button class="flex items-center gap-1 text-sm" @click="toggleLike(recipe)">
              <UIcon :name="recipe.liked ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="text-red-500" />
              <span>{{ recipe.likes }}</span>
            </button>

            <button class="flex items-center gap-1 text-sm">
              <UIcon name="i-heroicons-chat-bubble-left" />
              <span>{{ recipe.comments.length }}</span>
            </button>

            <button @click="toggleBookmark(recipe)">
              <UIcon
                :name="recipe.bookmarked ? 'i-heroicons-bookmark-solid' : 'i-heroicons-bookmark'"
                class="text-yellow-500"
              />
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
