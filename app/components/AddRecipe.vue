<script setup lang="ts">
import * as z from "zod";

import { CREATE_RECIPE } from "~/graphql/queries";

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
  images: [] as File[],
  ingredients: [] as string[],

});
const addRecipeModal = ref(false);
const schema = z.object({
  time: z.number().min(1, "Time is required").max(300, "Too long"),
  image: z.url("Must be a valid URL"),
  ingredients: z.array(z.string()).min(1, "At least one ingredient is required"),
});
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

function handleImagesUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files)
    return;

  for (const file of Array.from(files)) {
    const preview = URL.createObjectURL(file);
    images.value.push({ file, preview });
  }
}

function onSubmit(event: Event) {
  event.preventDefault();
  console.log("Recipe submitted! Check console for image data.");
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
  <!-- add recipe -->
  <UModal v-model:open="addRecipeModal" title="Add Recipes" :ui="{ footer: 'justify-end' }">
    <UButton color="primary" label="+ Add Recipe" />
    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField :label="state.time === 0 ? 'Time it talkes in minite' : `${state.time} min`" name="time">
          <!-- <UInput v-model="state.time" type="number" /> -->
          <USlider v-model="state.time" tooltip size="xs" class="my-5" />
        </UFormField>

        <UInputMenu v-model="state.ingredients" icon="i-heroicons-queue-list" multiple :items="ingredientOptions"
          placeholder="ingredients" />
        <UFormField label="Images" name="images">
          <UInput type="file" multiple accept="image/*" @change="handleImagesUpload" />
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
              <UButton size="xs" color="neutral" variant="outline" class="cursor-pointer" @click="addStepModal = true">
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
            <UButton type="submit" color="primary" @click="addRecipeModal = false">
              Submit
            </UButton>
          </div>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
