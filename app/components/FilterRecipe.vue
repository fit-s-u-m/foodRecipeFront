<script setup lang="ts">
import type { FILTER } from "../types/types.ts";

interface Props {
  onFilter: (filter: FILTER) => void; // optional
}

const { onFilter } = defineProps<Props>();
const isFilterModalOpen = ref(false);
const filters = ref<FILTER>({
  excludeIngredients: [],
  category: "",
  prepTime: [2, 300],
  sortBy: "latest",
  bookmarked: false,
});
const categories = [
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
  { label: "Dessert", value: "dessert" },
  { label: "Drinks", value: "drinks" },
];

const sortOptions = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
  { label: "Most Popular", value: "popular" },
];
function resetFilters() {
  filters.value = {
    excludeIngredients: [],
    category: "",
    prepTime: [2, 300],
    sortBy: "latest",
    bookmarked: false,
  };
}
const ingredientOptions = [
  "Peanuts",
  "Milk",
  "Shrimp",
  "Gluten",
  "Eggs",
  "Soy",
  "Fish",
  "Shellfish",
  "Nuts",
  "Dairy",
  "Wheat",
  "Sesame",
];
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
          <UInputMenu v-model="filters.excludeIngredients" icon="i-lucide-no-symbol" multiple :items="ingredientOptions"
            placeholder="" />

          <p class="text-xs text-gray-500 mt-1">
            Add ingredients you want to avoid (for allergies or dislikes)
          </p>
        </div>

        <!-- Category -->
        <div>
          <h3 class="font-semibold text-lg mb-2">
            Category
          </h3>
          <USelect v-model="filters.category" :items="categories" placeholder="Select category" />
        </div>

        <!-- Preparation Time -->
        <div class="mb-3">
          <h3 class="font-semibold text-lg my-2">
            Time {{ filters.prepTime[0] }}-{{ filters.prepTime[1] }} (minutes)
          </h3>
          <USlider v-model="filters.prepTime" tooltip size="sm" />
        </div>

        <!-- Sort By -->
        <div>
          <h3 class="font-semibold text-lg mb-2">
            Sort By
          </h3>
          <USelect v-model="filters.sortBy" :items="sortOptions" placeholder="Sort recipes" />
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
