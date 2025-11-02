// plugins/apollo.ts

import { ApolloLink } from "@apollo/client/core";
import { CachePersistor, LocalStorageWrapper } from "apollo3-cache-persist";

// ⚠️ IMPORTANT: Cache persistence only works on the client side.
// We must check if we are in the browser environment.

export default defineNuxtPlugin((nuxtApp) => {
  // Check if we are in the browser (client-side) environment
  if (process.client) {
    nuxtApp.hook("apollo:client:init", ({ client, ssr, defaultClient }) => {
      // client: The ApolloClient instance being initialized (your 'default' client)
      // defaultClient: boolean (true for 'default' client)

      if (!client) return;

      // 1. Get the InMemoryCache instance from the client
      const cache = client.cache;

      // 2. Configure the persistor
      const persistor = new CachePersistor({
        cache,
        storage: new LocalStorageWrapper(window.localStorage), // Use localStorage
        // You can specify keys to persist (optional)
        // trigger: "write", // Trigger persistence on every cache write
        maxSize: false, // Don't limit the size (or set a limit in bytes)
      });

      // 3. Initialize the cache persistence
      // Use await to ensure the cache is restored before the app starts querying.
      // Apollo recommends this method for SSR environments.
      persistor.restore().then(() => {
        // You can add logic here if needed after restoration
        console.log("Apollo Cache Restored from localStorage.");
      });

      // Optional: Add logic to clear the cache when needed (e.g., on logout)
      // window.addEventListener('beforeunload', () => {
      //   persistor.persist();
      // });
    });
  }
});
