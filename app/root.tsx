import React from "react";
import { Links, Meta, Outlet, Scripts } from "@remix-run/react";
// @ts-ignore
import stylesheet from "./tailwind.css?url";
import { LinksFunction } from "@remix-run/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import store from "./store";

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
    <html>
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body>
        {isClient && (
          <Provider store={store}>
            <AppContent />
          </Provider>
        )}
        <Scripts />
      </body>
    </html>
  );
}
