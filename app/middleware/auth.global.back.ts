export default defineNuxtRouteMiddleware(async (to) => {
  return;
  // Only run on client
  if (!import.meta.client)
    return;

  const accessToken = localStorage.getItem("accessToken");

  // Skip auth for login page
  if (to.path === "/login" || to.path === "/sign-up")
    return;
  if (((accessToken === "null") || !accessToken)) {
    return navigateTo("/login");
  }
  if (accessToken === "null" || !accessToken) {
    const query = gql`
          mutation MyMutation {
            Refresh {
              accessToken
            }
          }
        `;

    const { mutate, onDone, onError } = useMutation(query);
    mutate();
    onDone((payload) => {
      const data = payload.data.Refresh;
      localStorage.setItem("accessToken", data.accessToken);
    });
    onError((error) => {
      console.error(error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    });
  }
});
