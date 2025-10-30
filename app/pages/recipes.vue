<script setup lang="ts">
import { ref } from "vue";

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
</script>

<template>
  <UContainer class="py-10 max-w-6xl mx-auto mt-10">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">
        🍽️ Delicious Recipes
      </h1>
      <UButton color="primary" @click="isRecipeModalOpen = true">
        + Add Recipe
      </UButton>
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
<!---->
<!-- // Mock categories (replace with API fetch) -->
<!-- const categories = [ -->
<!--   { label: "Italian", value: 1 }, -->
<!--   { label: "Desserts", value: 2 }, -->
<!--   { label: "Vegan", value: 3 }, -->
<!-- ]; -->
<!---->
<!-- // Recipe form state -->
<!-- const recipe = ref({ -->
<!--   title: "", -->
<!--   description: "", -->
<!--   category_id: null, -->
<!--   prep_time_minutes: 0, -->
<!--   featured_image_url: "", -->
<!--   steps: [] as { step_index: number; content: string }[], -->
<!-- }); -->
<!---->
<!-- // Modal state -->
<!-- const isStepModalOpen = ref(false); -->
<!-- const newStepContent = ref(""); -->
<!---->
<!-- // Add step to recipe -->
<!-- function addStep() { -->
<!--   if (!newStepContent.value) -->
<!--     return; -->
<!--   recipe.value.steps.push({ -->
<!--     step_index: recipe.value.steps.length + 1, -->
<!--     content: newStepContent.value, -->
<!--   }); -->
<!--   newStepContent.value = ""; -->
<!--   isStepModalOpen.value = false; -->
<!-- } -->
<!---->
<!-- // Remove a step -->
<!-- function removeStep(index: number) { -->
<!--   recipe.value.steps.splice(index, 1); -->
<!--   // re-index steps -->
<!--   recipe.value.steps.forEach((s, i) => s.step_index = i + 1); -->
<!-- } -->
<!---->
<!-- // Submit recipe (replace with actual API call) -->
<!-- function submitRecipe() { -->
<!--   console.log("Submitting recipe:", recipe.value); -->
<!--   alert("Recipe submitted! Check console."); -->
<!-- } -->
<!---->
<!-- // Toggle Like -->
<!-- function toggleLike(recipe: any) { -->
<!--   recipe.liked = !recipe.liked; -->
<!--   recipe.likes += recipe.liked ? 1 : -1; -->
<!-- } -->
<!---->
<!-- // Toggle Bookmark -->
<!-- function toggleBookmark(recipe: any) { -->
<!--   recipe.bookmarked = !recipe.bookmarked; -->
<!-- } -->
<!-- </script> -->
<!---->
<!-- <template> -->
<!--   <UContainer class="py-10 my-10"> -->
<!--     <h1 class="text-3xl font-bold mb-8 text-center"> -->
<!--       🍽️ Delicious Recipes -->
<!--     </h1> -->
<!---->
<!--     <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"> -->
<!--       <UCard -->
<!--         v-for="recipe in recipes" :key="recipe.id" -->
<!--         class="flex flex-col justify-between shadow-lg hover:shadow-xl transition" -->
<!--       > -->
<!--         <img :src="recipe.image" alt="Recipe image" class="w-full h-48 object-cover rounded-t-lg"> -->
<!---->
<!--         <div class="p-4"> -->
<!--           <h2 class="text-xl font-semibold mb-2"> -->
<!--             {{ recipe.title }} -->
<!--           </h2> -->
<!--           <p class="text-gray-600 dark:text-gray-400 text-sm mb-4"> -->
<!--             {{ recipe.description }} -->
<!--           </p> -->
<!---->
<!--           <div class="flex justify-between items-center"> -->
<!--             <button class="flex items-center gap-1 text-sm" @click="toggleLike(recipe)"> -->
<!--               <UIcon :name="recipe.liked ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="text-red-500" /> -->
<!--               <span>{{ recipe.likes }}</span> -->
<!--             </button> -->
<!---->
<!--             <button class="flex items-center gap-1 text-sm"> -->
<!--               <UIcon name="i-heroicons-chat-bubble-left" /> -->
<!--               <span>{{ recipe.comments.length }}</span> -->
<!--             </button> -->
<!---->
<!--             <button @click="toggleBookmark(recipe)"> -->
<!--               <UIcon -->
<!--                 :name="recipe.bookmarked ? 'i-heroicons-bookmark-solid' : 'i-heroicons-bookmark'" -->
<!--                 class="text-yellow-500" -->
<!--               /> -->
<!--             </button> -->
<!--           </div> -->
<!--         </div> -->
<!--       </UCard> -->
<!--     </div> -->
<!--     <h1 class="text-3xl font-bold mb-6"> -->
<!--       Create New Recipe -->
<!--     </h1> -->
<!---->
<!--     <!-- Recipe Info --> -->
<!--     <div class="flex flex-col gap-4"> -->
<!--       <UInput v-model="recipe.title" label="Recipe Title" placeholder="Enter recipe title" /> -->
<!--       <UTextarea v-model="recipe.description" label="Description" placeholder="Enter recipe description" /> -->
<!--       <USelect v-model="recipe.category_id" :options="categories" label="Category" /> -->
<!--       <UInput v-model="recipe.prep_time_minutes" type="number" label="Prep Time (minutes)" /> -->
<!--       <UInput v-model="recipe.featured_image_url" label="Featured Image URL" placeholder="Enter image URL" /> -->
<!--     </div> -->
<!---->
<!--     <!-- Recipe Steps --> -->
<!--     <div class="mt-6"> -->
<!--       <h2 class="text-xl font-semibold mb-2"> -->
<!--         Steps -->
<!--       </h2> -->
<!--       <ul class="list-decimal ml-5 space-y-1"> -->
<!--         <li v-for="(step, index) in recipe.steps" :key="index" class="flex justify-between items-center"> -->
<!--           {{ step.content }} -->
<!--           <UButton size="sm" color="danger" @click="removeStep(index)"> -->
<!--             Remove -->
<!--           </UButton> -->
<!--         </li> -->
<!--       </ul> -->
<!--       <UButton class="mt-3" @click="isStepModalOpen = true"> -->
<!--         Add Step -->
<!--       </UButton> -->
<!--     </div> -->
<!---->
<!--     <!-- Submit --> -->
<!--     <UButton class="mt-6" color="primary" @click="submitRecipe"> -->
<!--       Submit Recipe -->
<!--     </UButton> -->
<!---->
<!--     <!-- Step Modal --> -->
<!--     <UModal v-model:show="isStepModalOpen" title="Add Recipe Step"> -->
<!--       <UTextarea v-model="newStepContent" label="Step Description" placeholder="Describe this step..." /> -->
<!--       <div class="flex justify-end mt-4 gap-2"> -->
<!--         <UButton color="secondary" @click="isStepModalOpen = false"> -->
<!--           Cancel -->
<!--         </UButton> -->
<!--         <UButton color="primary" @click="addStep"> -->
<!--           Add Step -->
<!--         </UButton> -->
<!--       </div> -->
<!--     </UModal> -->
<!--   </UContainer> -->
<!-- </template> -->
<!---->
<!-- <style scoped> -->
<!-- img { -->
<!--   transition: transform 0.3s ease; -->
<!-- } -->
<!---->
<!-- img:hover { -->
<!--   transform: scale(1.05); -->
<!-- } -->
<!-- </style> -->
