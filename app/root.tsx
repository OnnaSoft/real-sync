import React from "react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  useRouteError,
} from "@remix-run/react";
import stylesheet from "./tailwind.css?url";
import { LinksFunction } from "@remix-run/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import store from "./store";
import { StripeProvider } from "./components/stripe";
import { Toaster } from "./components/ui/toaster";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

const queryClient = new QueryClient();

function AppContent() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

export default function App() {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Links />
      </head>
      <body>
        {isClient && (
          <Provider store={store}>
            <StripeProvider>
              <Toaster />
              <AppContent />
            </StripeProvider>
          </Provider>
        )}
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  const error = useRouteError();

  if (!isClient) {
    return (
      <html lang="en">
        <head>
          <title>Loading...</title>
          <Meta />
          <Links />
        </head>
        <body>
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">
              Loading...
            </h1>
          </div>
          <Scripts />
        </body>
      </html>
    );
  }

  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en">
        <head>
          <title>
            {error.status} {error.statusText}
          </title>
          <Meta />
          <Links />
        </head>
        <body>
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">
              {error.status}
            </h1>
            <p className="text-2xl text-gray-600 mb-8">{error.statusText}</p>
            <Link
              to="/"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Go back home
            </Link>
          </div>
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>Oops! An error occurred</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Oops! An error occurred
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            We're sorry, something went wrong.
          </p>
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Go back home
          </Link>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
