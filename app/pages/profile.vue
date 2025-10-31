<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";

interface User {
  username: string;
  email: string;
  bio: string;
  avatar: string | null;
  stats: {
    recipes: number;
    followers: number;
    likes: number;
  };
}

const user = reactive<User>({
  username: "Fitsum Wondessen",
  email: "fitsum@example.com",
  bio: "Passionate about coding and creating delightful recipes 🍜",
  avatar: null,
  stats: {
    recipes: 12,
    followers: 1284,
    likes: 3456,
  },
});

const form = reactive({
  username: user.username,
  email: user.email,
  bio: user.bio,
});

const editing = ref(false);
const avatarPreview = ref<string | null>(null);

function handleAvatarChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file)
    return;
  const reader = new FileReader();
  reader.onload = () => (avatarPreview.value = reader.result as string);
  reader.readAsDataURL(file);
}

function toggleEdit() {
  editing.value = !editing.value;
  if (!editing.value) {
    // Save edits
    user.username = form.username;
    user.email = form.email;
    user.bio = form.bio;
    user.avatar = avatarPreview.value || user.avatar;
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-black p-8 flex justify-center mt-10"
  >
    <div
      class="max-w-4xl w-full bg-white dark:bg-gray-900 shadow-2xl rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800"
    >
      <!-- Header -->
      <div class="relative h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div
          class="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden shadow-xl group"
        >
          <img
            v-if="avatarPreview || user.avatar" :src="avatarPreview || user.avatar" alt="avatar"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          >
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-4xl text-gray-600"
          >
            {{ user.username.charAt(0).toUpperCase() }}
          </div>

          <label
            class="absolute bottom-0 right-0 m-1 bg-white/80 dark:bg-gray-800/80 p-1 rounded-full cursor-pointer shadow hover:scale-110 transition"
          >
            <input type="file" class="hidden" accept="image/*" @change="handleAvatarChange">
            <svg
              xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-700 dark:text-gray-200" viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M4 3a2 2 0 00-2 2v2a2 2 0 002 2h1v7a2 2 0 002 2h6a2 2 0 002-2v-7h1a2 2 0 002-2V5a2 2 0 00-2-2H4zm2 2h8v2H6V5z"
              />
            </svg>
          </label>
        </div>
      </div>

      <!-- Body -->
      <div class="pt-20 pb-10 px-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {{ user.username }}
          </h2>
          <p class="text-gray-500 dark:text-gray-400">
            {{ user.email }}
          </p>
        </div>

        <!-- Stats -->
        <div class="mt-8 grid grid-cols-3 gap-6">
          <div
            class="p-4 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-xl text-center shadow hover:shadow-md transition"
          >
            <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {{ user.stats.recipes }}
            </div>
            <div class="text-gray-600 dark:text-gray-300 text-sm">
              Recipes
            </div>
          </div>

          <div
            class="p-4 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl text-center shadow hover:shadow-md transition"
          >
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ user.stats.followers }}
            </div>
            <div class="text-gray-600 dark:text-gray-300 text-sm">
              Followers
            </div>
          </div>

          <div
            class="p-4 bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-800/20 rounded-xl text-center shadow hover:shadow-md transition"
          >
            <div class="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {{ user.stats.likes }}
            </div>
            <div class="text-gray-600 dark:text-gray-300 text-sm">
              Likes
            </div>
          </div>
        </div>

        <!-- Editable Form -->
        <div class="mt-10 space-y-6 max-w-lg mx-auto">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Profile Details
            </h3>
            <button class="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400" @click="toggleEdit">
              {{ editing ? 'Save' : 'Edit' }}
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">Username</label>
              <input
                v-model="form.username" :disabled="!editing" type="text"
                class="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
              <input
                v-model="form.email" :disabled="!editing" type="email"
                class="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">Bio</label>
              <textarea
                v-model="form.bio" :disabled="!editing" rows="3"
                class="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
