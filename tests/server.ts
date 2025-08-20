#!/usr/bin/env -S deno run --allow-net --allow-read

import { serveDir } from "jsr:@std/http/file-server";

const PORT = 8000;

console.log(`Starting Deno HTTP server on http://localhost:${PORT}`);
console.log(`Serving files from: ${Deno.cwd()}`);

Deno.serve({
  port: PORT,
  handler: (req: Request) => {
    // Add CORS headers for cross-origin requests
    const response = serveDir(req, {
      fsRoot: Deno.cwd(),
      urlRoot: "",
      showDirListing: true,
      enableCors: true,
    });

    return response;
  },
});