#!/usr/bin/env bun
import { parse } from "yaml";

const MODELS_DIR = "./models";
const OUTPUT_DIRS = [
  "../../todoforai/frontend/src/assets",
  "../../todoforai/agent/src/assets",
];

const categories = ["video", "image", "audio"] as const;

// Fields to exclude from export (internal only)
const INTERNAL_FIELDS = ["kie_pricing"];

function stripInternal(data: Record<string, unknown>) {
  const result = { ...data };
  for (const field of INTERNAL_FIELDS) {
    delete result[field];
  }
  return result;
}

async function build() {
  for (const category of categories) {
    const yamlPath = `${MODELS_DIR}/${category}.yaml`;

    const file = Bun.file(yamlPath);
    if (!(await file.exists())) {
      console.log(`⏭️  Skipping ${category} (no yaml)`);
      continue;
    }

    const yaml = await file.text();
    const models = parse(yaml);

    // Transform to array format with id, strip internal fields
    const output = {
      category,
      updated: new Date().toISOString(),
      models: Object.entries(models).map(([id, data]) => ({
        id,
        ...stripInternal(data as Record<string, unknown>),
      })),
    };

    const json = JSON.stringify(output, null, 2);

    for (const dir of OUTPUT_DIRS) {
      const jsonPath = `${dir}/${category}_models.json`;
      await Bun.write(jsonPath, json);
      console.log(`✅ ${category}: ${output.models.length} models → ${jsonPath}`);
    }
  }
}

build().catch(console.error);
