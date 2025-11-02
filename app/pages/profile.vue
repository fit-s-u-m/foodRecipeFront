<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";

import type { USER } from "~/types/types";

import { uploadToCloudinary } from "~/components/lib/util";
import { GET_USER_BY_ID, UPDATE_USER_AVATAR_BY_ID, UPDATE_USER_BY_ID } from "~/graphql/queries";

const user = ref<USER | null>(null);

const form = reactive({
  username: user.value ? user.value.username : "",
  email: user.value ? user.value.email : "",
  bio: user.value ? user.value.bio : "",
});

const editing = ref(false);
const avatarPreview = ref<string | null>(null);

async function handleAvatarChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file)
    return;
  changeAvatarURL(file);
  const reader = new FileReader();
  reader.onload = () => (avatarPreview.value = reader.result as string);
  reader.readAsDataURL(file);
}

async function toggleEdit() {
  editing.value = !editing.value;
  if (!editing.value) {
    if (!user.value)
      return;
    // Save edits
    // user.value.username = form.username;
    // user.value.email = form.email;
    // user.value.bio = form.bio;

    // update db
    const { mutate: updateUser } = useMutation(UPDATE_USER_BY_ID);

    await updateUser({
      user_id: user.value.id,
      bio: form.bio || "",
      email: form.email,
      username: form.username,
    });
  }
}
const userLoading = ref(true);
const uploading = ref(false);

onMounted(() => {
  const userId = localStorage.getItem("userId") || "";
  const shouldSkip = !userId || userId === "";
  const { result, loading: queryLoading } = useQuery(GET_USER_BY_ID, {
    userId,
    skip: shouldSkip, // ⬅️ The key change: Skip if userId is null/empty
  });
  watchEffect(() => {
    if (!queryLoading.value && result.value) {
      user.value = result.value.users[0];
      userLoading.value = false;

      // update the form
      if (!user.value)
        return;
      form.username = user.value.username;
      form.email = user.value.email;
      form.bio = user.value.bio;
    }
  });
});
async function changeAvatarURL(selectedFile: File) {
  uploading.value = true;
  const urls = await uploadToCloudinary([selectedFile]);
  const avatarUrl = urls[0];
  uploading.value = false;
  if (!avatarUrl)
    return;

  // eslint-disable-next-line no-console
  console.log("Uploaded:", avatarUrl);
  avatarPreview.value = avatarUrl;

  // update db
  if (!user.value)
    return;
  const { mutate: updateUser } = useMutation(UPDATE_USER_AVATAR_BY_ID);

  await updateUser({
    user_id: user.value.id,
    avatar_url: avatarUrl,
  });
  // user.value!.avatar = data.url;
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-black p-8 flex justify-center mt-10">
    <!-- <div v-if="userLoading" class="text-gray-500 dark:text-gray-400 text-lg animate-spin mt-10"> -->
    <!--   Loading -->
    <!-- </div> -->
    <div v-if="user"
      class="max-w-4xl w-full bg-white dark:bg-gray-900 shadow-2xl rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800">
      <!-- Header -->
      <div class="relative h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div
          class="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden shadow-xl group">
          <img v-if="avatarPreview || user.avatar_url" :src="avatarPreview || user.avatar_url" alt="avatar"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
          <div v-else
            class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-4xl text-gray-600">
            {{ user.username.charAt(0).toUpperCase() }}
          </div>

          <label
            class="absolute bottom-0 right-0 m-1 bg-white/80 dark:bg-gray-800/80 p-1 rounded-full cursor-pointer shadow hover:scale-110 transition">
            <input :disabled="userLoading" type="file" class="hidden" accept="image/*" @change="handleAvatarChange">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-700 dark:text-gray-200" viewBox="0 0 20 20"
              fill="currentColor">
              <path
                d="M4 3a2 2 0 00-2 2v2a2 2 0 002 2h1v7a2 2 0 002 2h6a2 2 0 002-2v-7h1a2 2 0 002-2V5a2 2 0 00-2-2H4zm2 2h8v2H6V5z" />
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
            class="p-4 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-xl text-center shadow hover:shadow-md transition">
            <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              118
              <!-- {{ user.stats.recipes }} -->
            </div>
            <div class="text-gray-600 dark:text-gray-300 text-sm">
              Recipes
            </div>
          </div>

          <div
            class="p-4 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl text-center shadow hover:shadow-md transition">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              0234983
              <!-- {{ user.stats.followers }} -->
            </div>
            <div class="text-gray-600 dark:text-gray-300 text-sm">
              Followers
            </div>
          </div>

          <div
            class="p-4 bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-800/20 rounded-xl text-center shadow hover:shadow-md transition">
            <div class="text-2xl font-bold text-pink-600 dark:text-pink-400">
              92387
              <!-- {{ user.stats.likes }} -->
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
              <input v-model="form.username" :disabled="!editing" type="text"
                class="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
              <input v-model="form.email" :disabled="!editing" type="email"
                class="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">Bio</label>
              <textarea v-model="form.bio" :disabled="!editing" rows="3"
                class="mt-1 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed resize-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
