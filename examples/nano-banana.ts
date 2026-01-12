import { createKieClient } from "../src/kie-client";

const client = createKieClient();

// Simple Nano Banana - text-to-image only
async function testNanoBanana() {
  console.log("Testing google/nano-banana (simple text-to-image)...");

  const result = await client.generate("google/nano-banana", {
    prompt: "A cute cartoon banana wearing sunglasses, digital art style",
  });

  console.log("Nano Banana result:", result.resultUrls);
  return result;
}

// Nano Banana Pro - text-to-image (no input images)
async function testNanaBananaPro() {
  console.log("Testing nano-banana-pro (text-to-image mode)...");

  const result = await client.generate("nano-banana-pro", {
    prompt: "A majestic banana throne in a royal palace, cinematic lighting, 8k detailed",
    resolution: "2K",
    aspect_ratio: "16:9",
  });

  console.log("Nano Banana Pro result:", result.resultUrls);
  return result;
}

// Nano Banana Pro - image-to-image mode
async function testNanaBananaProI2I(imageUrl: string) {
  console.log("Testing nano-banana-pro (image-to-image mode)...");

  const result = await client.generate("nano-banana-pro", {
    prompt: "Transform into a watercolor painting style",
    image_input: [imageUrl],
    resolution: "2K",
  });

  console.log("Nano Banana Pro I2I result:", result.resultUrls);
  return result;
}

// Run tests
const run = async () => {
  const simple = await testNanoBanana();
  const pro = await testNanaBananaPro();

  // Use output from simple as input for I2I
  if (simple.resultUrls[0]) {
    await testNanaBananaProI2I(simple.resultUrls[0]);
  }
};

run().catch(console.error);
