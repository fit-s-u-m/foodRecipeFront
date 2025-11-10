const accessToken = ref();
let pendingRequests: any[] = [];
const isRefreshing = ref(false);
export function useAuthMutation(mutation: any) {
  if (typeof window !== "undefined") {
    accessToken.value = localStorage.getItem("accessToken") || "";
  }
  else {
    accessToken.value = "";
  }

  const { mutate, onDone, onError, loading, error } = useMutation(mutation, {
    context: {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
      fetchOptions: {
        credentials: "include",
      },
    },
  });

  const run = (variables?: any) => mutate(variables);

  onDone((res) => {
    // eslint-disable-next-line no-console
    console.log("✅ Mutation success:", res.data);
  });

  onError(async (err) => {
    const status = err?.graphQLErrors?.[0]?.extensions?.code;
    // eslint-disable-next-line no-console
    console.log("Mutation error status:", status);

    if (status === "invalid-jwt") {
      if (isRefreshing.value) {
        // If already refreshing, add to pending requests
        pendingRequests.push(() => run);
        return;
      }
      isRefreshing.value = true;
      console.warn("⚠️ Access token expired. Refreshing...");

      try {
        const rep = await fetch("http://localhost:8000/refresh", {
          method: "POST",
          credentials: "include",
        });
        const response = await rep.json();

        if (response.accessToken) {
          localStorage.setItem("accessToken", response.accessToken);
          accessToken.value = response.accessToken;

          // Retry all pending requests
          pendingRequests.forEach(callback => callback());
          pendingRequests = []; // Clear pending requests
        }
        else {
          throw new Error("Refresh token failed");
        }
      }
      catch (error) {
        console.error("Failed to refresh token:", error);
        accessToken.value = "";
        localStorage.removeItem("accessToken");
        navigateTo("/login");
      }
      finally {
        isRefreshing.value = false;
      }
    }
    if (typeof window !== "undefined") {
      accessToken.value = localStorage.getItem("accessToken") || "";
    }
    else {
      accessToken.value = "";
    }
    if (!accessToken.value || accessToken.value === "") {
      localStorage.removeItem("accessToken");
      navigateTo("/login");
    }
    // eslint-disable-next-line no-console
    console.log(err);
  });

  return {
    run,
    loading,
    error,
  };
}
