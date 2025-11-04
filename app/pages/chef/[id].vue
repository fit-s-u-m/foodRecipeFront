<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";

import type { GET_CHEFS_QUERY, GetChefProfileResponse, GetChefResponse } from "~/types/types";

import { FOLLOW_CHEF, GET_CHEF, UNFOLLOW_CHEF } from "~/graphql/queries";

const route = useRoute();
const chefId = route.params.id || "1";
interface Recipe {
  id: number;
  title: string;
  image: string;
  likes: number;
  bookmarked: boolean;
  rating: number | null;
}

interface Chef {
  id: string;
  chef_id: number;
  username: string;
  bio: string;
  avatar: string;
  stats: {
    recipes: number;
    followers: number;
    likes: number;
    avarageRating: number | null;
  };
  followed: boolean;
  recipes: Recipe[];
}

function goToRecipie(index: number) {
  navigateTo(`/recipe/${index}`);
}

const userLoading = ref(false);
const chef = ref<Chef | null>(null);
const user_id = ref<null | string>(null);
const isCurrentUser = ref(false);
let refechChef;
onMounted(() => {
  const userId = localStorage.getItem("userId") || "";
  const shouldSkip = !userId || userId === "";

  const { result, refetch } = useQuery<GetChefResponse>(GET_CHEF, {
    current_user_id: userId,
    chef_id: chefId,
    skip: shouldSkip,
  });
  refechChef = refetch;

  user_id.value = userId;
  watch(
    result,
    (value) => {
      if (!value || !value.users?.length)
        return;

      const user = value.users[0];
      if (!user)
        return;

      isCurrentUser.value = userId === user.id;
      chef.value = {
        id: user.id,
        chef_id: user.user_id,
        username: user.username,
        avatar: user.avatar_url ?? "",
        stats: {
          recipes: user.recipes.length,
          followers: user.user_following_aggregate.aggregate.count,
          likes: user.recipes.reduce((acc, r) => acc + r.recipe_likes.length, 0),
          avarageRating: user.recipes.reduce((acc, r) => acc + (r.recipe_ratings_aggregate.aggregate.avg.rating ?? 0), 0)
            / (user.recipes.filter(r => r.recipe_ratings_aggregate.aggregate.avg.rating !== null).length || 1),
        },
        followed: (user.user_following.length ?? 0) > 0,
        recipes: user.recipes.map(r => ({
          id: r.recipe_id,
          title: r.title,
          image: r.recipe_images[0]?.url ?? "",
          description: r.description,
          likes: r.recipe_likes.length,
          bookmarked: r.recipe_bookmarks.length > 0,
          rating: r.recipe_ratings_aggregate.aggregate.avg.rating,
        })),
      };
      console.log("chef", chef.value);

      userLoading.value = false;
    },
    { immediate: true },
  );
});
// Loading state for the button
const followLoading = ref(false);
const { mutate: followMutate } = useMutation(FOLLOW_CHEF);
const { mutate: unfollowMutate } = useMutation(UNFOLLOW_CHEF);

// Function to toggle follow/unfollow
async function toggleFollow() {
  if (!chef.value)
    return;

  followLoading.value = true;

  try {
    if (chef.value.followed) {
      await unfollowMutate({ follower_id: user_id.value, following_id: chef.value.id });
      chef.value.followed = false;
      refechChef();
    }
    else {
      console.log({ follower_id: user_id.value, following_id: chef.value.id });
      await followMutate({ follower_id: user_id.value, following_id: chef.value.id });
      chef.value.followed = true;
      refechChef();
    }
  }
  catch (error) {
    console.error(error);
  }
  finally {
    followLoading.value = false;
  }
}
</script>

<template>
  <UContainer class="py-10 max-w-7xl mx-auto space-y-8 mt-10 ">
    <!-- Chef Header -->
    <div v-if="chef" class="flex justify-between  bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
      <div class="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12">
        <UAvatar :src="chef.avatar" :alt="chef.username" size="xl" />
        <div class="flex-1 text-center md:text-left space-y-2">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ chef.username }}
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
            <div class="text-center">
              <div class="text-xl font-bold text-gray-900 dark:text-white">
                {{ chef.stats.avarageRating }}
              </div>
              <div class="text-gray-500 dark:text-gray-400 text-sm">
                Avg rating
              </div>
            </div>
          </div>
        </div>
      </div>

      <UButton class="py-0 h-10" :color="chef?.followed ? 'primary' : 'secondary'"
        :disabled="isCurrentUser || followLoading" @click="toggleFollow">
        <template v-if="followLoading">
          ...
        </template>
        <template v-else>
          {{ chef?.followed ? 'Following' : 'Follow' }}
        </template>
      </UButton>
    </div>

    <!-- Chef Recipes -->
    <div v-if="chef">
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
              <span>⭐ {{ recipe.rating || "N/A" }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
