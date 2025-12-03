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

// Foods to regenerate with better prompts
const foodsToRegenerate = [
  { id: 'apple', name: 'a shiny red apple' },
  { id: 'strawberries', name: 'fresh red strawberries' },
  { id: 'kiwi', name: 'a sliced kiwi fruit showing green inside' },
  { id: 'peach', name: 'a ripe fuzzy peach' },
  { id: 'peas', name: 'green peas in an open pod' },
  { id: 'avocado', name: 'a ripe avocado cut in half showing the pit' },
  { id: 'zucchini', name: 'a fresh green zucchini' },
  { id: 'mushrooms', name: 'white button mushrooms' },
  { id: 'scrambled-eggs', name: 'fluffy yellow scrambled eggs on a plate' },
  { id: 'whole-wheat-bread', name: 'a loaf of whole wheat bread with a slice' },
  { id: 'homemade-smoothie', name: 'a colorful fruit smoothie in a glass with a straw' },
  { id: 'homemade-popsicle', name: 'a colorful homemade fruit popsicle' },
  { id: 'pasta', name: 'a plate of spaghetti pasta with sauce' },
  { id: 'bagel', name: 'a golden brown bagel' },
  { id: 'croissant', name: 'a flaky golden croissant' },
  { id: 'crackers', name: 'square saltine crackers' },
  { id: 'veggie-chicken-nuggets', name: 'crispy breaded vegetarian chicken nuggets' },
  { id: 'veggie-bacon', name: 'strips of vegetarian bacon' },
  { id: 'veggie-sausage', name: 'vegetarian breakfast sausage links' },
  { id: 'pretzels', name: 'twisted pretzel snacks' },
  { id: 'trail-mix', name: 'trail mix with nuts, raisins, and seeds' },
];

const outputDir = path.join(__dirname, '..', 'public', 'images', 'foods');

async function generateImage(food) {
  const prompt = `A cute, friendly, cartoon illustration of ${food.name} for children. Simple, clean, appealing design with soft colors on a plain white background. The style should be warm and inviting like a children's book illustration. No text, no labels, no human characters.`;

  try {
    console.log(`🎨 Generating: ${food.name}...`);
    
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

async function regenerateAll() {
  console.log(`\n🔄 Regenerating ${foodsToRegenerate.length} food images...\n`);

  let success = 0;
  let failed = 0;

  for (const food of foodsToRegenerate) {
    const result = await generateImage(food);
    if (result) {
      success++;
    } else {
      failed++;
    }
    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n========================`);
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`========================\n`);
}

regenerateAll().catch(console.error);

