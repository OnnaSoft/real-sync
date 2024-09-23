import { createRequestHandler } from "@remix-run/express";
import express from "express";
import dotenv from "dotenv";
import "./db.js";
import authRouter from "./routes/auth.js";

// Load environment variables from .env file
dotenv.config();

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
app.use(express.json());
app.use(
  viteDevServer ? viteDevServer.middlewares : express.static("build/client")
);

const build = viteDevServer
  ? async () => await viteDevServer.ssrLoadModule("virtual:remix/server-build")
  : // @ts-ignore
    await import("./build/server/index.js");

app.use("/auth", authRouter);
app.all("*", createRequestHandler({ build }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}`);
});
