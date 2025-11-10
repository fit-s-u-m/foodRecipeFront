<script setup lang="ts">
import { refDebounced } from "@vueuse/core";

import { buildWhere } from "./lib/util";

interface Props {
  modelValue: { label: string; value: string }[];
  items: { label: string; value: string }[];
  fetchFn: (variables?: any) => Promise<any>;
  createFn?: (variables?: any) => Promise<any>;
  searchItem: string;
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 3,
});

const emit = defineEmits(["update:modelValue"]);
const localValue = ref(props.modelValue);
watch(localValue, v => emit("update:modelValue", v));

const searchTerm = ref("");
const searchTermDebounced = refDebounced(searchTerm, 250);
const loading = ref(false);

// Search logic
watch(searchTermDebounced, async (term) => {
  loading.value = true;
  const where = buildWhere({ searchTerm: term, searchItem: props.searchItem });
  await props.fetchFn({ limit: props.limit, where });
  loading.value = false;
});

// Create item (if enabled)
async function onCreate(label: string) {
  if (!props.createFn)
    return;
  await props.createFn({ name: label });
  const where = buildWhere({ searchItem: props.searchItem });
  await props.fetchFn({ limit: props.limit, where });
}
</script>

<template>
  <USelectMenu v-model="localValue" v-model:search-term="searchTerm" multiple :items="props.items" :loading="loading"
    :create-item="!!props.createFn" ignore-filter placeholder="Search..." class="flex-1" @create="onCreate" />
</template>
