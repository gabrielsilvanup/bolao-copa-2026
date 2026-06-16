import { register } from "node:module";

register("./test-esm-loader.mjs", import.meta.url);
