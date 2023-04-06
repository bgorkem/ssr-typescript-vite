import express from "express";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

import { fileURLToPath } from "url";
import renderApp from "./dist/server/ServerApp.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const html = fs
  .readFileSync(path.resolve(__dirname, "./dist/client/index.html"))
  .toString();

const parts = html.split("<!--ssr-outlet-->");

const app = express();

app.use(
  "/assets",
  express.static(path.resolve(__dirname, "./dist/client/assets"))
);

app.use((req, res) => {
  // write part 1 before the app is rendered
  res.write(parts[0]);
  const stream = renderApp(req.url, {
    onShellReady() {
      stream.pipe(res);
    },
    onShellError() {},
    onAllReady() {
      // write part 2 after the app is rendered
      res.write(parts[1]);
      res.end();
    },
    onError(err) {
      console.error(err);
    },
  });
});

app.listen(PORT, () => {
  console.log(
    `Server listening on port ${PORT} NodeEnv: ${process.env.NODE_ENV}`
  );
});
