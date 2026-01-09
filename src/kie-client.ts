import { z } from "zod";
import { parse } from "yaml";

// ============ Load YAML Models ============

const loadYaml = async (name: string) => {
  const file = Bun.file(`${import.meta.dir}/../models/${name}.yaml`);
  return parse(await file.text()) as Record<string, ModelDef>;
};

type ModelDef = {
  name: string;
  provider: string;
  type: string;
  pricing: Record<string, number | Record<string, number>>;
  input: Record<string, FieldDef>;
};

type FieldDef = {
  type: "string" | "number" | "boolean" | "enum" | "array" | "url";
  values?: string[];
  items?: string;
  max?: number;
  min?: number;
  default?: unknown;
  required?: boolean;
};

// ============ YAML → Zod ============

const fieldToZod = (field: FieldDef): z.ZodTypeAny => {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "string":
      schema = field.max ? z.string().max(field.max) : z.string();
      break;
    case "number":
      schema = z.number();
      if (field.min !== undefined) schema = (schema as z.ZodNumber).min(field.min);
      if (field.max !== undefined) schema = (schema as z.ZodNumber).max(field.max);
      break;
    case "boolean":
      schema = z.boolean();
      break;
    case "enum":
      schema = z.enum(field.values as [string, ...string[]]);
      break;
    case "array":
      schema = field.items === "url"
        ? z.array(z.string().url()).max(field.max ?? 10)
        : z.array(z.string()).max(field.max ?? 10);
      break;
    case "url":
      schema = z.string().url();
      break;
    default:
      schema = z.unknown();
  }

  if (field.default !== undefined) schema = schema.default(field.default);
  if (!field.required) schema = schema.optional();

  return schema;
};

const modelToZod = (def: ModelDef) =>
  z.object(Object.fromEntries(
    Object.entries(def.input).map(([k, v]) => [k, fieldToZod(v)])
  ));

// ============ Models Registry ============

export const MODELS = {
  video: await loadYaml("video"),
  image: await loadYaml("image"),
  audio: await loadYaml("audio"),
};

export const ALL_MODELS = { ...MODELS.video, ...MODELS.image, ...MODELS.audio };

export type ModelId = keyof typeof ALL_MODELS;

const schemaCache = new Map<string, z.ZodObject<any>>();

export const getSchema = (modelId: ModelId) => {
  if (!schemaCache.has(modelId)) {
    schemaCache.set(modelId, modelToZod(ALL_MODELS[modelId]));
  }
  return schemaCache.get(modelId)!;
};

// ============ Response Schemas ============

const TaskState = z.enum(["waiting", "queuing", "generating", "success", "fail"]);
const TaskResult = z.object({ resultUrls: z.array(z.string().url()) });

export type TaskState = z.infer<typeof TaskState>;
export type TaskResult = z.infer<typeof TaskResult>;

// ============ Client ============

export class KieClient {
  constructor(
    private apiKey: string,
    private baseUrl = "https://api.kie.ai"
  ) {}

  private async fetch<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (json.code !== 200) throw new Error(`KIE ${json.code}: ${json.msg}`);
    return json;
  }

  async createTask(modelId: ModelId, input: Record<string, unknown>, callBackUrl?: string) {
    const schema = getSchema(modelId);
    const validated = schema.parse(input);
    const res = await this.fetch<{ data: { taskId: string } }>("POST", "/api/v1/jobs/createTask", {
      model: modelId,
      input: validated,
      ...(callBackUrl && { callBackUrl }),
    });
    return res.data.taskId;
  }

  async getStatus(taskId: string) {
    const res = await this.fetch<{ data: { state: TaskState; resultJson: string; failMsg: string; failCode: string } }>(
      "GET",
      `/api/v1/jobs/recordInfo?taskId=${taskId}`
    );
    return res.data;
  }

  async waitFor(taskId: string, onProgress?: (state: TaskState) => void): Promise<TaskResult> {
    let interval = 2000;
    const maxWait = 600_000;
    const start = Date.now();

    while (Date.now() - start < maxWait) {
      const { state, resultJson, failMsg, failCode } = await this.getStatus(taskId);
      onProgress?.(state);

      if (state === "success") return TaskResult.parse(JSON.parse(resultJson));
      if (state === "fail") throw new Error(`Task failed: ${failMsg} (${failCode})`);

      await Bun.sleep(interval);
      interval = Math.min(interval * 1.5, 15000);
    }
    throw new Error("Task timeout");
  }

  async generate(modelId: ModelId, input: Record<string, unknown>) {
    const taskId = await this.createTask(modelId, input);
    return this.waitFor(taskId);
  }
}

// ============ Factory ============

export const createKieClient = (apiKey = process.env.KIE_AI_API_KEY!) => new KieClient(apiKey);

// ============ Helpers ============

export const getModel = (id: ModelId) => ALL_MODELS[id];
export const listModels = (category?: "video" | "image" | "audio") =>
  category ? Object.entries(MODELS[category]) : Object.entries(ALL_MODELS);
