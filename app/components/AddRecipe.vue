<script setup lang="ts">
import * as z from "zod";

import type { NameId } from "~/types/types";

import { ADD_CATEGORY, ADD_INGREDIENT, GET_CATEGORIES, GET_INGREDIENTS, INSERT_RECIPE } from "~/graphql/queries";

import { uploadToCloudinary } from "./lib/util";

interface ImagePreview {
  file: File;
  preview: string;
}

const images = ref<ImagePreview[]>([]);

const newStep = ref("");
const steps = ref<string[]>([]);
const addStepModal = ref(false);

const state = reactive({
  time: 0,
  ingredients: [] as string[],
  categories: [] as string[],
  title: "" as string,
  description: "" as string,

});
const addRecipeModal = ref(false);
const schema = z.object({
  time: z.number().min(1, "Time is required").max(300, "Too long"),
  ingredients: z.array(z.string()).min(1, "At least one ingredient is required"),
  categories: z.array(z.string("must be string")),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});
const ingredientOptions = ref<NameId[]>([]);
const ingredientsLoading = ref(true);
const categoryOptions = ref<NameId[]>([]);
const categoriesLoading = ref(true);
let refetchCategory;
let refetchIngredient;
onMounted(() => {
  const { result: ingredientsRes, loading: ingredientsLoadingRes, refetch: refetchIng } = useQuery(GET_INGREDIENTS);
  const { result: categoriesRes, loading: categoriesLoadingRes, refetch: refetchCat } = useQuery(GET_CATEGORIES);
  refetchCategory = refetchCat;
  refetchIngredient = refetchIng;
  watchEffect(() => {
    if (!ingredientsLoadingRes.value && ingredientsRes.value) {
      ingredientOptions.value = ingredientsRes.value.ingredients;
      ingredientsLoading.value = false;
    }
    if (!categoriesLoadingRes.value && categoriesRes.value) {
      categoryOptions.value = categoriesRes.value.categories;
      categoriesLoading.value = false;
    }
  });
});

function handleImagesSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files)
    return;

  for (const file of Array.from(files)) {
    const preview = URL.createObjectURL(file);
    images.value.push({ file, preview });
  }
}
const submitingData = ref(false);
function getId(items: NameId[], list: string[]): string[] {
  return items.filter(i => list.includes(i.name)).map(i => i.id);
}

