const isRefreshing = ref(false);
const accessToken = ref();
let pendingRequests: any[] = [];

export function useAuthQuery<T>(query: any, variables: any) {
  accessToken.value = localStorage.getItem("accessToken") || "";
  const { result, loading, error, refetch, onError, onResult } = useQuery(
    query,
    variables,
    {
      context: {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
        fetchOptions: {
          credentials: "include",
        },
      },
    },
  );
  onResult((res) => {
    // eslint-disable-next-line no-console
    console.log("✅ Query result:", res.data);
  });

  onError(async (err) => {
    const status = err?.graphQLErrors?.[0]?.extensions?.code;
    // eslint-disable-next-line no-console
    console.log("Query error status:", status);

    if (status === "invalid-jwt") {
      if (isRefreshing.value) {
        // If already refreshing, add to pending requests
        pendingRequests.push(() => refetch(variables));
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
        // eslint-disable-next-line no-console
        console.log("Refresh response:", response.accessToken);

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
  });

  return {
    loading,
    result: result as Ref<T | null>,
    error,
    refetch,
  };
}
