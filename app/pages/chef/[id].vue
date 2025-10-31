<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const chefId = route.params.id || "1";

// Mock data
const chef = ref({
  id: chefId,
  name: "Fitsum Wondessen",
  bio: "Passionate chef sharing my favorite recipes 🍲",
  avatar: "/images/chef.jpg",
  stats: {
    recipes: 12,
    followers: 420,
    likes: 1024,
  },
  recipes: [
    {
      id: 1,
      title: "Chocolate Cake",
      image: "/images/cake.jpg",
      likes: 123,
    },
    {
      id: 2,
      title: "Spaghetti Carbonara",
      image: "/images/food7.jpg",
      likes: 98,
    },
    {
      id: 3,
      title: "Avocado Toast",
      image: "/images/food8.jpg",
      likes: 56,
    },
  ],
});
function goToRecipie(index: number) {
  navigateTo(`/recipe/${index}`);
}
</script>

<template>
  <UContainer class="py-10 max-w-7xl mx-auto space-y-8 mt-10">
    <!-- Chef Header -->
    <div
      class="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
      <UAvatar :src="chef.avatar" :alt="chef.name" size="xl" />
      <div class="flex-1 text-center md:text-left space-y-2">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ chef.name }}
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          {{ chef.bio }}
        </p>

        <!-- Stats -->
        <div class="flex justify-center md:justify-start gap-6 mt-4">
          <div class="text-center">
            <div class="text-xl font-bold text-gray-900 dark:text-white">
              {{ chef.stats.recipes }}
            </div>
            <div class="text-gray-500 dark:text-gray-400 text-sm">
              Recipes
            </div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-gray-900 dark:text-white">
              {{ chef.stats.followers }}
            </div>
            <div class="text-gray-500 dark:text-gray-400 text-sm">
              Followers
            </div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-gray-900 dark:text-white">
              {{ chef.stats.likes }}
            </div>
            <div class="text-gray-500 dark:text-gray-400 text-sm">
              Likes
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chef Recipes -->
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Recipes
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div v-for="recipe in chef.recipes" :key="recipe.id"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer"
          @click="goToRecipie(recipe.id)">
          <img :src="recipe.image" :alt="recipe.title" class="w-full h-48 object-cover">
          <div class="p-4 space-y-2">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ recipe.title }}
            </h3>
            <div class="flex items-center justify-between text-gray-500 dark:text-gray-400 text-sm">
              <span>❤️ {{ recipe.likes }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
