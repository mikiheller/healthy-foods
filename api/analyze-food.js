import OpenAI from 'openai';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { foodName } = req.body;

  if (!foodName) {
    return res.status(400).json({ error: 'Food name is required' });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Analyze this food for a children's nutrition education app: "${foodName}"

Categorize it and provide nutritional info. Respond ONLY with valid JSON in this exact format:
{
  "name": "properly capitalized food name",
  "category": "healthy" or "moderation" or "unhealthy",
  "emoji": "single food emoji",
  "protein": "low" or "medium" or "high",
  "fat": "low" or "medium" or "high", 
  "carbs": "low" or "medium" or "high",
  "description": "brief 2-4 word description"
}

Guidelines:
- "healthy": whole foods, fruits, vegetables, lean proteins, whole grains
- "moderation": processed foods, refined carbs, foods with some added sugar/fat
- "unhealthy": candy, fried foods, sugary drinks, highly processed snacks

Respond with ONLY the JSON, no other text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Parse the JSON response
    const foodData = JSON.parse(responseText);
    
    return res.status(200).json(foodData);
  } catch (error) {
    console.error('Error analyzing food:', error);
    return res.status(500).json({ error: 'Failed to analyze food' });
  }
}

