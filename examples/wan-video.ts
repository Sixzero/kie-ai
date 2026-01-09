import { createKieClient } from "../src/kie-client";

const client = createKieClient();

// Wan 2.2 text-to-video ($0.20 at 480p)
console.log("Starting Wan 2.2 generation...");

const result = await client.generate("wan/2-2-a14b-text-to-video-turbo", {
  prompt: "A serene mountain landscape with clouds passing by, cinematic",
  resolution: "480p",
  aspect_ratio: "16:9",
});

console.log("Video:", result.resultUrls[0]);
