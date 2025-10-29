<script setup lang="ts">
import { ref } from "vue";

// Mock chefs data
const chefs = ref([
  {
    id: 1,
    name: "John Doe",
    profileImage: "/images/chef1.jpg",
    follower: 97234,
    recipes: [
      { id: 1, title: "Spaghetti Carbonara", image: "/images/food6.jpeg" },
      { id: 2, title: "Avocado Toast", image: "/images/food7.jpg" },
      { id: 3, title: "Chicken Curry", image: "/images/food8.jpg" },
    ],
    following: false,
  },
  {
    id: 2,
    name: "Jane Smith",
    profileImage: "/images/chef2.jpg",
    follower: 39206,
    recipes: [
      { id: 4, title: "Beef Stir Fry", image: "/images/food9.jpg" },
      { id: 5, title: "Pancakes", image: "/images/food10.jpg" },
      { id: 6, title: "Caprese Salad", image: "/images/food11.jpg" },
    ],
    following: true,
  },
  {
    id: 3,
    name: "Ali Hassan",
    profileImage: "/images/chef3.jpg",
    follower: 54240,
    recipes: [
      { id: 7, title: "Shrimp Tacos", image: "/images/food12.jpg" },
      { id: 8, title: "Chicken Wrap", image: "/images/food8.jpg" },
      { id: 9, title: "Veggie Bowl", image: "/images/food7.jpg" },
    ],
    following: false,
  },
  {
    id: 4,
    name: "Ali Hassan",
    profileImage: "/images/chef4.jpg",
    follower: 74240,
    recipes: [
      { id: 7, title: "Shrimp Tacos", image: "/images/food4.webp" },
      { id: 8, title: "Chicken Wrap", image: "/images/food5.webp" },
      { id: 9, title: "Veggie Bowl", image: "/images/food7.jpg" },
    ],
    following: false,
  },
  {
    id: 5,
    name: "Ali Hassan",
    profileImage: "/images/chef5.jpg",
    follower: 19240,
    recipes: [
      { id: 7, title: "Shrimp Tacos", image: "/images/food.webp" },
      { id: 8, title: "Chicken Wrap", image: "/images/food2.webp" },
      { id: 9, title: "Veggie Bowl", image: "/images/food3.webp" },
    ],
    following: false,
  },
]);

function toggleFollow(chef: any) {
  chef.following = !chef.following;
}
</script>

<template class="overflow-y-scroll">
  <UContainer class="py-10 mt-10 ">
    <h1 class="text-3xl font-bold mb-8 text-center">
      👩‍🍳 Our Chefs
    </h1>

    <div class="flex flex-col gap-6">
      <div
        v-for="chef in chefs" :key="chef.id"
        class="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
      >
        <!-- Chef profile -->
        <img :src="chef.profileImage" alt="Chef profile" class="w-20 h-20 rounded-full object-cover">
        <div class="flex-1">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-xl font-semibold">
                {{ chef.name }}
              </h2>
              <p class="text-gray-500 dark:text-gray-400 text-sm">
                Top {{ chef.recipes.length }} recipes
              </p>
              <p class="text-gray-500 dark:text-gray-400 text-sm">
                <span class="text-red-900 dark:text-red-300"> {{ chef.follower }}</span> followers
              </p>
            </div>
            <UButton size="sm" :color="chef.following ? 'primary' : 'secondary'" @click="toggleFollow(chef)">
              {{ chef.following ? 'Following' : 'Follow' }}
            </UButton>
          </div>

          <!-- Horizontal scroll of top recipes -->
          <div class="mt-3 flex gap-3 overflow-x-auto py-2">
            <div
              v-for="recipe in chef.recipes" :key="recipe.id"
              class="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer"
            >
              <img :src="recipe.image" :alt="recipe.title" class="w-full h-full object-cover">
              <p class="text-sm mt-1 text-center px-1">
                {{ recipe.title }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
