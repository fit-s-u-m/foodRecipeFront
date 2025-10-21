<script setup lang="ts">
import { useRouter } from "#app";
import { onMounted, ref } from "vue";

import LoginPage from "~/components/login.vue";

const isLoading = ref(true);
const token = ref<string | null>(null);
const router = useRouter();

onMounted(() => {
  token.value = localStorage.getItem("token"); // check localStorage
  isLoading.value = false;
  if (!token.value) { //  TODO: authnticate
    router.push("/login");
  }
});
</script>

<template>
  <div>
    <div v-if="isLoading" class="flex justify-center items-center font-bold text-2xl">
      Loading...
    </div>
    <div v-else>
      <NuxtLayout>
        <UApp>
          <NuxtPage />
        </UApp>
      </NuxtLayout>
    </div>
  </div>
</template>
