import { defineConfig } from "vite"
import { flatRoutes } from "remix-flat-routes"
import { vitePlugin as remix } from "@remix-run/dev"
import tsconfigPaths from "vite-tsconfig-paths"

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true
  }
}

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: false,
      },
      routes: async (defineRoutes) => {
        return flatRoutes("routes", defineRoutes)
      },
      ignoredRouteFiles: ["**/*"],
    }),
    tsconfigPaths(),
  ],
})
