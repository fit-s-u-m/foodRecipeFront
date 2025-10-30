<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

import { toast } from "#build/ui";
import { ref } from "vue";
import * as z from "zod";

// in any page or composable
import { CREATE_RECIPE, GET_RECIPES } from "~/graphql/queries";

// Mock recipe data
const recipes = ref([
  {
    id: 1,
    title: "Spaghetti Carbonara",
    description: "Classic Italian pasta with eggs, cheese, and pancetta.",
    featured_image: "/images/food6.jpeg",
    prepare_time_minutes: 10,
    likes: 42,
    liked: false,
    bookmarked: false,
    comments: [],
  },
  {
    id: 2,
    title: "Avocado Toast",
    description: "Simple and healthy avocado toast with lemon and chili flakes.",
    featured_image: "/images/food7.jpg",
    likes: 15,
    liked: true,
    bookmarked: true,
    comments: [],
  },
  {
    id: 3,
    title: "Chicken Curry",
    description: "Rich and flavorful Indian curry with coconut milk.",
    featured_image: "/images/food8.jpg",
    likes: 27,
    liked: false,
    bookmarked: false,
    comments: [],
  },
  {
    id: 4,
    title: "Beef Stir Fry",
    description: "Quick and easy stir fry with tender beef and vegetables.",
    featured_image: "/images/food9.jpg",
    likes: 33,
    liked: false,
    bookmarked: false,
    comments: [],
  },
  {
    id: 5,
    title: "Pancakes with Maple Syrup",
    description: "Fluffy pancakes topped with butter and maple syrup.",
    featured_image: "/images/food10.jpg",
    likes: 50,
    liked: true,
    bookmarked: false,
    comments: [],
  },
  {
    id: 6,
    title: "Caprese Salad",
    description: "Fresh tomatoes, mozzarella, and basil drizzled with olive oil.",
    featured_image: "/images/food11.jpg",
    likes: 28,
    liked: false,
    bookmarked: true,
    comments: [],
  },
  {
    id: 7,
    title: "Shrimp Tacos",
    description: "Spicy grilled shrimp with fresh slaw and creamy sauce.",
    featured_image: "/images/food12.jpg",
    likes: 36,
    liked: false,
    bookmarked: false,
    comments: [],
  },
]);

// Recipe form state
// const newRecipe = ref({
//   title: "",
//   description: "",
//   category_id: null,
//   prep_time_minutes: 0,
//   featured_image_url: "",
//   steps: [] as { step_index: number; content: string }[],
// });
//
// Modal state
// const isRecipeModalOpen = ref(false);
// const isStepModalOpen = ref(false);
// const newStepContent = ref("");

// // Add step to recipe
// function addStep() {
//   if (!newStepContent.value)
//     return;
//   newRecipe.value.steps.push({
//     step_index: newRecipe.value.steps.length + 1,
//     content: newStepContent.value,
//   });
//   newStepContent.value = "";
//   isStepModalOpen.value = false;
// }
//
// // Remove step
// function removeStep(index: number) {
//   newRecipe.value.steps.splice(index, 1);
//   newRecipe.value.steps.forEach((s, i) => s.step_index = i + 1);
// }
//
// // Submit recipe
// function submitRecipe() {
//   if (!newRecipe.value.title)
//     return alert("Recipe title required!");
//   recipes.value.push({
//     ...newRecipe.value,
//     id: Date.now(),
//     likes: 0,
//     liked: false,
//     bookmarked: false,
//     comments: [],
//     image: newRecipe.value.featured_image_url,
//   });
//   newRecipe.value = { title: "", description: "", category_id: null, prep_time_minutes: 0, featured_image_url: "", steps: [] };
//   isRecipeModalOpen.value = false;
// }

// Toggle Like
function toggleLike(recipe: any) {
  recipe.liked = !recipe.liked;
  recipe.likes += recipe.liked ? 1 : -1;
}

// Toggle Bookmark
function toggleBookmark(recipe: any) {
  recipe.bookmarked = !recipe.bookmarked;
}

const recipesFromBackEnd = ref(null);
const loading = ref(true);

interface RecipieResp {
  title: string;
  created_at: string;
  description: string;
  featured_image: string | null;
  id: string;
  prep_time_minutes: number;
  recipe_likes_aggregate: {
    aggregate: {
      count: number;
    };
  };
  recipe_comments: { content: string; user_id: string }[];
  recipe_bookmarks: { id: number }[];
  recipe_likes: { id: number }[];
}

onMounted(() => {
  const userId = localStorage.getItem("userId") || "";
  const variables = {
    limit: 10,
    user_id: userId,
  };
  const { result, loading: queryLoading } = useQuery(GET_RECIPES, variables);
  watch(queryLoading, () => {
    if (!queryLoading.value) {
      // Check if result.value is truthy AND if it has the 'recipes' property
      if (result.value && result.value.recipes) {
        const recipes = result.value.recipes as RecipieResp[];
        // recipesFromBackEnd should hold an ARRAY of recipes, not just the first one
        recipesFromBackEnd.value = recipes.map(prevRecipe => ({
          id: prevRecipe.id,
          featured_image: prevRecipe.featured_image,
          description: prevRecipe.description,
          title: prevRecipe.title,
          liked: (prevRecipe.recipe_likes.length !== 0),
          likes: prevRecipe.recipe_likes_aggregate.aggregate.count,
          comments: prevRecipe.recipe_comments,
          bookmarked: (prevRecipe.recipe_bookmarks.length !== 0),
          prep_time_minutes: prevRecipe.prep_time_minutes,
        }));
        console.log("recipes", recipesFromBackEnd.value);
      }
      else {
        console.error("GraphQL query returned no data or failed.");
      }
      loading.value = false;
    }
  });
});

