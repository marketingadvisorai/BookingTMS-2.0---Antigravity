import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/cache";
import { router } from "./router";
import "./index.css";

/**
 * Application Entry Point
 * 
 * Uses configured QueryClient with:
 * - 5 minute stale time (reduces API calls)
 * - 30 minute garbage collection
 * - Disabled refetch on window focus
 * - Offline-first network mode
 * 
 * @see /src/lib/cache/queryConfig.ts
 * @see /docs/EDGE_CACHING_ARCHITECTURE.md
 */
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);

