<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";

import { useMutation } from "@vue/apollo-composable";
import { useRouter } from "#app";
import { gql } from "graphql-tag";
import * as z from "zod";

definePageMeta({
  layout: false, // disables the default layout
  auth: false,
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
    toast.add({ title: "Google", description: "Login with Google" });
  },
}, {
  label: "GitHub",
  icon: "i-simple-icons-github",
  onClick: () => {
    toast.add({ title: "GitHub", description: "Login with GitHub" });
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
  const query = gql`
    mutation Login($email: String!, $password: String!) {
      Login(credential: { email: $email, password: $password }) {
        userId
        accessToken
        refreshToken
      }
    }
  `;

  const variables = { email, password };

  const config = useRuntimeConfig();
  const adminSecret = config.public.hasuraAdminSecret;
  const { mutate, onDone, onError } = useMutation(query, {
    variables,
    context: {
      headers: {
        "x-hasura-admin-secret": adminSecret,
      },
    },
  });
  mutate({ email, password });
  onDone((payload) => {
    console.log(payload.data.Login);
    const accessToken = payload.data.Login.accessToken;
    const refreshToken = payload.data.Login.refreshToken;
    const userId = payload.data.Login.userId;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userId", userId);
    navigateTo(("/"));
  });
  onError((err) => {
    console.error(err);
  });
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema" title="Login" description="Enter your credentials to access your account."
        icon="i-lucide-user" :fields="fields" :providers="providers" @submit="onSubmit"
      >
        <!-- Footer slot: add custom buttons -->
        <template #footer>
          <div class="flex justify-between items-center mt-2 cursor:pointer">
            <button type="button" class="text-sm text-gray-500 hover:underline" @click="router.push('/sign-up')">
              Sign Up
            </button>

            <!-- The original continue/submit button will remain -->
          </div>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
