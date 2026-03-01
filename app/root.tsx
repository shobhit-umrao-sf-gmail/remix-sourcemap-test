import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import toast, { Toaster } from "react-hot-toast"
import { useState } from "react"

// Extend Window interface for New Relic
declare global {
  interface Window {
    newrelic?: {
      noticeError: (error: Error, customAttributes?: Record<string, unknown>) => void
      setCustomAttribute: (name: string, value: string | number | boolean) => void
      addPageAction: (name: string, attributes?: Record<string, unknown>) => void
    }
  }
}

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: false,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            onError: (error: unknown) => {
              console.log({ error, place: "query-client-on-error" })
              const errorMessage = (error as Error)?.message || "An unknown error occurred"

              // Manually send to New Relic (like production)
              if (typeof window !== "undefined" && window.newrelic) {
                window.newrelic.noticeError(error as Error)
              }

              toast.error(errorMessage)
            },
          },
          mutations: {
            retry: false,
            onError: (error: unknown) => {
              console.log({ error, place: "mutation-client-on-error" })
              const errorMessage = (error as Error)?.message || "An unknown error occurred"

              // Manually send to New Relic (like production)
              if (typeof window !== "undefined" && window.newrelic) {
                window.newrelic.noticeError(error as Error)
              }

              toast.error(errorMessage)
            },
          },
        },
      })
  )

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {process.env.NODE_ENV === "production" && <script type="text/javascript" src="/js/newrelic.js" />}
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Outlet />
          <Toaster position="top-right" />
          <ScrollRestoration />
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  )
}