async function onSubmit(event: any) {
  submitingData.value = true;
  const urls = await uploadToCloudinary(images.value.map(img => img.file));
  const { mutate } = useMutation(INSERT_RECIPE);
  const userId = localStorage.getItem("userId") || "";
  const ingredientsId = getId(ingredientOptions.value, state.ingredients);
  const categoriesId = getId(categoryOptions.value, state.categories);

  const recipeImages = urls.map(url => ({ url }));
  const recipeIngredients = ingredientsId.map(id => ({ ingredient_id: id }));
  const recipeCategories = categoriesId.map(id => ({ category_id: id }));
  const recipeSteps = steps.value.map((stepText, index) => ({ content: stepText, step_index: index }));
  mutate({
    user_id: userId,
    title: state.title,
    description: state.description,
    prep_time_minutes: state.time,
    images: recipeImages,
    ingredients: recipeIngredients,
    categories: recipeCategories,
    steps: recipeSteps,
  });

  // eslint-disable-next-line no-console
  console.log("Form data ✅", event, event.data, images.value, steps);
  submitingData.value = false;
  addRecipeModal.value = false;
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
const newIngredient = ref<string | null>(null);
const addIngredientModal = ref(false);
const { mutate: addIngredientMutate } = useMutation(ADD_INGREDIENT);
async function addIngredient() {
  await addIngredientMutate({ name: newIngredient.value });
  refetchIngredient();
  newIngredient.value = null;
  addIngredientModal.value = false;
}
const newCategory = ref<string | null>(null);
const addCategoryModal = ref(false);
const { mutate: addCategoryMutate } = useMutation(ADD_CATEGORY);
async function addCategory() {
  await addCategoryMutate({ name: newCategory.value });
  refetchCategory();
  newCategory.value = null;
  addCategoryModal.value = false;
}
</script>

<!-- add recipe -->
<template>
  <UModal v-model:open="addRecipeModal" title="Add Recipes" description="Add ur recipies"
    :ui="{ footer: 'justify-end' }" dismissiable="false">
    <UButton color="primary" label="+ Add Recipe" />
    <template #header>
      <div v-if="ingredientsLoading" class="flex items-center space-x-2 text-gray-500">
        <Icon name="i-lucide-loader" class="w-5 h-5 animate-spin text-blue-500" />
        <span>Loading ingredients...</span>
      </div>

      <div v-if="categoriesLoading" class="flex items-center space-x-2 text-gray-500">
        <Icon name="i-lucide-loader" class="w-5 h-5 animate-spin text-green-500" />
        <span>Loading categories...</span>
      </div>

      <div v-if="submitingData" class="flex items-center space-x-2 text-gray-500">
        <Icon name="i-lucide-loader" class="w-5 h-5 animate-spin text-yellow-500" />
        <span>Submitting data...</span>
      </div>
    </template>
    <template #body>
      <UForm v-if="!ingredientsLoading && !categoriesLoading" :schema="schema" :state="state" class="space-y-4"
        @submit="onSubmit">
        <UFormField label="Title" name="title">
          <UInput v-model="state.title" />
        </UFormField>
        <UFormField label="Description" name="description">
          <UInput v-model="state.description" />
        </UFormField>

        <UFormField :label="state.time === 0 ? 'Time it talkes in minite' : `${state.time} min`" name="time">
          <USlider v-model="state.time" tooltip size="xs" class="my-5" />
        </UFormField>

        <!-- ingredient -->
        <UFormField label="Ingredients" name="ingredients">
          <div class="flex gap-3">
            <UInputMenu v-model="state.ingredients" icon="i-lucide-list" multiple
              :items="ingredientOptions.map(i => i.name)" placeholder="ingredients" />
            <UButton size="xs" color="neutral" variant="outline" class="cursor-pointer" description="add ingredients"
              @click="addIngredientModal = true">
              +
            </UButton>
          </div>
        </UFormField>

        <UModal v-model:open="addIngredientModal" title="Add ingredient" :ui="{ footer: 'justify-end' }">
          <template #body>
            <UTextarea v-model="newIngredient" placeholder="ingredient to add" :rows="1" class="w-full" highlight
              aria-autocomplete="both" />
          </template>
          <template #footer>
            <UButton color="primary" label="Add" @click="addIngredient" />
          </template>
        </UModal>

        <!-- category  -->
        <UFormField label="Categories" name="categories">
          <div class="flex gap-3">
            <UInputMenu v-model="state.categories" icon="i-lucide-layout-list" multiple
              :items="categoryOptions.map(i => i.name)" value-attribute="id" label-attribute="name"
              placeholder="category" />
            <UButton size="xs" color="neutral" variant="outline" class="cursor-pointer" description="add category"
              @click="addCategoryModal = true">
              +
            </UButton>
          </div>
        </UFormField>

        <UModal v-model:open="addCategoryModal" title="Add Categories" :ui="{ footer: 'justify-end' }">
          <template #body>
            <UTextarea v-model="newCategory" placeholder="Category to add" :rows="1" class="w-full" highlight
              aria-autocomplete="both" />
          </template>
          <template #footer>
            <UButton color="primary" label="Add" @click="addCategory" />
          </template>
        </UModal>

        <UFormField label="Images" name="images">
          <UInput type="file" multiple accept="image/*" @change="handleImagesSelect" />
        </UFormField>
        <div class="flex flex-col gap-3 mt-3">
          <!-- Image Preview -->
          <div v-if="images.length" class="grid grid-cols-3 gap-2">
            <div v-for="(img, i) in images" :key="i" class="relative group">
              <img :src="img.preview" alt="Preview" class="w-full h-32 object-cover rounded-xl border border-gray-200">
              <button
                class="absolute top-1 right-1 bg-red-500 text-white  w-6 h-6 rounded-sm  opacity-0 group-hover:opacity-100 transition"
                @click.prevent="removeImage(i)">
                ✕
              </button>
            </div>
          </div>
          <div>
            <div class="flex justify-between items-center">
              <label class="font-semibold">Steps</label>
              <UButton size="xs" color="neutral" variant="outline" class="cursor-pointer" description="stn"
                @click="addStepModal = true">
                + Add Step
              </UButton>
            </div>
            <ul v-if="steps.length" class="mt-2 space-y-2">
              <li v-for="(step, i) in steps" :key="i"
                class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex justify-between items-start">
                <span>{{ i + 1 }}. </span>
                <pre>{{ step }} </pre>
                <UButton size="xs" color="primary" class="cursor-pointer" variant="ghost" icon="i-heroicons-trash"
                  @click="removeStep(i)" />
              </li>
            </ul>
          </div>

          <div class="flex justify-between">
            <UModal v-model:open="addStepModal" title="Add Step" :ui="{ footer: 'justify-end' }">
              <template #body>
                <UTextarea v-model="newStep" placeholder="Describe the step..." :rows="4" class="w-full" highlight
                  aria-autocomplete="both" />
              </template>
              <template #footer>
                <UButton color="primary" label="Add Step" @click="addStep" />
              </template>
            </UModal>
          </div>
        </div>
        <UButton type="submit" color="primary" class="cursor-pointer" :disabled="submitingData">
          Submit
        </UButton>
      </UForm>
    </template>
  </UModal>
</template>
