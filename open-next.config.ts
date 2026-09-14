import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// This site has no revalidation — every page is prerendered at build time from
// local JSON data. Serve prerendered pages straight from Workers static assets
// instead of requiring an R2/KV binding for the incremental cache.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
