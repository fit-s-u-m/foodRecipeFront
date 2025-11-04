<script setup lang="ts">
import { GET_CATEGORIES, GET_INGREDIENTS } from "~/graphql/queries.js";

import type { FILTER, NameId } from "../types/types.ts";

interface Props {
  refreshOnFilter: (fillter: FILTER) => void; // optional
}
const { refreshOnFilter } = defineProps<Props>();

const router = useRouter();
const route = useRoute();

const isFilterModalOpen = ref(false);
const filters = ref<FILTER>({
  excludeIngredients: [],
  categories: [] as string[],
  prepTime: [2, 300],
  bookmarked: false,
});
;

function resetFilters() {
  filters.value = {
    excludeIngredients: [],
    categories: [],
    prepTime: [2, 300],
    bookmarked: false,
  };
  router.replace({
    query: {
      ...route.query, // keep other params
      excludeIngredients: [],
      categories: [],
      bookmarked: undefined,
      prepTime: undefined,
    },
  });
  refreshOnFilter(filters.value);
  isFilterModalOpen.value = false;
}
const ingredientOptions = ref<NameId[]>([]);
const ingredientsLoading = ref(true);
const categoryOptions = ref<NameId[]>([]);
const categoriesLoading = ref(true);
onMounted(() => {
  const { result: ingredientsRes, loading: ingredientsLoadingRes } = useQuery(GET_INGREDIENTS);
  const { result: categoriesRes, loading: categoriesLoadingRes } = useQuery(GET_CATEGORIES);
  const query = route.query;
  filters.value = {
    bookmarked: !!query.bookmarked,
    prepTime: query.prepTime ? query.prepTime : [2, 300],
    excludeIngredients: route.query.excludeIngredients
      ? Array.isArray(route.query.excludeIngredients)
        ? route.query.excludeIngredients
        : [route.query.excludeIngredients]
      : [],
    categories: route.query.categories
      ? Array.isArray(route.query.categories)
        ? route.query.categories
        : [route.query.categories]
      : [],
  };

  watchEffect(() => {
    if (!ingredientsLoadingRes.value && ingredientsRes.value) {
      ingredientOptions.value = ingredientsRes.value.ingredients.map(i => i.name);
      ingredientsLoading.value = false;
    }
    if (!categoriesLoadingRes.value && categoriesRes.value) {
      categoryOptions.value = categoriesRes.value.categories.map(i => i.name);
      categoriesLoading.value = false;
    }
  });
});
function onFilter(filter: FILTER) {
  router.replace({
    query: {
      ...route.query, // keep other params
      excludeIngredients: filter.excludeIngredients,
      categories: filter.categories,
      bookmarked: filter.bookmarked ? "true" : undefined,
      prepTime: filter.prepTime[0] === 2 && filter.prepTime[1] === 300 ? undefined : filter.prepTime,
    },
  });
  refreshOnFilter(filter);
  isFilterModalOpen.value = false;
}
</script>

<template>
  <UModal v-model:open="isFilterModalOpen" title="Filter Recipes" size="lg">
    <UButton color="primary" icon="i-lucide-funnel" variant="outline" @click="isFilterModalOpen = true">
      Filter Recipes
    </UButton>
    <template #body>
      <UCard class="p-5 space-y-6">
        <!-- Exclude Ingredients -->
        <div>
          <h3 class="font-semibold text-lg mb-2">
            Exclude Ingredients
          </h3>
          <UInputMenu v-model="filters.excludeIngredients" icon="i-lucide-circle-slash" multiple
            :items="ingredientOptions" placeholder="" />

          <p class="text-xs text-gray-500 mt-1">
            Add ingredients you want to avoid (for allergies or dislikes)
          </p>
        </div>

        <!-- Category -->
        <div>
          <h3 class="font-semibold text-lg mb-2">
            Category
          </h3>
          <UInputMenu v-model="filters.categories" icon="i-lucide-layout-list" multiple :items="categoryOptions"
            placeholder="Select Category" />
        </div>

        <!-- Preparation Time -->
        <div class="mb-3">
          <h3 class="font-semibold text-lg my-2">
            Time {{ filters.prepTime[0] }}-{{ filters.prepTime[1] }} (minutes)
          </h3>
          <USlider v-model="filters.prepTime" tooltip size="sm" />
        </div>

        <!-- Bookmarked Only -->
        <USwitch v-model="filters.bookmarked" class="my-5" label="Bookmarked"
          description="Show only bookmarked recipies" />

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 ">
          <UButton color="primary" variant="soft" @click="resetFilters">
            Reset
          </UButton>
          <UButton color="primary" icon="i-heroicons-check-circle" @click="onFilter(filters)">
            Apply Filters
          </UButton>
        </div>
      </UCard>
    </template>
  </UModal>
</template>
