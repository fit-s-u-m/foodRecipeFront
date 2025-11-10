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
  name: "username",
  type: "text",
  label: "User name",
  placeholder: "Enter your username",
  required: true,
}, {
  name: "password",
  label: "Password",
  type: "password",
  placeholder: "Enter your password",
  required: true,
}];

const schema = z.object({
  username: z.string("username is required").min(3, "Must be at least 3 characters"),
  password: z.string("Password is required").min(8, "Must be at least 8 characters"),
});

type Schema = z.output<typeof schema>;
const router = useRouter();

function onSubmit(payload: FormSubmitEvent<Schema>) {
  const username = payload.data.username;
  const password = payload.data.password;
  const query = gql`
    mutation Login($username: String!, $password: String!) {
      Login(credential: { username: $username, password: $password }) {
        userId
        accessToken
        role
      }
    }
  `;

  const variables = { username, password };

  const { mutate, onDone, onError } = useMutation(query, {
    context: {
      fetchOptions: {
        credentials: "include",
      },
    },
  });
  mutate(variables);
  onDone((payload) => {
    console.log({ payload });
    const accessToken = payload.data.Login.accessToken;
    const userId = payload.data.Login.userId;
    const role = payload.data.Login.role;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("userId", userId);
    localStorage.setItem("userRole", role);
    toast.add({ title: "Login Successful", description: "You have been logged in successfully.", color: "success" });
    navigateTo(("/"));
  });
  onError((err) => {
    toast.add({ title: "Login Failed", description: "Invalid email or password.", color: "error" });
    console.error("Apollo-Error", err);
  });
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm :schema="schema" title="Login" description="Enter your credentials to access your account."
        icon="i-lucide-user" :fields="fields" @submit="onSubmit">
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
