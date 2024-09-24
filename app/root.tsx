import React from "react";
import { Links, Meta, Outlet, Scripts } from "@remix-run/react";
// @ts-ignore
import stylesheet from "./tailwind.css?url";
import { LinksFunction } from "@remix-run/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

const queryClient = new QueryClient();

export default function App() {
  return (
    <html>
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>

        <Scripts />
      </body>
    </html>
  );
}