const recipesAll = computed(() => {
  // 1. Start with the local mock recipes array
  let combined = [...recipes.value];
  console.log({ x: recipesFromBackEnd.value, c: combined });

  // 2. Check if the backend data has loaded and is an array
  if (recipesFromBackEnd.value) {
    // 3. Concatenate the backend recipes
    combined = [...combined, ...recipesFromBackEnd.value];
  }

  // Return the combined array (will re-run when recipesFromBackEnd.value changes)
  return combined;
});

console.log({ recipesAll });
const addRecipeModal = ref(false);
const addStepModal = ref(false);
const schema = z.object({
  time: z.number().min(1, "Time is required").max(300, "Too long"),
  image: z.url("Must be a valid URL"),
});
const newStep = ref("");

type Schema = z.output<typeof schema>;
const steps = ref<string[]>([]);
interface ImagePreview {
  file: File;
  preview: string;
}

const images = ref<ImagePreview[]>([]);

const state = reactive({
  time: undefined as number | undefined,
  images: [] as File[],

});
function handleImagesUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files)
    return;

  for (const file of Array.from(files)) {
    const preview = URL.createObjectURL(file);
    images.value.push({ file, preview });
  }

  console.log(images.value);
}

function onSubmit(event: Event) {
  event.preventDefault();
  // console.log("Time:", state.time);
  // console.log("Images:", state.images);
  // console.log("Image previews (browser URLs):", previews.value);

  alert("Recipe submitted! Check console for image data.");
}
function removeImage(index: number) {
  images.value.splice(index, 1);
}

function addStep() {
  if (newStep.value.trim() !== "") {
    steps.value.push(newStep.value.trim());
    newStep.value = "";
    addStepModal.value = false;
  }
}
function removeStep(index: number) {
  steps.value.splice(index, 1);
}
</script>

<template>
  <UContainer class="py-10 max-w-6xl mx-auto mt-10">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">
        🍽️ Delicious Recipes
      </h1>
      <UModal v-model:open="addRecipeModal" title="Add Recipes" :ui="{ footer: 'justify-end' }">
        <UButton color="primary" label="+ Add Recipe" />
        <template #body>
          <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
            <UFormField label="Time it talkes in minite" name="time">
              <UInput v-model="state.time" type="number" />
            </UFormField>

            <UFormField label="Images" name="images">
              <UInput type="file" multiple accept="image/*" @change="handleImagesUpload" />
            </UFormField>
            <div class="flex flex-col gap-3 mt-3">
              <!-- Image Preview -->
              <div v-if="images.length" class="grid grid-cols-3 gap-2">
                <div v-for="(img, i) in images" :key="i" class="relative group">
                  <img
                    :src="img.preview" alt="Preview"
                    class="w-full h-32 object-cover rounded-xl border border-gray-200"
                  >
                  <button
                    class="absolute top-1 right-1 bg-red-500 text-white  w-6 h-6 rounded-sm  opacity-0 group-hover:opacity-100 transition"
                    @click.prevent="removeImage(i)"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div>
                <div class="flex justify-between items-center">
                  <label class="font-semibold">Steps</label>
                  <UButton
                    size="xs" color="neutral" variant="outline" class="cursor-pointer"
                    @click="addStepModal = true"
                  >
                    + Add Step
                  </UButton>
                </div>
                <ul v-if="steps.length" class="mt-2 space-y-2">
                  <li
                    v-for="(step, i) in steps" :key="i"
                    class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex justify-between items-start"
                  >
                    <span>{{ i + 1 }}. </span>
                    <pre>{{ step }} </pre>
                    <UButton
                      size="xs" color="red" class="cursor-pointer" variant="ghost" icon="i-heroicons-trash"
                      @click="removeStep(i)"
                    />
                  </li>
                </ul>
              </div>

              <div class="flex justify-between">
                <UModal v-model:open="addStepModal" title="Add Step" :ui="{ footer: 'justify-end' }">
                  <template #body>
                    <UTextarea v-model="newStep" placeholder="Describe the step..." rows="4" class="w-full" />
                  </template>
                  <template #footer>
                    <UButton color="primary" label="Add Step" @click="addStep" />
                  </template>
                </UModal>
                <UButton type="submit" color="primary" @click="addRecipeModal = false">
                  Submit
                </UButton>
              </div>
            </div>
          </UForm>
        </template>
      </UModal>
    </div>

    <!-- Recipes Grid -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="recipe in recipesAll" :key="recipe.id" class="flex flex-col shadow-lg hover:shadow-xl transition">
        <img :src="recipe.featured_image" alt="Recipe image" class="w-full h-48 object-cover rounded-t-lg">
        <div class="p-4 flex flex-col justify-between flex-1">
          <h2 class="text-xl font-semibold mb-2">
            {{ recipe.title }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {{ recipe.description }}
          </p>

          <div class="flex justify-between items-center mt-auto">
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
