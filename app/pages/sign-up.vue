<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";

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
  name: "username",
  type: "text",
  label: "User Name",
  placeholder: "Enter your username",
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
  username: z.string("Username is required").min(3, "Must be at least 3 characters"),
});

type Schema = z.output<typeof schema>;

function onSubmit(payload: FormSubmitEvent<Schema>) {
  const email = payload.data.email;
  const password = payload.data.password;
  const username = payload.data.username;
  const query = gql`
  mutation SignUp($email: String!, $password: String!, $username: String!) {
    createUser(credential: { email: $email, password: $password, username: $username }) {
      accessToken
      email
      id
      refreshToken
      username
    }
  }
`;
  const variables = {
    email,
    password,
    username,
  };

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

  mutate({ email, password, username });
  onDone((result) => {
    const data = result.data.createUser;
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    toast.add({ title: "Success", description: "Account created successfully" });

    navigateTo("/");
  });
  onError((error) => {
    console.error(error);
    toast.add({ title: "Error", description: error.message, type: "foreground" });
  });
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema" title="Create an account" description="Sign up to get started."
        icon="i-lucide-user-plus" :fields="fields" :submit="{ label: 'Sign up' }" @submit="onSubmit"
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
