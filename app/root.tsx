import React from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
} from "@remix-run/react";
import stylesheet from "./tailwind.css?url";
import { LinksFunction } from "@remix-run/node";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export default function App() {
  return (
    <html>
      <head>
        <link
          rel="icon"
          href="data:image/x-icon;base64,AA"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />

        <Scripts />
      </body>
    </html>
  );
}
