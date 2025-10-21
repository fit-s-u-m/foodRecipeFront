<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";

import { useRouter } from "#app";
import * as z from "zod";

definePageMeta({
  layout: false, // disables the default layout
});

const toast = useToast();
const fields: AuthFormField[] = [{
  name: "email",
  type: "email",
  label: "Email",
  placeholder: "Enter your email",
  required: true,
}, {
  name: "password",
  label: "Password",
  type: "password",
  placeholder: "Enter your password",
  required: true,
}, {
  name: "remember",
  label: "Remember me",
  type: "checkbox",
}];

const providers = [{
  label: "Google",
  icon: "i-simple-icons-google",
  onClick: () => {
    toast.add({ title: "Google", description: "Signup with Google" });
  },
}, {
  label: "GitHub",
  icon: "i-simple-icons-github",
  onClick: () => {
    toast.add({ title: "GitHub", description: "Signup with GitHub" });
  },
}];

const schema = z.object({
  email: z.email("Invalid email"),
  password: z.string("Password is required").min(8, "Must be at least 8 characters"),
});

type Schema = z.output<typeof schema>;
const router = useRouter();

function onSubmit(payload: FormSubmitEvent<Schema>) {
  const email = payload.data.email;
  const password = payload.data.password;
  const encoded = btoa(`${email}:${password}`);
  localStorage.setItem("token", encoded);
  router.push("/");
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema" title="Create an account" description="Sign up to get started."
        icon="i-lucide-user-plus" :fields="fields" :providers="providers" :submit="{ label: 'Sign up' }"
        @submit="onSubmit"
      >
        <template #description>
          Already have an account? <ULink to="/login" class="text-primary font-medium">
            Sign in
          </ULink>.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
