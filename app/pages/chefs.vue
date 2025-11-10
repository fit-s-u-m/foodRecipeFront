<script setup lang="ts">
import { ref } from "vue";

import type { GET_CHEFS_QUERY, TOTAL_CHEFS_TYPE } from "~/types/types";

import { useAuthMutation } from "~/components/composeable/UseAuthMutation";
import { useAuthQuery } from "~/components/composeable/UseAuthQuery";
import { FOLLOW_CHEF, GET_CHEFS, TOTAL_CHEFS, UNFOLLOW_CHEF } from "~/graphql/queries";

interface RECIPE {
  id: number;
  image: string;
  title: string;
  description: string;
  time: number;
}

interface CHEF {
  id: number;
  name: string;
  recipes: RECIPE[];
  follower: number;
  avarageRating: number | null;
  following: boolean;
  profileImage: string | null;
}

function goToEachChefPage(index: number) {
  navigateTo(`/chef/${index}`);
}
function goToEachRecipePage(index: number) {
  navigateTo(`/recipe/${index}`);
}
const chefs = ref<CHEF[]>([]);
const userLoading = ref(false);
const page = ref(1);
const itemsPerPage = ref(2);
const totalChefs = ref(100);
const user_id = ref<null | string>(null);
let refetchChefs: any;
onMounted(() => {
  const userId = localStorage.getItem("userId") || "";
  user_id.value = userId;
  userLoading.value = true;
  const { result: totalChefsRes } = useAuthQuery<TOTAL_CHEFS_TYPE>(TOTAL_CHEFS, {});
  const { result, refetch } = useAuthQuery<GET_CHEFS_QUERY>(GET_CHEFS, {
    user_id: userId,
    limit: itemsPerPage,
    offset: (page.value - 1) * itemsPerPage.value,
  });
  refetchChefs = refetch;
  watch(
    totalChefsRes,
    (value) => {
      if (value && value.users_aggregate && value.users_aggregate.aggregate) {
        totalChefs.value = value.users_aggregate.aggregate.count;
      }
    },
    { immediate: true },
  );
  watch(
    result,
    (value) => {
      if (value && value.users) {
        chefs.value = value.users.map(user => ({
          name: user.username,
          id: user.user_id,
          recipes: (user.recipes || []).map(r => ({
            id: r.recipe_id,
            image: r.recipe_images?.[0]?.url ?? "",
            title: r.title,
            description: r.description,
            time: r.prep_time_minutes,
          })),
          follower: user.user_following_aggregate?.aggregate?.count ?? 0,
          avarageRating: user.recipe_ratings_aggregate?.aggregate?.avg?.rating ?? null,
          following: (user.user_following?.length ?? 0) > 0,
          profileImage: user.avatar_url ?? "",
        }));
        userLoading.value = false;
      }
    },
    { immediate: true }, // 🔑 ensures it runs immediately if result.value already has data
  );
});
const { run: followMutate } = useAuthMutation(FOLLOW_CHEF);
const { run: unfollowMutate } = useAuthMutation(UNFOLLOW_CHEF);
const followLoading = ref(false);

// Function to toggle follow/unfollow
async function toggleFollow(chef: any) {
  if (!chef.value)
    return;

  followLoading.value = true;

  try {
    if (chef.value.followed) {
      await unfollowMutate({ follower_id: user_id.value, following_id: chef.value.id });
      chef.value.followed = false;
      refetchChefs();
    }
    else {
      console.log({ follower_id: user_id.value, following_id: chef.value.id });
      await followMutate({ follower_id: user_id.value, following_id: chef.value.id });
      chef.value.followed = true;
      refetchChefs();
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

<template class="overflow-y-scroll">
  <UContainer class="py-10 mt-10 ">
    <h1 class="text-3xl font-bold mb-8 text-center">
      👩‍🍳 Our Chefs
    </h1>
    <div v-if="userLoading" class="flex items-center space-x-2 text-gray-500">
      <Icon name="i-lucide-loader" class="w-5 h-5 animate-spin text-blue-500" />
      <span>Loading Chefs...</span>
    </div>

    <div class="flex flex-col gap-6">
      <div v-for="chef in chefs" :key="chef.id"
        class="flex flex-col md:flex-row cursor-pointer items-start md:items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
        @click="goToEachChefPage(chef.id)">
        <!-- Chef profile -->
        <img :src="chef.profileImage || ''" alt="Chef profile" class="w-20 h-20 rounded-full object-cover">
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
            <div v-for="recipe in chef.recipes" :key="recipe.id"
              class="relative flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer"
              @click="goToEachRecipePage(recipe.id)">
              <img :src="recipe.image" :alt="recipe.title" class="w-full h-full object-cover">
              <p class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
                {{ recipe.title }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <UPagination v-model:page="page" :items-per-page="itemsPerPage" active-color="primary" active-variant="subtle"
      :total="totalChefs" class="justify-center mt-10" :ui="{ root: 'flex justify-center items-center' }"
      @update:page="() => { refetchChefs({ offset: (page - 1) * itemsPerPage }) }" />
  </UContainer>
</template>
