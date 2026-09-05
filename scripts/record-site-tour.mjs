import path from "node:path";
import { fileURLToPath } from "node:url";
import { runVideoTour } from "../../.cursor/scripts/demo-media/lib/video.mjs";
import config from "./demo-media.config.mjs";

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

await runVideoTour({ ...config, projectRoot });
