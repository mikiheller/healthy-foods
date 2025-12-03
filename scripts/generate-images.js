import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load food data
const foodsPath = path.join(__dirname, '..', 'data', 'foods.json');
const foods = JSON.parse(fs.readFileSync(foodsPath, 'utf-8'));

// Output directory for images
const outputDir = path.join(__dirname, '..', 'public', 'images', 'foods');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Track progress
const progressFile = path.join(__dirname, '..', 'data', 'image-progress.json');
let progress = {};
if (fs.existsSync(progressFile)) {
  progress = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
}

function saveProgress() {
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
}

async function generateImage(food) {
  const prompt = `A cute, colorful, kid-friendly cartoon illustration of ${food.name}. Simple, clean design on a white background. The style should be playful and appealing to young children, like a children's book illustration. No text or labels.`;

  try {
    console.log(`Generating image for: ${food.name}...`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data[0].url;
    
    // Download the image
    const imageResponse = await fetch(imageUrl);
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    
    const imagePath = path.join(outputDir, `${food.id}.png`);
    fs.writeFileSync(imagePath, buffer);
    
    console.log(`✅ Saved: ${food.id}.png`);
    return true;
  } catch (error) {
    console.error(`❌ Error generating ${food.name}:`, error.message);
    return false;
  }
}

async function generateAllImages() {
  const allFoods = [
    ...foods.healthy.map(f => ({ ...f, category: 'healthy' })),
    ...foods.moderation.map(f => ({ ...f, category: 'moderation' })),
    ...foods.unhealthy.map(f => ({ ...f, category: 'unhealthy' })),
  ];

  console.log(`\n🍎 Food Image Generator 🍎`);
  console.log(`========================`);
  console.log(`Total foods to process: ${allFoods.length}`);
  console.log(`Already generated: ${Object.keys(progress).length}`);
  console.log(`\n`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const food of allFoods) {
    // Skip if already generated
    if (progress[food.id]) {
      console.log(`⏭️  Skipping ${food.name} (already generated)`);
      skipped++;
      continue;
    }

    const success = await generateImage(food);
    
    if (success) {
      progress[food.id] = {
        generated: new Date().toISOString(),
        category: food.category,
      };
      saveProgress();
      generated++;
    } else {
      failed++;
    }

    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n========================`);
  console.log(`✅ Generated: ${generated}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`========================\n`);
}

// Run the generator
generateAllImages().catch(console.error);

