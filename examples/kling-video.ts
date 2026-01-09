import { KieClient, estimateCost, type CreateTaskInput } from "../src/kie-client";

const client = new KieClient({
  apiKey: process.env.KIE_AI_API_KEY!,
});

// Example 1: Kling 2.6 Text-to-Video
async function textToVideo() {
  const input: CreateTaskInput = {
    model: "kling-2.6/text-to-video",
    input: {
      prompt: "A cat playing piano in a jazz club, cinematic lighting",
      sound: false,
      aspect_ratio: "16:9",
      duration: "5",
    },
  };

  console.log(`Estimated cost: $${estimateCost(input)}`);

  const taskId = await client.createTask(input);
  console.log(`Task created: ${taskId}`);

  const result = await client.waitForTask(taskId, {
    onProgress: (state) => console.log(`Status: ${state}`),
  });

  console.log("Video URLs:", result.resultUrls);
}

// Example 2: Kling 2.6 Image-to-Video
async function imageToVideo() {
  const input: CreateTaskInput = {
    model: "kling-2.6/image-to-video",
    input: {
      prompt: "The person starts dancing gracefully",
      image_urls: ["https://example.com/your-image.jpg"],
      sound: true,
      duration: "10",
    },
  };

  console.log(`Estimated cost: $${estimateCost(input)}`);
  const result = await client.generateVideo(input);
  console.log("Video URLs:", result.resultUrls);
}

// Example 3: Kling 2.5 Turbo (40% cheaper!)
async function turboVideo() {
  const input: CreateTaskInput = {
    model: "kling/v2-5-turbo-text-to-video-pro",
    input: {
      prompt: "Ocean waves crashing on a beach at sunset",
      aspect_ratio: "16:9",
      duration: "5",
    },
  };

  console.log(`Estimated cost: $${estimateCost(input)}`); // $0.21
  const result = await client.generateVideo(input);
  console.log("Video URLs:", result.resultUrls);
}

// Run examples
const example = process.argv[2] || "text";

switch (example) {
  case "text":
    textToVideo();
    break;
  case "image":
    imageToVideo();
    break;
  case "turbo":
    turboVideo();
    break;
  default:
    console.log("Usage: tsx examples/kling-video.ts [text|image|turbo]");
}
