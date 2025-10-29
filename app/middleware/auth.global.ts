export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on client
  if (!import.meta.client)
    return;

  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  // Skip auth for login page
  if (to.path === "/login" || to.path === "/sign-up")
    return;
  if (((accessToken === "null" && refreshToken === "null") || (!accessToken && !refreshToken))
    || (!refreshToken || refreshToken === "null")) {
    return navigateTo("/login");
  }
  if (accessToken === "null" || !accessToken) {
    const query = gql`
          mutation MyMutation($refreshToken: String!) {
            Refresh(refreshToken:$refreshToken) {
              accessToken
              refreshToken
            }
          }
        `;
    const variables = { refreshToken };

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
    mutate({ refreshToken });
    onDone((payload) => {
      const data = payload.data.Refresh;
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
    });
    onError((error) => {
      console.error(error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    });
  }
});
