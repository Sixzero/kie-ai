#!/usr/bin/env bun
import { parse } from "yaml";

const MODELS_DIR = "./models";
const OUTPUT_DIR = process.env.OUTPUT_DIR || "../../todoforai/frontend/src/assets";

const categories = ["video", "image", "audio"] as const;

async function build() {
  for (const category of categories) {
    const yamlPath = `${MODELS_DIR}/${category}.yaml`;
    const jsonPath = `${OUTPUT_DIR}/${category}_models.json`;

    const file = Bun.file(yamlPath);
    if (!(await file.exists())) {
      console.log(`⏭️  Skipping ${category} (no yaml)`);
      continue;
    }

    const yaml = await file.text();
    const models = parse(yaml);

    // Transform to array format with id
    const output = {
      category,
      updated: new Date().toISOString(),
      models: Object.entries(models).map(([id, data]) => ({
        id,
        ...(data as object),
      })),
    };

    await Bun.write(jsonPath, JSON.stringify(output, null, 2));
    console.log(`✅ ${category}: ${output.models.length} models → ${jsonPath}`);
  }
}

build().catch(console.error);
