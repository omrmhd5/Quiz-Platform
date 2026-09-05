import path from "node:path";
import { fileURLToPath } from "node:url";
import { runScreenshots } from "../../.cursor/scripts/demo-media/lib/capture.mjs";
import config from "./demo-media.config.mjs";

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

await runScreenshots({ ...config, projectRoot });
