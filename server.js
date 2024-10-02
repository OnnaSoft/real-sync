import { createRequestHandler } from "@remix-run/express";
import express from "express";
import "./init.js";
import "./db.js";
import api from "./routes/index.js";

// Validate environment variables
const requiredEnvVars = ["PORT"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? null
    : // @ts-ignore
      await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const app = express();

app.use(
  viteDevServer ? viteDevServer.middlewares : express.static("build/client")
);

const build = viteDevServer
  ? async () => await viteDevServer.ssrLoadModule("virtual:remix/server-build")
  : // @ts-ignore
    await import("./build/server/index.js");

app.use("/", api);

// @ts-ignore
app.all("*", createRequestHandler({ build }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}`);
});
