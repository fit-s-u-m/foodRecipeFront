<script setup lang="ts">
import { useRouter } from "#app";
import { ref } from "vue";

import LoginPage from "~/components/login.vue";

const isLoading = ref(true);
const token = ref<string | null>(null);
const router = useRouter();

</script>

<template>
  <div>
    <NuxtLayout>
      <UApp>
        <NuxtPage />
      </UApp>
    </NuxtLayout>
  </div>
</template>
